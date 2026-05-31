/**
 * Server-side queries for the /billing page.
 *
 * Data model:
 * - `subscription_plans` holds the catalog (6 rows: 3 plans × 2 cycles).
 *   The UI shows 3 plan cards (by name) and the cycle toggle picks the
 *   correct row at checkout time.
 * - `subscriptions` holds the org's current sub (one active row at a time).
 *   Joined to a plan to read name + price + quotas.
 * - `usage_counters` is bucketed by month (period_start) per org.
 */
import { createClient } from "@/lib/supabase/server";

export interface PlanFeatures {
  team_seats?: number;
  api_access?: boolean;
  marketplace?: boolean;
  sla?: string;
  [key: string]: unknown;
}

export interface PlanRow {
  id: string;
  code: string;
  name: string;
  price_thb: number;
  billing_cycle: "monthly" | "yearly";
  doc_quota: number;
  hs_lookup_quota: number;
  features: PlanFeatures;
}

/**
 * One "plan card" on the UI — collapses the monthly + yearly rows into one.
 * (e.g. "Professional" has 2 rows in DB but is shown as 1 card with a cycle toggle.)
 */
export interface PlanCard {
  name: string;            // "Starter" | "Professional" | "Enterprise"
  code_root: string;       // "starter" | "pro" | "ent"
  monthly_plan_id: string;
  yearly_plan_id: string;
  monthly_price_thb: number;
  yearly_price_thb: number;
  doc_quota: number;       // -1 means unlimited
  hs_lookup_quota: number;
  features: PlanFeatures;
}

export interface CurrentSubscription {
  id: string;
  status: "trialing" | "active" | "past_due" | "cancelled";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: {
    id: string;
    code: string;
    name: string;
    price_thb: number;
    billing_cycle: "monthly" | "yearly";
    doc_quota: number;
    hs_lookup_quota: number;
  };
}

export interface CurrentUsage {
  period_start: string;          // ISO date — first day of this calendar month
  docs_processed: number;
  hs_lookups: number;
  ai_tokens_used: number;
}

/* ────────────────────────────────────────────────────────────
 * Plan catalog
 * ──────────────────────────────────────────────────────────── */

/**
 * Returns all active plans grouped into 3 cards (by plan name).
 *
 * The DB stores 6 rows (Starter/Pro/Ent × monthly/yearly). The UI shows
 * 3 cards with a yearly-discount toggle, so we collapse here.
 */
export async function getActivePlanCards(): Promise<PlanCard[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select(
      "id, code, name, price_thb, billing_cycle, doc_quota, hs_lookup_quota, features"
    )
    .eq("is_active", true)
    .order("price_thb", { ascending: true });

  if (error || !data) return [];

  // Group rows by plan name → each name should have a monthly + yearly variant.
  const byName = new Map<string, PlanRow[]>();
  for (const row of data as PlanRow[]) {
    const list = byName.get(row.name) ?? [];
    list.push(row);
    byName.set(row.name, list);
  }

  const cards: PlanCard[] = [];
  for (const [name, rows] of byName.entries()) {
    const monthly = rows.find((r) => r.billing_cycle === "monthly");
    const yearly = rows.find((r) => r.billing_cycle === "yearly");
    if (!monthly || !yearly) continue;          // skip incomplete pairs
    cards.push({
      name,
      code_root: monthly.code.replace(/_m$/, ""), // "starter_m" → "starter"
      monthly_plan_id: monthly.id,
      yearly_plan_id: yearly.id,
      monthly_price_thb: Number(monthly.price_thb),
      yearly_price_thb: Number(yearly.price_thb),
      doc_quota: monthly.doc_quota,
      hs_lookup_quota: monthly.hs_lookup_quota,
      features: monthly.features ?? {},
    });
  }
  // Preserve catalog ordering (Starter < Pro < Enterprise by price)
  cards.sort((a, b) => a.monthly_price_thb - b.monthly_price_thb);
  return cards;
}

/* ────────────────────────────────────────────────────────────
 * Current subscription
 * ──────────────────────────────────────────────────────────── */

/**
 * The org's active subscription with plan details joined.
 * Returns null if the org has never subscribed.
 *
 * "Active" includes `trialing` so that trial users see their trial card.
 */
export async function getCurrentSubscription(
  orgId: string | null
): Promise<CurrentSubscription | null> {
  if (!orgId) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      `
        id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        plan:subscription_plans!inner (
          id, code, name, price_thb, billing_cycle, doc_quota, hs_lookup_quota
        )
      `
    )
    .eq("org_id", orgId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.plan) return null;

  // Supabase returns `plan` as an array when relationship is many-to-one
  // through PostgREST; normalize to a single object.
  const planRaw = Array.isArray(data.plan) ? data.plan[0] : data.plan;
  if (!planRaw) return null;

  return {
    id: data.id,
    status: data.status as CurrentSubscription["status"],
    current_period_start: data.current_period_start,
    current_period_end: data.current_period_end,
    cancel_at_period_end: data.cancel_at_period_end ?? false,
    plan: {
      id: planRaw.id,
      code: planRaw.code,
      name: planRaw.name,
      price_thb: Number(planRaw.price_thb),
      billing_cycle: planRaw.billing_cycle,
      doc_quota: planRaw.doc_quota,
      hs_lookup_quota: planRaw.hs_lookup_quota,
    },
  };
}

/* ────────────────────────────────────────────────────────────
 * Usage counter
 * ──────────────────────────────────────────────────────────── */

/**
 * Usage in the current calendar month. Returns zeros if no counter row exists.
 */
export async function getCurrentMonthUsage(
  orgId: string | null
): Promise<CurrentUsage> {
  const periodStart = firstDayOfThisMonth();
  if (!orgId) {
    return {
      period_start: periodStart,
      docs_processed: 0,
      hs_lookups: 0,
      ai_tokens_used: 0,
    };
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("usage_counters")
    .select("docs_processed, hs_lookups, ai_tokens_used")
    .eq("org_id", orgId)
    .eq("period_start", periodStart)
    .maybeSingle();

  return {
    period_start: periodStart,
    docs_processed: data?.docs_processed ?? 0,
    hs_lookups: data?.hs_lookups ?? 0,
    ai_tokens_used: Number(data?.ai_tokens_used ?? 0),
  };
}

function firstDayOfThisMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
