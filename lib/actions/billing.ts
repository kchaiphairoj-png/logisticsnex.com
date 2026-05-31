"use server";

/**
 * Server Actions for the /billing page.
 *
 * For now we don't have a real payment gateway wired up. The "checkout"
 * flow simulates a 14-day trial subscription on the chosen plan, so the
 * user can immediately exercise the feature gates the plan unlocks.
 *
 * Real money flow (Omise / Stripe webhook → activate) is a TODO that will
 * sit on top of the same `subscriptions` row.
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const TRIAL_DAYS = 14;

const ChangePlanSchema = z.object({
  plan_id: z.string().uuid(),
});

export type ChangePlanState = {
  ok: boolean;
  message?: string;
};

export async function startTrialOnPlan(
  _prev: ChangePlanState | undefined,
  formData: FormData
): Promise<ChangePlanState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };

  // Resolve user → default org
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.default_org_id) {
    return { ok: false, message: "ไม่พบ organization ของผู้ใช้" };
  }
  const orgId = profile.default_org_id;

  // Validate plan_id
  const parsed = ChangePlanSchema.safeParse({
    plan_id: formData.get("plan_id"),
  });
  if (!parsed.success) {
    return { ok: false, message: "แพ็กเกจที่เลือกไม่ถูกต้อง" };
  }
  const planId = parsed.data.plan_id;

  // Sanity-check the plan exists + read its cycle to set the period end
  const { data: plan, error: planErr } = await supabase
    .from("subscription_plans")
    .select("billing_cycle, name")
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle();

  if (planErr || !plan) {
    return { ok: false, message: "ไม่พบแพ็กเกจในระบบ" };
  }

  // Calculate the period:
  //   - new subscription → trial (TRIAL_DAYS days) then bills for the cycle
  //   - existing subscription → swap plan, keep period
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  // Is there already an active/trialing/past_due row for this org?
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("org_id", orgId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Plan swap — keep the existing period, just point at the new plan.
    const { error } = await supabase
      .from("subscriptions")
      .update({ plan_id: planId })
      .eq("id", existing.id);
    if (error) return { ok: false, message: error.message };
  } else {
    // First-time subscriber — start the trial.
    const { error } = await supabase.from("subscriptions").insert({
      org_id: orgId,
      plan_id: planId,
      status: "trialing",
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
    });
    if (error) return { ok: false, message: error.message };
  }

  revalidatePath("/billing");
  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return {
    ok: true,
    message: existing
      ? `เปลี่ยนแผนเป็น ${plan.name} สำเร็จ`
      : `เริ่มทดลองใช้ ${plan.name} ฟรี ${TRIAL_DAYS} วัน — ทีมจะติดต่อเรื่องชำระเงินก่อนหมดทดลอง`,
  };
}
