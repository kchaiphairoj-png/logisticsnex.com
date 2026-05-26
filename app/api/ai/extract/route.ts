import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractFromStorage } from "@/lib/agents/extractor";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
// Allow up to 60s — OpenAI vision on a multi-page PDF can be slow.
export const maxDuration = 60;

const BodySchema = z.object({
  document_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  /* ─── 1. AuthN/AuthZ ─────────────────────────────────────
   * Resolve the calling user, then look up the document and verify
   * the user belongs to that document's org. Bypassing RLS with the
   * service role is necessary to read Storage, but we MUST replicate
   * the access check ourselves.
   *
   * Wire this to your Supabase Auth middleware. Sketch only:
   *
   *   const { data: { user } } = await supabaseServer().auth.getUser();
   *   if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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

  const supabase = getSupabaseAdmin();

  /* ─── 2. Load the document row ───────────────────────────── */
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select("id, org_id, storage_path, ocr_status")
    .eq("id", body.document_id)
    .single();

  if (docErr || !doc) {
    return NextResponse.json(
      { error: "document_not_found", detail: docErr?.message },
      { status: 404 }
    );
  }

  // Idempotency — don't redo work that's already running or done.
  if (doc.ocr_status === "processing") {
    return NextResponse.json(
      { error: "already_processing" },
      { status: 409 }
    );
  }

  /* ─── 3. Mark processing ─────────────────────────────────── */
  await supabase
    .from("documents")
    .update({ ocr_status: "processing", updated_at: new Date().toISOString() })
    .eq("id", doc.id);

  /* ─── 4. Run the agent ───────────────────────────────────── */
  const result = await extractFromStorage(doc.storage_path);

  /* ─── 5. Persist result ──────────────────────────────────── */
  if (result.status === "success") {
    const { data, meta } = result;

    await supabase
      .from("documents")
      .update({
        ocr_status: "done",
        ocr_confidence: data.ai_confidence,
        doc_number: data.invoice_number,
        issue_date: data.invoice_date,
        supplier_name: data.shipper_name,
        buyer_name: data.consignee_name,
        currency: data.currency,
        total_amount: data.total_amount,
        raw_extraction: data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doc.id);

    // Insert line items
    if (data.items.length > 0) {
      await supabase.from("document_items").insert(
        data.items.map((item, i) => ({
          document_id: doc.id,
          org_id: doc.org_id,
          line_no: i + 1,
          description: item.item_description,
          qty: item.quantity,
          unit_price: item.unit_price,
          amount: item.total_price,
          // country_of_origin saved on item; HS classification runs separately
        }))
      );
    }

    // Audit + usage tracking
    await Promise.all([
      supabase.from("audit_logs").insert({
        org_id: doc.org_id,
        action: "document.extract",
        resource_type: "document",
        resource_id: doc.id,
        metadata: { meta, item_count: data.items.length },
      }),
      supabase.rpc("increment_usage", {
        p_org_id: doc.org_id,
        p_docs: 1,
        p_tokens: meta.prompt_tokens + meta.completion_tokens,
      }),
    ]);

    return NextResponse.json({ status: "success", data, meta });
  }

  /* failed_to_parse */
  await supabase
    .from("documents")
    .update({
      ocr_status: "failed",
      raw_extraction: { failure: result },
      updated_at: new Date().toISOString(),
    })
    .eq("id", doc.id);

  await supabase.from("audit_logs").insert({
    org_id: doc.org_id,
    action: "document.extract.failed",
    resource_type: "document",
    resource_id: doc.id,
    metadata: {
      reason: result.reason,
      message: result.message,
      retryable: result.retryable,
      meta: result.meta,
    },
  });

  // 200 with status="failed_to_parse" — this is a known business outcome,
  // not an HTTP error. Frontend renders "human review" UI accordingly.
  return NextResponse.json(result);
}
