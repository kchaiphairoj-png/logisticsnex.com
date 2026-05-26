import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "@/lib/openai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/* ────────────────────────────────────────────────────────────
 * Schemas
 * ──────────────────────────────────────────────────────────── */

export const SupplierMatchSchema = z.object({
  supplier_id: z.string().uuid(),
  match_score: z
    .number()
    .min(0)
    .max(1)
    .describe(
      "0..1 overall fit score. 0.9+ = excellent, 0.7-0.9 = good, <0.7 = consider with caution."
    ),
  reasoning: z
    .string()
    .describe("ภาษาไทย — 1-2 ประโยคอธิบายว่าทำไม match ได้คะแนนนี้"),
  pros: z
    .array(z.string())
    .min(0)
    .max(5)
    .describe("ภาษาไทย — bullet points ที่เป็นข้อดี"),
  cons: z
    .array(z.string())
    .min(0)
    .max(5)
    .describe("ภาษาไทย — bullet points ที่เป็นข้อกังวล / risk"),
  estimated_unit_price_usd: z
    .number()
    .nullable()
    .describe(
      "ราคา/หน่วยที่คาดว่าจะได้ (USD) — interpolate จาก supplier's price range + RFQ quantity"
    ),
  estimated_duty_saving_thb: z
    .number()
    .describe(
      "ประมาณการการประหยัดอากรขาเข้า (THB) ถ้าใช้ FTA ที่ supplier รองรับ"
    ),
  recommended_action: z
    .enum(["request_quote", "request_sample", "skip", "negotiate"])
    .describe("Action ที่แนะนำให้ buyer ทำต่อ"),
});

export const MatchResultSchema = z.object({
  matches: z
    .array(SupplierMatchSchema)
    .min(0)
    .max(10)
    .describe("Sorted by match_score descending."),
  insights: z
    .string()
    .describe(
      "ภาษาไทย — ภาพรวมการแมตช์ (เช่น 'มี supplier 3 รายที่ตรงสเปก, แนะนำ X เพราะ Y') 2-3 ประโยค"
    ),
});

export type SupplierMatch = z.infer<typeof SupplierMatchSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;

/* ────────────────────────────────────────────────────────────
 * Input
 * ──────────────────────────────────────────────────────────── */

export interface MatchInput {
  /** Free-text description of what the buyer wants (TH or EN) */
  description: string;

  /** Optional structured fields from the RFQ form */
  quantity?: number;
  quantity_unit?: string;
  target_price_usd?: number;
  preferred_origin?: string[]; // ISO-2 codes
  required_form_e?: boolean;
  required_form_rcep?: boolean;
  required_certifications?: string[];
  delivery_incoterm?: string;
  delivery_port?: string;
  needed_by_date?: string; // ISO date
  hs_code_hint?: string;
}

/* ────────────────────────────────────────────────────────────
 * Result discriminated union
 * ──────────────────────────────────────────────────────────── */

export type MatchFailureReason =
  | "empty_description"
  | "embedding_failed"
  | "no_candidates"
  | "ai_timeout"
  | "ai_quota_exceeded"
  | "ai_invalid_response"
  | "unknown_error";

export type MatchOutput =
  | {
      status: "success";
      data: MatchResult;
      meta: {
        embedding_model: string;
        matcher_model: string;
        candidates_evaluated: number;
        prompt_tokens: number;
        completion_tokens: number;
        latency_ms: number;
      };
    }
  | {
      status: "failed";
      reason: MatchFailureReason;
      message: string;
      meta?: Partial<{ latency_ms: number }>;
    };

