import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai, EXTRACT_MODEL } from "@/lib/openai";
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
  shipper_name: z
    .string()
    .nullable()
    .describe("Seller / exporter name. null if not legible."),
  consignee_name: z
    .string()
    .nullable()
    .describe("Buyer in Thailand. null if not legible."),
  invoice_number: z.string().nullable(),
  invoice_date: z
    .string()
    .nullable()
    .describe("ISO 8601 date (YYYY-MM-DD). null if unreadable."),
  currency: z
    .string()
    .nullable()
    .describe('ISO 4217 currency code, e.g. "USD". null if unclear.'),
  total_amount: z.number().nullable(),
  items: z.array(InvoiceItemSchema),
  /**
   * AI's own self-rated confidence 0..1. Used to short-circuit
   * to `failed_to_parse` when the model itself is uncertain.
   */
  ai_confidence: z.number().min(0).max(1),
  /**
   * If the model believes the document is not an invoice, set true.
   * Lets us avoid garbage-in pipelines (e.g. user uploaded a selfie).
   */
  not_an_invoice: z.boolean(),
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type ExtractedInvoice = z.infer<typeof ExtractedInvoiceSchema>;

/* ────────────────────────────────────────────────────────────
 * Result discriminated union (no exceptions across boundaries)
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

export type ExtractResult =
  | {
      status: "success";
      data: ExtractedInvoice;
      meta: {
        model: string;
        prompt_tokens: number;
        completion_tokens: number;
        latency_ms: number;
      };
    }
  | {
      status: "failed_to_parse";
      reason: ExtractFailureReason;
      message: string;
      retryable: boolean;
      meta?: Partial<{
        model: string;
        prompt_tokens: number;
        completion_tokens: number;
        latency_ms: number;
      }>;
    };

/* ────────────────────────────────────────────────────────────
 * Prompts
 * ──────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are an expert Thai customs broker assistant.
Given a commercial invoice image or PDF for goods being imported into Thailand,
extract the structured data per the JSON schema. Follow these rules strictly:

1. NEVER invent values. If a field is unreadable, set it to null.
2. Numeric fields must be parsed as numbers (not strings). Remove thousand separators.
3. "country_of_origin" must be an ISO-3166 alpha-2 code (CN, JP, KR, VN, etc.),
   not the country name. Infer from the address or "Made in" if explicit
   "Country of Origin" column is missing. If genuinely unclear, set null.
4. "invoice_date" must be ISO 8601 (YYYY-MM-DD). Reinterpret formats like
   "15/05/2025" or "May 15, 2025" or "2568-05-15" (Buddhist year) accordingly.
   Treat 4-digit years 2500-2600 as Buddhist Era and convert to CE (subtract 543).
5. For "items", include ONE row per line item on the invoice. Do NOT merge.
   If quantity·unit_price ≠ total_price, prefer what the document literally shows.
6. "ai_confidence": rate your own certainty 0..1 conservatively.
   - 1.0 = crisp scan, every field unambiguous
   - 0.7 = readable but a few fields inferred
   - 0.5 = partially smudged / handwritten / low resolution
   - <0.4 = mostly guessing — set this and stop.
7. "not_an_invoice": true if the document is clearly something else
   (passport, photo, blank page, AWB, etc.). Still attempt fields where possible
   but set this flag.`;

const USER_PROMPT = `Extract the invoice data from the attached document.
Reply with JSON ONLY matching the provided schema.
If the document is illegible, set ai_confidence below 0.4 and leave fields null.`;

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

/**
 * Extract from a file already in Supabase Storage.
 * `storagePath` should NOT include the bucket name.
 */
export async function extractFromStorage(
  storagePath: string
): Promise<ExtractResult> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(DOC_BUCKET)
    .download(storagePath);

  if (error || !data) {
    return {
      status: "failed_to_parse",
      reason: "file_not_found",
      message: error?.message ?? `Not found in ${DOC_BUCKET}/${storagePath}`,
      retryable: false,
    };
  }

  const bytes = new Uint8Array(await data.arrayBuffer());
  const mime = data.type || guessMimeFromPath(storagePath);
  return extractFromBytes(bytes, mime, storagePath);
}

