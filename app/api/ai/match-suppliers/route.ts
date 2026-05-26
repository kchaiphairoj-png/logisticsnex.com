import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  description: z.string().min(5),
  quantity: z.number().int().positive().optional(),
  quantity_unit: z.string().optional(),
  target_price_usd: z.number().positive().optional(),
  preferred_origin: z.array(z.string().length(2)).optional(),
  required_form_e: z.boolean().optional(),
  required_form_rcep: z.boolean().optional(),
  required_certifications: z.array(z.string()).optional(),
  delivery_incoterm: z.string().optional(),
  delivery_port: z.string().optional(),
  needed_by_date: z.string().optional(),
  hs_code_hint: z.string().optional(),

  // For audit logging — optional
  rfq_id: z.string().uuid().optional(),
  org_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  // Dynamic imports — see /api/ai/extract for rationale
  const { matchSuppliers } = await import("@/lib/agents/supplier-matcher");
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_request", detail: (e as Error).message },
      { status: 400 }
    );
  }

  const result = await matchSuppliers(body);

  // Persist match log + bump usage
  if (body.org_id && result.status === "success") {
    const supabase = getSupabaseAdmin();
    await Promise.all([
      supabase.from("supplier_match_logs").insert({
        rfq_id: body.rfq_id ?? null,
        org_id: body.org_id,
        matched_suppliers: result.data.matches,
        model_used: result.meta.matcher_model,
        prompt_tokens: result.meta.prompt_tokens,
        completion_tokens: result.meta.completion_tokens,
        latency_ms: result.meta.latency_ms,
      }),
      supabase.rpc("increment_usage", {
        p_org_id: body.org_id,
        p_tokens:
          result.meta.prompt_tokens + result.meta.completion_tokens,
      }),
    ]);
  }

  return NextResponse.json(result);
}
