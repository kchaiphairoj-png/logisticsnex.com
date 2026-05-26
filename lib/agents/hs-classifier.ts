import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/* ────────────────────────────────────────────────────────────
 * Schemas
 * ──────────────────────────────────────────────────────────── */

export const FtaRateSchema = z.object({
  fta: z
    .string()
    .describe(
      'FTA short name: "ACFTA" (China), "AJCEP" (Japan), "AKFTA" (Korea), "AANZFTA" (AUS/NZ), "AIFTA" (India), "ATIGA" (ASEAN), "RCEP", "TAFTA" (AUS), "JTEPA" (Japan), or "MFN" if no FTA applies.'
    ),
  certificate: z
    .string()
    .describe('Form required, e.g. "Form E", "Form AJ", "Form D", "Form AI", "Form RCEP", or "—" if none.'),
  duty_rate: z
    .number()
    .describe("Preferential duty rate (%) if origin certificate is presented."),
  eligible: z
    .boolean()
    .describe("Whether the importer in this case is likely eligible (e.g. origin country matches FTA)."),
  conditions: z
    .string()
    .describe("Plain-Thai explanation of eligibility conditions and risks."),
});

export const HsAlternativeSchema = z.object({
  hs_code: z.string().describe("8-digit HS code"),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  why_not_chosen: z.string().describe("Why this was NOT the top pick."),
});

export const HsClassificationSchema = z.object({
  hs_code_8: z
    .string()
    .regex(/^\d{4}\.?\d{2}\.?\d{2}$|^\d{8}$/)
    .describe('8-digit HS code in dotted form "8504.40.30" or solid "85044030".'),
  hs_code_th_11: z
    .string()
    .nullable()
    .describe("11-digit Thai HS code if a specific subheading matches, else null."),
  description_en: z.string(),
  description_th: z.string(),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "Self-rated confidence. <0.6 means this should be reviewed by a human."
    ),
  reasoning: z
    .string()
    .describe(
      "ภาษาไทย — explain WHY using General Rules of Interpretation (GIR) 1-6."
    ),
  gir_rule_applied: z
    .enum(["1", "2a", "2b", "3a", "3b", "3c", "4", "5a", "5b", "6"])
    .describe("Which GIR rule was decisive (Thai Customs interpretation)."),
  normal_duty_rate: z
    .number()
    .describe("MFN / normal import duty rate (%) for this code."),
  vat_rate: z.number().describe("VAT rate (%), typically 7 in Thailand."),
  excise_rate: z
    .number()
    .nullable()
    .describe("Excise tax rate (%) if applicable, else null."),
  fta_options: z
    .array(FtaRateSchema)
    .describe(
      "All FTAs available for this HS code with eligibility flag based on origin country."
    ),
  recommendations: z
    .array(z.string())
    .describe(
      "ภาษาไทย — actionable recommendations for the importer (e.g. 'ขอ Form E จาก supplier จะได้ลดเหลือ 0%')."
    ),
  alternatives: z
    .array(HsAlternativeSchema)
    .min(0)
    .max(3)
    .describe("Up to 3 alternative HS codes the human reviewer should consider."),
  warnings: z
    .array(z.string())
    .describe("Risks: dual-use, license requirements, anti-dumping, etc."),
});

export type HsClassification = z.infer<typeof HsClassificationSchema>;
export type FtaRate = z.infer<typeof FtaRateSchema>;

/* ────────────────────────────────────────────────────────────
 * Result discriminated union
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

export type HsClassifyResult =
  | {
      status: "success";
      data: HsClassification;
      candidates: HsCandidate[];
      meta: {
        embedding_model: string;
        classifier_model: string;
        prompt_tokens: number;
        completion_tokens: number;
        latency_ms: number;
      };
    }
  | {
      status: "needs_review";
      reason: HsClassifyFailureReason;
      message: string;
      partial?: HsClassification;
      candidates?: HsCandidate[];
      meta?: Record<string, unknown>;
    };

export type HsCandidate = {
  code: string;
  description_en: string;
  description_th: string | null;
  duty_rate: number | null;
  vat_rate: number | null;
  excise_rate: number | null;
  similarity: number;
};

/* ────────────────────────────────────────────────────────────
 * Input
 * ──────────────────────────────────────────────────────────── */

