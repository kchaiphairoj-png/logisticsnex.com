/**
 * Server-side queries for the documents/analysis pages.
 * RLS enforces org isolation — no orgId filter needed when using the
 * authenticated client. We still accept orgId to keep queries explicit.
 */
import { createClient } from "@/lib/supabase/server";

export type DocumentStatus = "pending" | "processing" | "done" | "failed";

export interface DocumentListItem {
  id: string;
  doc_number: string | null;
  doc_type: string;
  supplier_name: string | null;
  origin_country: string | null;
  item_count: number;
  avg_confidence: number;
  total_value_thb: number;
  total_tax_thb: number;
  ocr_status: DocumentStatus;
  created_at: string;
}

export interface DocumentListFilter {
  org_id: string;
  status?: DocumentStatus | "all";
  q?: string;
  page?: number;
  page_size?: number;
}

export async function listDocuments(filter: DocumentListFilter) {
  const supabase = createClient();
  const page = filter.page ?? 1;
  const pageSize = filter.page_size ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("documents")
    .select(
      "id, doc_number, doc_type, supplier_name, origin_country, total_amount, ocr_status, ocr_confidence, created_at, document_items(count)",
      { count: "exact" }
    )
    .eq("org_id", filter.org_id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filter.status && filter.status !== "all") {
    query = query.eq("ocr_status", filter.status);
  }
  if (filter.q && filter.q.trim()) {
    const term = `%${filter.q.trim()}%`;
    query = query.or(`doc_number.ilike.${term},supplier_name.ilike.${term}`);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  const items: DocumentListItem[] = (data ?? []).map((d: any) => ({
    id: d.id,
    doc_number: d.doc_number,
    doc_type: d.doc_type,
    supplier_name: d.supplier_name,
    origin_country: d.origin_country,
    item_count: d.document_items?.[0]?.count ?? 0,
    avg_confidence: Number(d.ocr_confidence ?? 0),
    total_value_thb: Number(d.total_amount ?? 0),
    total_tax_thb: Math.round(Number(d.total_amount ?? 0) * 0.17), // approximate
    ocr_status: d.ocr_status,
    created_at: d.created_at,
  }));

  return {
    items,
    total: count ?? 0,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

/**
 * Aggregate stats for the 4 tiles on /analysis page header.
 */
export async function getDocumentSummary(orgId: string) {
  const supabase = createClient();

  const [allRes, successRes, reviewRes, monthRes] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .is("deleted_at", null),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("ocr_status", "done")
      .is("deleted_at", null),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("ocr_status", "done")
      .lt("ocr_confidence", 0.7)
      .is("deleted_at", null),
    supabase
      .from("documents")
      .select("total_amount")
      .eq("org_id", orgId)
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .is("deleted_at", null),
  ]);

  const total = allRes.count ?? 0;
  const success = successRes.count ?? 0;
  const review = reviewRes.count ?? 0;
  const monthSum = (monthRes.data ?? []).reduce(
    (s, d) => s + (Number(d.total_amount) || 0),
    0
  );

  return {
    total,
    success_count: success,
    success_pct: total > 0 ? (success / total) * 100 : 0,
    review_count: review,
    review_pct: total > 0 ? (review / total) * 100 : 0,
    month_value_thb: Math.round(monthSum),
  };
}
