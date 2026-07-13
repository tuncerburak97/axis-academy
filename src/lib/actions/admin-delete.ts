// src/lib/actions/admin-delete.ts — admin hard delete Server Action'ları
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { purgeClassMaterialFiles } from "@/lib/actions/admin-classes";
import { createAdminClient, hasAdminServiceKey } from "@/lib/supabase/admin";

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/siniflar");
  revalidatePath("/admin/moduller");
  revalidatePath("/admin/talepler");
  revalidatePath("/panel");
  revalidatePath("/egitim");
}

export async function deleteUser(formData: FormData): Promise<void> {
  const { supabase, user: adminUser } = await requireAdmin();
  const targetUserId = String(formData.get("user_id"));

  if (!hasAdminServiceKey()) redirect("/admin/kullanicilar?error=no_service_key");
  if (targetUserId === adminUser.id) redirect("/admin/kullanicilar?error=self_delete");

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", targetUserId)
    .maybeSingle();
  if (!targetProfile) redirect("/admin/kullanicilar?error=not_found");

  if (targetProfile.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) redirect("/admin/kullanicilar?error=last_admin");
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
  if (error) redirect("/admin/kullanicilar?error=delete_failed");

  revalidateAll();
  redirect("/admin/kullanicilar?saved=1");
}

export async function deleteClass(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const classId = String(formData.get("class_id"));

  await purgeClassMaterialFiles(supabase, classId);
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) redirect("/admin/siniflar?error=delete_failed");

  revalidateAll();
  redirect("/admin/siniflar?saved=1");
}

export async function deleteModule(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const moduleId = String(formData.get("module_id"));

  const { data: classes } = await supabase.from("classes").select("id").eq("module_id", moduleId);
  for (const trainingClass of classes ?? []) {
    await purgeClassMaterialFiles(supabase, trainingClass.id);
  }

  const { error } = await supabase.from("education_modules").delete().eq("id", moduleId);
  if (error) redirect(`/admin/moduller/${moduleId}?error=delete_failed`);

  revalidateAll();
  redirect("/admin/moduller?saved=1");
}

export async function deleteContactRequest(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const requestId = String(formData.get("request_id"));

  const { data: request } = await supabase
    .from("contact_requests")
    .select("file_path")
    .eq("id", requestId)
    .maybeSingle();
  if (request?.file_path) {
    await supabase.storage.from("request-files").remove([request.file_path]);
  }

  const { error } = await supabase.from("contact_requests").delete().eq("id", requestId);
  if (error) redirect("/admin/talepler?error=delete_failed");

  revalidatePath("/admin/talepler");
  redirect("/admin/talepler?saved=1");
}

export async function deleteIndividualRequest(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const requestId = String(formData.get("request_id"));

  const { error } = await supabase.from("individual_requests").delete().eq("id", requestId);
  if (error) redirect("/admin/talepler?error=delete_failed");

  revalidatePath("/admin/talepler");
  redirect("/admin/talepler?saved=1");
}

export async function deleteInquiry(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const inquiryId = String(formData.get("inquiry_id"));

  const { error } = await supabase.from("public_inquiries").delete().eq("id", inquiryId);
  if (error) redirect("/admin/talepler?error=delete_failed");

  revalidatePath("/admin/talepler");
  redirect("/admin/talepler?saved=1");
}