export interface ClassifyInput {
  /** Free-text description in TH or EN. Can include specs, model, material. */
  description: string;

  /** ISO-3166 alpha-2 code of origin country. Used for FTA eligibility. */
  origin_country?: string;

  /** Optional supplier name — improves accuracy when AI has prior history. */
  supplier_name?: string;

  /** Optional 2-digit HS chapter to restrict candidates (e.g. "85" for electronics). */
  chapter_hint?: string;

  /** Extra context — e.g. invoice unit price, end-use, intended buyer industry. */
  additional_context?: string;
}

/* ────────────────────────────────────────────────────────────
 * Prompts — GIR rules baked in, Thai customs context
 * ──────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are an expert Thai customs broker (ชิปปิ้ง) classifying imported goods.

Apply the **General Rules for Interpretation (GIR)** of the Harmonized System,
as adopted by Thai Customs Department (กรมศุลกากร), in order:

GIR 1 — Section / Chapter / Heading texts and legal notes prevail.
GIR 2(a) — Incomplete or unassembled goods are classified as the finished article.
GIR 2(b) — Mixtures and combinations of materials use GIR 3.
GIR 3(a) — The most specific description prevails over a more general one.
GIR 3(b) — Mixtures/composite goods are classified by the material/component giving essential character.
GIR 3(c) — When 3(a) and 3(b) cannot decide, choose the heading appearing last numerically.
GIR 4 — If no rule fits, classify as the most akin goods.
GIR 5 — Cases and packaging follow the article.
GIR 6 — Subheading determination uses the same rules at subheading level.

You will receive:
1. A free-text item description (Thai or English).
2. The origin country (helps with FTA suggestions).
3. The top 10 candidate HS codes from vector search, with their official descriptions and Thai MFN duty rates.

Your job:
1. Choose the BEST 8-digit HS code from the candidates (or, rarely, propose a different one if all candidates are clearly wrong — in that case set confidence below 0.5).
2. Explain WHY in Thai, citing which GIR rule applied.
3. Look at the origin country and recommend applicable FTA preferential rates.
4. List 2-3 alternative codes the reviewer should consider.
5. Flag risks: items needing import license, controlled goods (lithium batteries, lasers, chemicals), anti-dumping duties (Chinese steel/ceramics), dual-use.

# Thailand FTA cheatsheet
- China → ACFTA / Form E → many MFN-applied codes drop to 0%
- Japan → JTEPA (older, bilateral) or AJCEP (multilateral) / Form JTEPA or Form AJ
- Korea → AKFTA / Form AK
- Australia/NZ → TAFTA + AANZFTA / Form TAFTA or AANZ
- India → AIFTA / Form AI (limited product coverage)
- ASEAN-internal → ATIGA / Form D → 0% for almost all originating goods
- RCEP (covers CN/JP/KR/AU/NZ/ASEAN/IN-pending) → Form RCEP, useful when other FTA gives a worse rate

# Output rules
- All rates are PERCENTAGES (e.g. 5 means 5%, not 0.05).
- VAT is always 7 for Thailand unless the chapter is zero-rated.
- "recommendations" and "reasoning" MUST be in Thai language.
- "description_en"/"description_th" should match the official tariff schedule wording where possible.
- If confidence < 0.6, still output your best guess but explicitly say in "reasoning" that human review is required.`;

/* ────────────────────────────────────────────────────────────
 * Main entry point
 * ──────────────────────────────────────────────────────────── */

const EMBED_MODEL = "text-embedding-3-small";
const CLASSIFIER_MODEL =
  process.env.OPENAI_HS_MODEL ?? "gpt-4o-mini-2024-07-18";

