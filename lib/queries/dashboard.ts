/**
 * Server-side queries for the dashboard.
 * All queries run as the current user — RLS enforces org isolation.
 */
import { createClient } from "@/lib/supabase/server";
import type { SummaryCardsData } from "@/components/dashboard/summary-cards";
import type { RecentDocumentRow } from "@/components/dashboard/recent-activity";

const PRO_PLAN_CREDITS = 2000; // fallback default for trial users

/**
 * Aggregate stats for the 3 summary cards.
 * Falls back to zeros if the user has no org yet.
 */
export async function getDashboardSummary(orgId: string | null): Promise<SummaryCardsData> {
  if (!orgId) {
    return {
      pending_docs: 0,
      needs_review: 0,
      delta_pending: 0,
      tax_total_thb: 0,
      docs_count: 0,
      tax_delta_pct: 0,
      ai_credits_left: PRO_PLAN_CREDITS,
      ai_credits_total: PRO_PLAN_CREDITS,
      ai_credits_reset_days: 30,
    };
  }

  const supabase = createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [pendingRes, reviewRes, monthDocsRes, deltaRes, usageRes] = await Promise.all([
    // Pending = docs not yet "done"
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .in("ocr_status", ["pending", "processing"])
      .is("deleted_at", null),
    // Needs review = low confidence done docs
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("ocr_status", "done")
      .lt("ocr_confidence", 0.7)
      .is("deleted_at", null),
    // Docs + total tax this month
    supabase
      .from("documents")
      .select("total_amount")
      .eq("org_id", orgId)
      .gte("created_at", monthStart)
      .is("deleted_at", null),
    // Pending delta since yesterday
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .in("ocr_status", ["pending", "processing"])
      .gte("created_at", yesterday)
      .is("deleted_at", null),
    // Usage counter for current month
    supabase
      .from("usage_counters")
      .select("docs_processed, hs_lookups, ai_tokens_used")
      .eq("org_id", orgId)
      .eq("period_start", monthStart.slice(0, 10))
      .maybeSingle(),
  ]);

  const monthDocs = monthDocsRes.data ?? [];
  const taxTotal = monthDocs.reduce(
    (sum, d) => sum + (Number(d.total_amount) || 0) * 0.17, // ~17% combined duty+VAT
    0
  );

  const aiLookupsUsed = usageRes.data?.hs_lookups ?? 0;
  const aiCreditsTotal = PRO_PLAN_CREDITS;
  const aiCreditsLeft = Math.max(0, aiCreditsTotal - aiLookupsUsed);

  // Days until end of month (when usage resets)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const resetDays = Math.max(1, lastDay - now.getDate());

  return {
    pending_docs: pendingRes.count ?? 0,
    needs_review: reviewRes.count ?? 0,
    delta_pending: deltaRes.count ?? 0,
    tax_total_thb: Math.round(taxTotal),
    docs_count: monthDocs.length,
    tax_delta_pct: 0, // Comparing months needs more data — leave 0 for now
    ai_credits_left: aiCreditsLeft,
    ai_credits_total: aiCreditsTotal,
    ai_credits_reset_days: resetDays,
  };
}

/**
 * Most recent documents for the activity table on the dashboard.
 */
export async function getRecentDocuments(
  orgId: string | null,
  limit = 5
): Promise<RecentDocumentRow[]> {
  if (!orgId) return [];

  const supabase = createClient();
  const { data: docs } = await supabase
    .from("documents")
    .select(
      "id, doc_number, doc_type, supplier_name, total_amount, ocr_status, updated_at, document_items(count)"
    )
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (docs ?? []).map((d: any) => ({
    id: d.id,
    doc_number: d.doc_number,
    doc_type: d.doc_type,
    supplier_name: d.supplier_name,
    total_amount: d.total_amount,
    hs_codes_count: d.document_items?.[0]?.count ?? 0,
    ocr_status: d.ocr_status,
    updated_relative: formatRelative(d.updated_at),
  }));
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชม. ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}
