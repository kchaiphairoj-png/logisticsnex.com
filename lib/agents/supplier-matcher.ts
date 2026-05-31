import { z } from "zod";
import { generateObject, embed, NoObjectGeneratedError } from "ai";
import { classifierModel, embeddingModel } from "@/lib/ai";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/* ────────────────────────────────────────────────────────────
 * Schemas
 * ──────────────────────────────────────────────────────────── */

export const SupplierMatchSchema = z.object({
  supplier_id: z.string().uuid(),
  match_score: z.number().min(0).max(1).describe("0..1 fit score."),
  reasoning: z.string().describe("ภาษาไทย — 1-2 ประโยคอธิบาย"),
  pros: z.array(z.string()).min(0).max(5),
  cons: z.array(z.string()).min(0).max(5),
  estimated_unit_price_usd: z
    .number()
    .nullable()
    .describe("Estimated unit price (USD) from supplier price range."),
  estimated_duty_saving_thb: z
    .number()
    .describe("Estimated duty saving (THB) via available FTA."),
  recommended_action: z.enum(["request_quote", "request_sample", "skip", "negotiate"]),
});

export const MatchResultSchema = z.object({
  matches: z.array(SupplierMatchSchema).min(0).max(10),
  insights: z.string().describe("ภาษาไทย — 2-3 ประโยค overall recommendation"),
});

export type SupplierMatch = z.infer<typeof SupplierMatchSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;

/* ────────────────────────────────────────────────────────────
 * Input + result
 * ──────────────────────────────────────────────────────────── */

export interface MatchInput {
  description: string;
  quantity?: number;
  quantity_unit?: string;
  target_price_usd?: number;
  preferred_origin?: string[];
  required_form_e?: boolean;
  required_form_rcep?: boolean;
  required_certifications?: string[];
  delivery_incoterm?: string;
  delivery_port?: string;
  needed_by_date?: string;
  hs_code_hint?: string;
}

export type MatchFailureReason =
  | "empty_description"
  | "embedding_failed"
  | "no_candidates"
  | "ai_timeout"
  | "ai_quota_exceeded"
  | "ai_invalid_response"
  | "unknown_error";

