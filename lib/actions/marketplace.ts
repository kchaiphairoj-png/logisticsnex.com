"use server";

/**
 * Marketplace Server Actions.
 *
 * For now: `createRfq` inserts a new RFQ for the user's org, then redirects
 * to the detail page. (The AI supplier-matcher endpoint already exists at
 * /api/ai/match-suppliers — wiring it up automatically on RFQ creation
 * is a TODO; for now buyers can review their RFQ and request matches
 * from the detail page.)
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const RfqSchema = z.object({
  title: z.string().trim().min(6, "หัวข้ออย่างน้อย 6 ตัวอักษร").max(200),
  description: z.string().trim().min(20, "อธิบายอย่างน้อย 20 ตัวอักษร").max(5000),
  category: z.string().trim().max(120).optional().or(z.literal("")),
  hs_code_hint: z.string().trim().max(20).optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive("จำนวนต้องมากกว่า 0"),
  quantity_unit: z.string().trim().min(1).max(20).default("pcs"),
  target_price_usd: z.coerce.number().positive().optional().or(z.literal("")),
  preferred_origin: z
    .array(z.string().length(2))
    .max(10)
    .default([]),
  required_certifications: z.array(z.string().max(40)).max(20).default([]),
  required_form_e: z.coerce.boolean().default(false),
  required_form_rcep: z.coerce.boolean().default(false),
  delivery_incoterm: z.string().trim().max(10).default("CIF"),
  delivery_port: z.string().trim().max(20).default("THBKK"),
  needed_by_date: z.string().trim().optional().or(z.literal("")),
  sample_required: z.coerce.boolean().default(true),
});

export type CreateRfqState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  rfq_id?: string;
};

export async function createRfq(
  _prev: CreateRfqState | undefined,
  formData: FormData
): Promise<CreateRfqState> {
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

  // FormData arrays come through as comma-joined strings (because we put
  // them in a hidden input). Normalize before validating.
  const originRaw = String(formData.get("preferred_origin") ?? "");
  const certsRaw = String(formData.get("required_certifications") ?? "");

  const parsed = RfqSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category") ?? "",
    hs_code_hint: formData.get("hs_code_hint") ?? "",
    quantity: formData.get("quantity"),
    quantity_unit: formData.get("quantity_unit") ?? "pcs",
    target_price_usd: formData.get("target_price_usd") ?? "",
    preferred_origin: originRaw ? originRaw.split(",").filter(Boolean) : [],
    required_certifications: certsRaw ? certsRaw.split(",").filter(Boolean) : [],
    required_form_e: formData.get("required_form_e") === "true",
    required_form_rcep: formData.get("required_form_rcep") === "true",
    delivery_incoterm: formData.get("delivery_incoterm") ?? "CIF",
    delivery_port: formData.get("delivery_port") ?? "THBKK",
    needed_by_date: formData.get("needed_by_date") ?? "",
    sample_required: formData.get("sample_required") === "true",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0] as string;
      fieldErrors[k] = issue.message;
    }
    return { ok: false, message: "ข้อมูลไม่ถูกต้อง", fieldErrors };
  }

  // 30-day default expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data: inserted, error } = await supabase
    .from("rfqs")
    .insert({
      org_id: profile.default_org_id,
      created_by: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category || null,
      hs_code_hint: parsed.data.hs_code_hint || null,
      quantity: parsed.data.quantity,
      quantity_unit: parsed.data.quantity_unit,
      target_price_usd:
        parsed.data.target_price_usd === "" ? null : parsed.data.target_price_usd,
      currency: "USD",
      preferred_origin: parsed.data.preferred_origin,
      required_certifications: parsed.data.required_certifications,
      required_form_e: parsed.data.required_form_e,
      required_form_rcep: parsed.data.required_form_rcep,
      delivery_incoterm: parsed.data.delivery_incoterm,
      delivery_port: parsed.data.delivery_port,
      needed_by_date: parsed.data.needed_by_date || null,
      sample_required: parsed.data.sample_required,
      status: "open",
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, message: error?.message ?? "บันทึก RFQ ไม่สำเร็จ" };
  }

  revalidatePath("/marketplace");
  revalidatePath("/marketplace/rfq");

  // Redirect from the action so the client lands on the new RFQ's page.
  redirect(`/marketplace/rfq/${inserted.id}`);
}
