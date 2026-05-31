"use client";
import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Lock, Tag, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PlanSelector, type Cycle } from "@/components/dashboard/plan-selector";
import { PaymentForm } from "@/components/dashboard/payment-form";
import { formatTHB } from "@/lib/utils";
import { startTrialOnPlan, type ChangePlanState } from "@/lib/actions/billing";
import type { PlanCard } from "@/lib/queries/billing";

const VAT_RATE = 0.07;

interface Props {
  plans: PlanCard[];
  /** Plan code_root of the current subscription, if any — used to preselect. */
  currentCodeRoot: string | null;
  /** Whether the org already has an active/trialing subscription. */
  hasActiveSubscription: boolean;
}

export function BillingClient({
  plans,
  currentCodeRoot,
  hasActiveSubscription,
}: Props) {
  // Default selection: current plan if any, else "pro" (popular), else first.
  const defaultSelected =
    (currentCodeRoot && plans.find((p) => p.code_root === currentCodeRoot)?.code_root) ??
    plans.find((p) => p.code_root === "pro")?.code_root ??
    plans[0]?.code_root ??
    "";

  const [selected, setSelected] = React.useState(defaultSelected);
  const [cycle, setCycle] = React.useState<Cycle>("yearly");
  const [coupon, setCoupon] = React.useState("");
  const [discount, setDiscount] = React.useState(0);

  const [state, formAction] = useFormState<ChangePlanState | undefined, FormData>(
    startTrialOnPlan,
    undefined
  );

  const plan = plans.find((p) => p.code_root === selected);
  const subtotal = plan
    ? cycle === "monthly"
      ? plan.monthly_price_thb
      : plan.yearly_price_thb
    : 0;
  const couponAmount = discount;
  const beforeVat = Math.max(0, subtotal - couponAmount);
  const vat = Math.round(beforeVat * VAT_RATE);
  const total = beforeVat + vat;

  // The plan_id we'll actually submit (DB has 2 rows per plan — pick by cycle).
  const planIdToSubmit = plan
    ? cycle === "monthly"
      ? plan.monthly_plan_id
      : plan.yearly_plan_id
    : "";

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "WELCOME10") {
      setDiscount(Math.round(subtotal * 0.1));
    } else {
      setDiscount(0);
    }
  };

  // Reset discount when cycle changes (the % stays but amount depends on subtotal)
  React.useEffect(() => {
    if (coupon.trim().toUpperCase() === "WELCOME10") {
      setDiscount(Math.round(subtotal * 0.1));
    }
  }, [cycle, subtotal, coupon]);

  if (!plan) {
    return (
      <Card className="p-8 text-center text-sm text-muted-foreground">
        ยังไม่มีแพ็กเกจในระบบ
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: plan + payment form */}
      <div className="space-y-6 lg:col-span-2">
        <PlanSelector
          plans={plans}
          selected={selected}
          onSelect={setSelected}
          cycle={cycle}
          onCycleChange={setCycle}
        />
        <Separator />
        <PaymentForm />
      </div>

      {/* Right: order summary (sticky) */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20 overflow-hidden">
          <div className="border-b border-border bg-gradient-to-br from-blue-500/10 via-card to-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              สรุปคำสั่งซื้อ
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold">{plan.name} Plan</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {cycle === "monthly" ? "รายเดือน" : "รายปี"}
            </p>
          </div>

          <form action={formAction} className="space-y-4 p-5">
            <input type="hidden" name="plan_id" value={planIdToSubmit} />

            {/* Coupon */}
            <div>
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> โค้ดส่วนลด
              </label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  placeholder="ใส่โค้ด (ลอง WELCOME10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="h-9 text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={applyCoupon}
                >
                  ใช้
                </Button>
              </div>
              {discount > 0 && (
                <p className="mt-1.5 text-xs text-emerald-400">
                  ✓ ใช้โค้ด WELCOME10 — ลด 10%
                </p>
              )}
            </div>

            <Separator />

            {/* Line items */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {plan.name} ({cycle === "monthly" ? "1 เดือน" : "12 เดือน"})
                </span>
                <span className="tabular-nums">{formatTHB(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>ส่วนลด WELCOME10</span>
                  <span className="tabular-nums">-{formatTHB(couponAmount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">VAT 7%</span>
                <span className="tabular-nums">{formatTHB(vat)}</span>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">ยอดรวมทั้งสิ้น</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums text-primary">
                    {formatTHB(total)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {cycle === "yearly" ? "เก็บปีละครั้ง" : "เก็บทุกเดือน"} · ยกเลิกได้ทุกเมื่อ
                  </p>
                </div>
                <Lock className="h-7 w-7 text-primary/60" />
              </div>
            </div>

            {/* Inline action feedback */}
            {state?.ok === false && state.message && (
              <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-500/5 p-2.5 text-xs">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-400">{state.message}</p>
              </div>
            )}
            {state?.ok === true && state.message && (
              <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-emerald-400">{state.message}</p>
              </div>
            )}

            <SubmitButton
              total={total}
              isUpgrade={hasActiveSubscription && currentCodeRoot !== plan.code_root}
              isSamePlan={hasActiveSubscription && currentCodeRoot === plan.code_root}
            />

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              การกดปุ่ม "ยืนยัน" หมายความว่าคุณยอมรับ{" "}
              <a className="text-primary hover:underline">เงื่อนไขการใช้งาน</a> และ{" "}
              <a className="text-primary hover:underline">นโยบายความเป็นส่วนตัว</a>
              {!hasActiveSubscription && (
                <>
                  {" "}— เริ่มทดลองใช้ฟรี 14 วัน ทีมจะติดต่อก่อนหมดทดลอง
                </>
              )}
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

function SubmitButton({
  total,
  isUpgrade,
  isSamePlan,
}: {
  total: number;
  isUpgrade: boolean;
  isSamePlan: boolean;
}) {
  const { pending } = useFormStatus();
  let label: string;
  if (isSamePlan) {
    label = "แผนปัจจุบัน";
  } else if (isUpgrade) {
    label = "เปลี่ยนเป็นแผนนี้";
  } else {
    label = `เริ่มทดลองใช้ ${formatTHB(total)}`;
  }
  return (
    <Button className="w-full" size="lg" type="submit" disabled={pending || isSamePlan}>
      <Lock className="h-4 w-4" />
      {pending ? "กำลังบันทึก..." : label}
    </Button>
  );
}