export interface MatchMeta {
  embedding_model: string;
  matcher_model: string;
  candidates_evaluated: number;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export type MatchOutput =
  | { status: "success"; data: MatchResult; meta: MatchMeta }
  | {
      status: "failed";
      reason: MatchFailureReason;
      message: string;
      meta?: Partial<MatchMeta>;
    };

/* ────────────────────────────────────────────────────────────
 * Prompt
 * ──────────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are an AI sourcing agent for Thai SME importers.
Given a buyer's requirements and a list of candidate suppliers (with their products,
verification status, FTA support, ratings, and trade history), score and rank
each supplier for fit.

# Scoring rubric (0..1)
Weight:
- Product spec match (40%) — does the supplier's product line actually fit?
- Trust signals (25%) — verified, trade assurance, rating, response rate, on-time delivery
- Commercial fit (20%) — MOQ vs buyer qty, price vs target, lead time vs deadline
- FTA / duty optimization (15%) — Form E for CN, Form D for ASEAN, etc.

# Scoring guide
- 0.90+: clear winner — verified + spec match + FTA + commercial fit
- 0.75-0.89: solid match — minor concerns
- 0.50-0.74: possible — real gaps
- <0.50: skip

# Reasoning style
- "reasoning", "pros", "cons", "insights" MUST be in Thai.
- Be specific: "ผลิต X รุ่น Y" not "ผลิตได้".

# Estimated duty saving formula
- saving_thb ≈ quantity × supplier_avg_price_usd × 36 × fta_diff_pct.

# Rules
- Return at most 10 matches, sorted by score descending.
- ONLY include supplier_id values from the candidate list — never invent.`;

/* ────────────────────────────────────────────────────────────
 * Main entry
 * ──────────────────────────────────────────────────────────── */

export async function matchSuppliers(input: MatchInput): Promise<MatchOutput> {
  const startedAt = Date.now();

  if (!input.description?.trim()) {
    return { status: "failed", reason: "empty_description", message: "Description is required" };
  }

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
      status: "failed",
      reason: "embedding_failed",
      message: (err as Error).message,
      meta: { latency_ms: Date.now() - startedAt },
    };
  }

  // 2. Two-pronged vector search
  const supabase = getSupabaseAdmin();
  const originFilter =
    input.preferred_origin && input.preferred_origin.length === 1
      ? input.preferred_origin[0]
      : null;

  const productResults = await supabase.rpc("match_supplier_products", {
    query_embedding: embedding,
    match_count: 15,
    country_filter: originFilter,
  });

  const supplierResults = await supabase.rpc("match_suppliers", {
    query_embedding: embedding,
    match_count: 10,
    country_filter: originFilter,
    require_form_e: input.required_form_e ?? false,
  });

  const productRows = (productResults.data ?? []) as any[];
  const supplierRows = (supplierResults.data ?? []) as any[];

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
      message: "ไม่พบ supplier ที่ตรงกับคำอธิบาย",
      meta: { latency_ms: Date.now() - startedAt },
    };
  }

  // 3. Fetch dossiers
  const { data: dossiers } = await supabase
    .from("suppliers")
    .select(
      "id, trade_name, country, city, established_year, staff_count, is_verified, trade_assurance, response_rate, response_hours_avg, on_time_delivery_rate, main_categories, supports_form_e, supports_form_rcep, rating, review_count, export_volume_usd_yearly"
    )
    .in("id", supplierIds);

  const productsBySupplier = new Map<string, any[]>();
  for (const p of productRows) {
    const list = productsBySupplier.get(p.supplier_id) ?? [];
    if (list.length < 3) list.push(p);
    productsBySupplier.set(p.supplier_id, list);
  }

  const candidateBlock = (dossiers ?? [])
    .map((s: any) => formatSupplierForPrompt(s, productsBySupplier.get(s.id) ?? []))
    .join("\n\n");

  // 4. LLM ranking
  const userMessage = buildUserMessage(input, candidateBlock);
  const model = classifierModel();

  let parsed: MatchResult;
  let usage: { inputTokens?: number; outputTokens?: number } | undefined;
  try {
    const result = await generateObject({
      model,
      schema: MatchResultSchema,
      system: SYSTEM_PROMPT,
      prompt: userMessage,
      temperature: 0.1,
    });
    parsed = result.object;
    usage = result.usage;
  } catch (err) {
    return mapAiError(err, Date.now() - startedAt);
  }

  // Sanity-check: drop hallucinated supplier_ids
  const validIds = new Set(supplierIds);
  const cleanMatches = parsed.matches
    .filter((m) => validIds.has(m.supplier_id))
    .sort((a, b) => b.match_score - a.match_score);

  return {
    status: "success",
    data: { ...parsed, matches: cleanMatches },
    meta: {
      embedding_model: "text-embedding-004",
      matcher_model: model.modelId,
      candidates_evaluated: supplierIds.length,
      latency_ms: Date.now() - startedAt,
      prompt_tokens: usage?.inputTokens ?? 0,
      completion_tokens: usage?.outputTokens ?? 0,
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
            `  • ${p.name_en} [HS ${p.hs_code}] MOQ ${p.moq}, $${p.price_min_usd}-${p.price_max_usd}, ${p.lead_time_days_min}d lead`
        )
        .join("\n")}`
    : "Products: (none indexed — use main_categories)"
}`;
}

function mapAiError(err: unknown, latency_ms: number): MatchOutput {
  const e = err as { statusCode?: number; message?: string };
  const message = e?.message ?? String(err);
  if (err instanceof NoObjectGeneratedError) {
    return {
      status: "failed",
      reason: "ai_invalid_response",
      message: "Model failed to produce valid JSON",
      meta: { latency_ms },
    };
  }
  if (/timeout/i.test(message)) {
    return { status: "failed", reason: "ai_timeout", message, meta: { latency_ms } };
  }
  if (e?.statusCode === 429 || /quota|rate/i.test(message)) {
    return { status: "failed", reason: "ai_quota_exceeded", message, meta: { latency_ms } };
  }
  return { status: "failed", reason: "unknown_error", message, meta: { latency_ms } };
}
