"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin, DOC_BUCKET } from "@/lib/supabase-admin";

/**
 * Server Actions for document uploads.
 *
 * Flow:
 *   1. Client computes a UUID for the new document.
 *   2. Client uploads file directly to Supabase Storage at
 *      `{org_id}/{yyyy}/{mm}/{document_id}.{ext}` (RLS-gated).
 *   3. Client calls `registerUploadedDocument()` to:
 *        - insert a documents row
 *        - fire-and-forget POST /api/ai/extract
 *   4. Client navigates to /analysis/{document_id}.
 *
 * Direct-from-client upload avoids serializing the file through the
 * Server Action boundary, which would force the whole file into memory
 * on the Vercel function.
 */

const RegisterSchema = z.object({
  document_id: z.string().uuid(),
  storage_path: z.string().min(1),
  file_name: z.string().min(1),
  file_size: z.number().int().positive(),
  mime: z.string().min(1),
  doc_type: z.enum(["invoice", "packing_list", "bl", "awb", "other"]),
  // Optional batch metadata
  supplier_name: z.string().optional().or(z.literal("")),
  origin_country: z.string().length(2).optional().or(z.literal("")),
  incoterm: z.string().optional().or(z.literal("")),
  currency: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type RegisterDocumentResult =
  | { ok: true; document_id: string }
  | { ok: false; message: string };

export async function registerUploadedDocument(
  input: z.input<typeof RegisterSchema>
): Promise<RegisterDocumentResult> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };

  // Look up the user's current org
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("default_org_id")
    .eq("id", user.id)
    .maybeSingle();

  const orgId = profile?.default_org_id;
  if (!orgId) return { ok: false, message: "ไม่พบองค์กรของคุณ" };

  // Storage path should start with the user's org_id for the RLS policy
  // to accept the upload. Verify before inserting the row.
  if (!parsed.data.storage_path.startsWith(`${orgId}/`)) {
    return {
      ok: false,
      message: `Storage path ผิด — ต้องขึ้นต้นด้วย ${orgId}/`,
    };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    id: parsed.data.document_id,
    org_id: orgId,
    uploaded_by: user.id,
    doc_type: parsed.data.doc_type,
    supplier_name: parsed.data.supplier_name || null,
    origin_country: parsed.data.origin_country || null,
    incoterm: parsed.data.incoterm || null,
    currency: parsed.data.currency || "USD",
    storage_path: parsed.data.storage_path,
    file_hash: null,
    ocr_status: "pending",
    notes: parsed.data.notes || null,
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  // Fire-and-forget AI extract — don't block the UI.
  // The route handler updates `documents.ocr_status` as it progresses.
  // We use the service-role admin client so the call doesn't need a
  // user session (which it already has via cookies anyway).
  if (process.env.NEXT_PUBLIC_APP_URL) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: parsed.data.document_id }),
      // Don't keep the connection alive for the entire OCR call —
      // we just want to kick it off. The Edge runtime will keep
      // it running independently.
    }).catch(() => {
      // Errors here aren't fatal — the user can retry from /analysis/[id]
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/analysis");
  return { ok: true, document_id: parsed.data.document_id };
}

/**
 * Manually re-trigger extraction for a document. Used by the
 * "วิเคราะห์ใหม่" button on /analysis/[id].
 */
export async function retriggerExtract(documentId: string): Promise<{ ok: boolean; message?: string }> {
  if (!z.string().uuid().safeParse(documentId).success) {
    return { ok: false, message: "Invalid document id" };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };

  // RLS will reject if user doesn't own this doc's org
  const { data: doc } = await supabase
    .from("documents")
    .select("id, org_id, ocr_status")
    .eq("id", documentId)
    .maybeSingle();

  if (!doc) return { ok: false, message: "ไม่พบเอกสาร" };
  if (doc.ocr_status === "processing") {
    return { ok: false, message: "กำลังประมวลผลอยู่แล้ว" };
  }

  // Reset status so the route handler will accept it
  await supabase
    .from("documents")
    .update({ ocr_status: "pending" })
    .eq("id", documentId);

  if (process.env.NEXT_PUBLIC_APP_URL) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId }),
    }).catch(() => {});
  }

  revalidatePath(`/analysis/${documentId}`);
  return { ok: true };
}

/**
 * Soft-delete a document. Called from the delete confirmation.
 */
export async function deleteDocument(documentId: string): Promise<{ ok: boolean; message?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "ไม่ได้เข้าสู่ระบบ" };

  // RLS enforces that only owners/admins can delete
  const { error } = await supabase
    .from("documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", documentId);

  if (error) return { ok: false, message: error.message };

  // Also try to remove the file from storage (best effort)
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .maybeSingle();

  if (doc?.storage_path) {
    const admin = getSupabaseAdmin();
    await admin.storage.from(DOC_BUCKET).remove([doc.storage_path]);
  }

  revalidatePath("/analysis");
  revalidatePath("/dashboard");
  return { ok: true };
}
