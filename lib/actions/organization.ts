"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: update the user's current organization.
 * Only owners/admins can call this — enforced by RLS policy on `organizations`.
 */

const OrgSchema = z.object({
  org_id: z.string().uuid(),
  name: z.string().trim().min(1, "ชื่อองค์กรห้ามว่าง").max(200),
  tax_id: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  country: z.string().length(2).optional().or(z.literal("")),
  billing_email: z.string().trim().email("อีเมลไม่ถูกต้อง"),
});

export type UpdateOrgState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof OrgSchema>, string>>;
};

export async function updateOrganization(
  _prev: UpdateOrgState | undefined,
  formData: FormData
): Promise<UpdateOrgState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };

  const parsed = OrgSchema.safeParse({
    org_id: formData.get("org_id"),
    name: formData.get("name"),
    tax_id: formData.get("tax_id"),
    country: formData.get("country") || "TH",
    billing_email: formData.get("billing_email"),
  });

  if (!parsed.success) {
    const fieldErrors: UpdateOrgState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof OrgSchema>;
      fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "ข้อมูลไม่ถูกต้อง", fieldErrors };
  }

  // RLS policy ensures only owners/admins of this org can update.
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      tax_id: parsed.data.tax_id || null,
      country: parsed.data.country || "TH",
      billing_email: parsed.data.billing_email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.org_id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true, message: "บันทึกแล้ว" };
}
