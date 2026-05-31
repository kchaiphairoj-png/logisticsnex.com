import { z } from "zod";
import { generateObject, embed, NoObjectGeneratedError } from "ai";
import { classifierModel, embeddingModel } from "@/lib/ai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/* ────────────────────────────────────────────────────────────
 * Schemas
 * ──────────────────────────────────────────────────────────── */

export const FtaRateSchema = z.object({
  fta: z.string().describe('"ACFTA","AJCEP","AKFTA","AANZFTA","AIFTA","ATIGA","RCEP","TAFTA","JTEPA",or "MFN".'),
  certificate: z.string().describe('Form required: "Form E","Form AJ","Form D","Form AI","Form RCEP", or "—".'),
  duty_rate: z.number().describe("Preferential duty rate (%) if origin cert presented."),
  eligible: z.boolean().describe("Whether importer is likely eligible based on origin."),
  conditions: z.string().describe("Plain-Thai eligibility conditions and risks."),
});

export const HsAlternativeSchema = z.object({
  hs_code: z.string().describe("8-digit HS code"),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  why_not_chosen: z.string().describe("Why NOT the top pick."),
});

export const HsClassificationSchema = z.object({
  hs_code_8: z
    .string()
    .regex(/^\d{4}\.?\d{2}\.?\d{2}$|^\d{8}$/)
    .describe('8-digit HS code "XXXX.XX.XX" or "XXXXXXXX".'),
  hs_code_th_11: z.string().nullable().describe("11-digit Thai HS code if matched, else null."),
  description_en: z.string(),
  description_th: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().describe("ภาษาไทย — explain WHY using GIR 1-6."),
  gir_rule_applied: z.enum(["1", "2a", "2b", "3a", "3b", "3c", "4", "5a", "5b", "6"]),
  normal_duty_rate: z.number().describe("MFN duty rate (%)."),
  vat_rate: z.number().describe("VAT (%), typically 7."),
  excise_rate: z.number().nullable(),
  fta_options: z.array(FtaRateSchema),
  recommendations: z.array(z.string()).describe("ภาษาไทย — actionable for the importer."),
  alternatives: z.array(HsAlternativeSchema).min(0).max(3),
  warnings: z.array(z.string()).describe("Risks: dual-use, licenses, anti-dumping, ..."),
});

export type HsClassification = z.infer<typeof HsClassificationSchema>;
export type FtaRate = z.infer<typeof FtaRateSchema>;

/* ────────────────────────────────────────────────────────────
 * Result + input
 * ──────────────────────────────────────────────────────────── */

export type HsClassifyFailureReason =
  | "empty_description"
  | "embedding_failed"
  | "no_candidates"
  | "ai_timeout"
  | "ai_quota_exceeded"
  | "ai_invalid_response"
  | "low_confidence"
  | "unknown_error";

export type HsCandidate = {
  code: string;
  description_en: string;
  description_th: string | null;
  duty_rate: number | null;
  vat_rate: number | null;
  excise_rate: number | null;
  similarity: number;
};

