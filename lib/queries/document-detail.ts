/**
 * Server query for the /analysis/[id] page.
 * Returns document + items + signed storage URL.
 */
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin, DOC_BUCKET } from "@/lib/supabase-admin";

export interface DocumentDetail {
  id: string;
  org_id: string;
  doc_number: string | null;
  doc_type: string;
  issue_date: string | null;
  supplier_name: string | null;
  buyer_name: string | null;
  incoterm: string | null;
  currency: string | null;
  total_amount: number | null;
  origin_country: string | null;
  dest_country: string | null;
  storage_path: string;
  ocr_status: "pending" | "processing" | "done" | "failed";
  ocr_confidence: number | null;
  raw_extraction: unknown;
  notes: string | null;
  created_at: string;
  items: DocumentItem[];
  signed_file_url: string | null;
}

export interface DocumentItem {
  id: string;
  line_no: number | null;
  description: string;
  description_th: string | null;
  qty: number | null;
  unit: string | null;
  unit_price: number | null;
  amount: number | null;
  hs_code: string | null;
  hs_confidence: number | null;
  country_of_origin: string | null;
  verified_by_user: boolean;
}

export async function getDocumentDetail(id: string): Promise<DocumentDetail | null> {
  const supabase = createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select(
      "id, org_id, doc_number, doc_type, issue_date, supplier_name, buyer_name, incoterm, currency, total_amount, origin_country, dest_country, storage_path, ocr_status, ocr_confidence, raw_extraction, notes, created_at"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!doc) return null;

  const { data: items } = await supabase
    .from("document_items")
    .select(
      "id, line_no, description, description_th, qty, unit, unit_price, amount, hs_code, hs_confidence, country_of_origin, verified_by_user"
    )
    .eq("document_id", id)
    .order("line_no", { ascending: true });

  // Signed URL for the file preview — service role since storage path
  // is org-scoped under documents/{org_id}/...
  let signedUrl: string | null = null;
  try {
    const admin = getSupabaseAdmin();
    const { data: signed } = await admin.storage
      .from(DOC_BUCKET)
      .createSignedUrl(doc.storage_path, 60 * 30); // 30 min
    signedUrl = signed?.signedUrl ?? null;
  } catch {
    // Storage may not have the file yet (or wrong permissions); ignore.
  }

  return {
    ...doc,
    items: (items ?? []) as DocumentItem[],
    signed_file_url: signedUrl,
  } as DocumentDetail;
}

/**
 * Aggregate duty/VAT figures for the right-side panel.
 * Uses simple approximations — for precise rates plug `hs_code_reference.duty_rate`.
 */
export function calcDutySummary(doc: DocumentDetail) {
  const fobUsd = (doc.items ?? []).reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const fxRate = 36; // TODO: pull from FX table
  const cifThb = Math.round(fobUsd * fxRate * 1.05); // +5% freight/insurance estimate
  const dutyAvgPct = 7.5; // estimate when HS codes not yet classified
  const duty = Math.round(cifThb * (dutyAvgPct / 100));
  const localTax = Math.round(duty * 0.1); // ภาษีมหาดไทย
  const dutyTotal = duty + localTax;
  const vat = Math.round((cifThb + dutyTotal) * 0.07);

  return {
    fob_usd: fobUsd,
    cif_thb: cifThb,
    duty_avg_pct: dutyAvgPct,
    duty_thb: duty,
    local_tax_thb: localTax,
    duty_total_thb: dutyTotal,
    vat_thb: vat,
    grand_total_thb: dutyTotal + vat,
  };
}
