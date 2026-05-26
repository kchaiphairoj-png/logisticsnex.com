import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { classifyHsCode, type HsClassifyResult } from "@/lib/agents/hs-classifier";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const ItemSchema = z.object({
  item_description: z.string().min(1),
  origin_country: z.string().length(2).optional(), // ISO-3166 alpha-2
  supplier_name: z.string().optional(),
  chapter_hint: z
    .string()
    .regex(/^\d{2}$/, "Must be 2-digit HS chapter")
    .optional(),
  additional_context: z.string().optional(),

  // Optional — if provided, the result is persisted as an hs_code_logs row
  // tied to a specific line item. If omitted, classification is "preview only".
  document_item_id: z.string().uuid().optional(),
});

const BodySchema = z.union([
  // Single classification
  ItemSchema,
  // Batch (e.g. classify all items in an invoice at once)
  z.object({
    org_id: z.string().uuid(),
    items: z.array(ItemSchema).min(1).max(50),
  }),
]);

export async function POST(req: NextRequest) {
  /* ─── AuthN/AuthZ ─────────────────────────────────────────
   * Wire to your Supabase Auth middleware. The caller's user MUST be
   * a member of the org that owns the document_item being classified.
   * Sketch only — see /api/ai/extract for the same pattern.
   */

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_request", detail: (e as Error).message },
      { status: 400 }
    );
  }

  // Normalize to batch shape
  const { org_id, items } =
    "items" in body
      ? body
      : { org_id: undefined, items: [body] };

  // Run all items in parallel — each call is ~2-3s, so batch of 10 ≈ 3s total.
  const results = await Promise.all(
    items.map((item) =>
      classifyHsCode({
        description: item.item_description,
        origin_country: item.origin_country,
        supplier_name: item.supplier_name,
        chapter_hint: item.chapter_hint,
        additional_context: item.additional_context,
      })
    )
  );

  // Persist hs_code_logs + bump usage_counters
  if (org_id) {
    await persistResults(org_id, items, results);
  }

  // Single-item response shape preserved for callers that sent single.
  if (!("items" in body)) {
    return NextResponse.json(results[0]);
  }
  return NextResponse.json({ results });
}

async function persistResults(
  org_id: string,
  items: z.infer<typeof ItemSchema>[],
  results: HsClassifyResult[]
) {
  const supabase = getSupabaseAdmin();

  let totalTokens = 0;
  const logRows = results.map((r, i) => {
    const item = items[i];
    const top =
      r.status === "success"
        ? r.data
        : r.status === "needs_review"
        ? r.partial
        : undefined;

    const meta = r.status === "success" ? r.meta : r.meta;
    if (meta && "prompt_tokens" in meta) {
      totalTokens +=
        (meta.prompt_tokens as number) + (meta.completion_tokens as number);
    }

    return {
      org_id,
      document_item_id: item.document_item_id ?? null,
      input_text: item.item_description,
      suggested_codes: top
        ? [
            {
              code: top.hs_code_8,
              conf: top.confidence,
              reason: top.reasoning,
            },
            ...top.alternatives.map((a) => ({
              code: a.hs_code,
              conf: a.confidence,
              reason: a.why_not_chosen,
            })),
          ]
        : [],
      selected_code: null, // Filled when user confirms in UI
      model_used: meta?.classifier_model ?? null,
      prompt_tokens: (meta as any)?.prompt_tokens ?? null,
      completion_tokens: (meta as any)?.completion_tokens ?? null,
      latency_ms: meta?.latency_ms ?? null,
    };
  });

  await Promise.all([
    supabase.from("hs_code_logs").insert(logRows),
    supabase.rpc("increment_usage", {
      p_org_id: org_id,
      p_hs_lookups: items.length,
      p_tokens: totalTokens,
    }),
  ]);
}
