"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: update the signed-in user's profile.
 * Called from <form action={updateProfile}> in the Account → Profile tab.
 */

const ProfileSchema = z.object({
  full_name: z.string().trim().min(1, "ชื่อห้ามว่าง").max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  job_title: z.string().trim().max(120).optional().or(z.literal("")),
});

export type UpdateProfileState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof ProfileSchema>, string>>;
};

export async function updateProfile(
  _prev: UpdateProfileState | undefined,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };
  }

  const parsed = ProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    job_title: formData.get("job_title"),
  });

  if (!parsed.success) {
    const fieldErrors: UpdateProfileState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof ProfileSchema>;
      fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "ข้อมูลไม่ถูกต้อง", fieldErrors };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
      // job_title is not in the base schema yet — store in user_metadata for now
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  // Mirror display name to auth.user_metadata so the JWT carries it
  await supabase.auth.updateUser({
    data: {
      full_name: parsed.data.full_name,
      job_title: parsed.data.job_title || null,
    },
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true, message: "บันทึกแล้ว" };
}
