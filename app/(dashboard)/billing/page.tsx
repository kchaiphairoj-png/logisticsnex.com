/**
 * /billing — Server Component
 *
 * Fetches the plan catalog, the org's current subscription, and current-month
 * usage from Supabase, then delegates the interactive checkout UI to
 * <BillingClient />.
 */
import Link from "next/link";
import { ChevronRight, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingClient } from "./billing-client";
import { requireUser } from "@/lib/auth";
import {
  getActivePlanCards,
  getCurrentSubscription,
  getCurrentMonthUsage,
  type CurrentSubscription,
  type CurrentUsage,
} from "@/lib/queries/billing";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireUser("/billing");
  const orgId = user.default_org_id;

  const [plans, subscription, usage] = await Promise.all([
    getActivePlanCards(),
    getCurrentSubscription(orgId),
    getCurrentMonthUsage(orgId),
  ]);

  const currentCodeRoot = subscription
    ? deriveCodeRoot(subscription.plan.code)
    : null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/dashboard"
          className="hover:text-foreground transition-colors"
        >
          หน้าแรก
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">ชำระเงิน & แพ็กเกจ</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {subscription ? "จัดการแพ็กเกจ" : "อัปเกรดแพ็กเกจ"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ปลดล็อกศักยภาพ AI สำหรับธุรกิจนำเข้า-ส่งออกของคุณ
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-muted-foreground">
            ปลอดภัยด้วย <span className="font-medium text-foreground">SSL 256-bit</span>{" "}
            · ผ่าน{" "}
            <span className="font-medium text-foreground">Omise</span>
          </span>
        </div>
      </div>

      {/* Current subscription banner (only when there is one) */}
      {subscription && (
        <CurrentSubscriptionBanner sub={subscription} usage={usage} />
      )}

      {/* Plan selector + checkout */}
      <BillingClient
        plans={plans}
        currentCodeRoot={currentCodeRoot}
        hasActiveSubscription={Boolean(subscription)}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Subcomponents (server-rendered)
 * ──────────────────────────────────────────────────────────── */

function CurrentSubscriptionBanner({
  sub,
  usage,
}: {
  sub: CurrentSubscription;
  usage: CurrentUsage;
}) {
  const daysLeft = daysUntil(sub.current_period_end);
  const isTrialing = sub.status === "trialing";
  const docsPct = pctOfQuota(usage.docs_processed, sub.plan.doc_quota);
  const lookupsPct = pctOfQuota(usage.hs_lookups, sub.plan.hs_lookup_quota);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isTrialing
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              }
            >
              {isTrialing ? "ทดลองใช้" : "ใช้งานอยู่"}
            </Badge>
            <h2 className="text-base font-semibold">
              {sub.plan.name} ({sub.plan.billing_cycle === "yearly" ? "รายปี" : "รายเดือน"})
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {isTrialing ? (
              <>
                <AlertTriangle className="mr-1 inline h-3 w-3 text-amber-400" />
                หมดทดลองในอีก{" "}
                <span className="font-medium text-foreground">{daysLeft}</span>{" "}
                วัน (วันที่ {formatThaiDate(sub.current_period_end)})
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-400" />
                ต่ออายุอัตโนมัติวันที่ {formatThaiDate(sub.current_period_end)}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Usage bars */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <UsageBar
          label="เอกสาร"
          used={usage.docs_processed}
          quota={sub.plan.doc_quota}
          pct={docsPct}
        />
        <UsageBar
          label="HS Code Lookup"
          used={usage.hs_lookups}
          quota={sub.plan.hs_lookup_quota}
          pct={lookupsPct}
        />
      </div>
    </Card>
  );
}

function UsageBar({
  label,
  used,
  quota,
  pct,
}: {
  label: string;
  used: number;
  quota: number;
  pct: number;
}) {
  const unlimited = quota < 0;
  const isNearLimit = pct >= 80 && !unlimited;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xs tabular-nums">
          <span className="font-semibold text-foreground">
            {used.toLocaleString()}
          </span>
          <span className="text-muted-foreground">
            {" "}
            / {unlimited ? "ไม่จำกัด" : quota.toLocaleString()}
          </span>
        </p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${
            unlimited
              ? "bg-emerald-500/40"
              : isNearLimit
              ? "bg-amber-500"
              : "bg-primary"
          }`}
          style={{ width: `${unlimited ? 8 : Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */

/** "starter_m" / "starter_y" → "starter"; "pro_m" → "pro"; "ent_m" → "ent" */
function deriveCodeRoot(code: string): string {
  return code.replace(/_(m|y)$/, "");
}

function pctOfQuota(used: number, quota: number): number {
  if (quota < 0) return 0; // unlimited
  if (quota === 0) return 100;
  return Math.round((used / quota) * 100);
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatThaiDate(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
