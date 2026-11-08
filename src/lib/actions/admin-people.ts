// src/lib/actions/admin-people.ts — kişi yönetimi: rol değişikliği (korumalı), ekibe ekleme, kalıcı silme (service key)
"use server";

import { requireAdmin } from "@/lib/actions/admin-guard";
import { logAudit } from "@/lib/audit";
import { createAdminClient, hasAdminServiceKey } from "@/lib/supabase/admin";
import type { ActionState } from "@/components/admin/lib/action-state";
import { roleLabels } from "@/components/admin/lib/labels";
import { fail, isUuid, ok, revalidateAdmin, revalidateEverything, str } from "@/lib/actions/admin-utils";

const ROLES = ["user", "instructor", "admin"];

type Supabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

async function adminCount(supabase: Supabase): Promise<number> {
  const { count } = await supabase.from("profiles").select("user_id", { count: "exact", head: true }).eq("role", "admin");
  return count ?? 0;
}

async function applyRole(supabase: Supabase, actorId: string, userId: string, role: string): Promise<ActionState> {
  if (!ROLES.includes(role)) return fail("Geçerli bir rol seç.");
  if (!isUuid(userId)) return fail("Kişi bulunamadı.");
  const { data: target } = await supabase.from("profiles").select("role, full_name, email").eq("user_id", userId).maybeSingle();
  if (!target) return fail("Kişi bulunamadı.");
  if (target.role === role) return ok();
  if (userId === actorId) return fail("Kendi rolünü değiştiremezsin. Başka bir admin değiştirebilir.");
  if (target.role === "admin" && (await adminCount(supabase)) <= 1) return fail("Son admin'in rolü değiştirilemez. Önce başka birini admin yap.");

  const { error } = await supabase.from("profiles").update({ role }).eq("user_id", userId);
  if (error) return fail("Rol değiştirilemedi. Tekrar dene.");

  await logAudit(
    supabase,
    actorId,
    "profile.role",
    "profile",
    userId,
    `${target.full_name || target.email}: ${roleLabels[target.role] ?? target.role} → ${roleLabels[role]}`,
  );
  revalidateAdmin();
  return ok(`Rol: ${roleLabels[role]}`);
}

export async function changeRole(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  return applyRole(supabase, user.id, str(formData, "user_id"), str(formData, "role"));
}

/** Ekibe e-posta ile ekle: kişinin önce üye olması gerekir */
export async function addTeamMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const email = str(formData, "email").toLowerCase();
  const role = str(formData, "role");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail("Geçerli bir e-posta adresi gir.");
  if (!["instructor", "admin"].includes(role)) return fail("Rol seç: eğitmen ya da admin.");
  const { data: target } = await supabase.from("profiles").select("user_id").ilike("email", email).maybeSingle();
  if (!target) return fail("Bu e-postayla kayıtlı üye yok. Kişi önce siteye üye olmalı.");
  return applyRole(supabase, user.id, target.user_id, role);
}

/** Hesabı kalıcı olarak siler (auth kullanıcısı + bağlı tüm veriler) */
export async function deletePerson(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireAdmin();
  const userId = str(formData, "user_id");
  if (!hasAdminServiceKey()) return fail("Sunucuda SUPABASE_SECRET_KEY tanımlı değil; hesap silme devre dışı.");
  if (!isUuid(userId)) return fail("Kişi bulunamadı.");
  if (userId === user.id) return fail("Kendi hesabını buradan silemezsin.");

  const { data: target } = await supabase.from("profiles").select("role, full_name, email").eq("user_id", userId).maybeSingle();
  if (!target) return fail("Kişi bulunamadı.");
  if (target.role === "admin" && (await adminCount(supabase)) <= 1) return fail("Son admin silinemez.");

  // Talep dosyalarını depolamadan temizle (satırlar cascade ile silinir)
  const { data: files } = await supabase.from("request_files").select("file_path, requests!inner(user_id)").eq("requests.user_id", userId);
  const paths = (files ?? []).map((file) => file.file_path);
  if (paths.length) await supabase.storage.from("request-files").remove(paths);

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) return fail("Hesap silinemedi. Tekrar dene.");

  await logAudit(supabase, user.id, "profile.delete", "profile", userId, `${target.full_name || target.email} hesabı silindi`);
  revalidateEverything();
  return ok("Hesap silindi", { redirectTo: "/admin/kisiler" });
}