/* ────────────────────────────────────────────────────────────
 * Prompt
 * ──────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are an AI sourcing agent for Thai SME importers.
Given a buyer's requirements and a list of candidate suppliers (with their products,
verification status, FTA support, ratings, and trade history), score and rank
each supplier for fit.

# Scoring rubric (0..1)
Weight roughly:
- Product spec match (40%) — does the supplier's product line actually fit?
- Trust signals (25%) — verified, trade assurance, rating, response rate, on-time delivery
- Commercial fit (20%) — MOQ vs buyer qty, price range vs target, lead time vs deadline
- FTA / duty optimization (15%) — Form E for CN, Form D for ASEAN, etc.

# Scoring guide
- 0.90+: clear winner — verified + spec match + FTA + commercial fit
- 0.75-0.89: solid match — minor concerns
- 0.50-0.74: possible — but real gaps (no FTA, high MOQ, etc.)
- <0.50: skip — major mismatch

# Reasoning style
- All "reasoning", "pros", "cons", "insights" MUST be in Thai.
- Be specific: "ผลิต X รุ่น Y" not "ผลิตได้".
- For cons, prefer concrete concerns over generic ones.

# Estimated duty saving calculation
- If supplier supports Form E and buyer origin is CN → assume 10% MFN avoidance.
- If buyer wants ASEAN supplier with Form D → 5-10% saving typical.
- Use the formula: saving_thb ≈ quantity × supplier_avg_price_usd × 36 × fta_diff_pct.
- If supplier doesn't support relevant FTA, saving = 0.

# Output rules
- Return at most 10 matches, sorted by match_score descending.
- ONLY include supplier_id values present in the candidate list — never invent.
- recommended_action:
  - "request_quote": top-tier match, ready for RFQ
  - "request_sample": good match but need to verify quality first
  - "negotiate": match but pricing/MOQ not ideal — worth haggling
  - "skip": low fit, recommend not to engage`;

/* ────────────────────────────────────────────────────────────
 * Main entry point
 * ──────────────────────────────────────────────────────────── */

const EMBED_MODEL = "text-embedding-3-small";
const MATCHER_MODEL =
  process.env.OPENAI_MATCHER_MODEL ?? "gpt-4o-mini-2024-07-18";

export async function matchSuppliers(input: MatchInput): Promise<MatchOutput> {
  const startedAt = Date.now();

  if (!input.description?.trim()) {
    return {
      status: "failed",
      reason: "empty_description",
      message: "Description is required",
    };
  }

  /* ─── 1. Embed buyer's intent ─── */
  let embedding: number[];
  try {
    const e = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: enrichForEmbedding(input),
    });
    embedding = e.data[0].embedding;
  } catch (err) {
    return {
      status: "failed",
      reason: "embedding_failed",
      message: (err as Error).message,
      meta: { latency_ms: Date.now() - startedAt },
    };
  }

  /* ─── 2. Two-pronged vector search ─── */
  const supabase = getSupabaseAdmin();
  const originFilter =
    input.preferred_origin && input.preferred_origin.length === 1
      ? input.preferred_origin[0]
      : null;

  // (a) Match by product → great precision when buyer knows what they want
  const productResults = await supabase.rpc("match_supplier_products", {
    query_embedding: embedding,
    match_count: 15,
    country_filter: originFilter,
  });

  // (b) Match by supplier directly → covers cases where no product is indexed
  //     but the supplier's main_categories overlap.
  const supplierResults = await supabase.rpc("match_suppliers", {
    query_embedding: embedding,
    match_count: 10,
    country_filter: originFilter,
    require_form_e: input.required_form_e ?? false,
  });

  const productRows = (productResults.data ?? []) as any[];
  const supplierRows = (supplierResults.data ?? []) as any[];

  // Merge and dedupe supplier ids
  const supplierIds = Array.from(
    new Set([
      ...productRows.map((r) => r.supplier_id),
      ...supplierRows.map((r) => r.id),
    ])
  );

  if (supplierIds.length === 0) {
    return {
      status: "failed",
      reason: "no_candidates",
      message: "ไม่พบ supplier ที่ตรงกับ embedding — ลองใช้คำอธิบายอื่น",
      meta: { latency_ms: Date.now() - startedAt },
    };
  }

  /* ─── 3. Fetch full supplier dossiers for the LLM ─── */
  const { data: dossiers } = await supabase
    .from("suppliers")
    .select(
      "id, trade_name, country, city, established_year, staff_count, is_verified, trade_assurance, response_rate, response_hours_avg, on_time_delivery_rate, main_categories, supports_form_e, supports_form_rcep, rating, review_count, export_volume_usd_yearly"
    )
    .in("id", supplierIds);

  // Attach top product(s) per supplier for context
  const productsBySupplier = new Map<string, any[]>();
  for (const p of productRows) {
    const list = productsBySupplier.get(p.supplier_id) ?? [];
    if (list.length < 3) list.push(p);
    productsBySupplier.set(p.supplier_id, list);
  }

  const candidateBlock = (dossiers ?? [])
    .map((s: any) => formatSupplierForPrompt(s, productsBySupplier.get(s.id) ?? []))
    .join("\n\n");

  /* ─── 4. LLM ranking ─── */
  const userMessage = buildUserMessage(input, candidateBlock);

  let completion;
  try {
    completion = await openai.beta.chat.completions.parse({
      model: MATCHER_MODEL,
      temperature: 0.1, // small randomness for natural-sounding reasoning
      max_tokens: 3000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: zodResponseFormat(MatchResultSchema, "matches"),
    });
  } catch (err) {
    return mapOpenAIError(err, Date.now() - startedAt);
  }

  const msg = completion.choices[0]?.message;
  if (!msg || msg.refusal || !msg.parsed) {
    return {
      status: "failed",
      reason: "ai_invalid_response",
      message: msg?.refusal ?? "No parsed output",
      meta: { latency_ms: Date.now() - startedAt },
    };
  }

  // Sanity-check: drop any supplier_id the LLM hallucinated
  const validIds = new Set(supplierIds);
  const cleanMatches = msg.parsed.matches
    .filter((m) => validIds.has(m.supplier_id))
    .sort((a, b) => b.match_score - a.match_score);

  return {
    status: "success",
    data: { ...msg.parsed, matches: cleanMatches },
    meta: {
      embedding_model: EMBED_MODEL,
      matcher_model: completion.model,
      candidates_evaluated: supplierIds.length,
      prompt_tokens: completion.usage?.prompt_tokens ?? 0,
      completion_tokens: completion.usage?.completion_tokens ?? 0,
      latency_ms: Date.now() - startedAt,
    },
  };
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

