import { z } from "zod";
import { generateObject, NoObjectGeneratedError } from "ai";
import { extractModel } from "@/lib/ai";
import { getSupabaseAdmin, DOC_BUCKET } from "@/lib/supabase-admin";

/* ────────────────────────────────────────────────────────────
 * Schema — single source of truth for AI output AND TS types
 * ──────────────────────────────────────────────────────────── */

export const InvoiceItemSchema = z.object({
  item_description: z
    .string()
    .describe("Full product description as written on the invoice, original language"),
  quantity: z
    .number()
    .describe("Numeric quantity. Set 0 if not legible."),
  unit_price: z
    .number()
    .nullable()
    .describe("Price per unit in invoice currency. null if missing."),
  total_price: z
    .number()
    .nullable()
    .describe("Line total in invoice currency. null if missing."),
  country_of_origin: z
    .string()
    .nullable()
    .describe('ISO-3166 alpha-2 country code (e.g. "CN", "JP"). null if not stated.'),
});

export const ExtractedInvoiceSchema = z.object({
  shipper_name: z.string().nullable().describe("Seller / exporter name. null if not legible."),
  consignee_name: z.string().nullable().describe("Buyer in Thailand. null if not legible."),
  invoice_number: z.string().nullable(),
  invoice_date: z
    .string()
    .nullable()
    .describe("ISO 8601 date (YYYY-MM-DD). null if unreadable."),
  currency: z.string().nullable().describe('ISO 4217 currency code, e.g. "USD". null if unclear.'),
  total_amount: z.number().nullable(),
  items: z.array(InvoiceItemSchema),
  ai_confidence: z.number().min(0).max(1).describe("Self-rated 0..1. <0.4 = stop."),
  not_an_invoice: z.boolean().describe("True if document is clearly not a commercial invoice."),
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type ExtractedInvoice = z.infer<typeof ExtractedInvoiceSchema>;

/* ────────────────────────────────────────────────────────────
 * Result type
 * ──────────────────────────────────────────────────────────── */

export type ExtractFailureReason =
  | "file_not_found"
  | "file_too_large"
  | "unsupported_mime"
  | "ai_timeout"
  | "ai_quota_exceeded"
  | "ai_invalid_response"
  | "image_unreadable"
  | "not_an_invoice"
  | "low_confidence"
  | "unknown_error";

export interface ExtractMeta {
  model: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export type ExtractResult =
  | { status: "success"; data: ExtractedInvoice; meta: ExtractMeta }
  | {
      status: "failed_to_parse";
      reason: ExtractFailureReason;
      message: string;
      retryable: boolean;
      meta?: Partial<ExtractMeta>;
    };

/* ────────────────────────────────────────────────────────────
 * Prompt
 * ──────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are an expert Thai customs broker assistant.
Given a commercial invoice image or PDF for goods being imported into Thailand,
extract the structured data per the JSON schema. Rules:

1. NEVER invent values. If a field is unreadable, set it to null.
2. Numeric fields must be parsed as numbers. Remove thousand separators.
3. "country_of_origin" must be ISO-3166 alpha-2 (CN, JP, KR, VN, ...). Infer from address or "Made in" if no explicit column.
4. "invoice_date" must be ISO 8601 (YYYY-MM-DD). Convert Buddhist Era years (2500-2600) to CE by subtracting 543.
5. "items" — one row per line item, do NOT merge.
6. "ai_confidence" 0..1, conservative.
7. "not_an_invoice": true if the document is clearly not a commercial invoice.`;

const USER_PROMPT = `Extract the invoice data from the attached document.
If illegible, set ai_confidence below 0.4 and leave fields null.`;

/* ────────────────────────────────────────────────────────────
 * Public entry points
 * ──────────────────────────────────────────────────────────── */

const MAX_BYTES = Number(process.env.EXTRACT_MAX_FILE_BYTES ?? 20 * 1024 * 1024);
const MIN_CONFIDENCE = Number(process.env.EXTRACT_MIN_CONFIDENCE ?? 0.6);

const SUPPORTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

export async function extractFromStorage(storagePath: string): Promise<ExtractResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(DOC_BUCKET).download(storagePath);

  if (error || !data) {
    return fail("file_not_found", error?.message ?? `Not found: ${storagePath}`, false);
  }

  const bytes = new Uint8Array(await data.arrayBuffer());
  const mime = data.type || guessMimeFromPath(storagePath);
  return extractFromBytes(bytes, mime, storagePath);
}

export async function extractFromBytes(
  bytes: Uint8Array,
  mime: string,
  hintFilename?: string
): Promise<ExtractResult> {
  if (bytes.byteLength === 0) return fail("file_not_found", "Empty file", false);
  if (bytes.byteLength > MAX_BYTES) {
    return fail("file_too_large", `${bytes.byteLength} > ${MAX_BYTES}`, false);
  }
  if (!SUPPORTED_MIME.has(mime)) {
    return fail("unsupported_mime", `mime "${mime}" not supported`, false);
  }

  const startedAt = Date.now();
  const model = extractModel();

  // Build multimodal content. AI SDK supports `image` (data URL or Buffer)
  // and `file` (any mime type — Gemini handles PDF natively).
  const isPdf = mime === "application/pdf";
  const userContent = isPdf
    ? ([
        {
          type: "file" as const,
          data: bytes,
          mediaType: mime,
        },
        { type: "text" as const, text: USER_PROMPT },
      ])
    : ([
        {
          type: "image" as const,
          image: bytes,
          mediaType: mime,
        },
        { type: "text" as const, text: USER_PROMPT },
      ]);

  let parsed: ExtractedInvoice;
  let usage: { inputTokens?: number; outputTokens?: number } | undefined;
  try {
    const result = await generateObject({
      model,
      schema: ExtractedInvoiceSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userContent as never,
        },
      ],
      temperature: 0,
    });
    parsed = result.object;
    usage = result.usage;
  } catch (err) {
    return mapAiError(err, Date.now() - startedAt);
  }

  const latency_ms = Date.now() - startedAt;
  const meta: ExtractMeta = {
    model: model.modelId,
    latency_ms,
    prompt_tokens: usage?.inputTokens ?? 0,
    completion_tokens: usage?.outputTokens ?? 0,
  };

  if (parsed.not_an_invoice) {
    return {
      status: "failed_to_parse",
      reason: "not_an_invoice",
      message: "Document does not appear to be a commercial invoice",
      retryable: false,
      meta,
    };
  }
  if (parsed.ai_confidence < 0.4) {
    return {
      status: "failed_to_parse",
      reason: "image_unreadable",
      message: `Model confidence too low (${parsed.ai_confidence.toFixed(2)})`,
      retryable: false,
      meta,
    };
  }
  if (parsed.ai_confidence < MIN_CONFIDENCE) {
    return {
      status: "failed_to_parse",
      reason: "low_confidence",
      message: `Confidence ${parsed.ai_confidence.toFixed(2)} below threshold ${MIN_CONFIDENCE}`,
      retryable: false,
      meta,
    };
  }
  if (parsed.items.length === 0) {
    return {
      status: "failed_to_parse",
      reason: "image_unreadable",
      message: "No line items detected",
      retryable: false,
      meta,
    };
  }

  return { status: "success", data: parsed, meta };
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

function fail(reason: ExtractFailureReason, message: string, retryable: boolean): ExtractResult {
  return { status: "failed_to_parse", reason, message, retryable };
}

function guessMimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf": return "application/pdf";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    case "heic": return "image/heic";
    default: return "application/octet-stream";
  }
}

function mapAiError(err: unknown, latency_ms: number): ExtractResult {
  const e = err as { name?: string; statusCode?: number; message?: string };
  const message = e?.message ?? String(err);
  const meta = { latency_ms };

  if (err instanceof NoObjectGeneratedError) {
    return {
      status: "failed_to_parse",
      reason: "ai_invalid_response",
      message: "Model failed to produce valid schema-conformant JSON",
      retryable: true,
      meta,
    };
  }
  if (/timeout/i.test(message)) {
    return { status: "failed_to_parse", reason: "ai_timeout", message, retryable: true, meta };
  }
  if (e?.statusCode === 429 || /quota|rate/i.test(message)) {
    return {
      status: "failed_to_parse",
      reason: "ai_quota_exceeded",
      message,
      retryable: true,
      meta,
    };
  }
  if (e?.statusCode === 400) {
    return {
      status: "failed_to_parse",
      reason: "image_unreadable",
      message,
      retryable: false,
      meta,
    };
  }
  return {
    status: "failed_to_parse",
    reason: "unknown_error",
    message,
    retryable: true,
    meta,
  };
}