export interface HsClassifyMeta {
  embedding_model: string;
  classifier_model: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export type HsClassifyResult =
  | {
      status: "success";
      data: HsClassification;
      candidates: HsCandidate[];
      meta: HsClassifyMeta;
    }
  | {
      status: "needs_review";
      reason: HsClassifyFailureReason;
      message: string;
      partial?: HsClassification;
      candidates?: HsCandidate[];
      meta?: Partial<HsClassifyMeta>;
    };

export interface ClassifyInput {
  description: string;
  origin_country?: string;
  supplier_name?: string;
  chapter_hint?: string;
  additional_context?: string;
}

/* ────────────────────────────────────────────────────────────
 * Prompts
 * ──────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are an expert Thai customs broker (ชิปปิ้ง) classifying imported goods.

Apply the **General Rules for Interpretation (GIR)** of the Harmonized System,
as adopted by Thai Customs Department (กรมศุลกากร), in order:

GIR 1 — Section/Chapter/Heading texts and legal notes prevail.
GIR 2(a) — Incomplete/unassembled goods classified as the finished article.
GIR 2(b) — Mixtures and combinations of materials use GIR 3.
GIR 3(a) — Most specific description prevails.
GIR 3(b) — Mixtures classified by material giving essential character.
GIR 3(c) — When 3(a)+3(b) cannot decide, choose the heading appearing last numerically.
GIR 4 — Most akin goods.
GIR 5 — Cases and packaging follow the article.
GIR 6 — Subheading determination uses the same rules at subheading level.

# Thailand FTA cheatsheet
- China → ACFTA / Form E → many MFN-applied codes drop to 0%
- Japan → JTEPA / Form JTEPA, AJCEP / Form AJ
- Korea → AKFTA / Form AK
- AUS/NZ → TAFTA + AANZFTA / Form TAFTA or AANZ
- India → AIFTA / Form AI
- ASEAN-internal → ATIGA / Form D → 0% for almost all originating goods
- RCEP → Form RCEP

# Rules
- All rates are PERCENTAGES (e.g. 5 means 5%, not 0.05).
- VAT is always 7 for Thailand unless the chapter is zero-rated.
- "reasoning" and "recommendations" MUST be in Thai.
- If confidence < 0.6, still output your best guess and say in "reasoning" that human review is required.`;

/* ────────────────────────────────────────────────────────────
 * Main entry
 * ──────────────────────────────────────────────────────────── */

export async function classifyHsCode(input: ClassifyInput): Promise<HsClassifyResult> {
  const description = input.description?.trim();
  if (!description) {
    return { status: "needs_review", reason: "empty_description", message: "Description is empty" };
  }

  const startedAt = Date.now();

  // 1. Embed
  let embedding: number[];
  try {
    const result = await embed({
      model: embeddingModel(),
      value: enrichForEmbedding(input),
    });
    embedding = result.embedding;
  } catch (err) {
    return {
      status: "needs_review",
      reason: "embedding_failed",
      message: (err as Error).message,
    };
  }

  // 2. Vector search top-10
  const supabase = getSupabaseAdmin();
  const { data: rows, error: searchErr } = await supabase.rpc("match_hs_codes", {
    query_embedding: embedding,
    match_count: 10,
    chapter_filter: input.chapter_hint ?? null,
  });

  const candidates: HsCandidate[] = (rows ?? []).map((r: any) => ({
    code: r.code,
    description_en: r.description_en,
    description_th: r.description_th,
    duty_rate: r.duty_rate,
    vat_rate: r.vat_rate,
    excise_rate: r.excise_rate,
    similarity: Number(r.similarity),
  }));

  if (searchErr || candidates.length === 0) {
    console.warn("[hs-classifier] no candidates from vector search; LLM-only fallback", {
      err: searchErr?.message,
    });
  }

  // 3. Classify with LLM + candidates
  const userMessage = buildUserMessage(input, candidates);

  let parsed: HsClassification;
  let usage: { inputTokens?: number; outputTokens?: number } | undefined;
  const model = classifierModel();
  try {
    const result = await generateObject({
      model,
      schema: HsClassificationSchema,
      system: SYSTEM_PROMPT,
      prompt: userMessage,
      temperature: 0,
    });
    parsed = result.object;
    usage = result.usage;
  } catch (err) {
    return mapAiError(err, Date.now() - startedAt);
  }

  const meta: HsClassifyMeta = {
    embedding_model: "text-embedding-004",
    classifier_model: model.modelId,
    latency_ms: Date.now() - startedAt,
    prompt_tokens: usage?.inputTokens ?? 0,
    completion_tokens: usage?.outputTokens ?? 0,
  };

  const data = normalizeClassification(parsed, input.origin_country);

  if (data.confidence < 0.6) {
    return {
      status: "needs_review",
      reason: "low_confidence",
      message: `Confidence ${data.confidence.toFixed(2)} below threshold 0.60`,
      partial: data,
      candidates,
      meta,
    };
  }

  return { status: "success", data, candidates, meta };
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

function enrichForEmbedding(input: ClassifyInput): string {
  return [
    input.description,
    input.additional_context,
    input.supplier_name && `Supplier: ${input.supplier_name}`,
    input.origin_country && `Origin: ${input.origin_country}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserMessage(input: ClassifyInput, candidates: HsCandidate[]): string {
  const candidateBlock =
    candidates.length === 0
      ? "(No candidates from vector search — use Thai tariff schedule knowledge.)"
      : candidates
          .map(
            (c, i) =>
              `${i + 1}. ${c.code}  [sim ${c.similarity.toFixed(3)}]  duty ${c.duty_rate ?? "?"}%
   EN: ${c.description_en}
   TH: ${c.description_th ?? "—"}`
          )
          .join("\n");

  return `# Item to classify
Description: ${input.description}
Origin country: ${input.origin_country ?? "(unknown)"}
${input.supplier_name ? `Supplier: ${input.supplier_name}` : ""}
${input.additional_context ? `Context: ${input.additional_context}` : ""}

# Top candidate HS codes from semantic search
${candidateBlock}

Choose the best code per GIR rules, suggest FTA reductions, and warn of any risks.`;
}

function normalizeClassification(c: HsClassification, origin?: string): HsClassification {
  const digits = c.hs_code_8.replace(/\D/g, "");
  const dotted =
    digits.length >= 8
      ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
      : c.hs_code_8;

  const fta_options = origin
    ? c.fta_options.map((f) => ({
        ...f,
        eligible: f.eligible && originMatchesFta(origin, f.fta),
      }))
    : c.fta_options;

  return { ...c, hs_code_8: dotted, fta_options };
}

function originMatchesFta(originIso2: string, fta: string): boolean {
  const ASEAN = ["BN", "KH", "ID", "LA", "MY", "MM", "PH", "SG", "VN"];
  const map: Record<string, (c: string) => boolean> = {
    ACFTA: (c) => c === "CN",
    JTEPA: (c) => c === "JP",
    AJCEP: (c) => c === "JP" || ASEAN.includes(c),
    AKFTA: (c) => c === "KR",
    TAFTA: (c) => c === "AU",
    AANZFTA: (c) => c === "AU" || c === "NZ" || ASEAN.includes(c),
    AIFTA: (c) => c === "IN",
    ATIGA: (c) => ASEAN.includes(c),
    RCEP: (c) => ["CN", "JP", "KR", "AU", "NZ", ...ASEAN].includes(c),
    MFN: () => true,
  };
  return map[fta]?.(originIso2) ?? false;
}

function mapAiError(err: unknown, latency_ms: number): HsClassifyResult {
  const e = err as { statusCode?: number; message?: string };
  const meta = { latency_ms };
  const message = e?.message ?? String(err);

  if (err instanceof NoObjectGeneratedError) {
    return {
      status: "needs_review",
      reason: "ai_invalid_response",
      message: "Model failed to produce valid JSON",
      meta,
    };
  }
  if (/timeout/i.test(message)) {
    return { status: "needs_review", reason: "ai_timeout", message, meta };
  }
  if (e?.statusCode === 429 || /quota|rate/i.test(message)) {
    return { status: "needs_review", reason: "ai_quota_exceeded", message, meta };
  }
  return { status: "needs_review", reason: "unknown_error", message, meta };
}