function enrichForEmbedding(input: MatchInput): string {
  return [
    input.description,
    input.hs_code_hint && `HS Code: ${input.hs_code_hint}`,
    input.quantity && `Quantity: ${input.quantity} ${input.quantity_unit ?? "pcs"}`,
    input.required_certifications?.length &&
      `Required certs: ${input.required_certifications.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildUserMessage(input: MatchInput, candidateBlock: string): string {
  return `# Buyer's requirements
Description: ${input.description}
Quantity: ${input.quantity ?? "(not specified)"} ${input.quantity_unit ?? ""}
Target unit price: ${input.target_price_usd ? `$${input.target_price_usd}` : "(open)"}
Preferred origin: ${input.preferred_origin?.join(", ") ?? "(any)"}
Required Form E: ${input.required_form_e ? "YES" : "no"}
Required Form RCEP: ${input.required_form_rcep ? "YES" : "no"}
Required certifications: ${input.required_certifications?.join(", ") ?? "(none)"}
Incoterm: ${input.delivery_incoterm ?? "(open)"}
Delivery port: ${input.delivery_port ?? "(open)"}
Needed by: ${input.needed_by_date ?? "(flexible)"}
HS Code hint: ${input.hs_code_hint ?? "(unknown)"}

# Candidate suppliers
${candidateBlock}

Rank these candidates per the rubric. Output up to 10 matches sorted by score descending.`;
}

function formatSupplierForPrompt(s: any, products: any[]): string {
  return `--- supplier_id: ${s.id} ---
${s.trade_name} · ${s.city}, ${s.country}
Established: ${s.established_year} · ${s.staff_count} staff
Verified: ${s.is_verified} · Trade Assurance: ${s.trade_assurance}
Response rate: ${s.response_rate}% (avg ${s.response_hours_avg}h) · On-time: ${s.on_time_delivery_rate}%
Rating: ${s.rating}/5 (${s.review_count} reviews)
Export volume: $${(s.export_volume_usd_yearly / 1_000_000).toFixed(1)}M/year
Categories: ${(s.main_categories ?? []).join(", ")}
Supports: ${[s.supports_form_e && "Form E", s.supports_form_rcep && "Form RCEP"].filter(Boolean).join(", ") || "(no FTA forms)"}
${
  products.length > 0
    ? `Relevant products:\n${products
        .map(
          (p) =>
            `  • ${p.name_en} [HS ${p.hs_code}] MOQ ${p.moq}, $${p.price_min_usd}-${p.price_max_usd}, ${p.lead_time_days_min}d lead, eligible: ${(p.hs_form_eligible ?? []).join("/")}`
        )
        .join("\n")}`
    : "Products: (none indexed — use main_categories for matching)"
}`;
}

function mapOpenAIError(err: unknown, latency_ms: number): MatchOutput {
  const e = err as { name?: string; status?: number; message?: string };
  const message = e?.message ?? String(err);
  if (e?.name === "APIConnectionTimeoutError" || /timeout/i.test(message)) {
    return { status: "failed", reason: "ai_timeout", message, meta: { latency_ms } };
  }
  if (e?.status === 429) {
    return { status: "failed", reason: "ai_quota_exceeded", message, meta: { latency_ms } };
  }
  return { status: "failed", reason: "unknown_error", message, meta: { latency_ms } };
}