export async function classifyHsCode(
  input: ClassifyInput
): Promise<HsClassifyResult> {
  const description = input.description?.trim();
  if (!description) {
    return {
      status: "needs_review",
      reason: "empty_description",
      message: "Item description is empty",
    };
  }

  const startedAt = Date.now();

  /* ─── 1. Embed the description ─── */
  let embedding: number[];
  try {
    const e = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: enrichForEmbedding(input),
    });
    embedding = e.data[0].embedding;
  } catch (err) {
    return {
      status: "needs_review",
      reason: "embedding_failed",
      message: (err as Error).message,
    };
  }

  /* ─── 2. Vector search top-10 candidates ─── */
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
    // Fall back to LLM-only — less accurate, log it.
    console.warn("[hs-classifier] no candidates from vector search; falling back to LLM-only", {
      err: searchErr?.message,
    });
  }

  /* ─── 3. Classify with LLM + candidates ─── */
  const userMessage = buildUserMessage(input, candidates);

  let completion;
  try {
    completion = await openai.beta.chat.completions.parse({
      model: CLASSIFIER_MODEL,
      temperature: 0,
      max_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: zodResponseFormat(HsClassificationSchema, "classification"),
    });
  } catch (err) {
    return mapOpenAIError(err, Date.now() - startedAt);
  }

  const meta = {
    embedding_model: EMBED_MODEL,
    classifier_model: completion.model,
    prompt_tokens: completion.usage?.prompt_tokens ?? 0,
    completion_tokens: completion.usage?.completion_tokens ?? 0,
    latency_ms: Date.now() - startedAt,
  };

  const msg = completion.choices[0]?.message;
  if (!msg || msg.refusal || !msg.parsed) {
    return {
      status: "needs_review",
      reason: "ai_invalid_response",
      message: msg?.refusal ?? "No parsed output",
      candidates,
      meta,
    };
  }

  const data = normalizeClassification(msg.parsed, input.origin_country);

  // Confidence gate — but still return the data as `needs_review` so the
  // user sees the suggestion and can decide.
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
  // The embedding is semantic — feed it everything that helps disambiguate.
  return [
    input.description,
    input.additional_context,
    input.supplier_name && `Supplier: ${input.supplier_name}`,
    input.origin_country && `Origin: ${input.origin_country}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserMessage(
  input: ClassifyInput,
  candidates: HsCandidate[]
): string {
  const candidateBlock =
    candidates.length === 0
      ? "(No candidates returned — classify based on your own knowledge of the Thai tariff schedule.)"
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

function normalizeClassification(
  c: HsClassification,
  origin?: string
): HsClassification {
  // Normalize 8-digit code to dotted form "XXXX.XX.XX" for display consistency.
  const digits = c.hs_code_8.replace(/\D/g, "");
  const dotted =
    digits.length >= 8
      ? `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`
      : c.hs_code_8;

  // If origin is provided, re-flag fta_options eligibility deterministically —
  // don't fully trust the LLM here.
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
    RCEP: (c) =>
      ["CN", "JP", "KR", "AU", "NZ", ...ASEAN].includes(c),
    MFN: () => true,
  };
  return map[fta]?.(originIso2) ?? false;
}

function mapOpenAIError(err: unknown, latency_ms: number): HsClassifyResult {
  const e = err as { name?: string; status?: number; code?: string; message?: string };
  const meta = { latency_ms };
  const message = e?.message ?? String(err);

  if (e?.name === "APIConnectionTimeoutError" || /timeout/i.test(message)) {
    return { status: "needs_review", reason: "ai_timeout", message, meta };
  }
  if (e?.status === 429) {
    return {
      status: "needs_review",
      reason: "ai_quota_exceeded",
      message,
      meta,
    };
  }
  return { status: "needs_review", reason: "unknown_error", message, meta };
}