/**
 * Extract from raw bytes + mime. Use this when you already have the file
 * in memory (e.g. from a multipart upload without ever touching Storage).
 */
export async function extractFromBytes(
  bytes: Uint8Array,
  mime: string,
  hintFilename?: string
): Promise<ExtractResult> {
  if (bytes.byteLength === 0) {
    return fail("file_not_found", "Empty file", false);
  }
  if (bytes.byteLength > MAX_BYTES) {
    return fail(
      "file_too_large",
      `File is ${bytes.byteLength} bytes, max ${MAX_BYTES}`,
      false
    );
  }
  if (!SUPPORTED_MIME.has(mime)) {
    return fail("unsupported_mime", `Mime "${mime}" not supported`, false);
  }

  const startedAt = Date.now();

  // Build the multimodal user message. OpenAI supports inline base64
  // for both images and PDFs (when using gpt-4o-2024-08-06 or newer).
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  const userContent =
    mime === "application/pdf"
      ? [
          {
            type: "file" as const,
            file: {
              file_data: dataUrl,
              filename: hintFilename?.split("/").pop() ?? "invoice.pdf",
            },
          },
          { type: "text" as const, text: USER_PROMPT },
        ]
      : [
          {
            type: "image_url" as const,
            image_url: { url: dataUrl, detail: "high" as const },
          },
          { type: "text" as const, text: USER_PROMPT },
        ];

  let completion;
  try {
    completion = await openai.beta.chat.completions.parse({
      model: EXTRACT_MODEL,
      temperature: 0,
      max_tokens: 4096,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        // `any` because openai SDK types lag behind the "file" content type;
        // payload is valid for gpt-4o-2024-08-06 onwards.
        { role: "user", content: userContent as any },
      ],
      response_format: zodResponseFormat(ExtractedInvoiceSchema, "invoice"),
    });
  } catch (err) {
    return mapOpenAIError(err, Date.now() - startedAt);
  }

  const latency_ms = Date.now() - startedAt;
  const meta = {
    model: completion.model,
    prompt_tokens: completion.usage?.prompt_tokens ?? 0,
    completion_tokens: completion.usage?.completion_tokens ?? 0,
    latency_ms,
  };

  const message = completion.choices[0]?.message;
  if (!message || message.refusal) {
    return {
      status: "failed_to_parse",
      reason: "ai_invalid_response",
      message: message?.refusal ?? "Model returned no message",
      retryable: false,
      meta,
    };
  }
  if (!message.parsed) {
    return {
      status: "failed_to_parse",
      reason: "ai_invalid_response",
      message: "Model output did not conform to schema",
      retryable: true,
      meta,
    };
  }

  const parsed = message.parsed;

  // Semantic gates — the model technically returned valid JSON,
  // but the content tells us we shouldn't trust it downstream.
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

function fail(
  reason: ExtractFailureReason,
  message: string,
  retryable: boolean
): ExtractResult {
  return { status: "failed_to_parse", reason, message, retryable };
}

function guessMimeFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    default:
      return "application/octet-stream";
  }
}

function mapOpenAIError(err: unknown, latency_ms: number): ExtractResult {
  // Avoid importing the OpenAI error class at the top — keep this resilient
  // even if the SDK shape shifts. We sniff by name and status.
  const e = err as { name?: string; status?: number; code?: string; message?: string };
  const message = e?.message ?? String(err);
  const meta = { latency_ms };

  if (e?.name === "APIConnectionTimeoutError" || /timeout/i.test(message)) {
    return {
      status: "failed_to_parse",
      reason: "ai_timeout",
      message,
      retryable: true,
      meta,
    };
  }
  if (e?.status === 429 || e?.code === "insufficient_quota") {
    return {
      status: "failed_to_parse",
      reason: "ai_quota_exceeded",
      message,
      // 429 from rate-limit is retryable; from quota is not.
      retryable: e?.code !== "insufficient_quota",
      meta,
    };
  }
  if (e?.status === 400) {
    // Most likely a malformed image / unsupported file
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
