"use server";

/**
 * Server Actions for the supplier-inquiry relay flow.
 *
 * Buyer clicks "Contact Supplier" on a profile → submits this form →
 * row lands in `supplier_inquiries` with status='pending'. LogisticsNex
 * ops forwards to the supplier out-of-band, then updates the row's
 * `supplier_response` + `status` so the buyer sees the reply.
 */
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SendInquirySchema = z.object({
  supplier_id: z.string().uuid(),
  subject: z.string().trim().min(6, "หัวข้ออย่างน้อย 6 ตัวอักษร").max(200),
  message: z.string().trim().min(20, "รายละเอียดอย่างน้อย 20 ตัวอักษร").max(5000),
  quantity: z.coerce.number().int().positive().optional(),
  quantity_unit: z.string().trim().max(20).optional().or(z.literal("")),
  target_price_usd: z.coerce.number().positive().optional(),
  needed_by_date: z.string().trim().optional().or(z.literal("")),
});

export type SendInquiryState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  inquiry_id?: string;
};

export async function sendInquiry(
  _prev: SendInquiryState | undefined,
  formData: FormData
): Promise<SendInquiryState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.default_org_id) {
    return { ok: false, message: "ไม่พบ organization ของผู้ใช้" };
  }

  const parsed = SendInquirySchema.safeParse({
    supplier_id: formData.get("supplier_id"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    quantity: formData.get("quantity") || undefined,
    quantity_unit: formData.get("quantity_unit") ?? "",
    target_price_usd: formData.get("target_price_usd") || undefined,
    needed_by_date: formData.get("needed_by_date") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as string;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, message: "ตรวจสอบข้อมูลในฟอร์มอีกครั้ง", fieldErrors };
  }

  const { data: inserted, error } = await supabase
    .from("supplier_inquiries")
    .insert({
      buyer_org_id: profile.default_org_id,
      buyer_user_id: user.id,
      supplier_id: parsed.data.supplier_id,
      subject: parsed.data.subject,
      message: parsed.data.message,
      quantity: parsed.data.quantity ?? null,
      quantity_unit: parsed.data.quantity_unit || "pcs",
      target_price_usd: parsed.data.target_price_usd ?? null,
      needed_by_date: parsed.data.needed_by_date || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, message: error?.message ?? "ส่ง inquiry ไม่สำเร็จ" };
  }

  revalidatePath("/marketplace/inquiries");
  revalidatePath(`/marketplace/suppliers/${parsed.data.supplier_id}`);

  return { ok: true, inquiry_id: inserted.id };
}

/**
 * Buyer cancels (closes) their own inquiry.
 */
export async function closeInquiry(inquiryId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };

  // RLS lets only the owning org update; further restrict the new value here.
  const { error } = await supabase
    .from("supplier_inquiries")
    .update({ status: "closed" })
    .eq("id", inquiryId);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/marketplace/inquiries");
  return { ok: true };
}
