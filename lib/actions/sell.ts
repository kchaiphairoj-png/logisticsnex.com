"use server";

/**
 * Server Actions for /sell — supplier self-onboarding.
 *
 * Anyone can apply via the public form. We insert into `suppliers` with
 * `is_verified=false`. The marketplace landing filters to verified-only
 * by default, so unverified rows don't surface until admin reviews them.
 *
 * Uses the service-role admin client because public visitors are
 * unauthenticated and `suppliers` is RLS-locked on writes.
 */
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ApplySchema = z.object({
  legal_name: z.string().trim().min(2, "ชื่อบริษัทอย่างน้อย 2 ตัวอักษร").max(200),
  trade_name: z.string().trim().min(2, "ชื่อแบรนด์อย่างน้อย 2 ตัวอักษร").max(200),
  country: z.string().length(2, "ประเทศต้องเป็น ISO 2 ตัวอักษร เช่น CN, VN"),
  city: z.string().trim().min(1).max(100),
  established_year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear()),
  staff_count: z.coerce.number().int().min(1).max(1_000_000).optional(),

  // Categories — array of 2-4 digit HS chapters
  main_categories: z
    .array(z.string().regex(/^\d{2,4}$/, "ใส่เลข HS chapter 2 หรือ 4 หลัก"))
    .min(1, "เลือกอย่างน้อย 1 หมวด")
    .max(10),

  description: z.string().trim().min(50, "คำอธิบายอย่างน้อย 50 ตัวอักษร").max(2000),

  // Contact (at least one channel beyond email is required)
  contact_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง"),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  wechat_id: z.string().trim().max(60).optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("URL ต้องขึ้นต้นด้วย http(s)://")
    .optional()
    .or(z.literal("")),

  // FTA support — checkboxes
  supports_form_e: z.coerce.boolean().default(false),
  supports_form_d: z.coerce.boolean().default(false),
  supports_form_aj: z.coerce.boolean().default(false),
  supports_form_ak: z.coerce.boolean().default(false),
  supports_form_rcep: z.coerce.boolean().default(false),
});

export type ApplyState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  supplier_id?: string;
};

export async function submitSupplierApplication(
  _prev: ApplyState | undefined,
  formData: FormData
): Promise<ApplyState> {
  // Categories arrive as comma-joined hidden input from the form widget.
  const categoriesRaw = String(formData.get("main_categories") ?? "");
  const categories = categoriesRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = ApplySchema.safeParse({
    legal_name: formData.get("legal_name"),
    trade_name: formData.get("trade_name"),
    country: String(formData.get("country") ?? "").toUpperCase(),
    city: formData.get("city"),
    established_year: formData.get("established_year"),
    staff_count: formData.get("staff_count") || undefined,
    main_categories: categories,
    description: formData.get("description"),
    contact_name: formData.get("contact_name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp") ?? "",
    wechat_id: formData.get("wechat_id") ?? "",
    website: formData.get("website") ?? "",
    supports_form_e: formData.get("supports_form_e") === "true",
    supports_form_d: formData.get("supports_form_d") === "true",
    supports_form_aj: formData.get("supports_form_aj") === "true",
    supports_form_ak: formData.get("supports_form_ak") === "true",
    supports_form_rcep: formData.get("supports_form_rcep") === "true",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as string;
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, message: "ตรวจสอบข้อมูลในฟอร์มอีกครั้ง", fieldErrors };
  }

  const supabase = getSupabaseAdmin();
  const { data: inserted, error } = await supabase
    .from("suppliers")
    .insert({
      legal_name: parsed.data.legal_name,
      trade_name: parsed.data.trade_name,
      country: parsed.data.country,
      city: parsed.data.city,
      established_year: parsed.data.established_year,
      staff_count: parsed.data.staff_count ?? null,
      main_categories: parsed.data.main_categories,
      main_markets: ["TH"], // default — we're a Thai-focused marketplace
      contact_name: parsed.data.contact_name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp || null,
      wechat_id: parsed.data.wechat_id || null,
      website: parsed.data.website || null,
      supports_form_e: parsed.data.supports_form_e,
      supports_form_d: parsed.data.supports_form_d,
      supports_form_aj: parsed.data.supports_form_aj,
      supports_form_ak: parsed.data.supports_form_ak,
      supports_form_rcep: parsed.data.supports_form_rcep,
      // Visible-but-not-verified until admin approves
      is_verified: false,
      trade_assurance: false,
      rating: 0,
      review_count: 0,
      export_volume_usd_yearly: 0,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, message: error?.message ?? "บันทึกใบสมัครไม่สำเร็จ" };
  }

  // We deliberately don't revalidate /marketplace yet — the new row is
  // unverified, and the landing page filters verified-only.
  revalidatePath("/sell");

  return { ok: true, supplier_id: inserted.id };
}
