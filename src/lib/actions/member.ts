// src/lib/actions/member.ts — üye alanı sunucu aksiyonları (useActionState + toast ile kullanılır)
// Uygulama içi bildirimler DB tetikleyicileriyle oluşur; burada yalnızca ekibe e-posta gider.
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminServiceKey } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";
import { sendAdminNotification } from "@/lib/email";
import { formatTRY } from "@/lib/format";
import { requestKindLabels, type RequestKind } from "@/lib/types/platform";
import { fail, ok, type ActionState } from "@/lib/queries/member-types";

const MAX_REQUEST_FILE_SIZE = 20 * 1024 * 1024;
const uuid = z.string().uuid("Geçersiz kayıt.");

async function currentUser() {
  const user = await getSessionUser();
  return user;
}

const SESSION_EXPIRED = "Oturumun kapanmış. Sayfayı yenileyip tekrar giriş yap.";

function revalidatePanel(...paths: string[]) {
  revalidatePath("/panel", "layout");
  for (const path of paths) revalidatePath(path);
}

// ------------------------------------------------------------
// Dönem başvurusu
// ------------------------------------------------------------
export async function cancelEnrollmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const id = uuid.safeParse(formData.get("enrollment_id"));
  if (!id.success) return fail("Başvuru bulunamadı.");

  const supabase = await createClient();
  const { data: enrollment } = await supabase
    .from("class_enrollments")
    .select("id, class_id, status, classes(title)")
    .eq("id", id.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!enrollment) return fail("Başvuru bulunamadı.");

  const { error } = await supabase.rpc("cancel_my_enrollment", { p_enrollment_id: id.data });
  if (error) {
    return fail(
      error.message.includes("NOT_CANCELLABLE")
        ? "Bu kayıt artık geri çekilemiyor. Değişiklik için ekiple iletişime geç."
        : "Başvuru geri çekilemedi. Biraz sonra tekrar dene.",
    );
  }

  const cohortTitle = (enrollment.classes as { title: string } | null)?.title ?? "Dönem";
  await sendAdminNotification("Başvuru geri çekildi", [`${user.displayName} (${user.email})`, `${cohortTitle} başvurusunu geri çekti.`], `/admin/donemler/${enrollment.class_id}`);
  revalidatePanel("/panel/egitimler", `/panel/egitimler/${enrollment.class_id}`);
  return ok("Başvurun geri çekildi.");
}

// ------------------------------------------------------------
// Talepler
// ------------------------------------------------------------
export async function respondToQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const id = uuid.safeParse(formData.get("request_id"));
  if (!id.success) return fail("Talep bulunamadı.");
  const accept = formData.get("decision") === "accept";

  const supabase = await createClient();
  const { data: request, error } = await supabase.rpc("respond_to_quote", { p_request_id: id.data, p_accept: accept });
  if (error || !request) {
    return fail(
      error?.message.includes("QUOTE_NOT_PENDING")
        ? "Bu teklif artık yanıt beklemiyor. Sayfayı yenileyip güncel durumu kontrol et."
        : "Yanıtın kaydedilemedi. Biraz sonra tekrar dene.",
    );
  }

  await sendAdminNotification(
    accept ? "Teklif onaylandı" : "Teklif reddedildi",
    [
      `${user.displayName} (${user.email})`,
      `Talep: ${request.title || requestKindLabels[request.kind as RequestKind]}`,
      request.quote_amount ? `Teklif tutarı: ${formatTRY(request.quote_amount)}` : "",
      accept ? "Süreci planlamak için talebi aç." : "Kullanıcı teklifi reddetti; talep iptal edildi.",
    ].filter(Boolean),
    `/admin/talepler/${id.data}`,
  );
  revalidatePanel("/panel/talepler", `/panel/talepler/${id.data}`);
  return ok(accept ? "Teklifi onayladın. Ekibimiz planlamaya başlıyor." : "Teklifi reddettin; talep kapatıldı.");
}

export async function cancelRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const id = uuid.safeParse(formData.get("request_id"));
  if (!id.success) return fail("Talep bulunamadı.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_my_request", { p_request_id: id.data });
  if (error) {
    return fail(
      error.message.includes("NOT_CANCELLABLE")
        ? "Bu talep işleme alındığı için buradan iptal edilemiyor. Mesaj yazarak ekiple konuş."
        : "Talep iptal edilemedi. Biraz sonra tekrar dene.",
    );
  }
  await sendAdminNotification("Talep iptal edildi", [`${user.displayName} (${user.email}) talebini iptal etti.`], `/admin/talepler/${id.data}`);
  revalidatePanel("/panel/talepler", `/panel/talepler/${id.data}`);
  return ok("Talebin iptal edildi.");
}

const messageSchema = z.object({
  request_id: uuid,
  body: z.string().trim().min(1, "Mesaj boş olamaz.").max(5000, "Mesaj en fazla 5000 karakter olabilir."),
});

export async function sendRequestMessageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const parsed = messageSchema.safeParse({ request_id: formData.get("request_id"), body: formData.get("body") });
  if (!parsed.success) return fail(parsed.error.issues[0].message, { body: parsed.error.issues[0].message });

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("requests")
    .select("id, title, kind, status")
    .eq("id", parsed.data.request_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!request) return fail("Talep bulunamadı.");
  if (request.status === "cancelled") return fail("İptal edilen talebe mesaj gönderilemez. Yeni bir talep oluşturabilirsin.");

  const { error } = await supabase.from("request_messages").insert({
    request_id: request.id,
    author_id: user.id,
    is_staff: false,
    body: parsed.data.body,
  });
  if (error) return fail("Mesajın gönderilemedi. Biraz sonra tekrar dene.");

  await sendAdminNotification(
    `Yeni mesaj: ${request.title || requestKindLabels[request.kind as RequestKind]}`,
    [`${user.displayName} (${user.email}) yazdı:`, parsed.data.body.slice(0, 1000)],
    `/admin/talepler/${request.id}`,
  );
  revalidatePath(`/panel/talepler/${request.id}`);
  return ok("Mesajın gönderildi.");
}

function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^\w.\-() ]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(-120);
  return cleaned || "dosya";
}

export async function uploadRequestFilesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const id = uuid.safeParse(formData.get("request_id"));
  if (!id.success) return fail("Talep bulunamadı.");
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (!files.length) return fail("Yüklemek için en az bir dosya seç.");
  const tooLarge = files.find((file) => file.size > MAX_REQUEST_FILE_SIZE);
  if (tooLarge) return fail(`"${tooLarge.name}" 20 MB'tan büyük. Dosyayı sıkıştırıp ya da bölüp tekrar dene.`);

  const supabase = await createClient();
  const { data: request } = await supabase.from("requests").select("id, title, status").eq("id", id.data).eq("user_id", user.id).maybeSingle();
  if (!request) return fail("Talep bulunamadı.");
  if (request.status === "cancelled") return fail("İptal edilen talebe dosya eklenemez.");

  let uploaded = 0;
  for (const file of files) {
    const path = `${user.id}/${request.id}/${Date.now().toString(36)}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from("request-files").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (uploadError) {
      if (uploaded) revalidatePath(`/panel/talepler/${request.id}`);
      return fail(`"${file.name}" yüklenemedi. Bağlantını kontrol edip tekrar dene.`);
    }
    const { error } = await supabase.from("request_files").insert({
      request_id: request.id,
      uploaded_by: user.id,
      file_path: path,
      file_name: file.name.slice(0, 200),
      file_size: file.size,
    });
    if (error) {
      await supabase.storage.from("request-files").remove([path]);
      return fail(`"${file.name}" kaydedilemedi. Tekrar dene.`);
    }
    uploaded += 1;
  }

  await sendAdminNotification(
    `Yeni dosya: ${request.title || "Talep"}`,
    [`${user.displayName} (${user.email}) ${uploaded} dosya ekledi.`, ...files.map((file) => `• ${file.name}`)],
    `/admin/talepler/${request.id}`,
  );
  revalidatePath(`/panel/talepler/${request.id}`);
  return ok(uploaded === 1 ? "Dosyan yüklendi." : `${uploaded} dosya yüklendi.`);
}

// ------------------------------------------------------------
// Değerlendirme
// ------------------------------------------------------------
const reviewSchema = z.object({
  target: z.enum(["class", "request"]),
  target_id: uuid,
  rating: z.coerce.number().int().min(1, "Puan seç (1–5).").max(5, "Puan seç (1–5)."),
  comment: z.string().trim().max(2000, "Yorum en fazla 2000 karakter olabilir."),
});

export async function submitReviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const parsed = reviewSchema.safeParse({
    target: formData.get("target"),
    target_id: formData.get("target_id"),
    rating: formData.get("rating") ?? 0,
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const supabase = await createClient();
  let moduleId: string | null = null;
  let path: string;
  if (parsed.data.target === "class") {
    const { data } = await supabase.from("classes").select("module_id").eq("id", parsed.data.target_id).maybeSingle();
    moduleId = data?.module_id ?? null;
    path = `/panel/egitimler/${parsed.data.target_id}`;
  } else {
    const { data } = await supabase.from("requests").select("module_id").eq("id", parsed.data.target_id).eq("user_id", user.id).maybeSingle();
    if (!data) return fail("Talep bulunamadı.");
    moduleId = data.module_id;
    path = `/panel/talepler/${parsed.data.target_id}`;
  }

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    module_id: moduleId,
    class_id: parsed.data.target === "class" ? parsed.data.target_id : null,
    request_id: parsed.data.target === "request" ? parsed.data.target_id : null,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });
  if (error) {
    return fail(
      error.code === "23505"
        ? "Bu eğitim için zaten değerlendirme gönderdin."
        : "Değerlendirmen kaydedilemedi. Eğitim başladıktan sonra tekrar dene.",
    );
  }
  await sendAdminNotification("Yeni değerlendirme", [`${user.displayName}: ${parsed.data.rating}/5`, parsed.data.comment || "(yorumsuz)"], "/admin/yorumlar");
  revalidatePath(path);
  return ok("Teşekkürler! Yorumun onaylandıktan sonra yayınlanır.");
}

// ------------------------------------------------------------
// Hesap
// ------------------------------------------------------------
const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(100, "Ad soyad en fazla 100 karakter olabilir."),
  phone: z
    .string()
    .trim()
    .max(20, "Telefon numarası en fazla 20 karakter olabilir.")
    .regex(/^[0-9+()\s-]*$/, "Telefon numarasında yalnızca rakam, boşluk ve + ( ) - kullan."),
});

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const parsed = profileSchema.safeParse({ full_name: formData.get("full_name") ?? "", phone: formData.get("phone") ?? "" });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue.message, { [String(issue.path[0])]: issue.message });
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("user_id", user.id);
  if (error) return fail("Profilin güncellenemedi. Biraz sonra tekrar dene.");
  revalidatePanel("/panel/hesap");
  return ok("Profil bilgilerin güncellendi.");
}

export async function updateEmailPreferenceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const enabled = formData.get("email_notifications") === "on";
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ email_notifications: enabled }).eq("user_id", user.id);
  if (error) return fail("Tercihin kaydedilemedi. Tekrar dene.");
  revalidatePath("/panel/hesap");
  return ok(enabled ? "E-posta bildirimleri açıldı." : "E-posta bildirimleri kapatıldı. Panel bildirimleri devam eder.");
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "Şifre en az 8 karakter olmalı.").max(72, "Şifre en fazla 72 karakter olabilir."),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, { message: "Şifreler eşleşmiyor.", path: ["confirm"] });

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  const parsed = passwordSchema.safeParse({ password: formData.get("password") ?? "", confirm: formData.get("confirm") ?? "" });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue.message, { [String(issue.path[0])]: issue.message });
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("different") || message.includes("same")) return fail("Yeni şifre eskisiyle aynı olamaz.", { password: "Farklı bir şifre seç." });
    if (message.includes("reauthentication") || message.includes("recent")) return fail("Güvenlik için çıkış yapıp tekrar giriş yaptıktan sonra şifreni değiştir.");
    return fail("Şifren değiştirilemedi. Daha güçlü bir şifre deneyebilirsin.");
  }
  return ok("Şifren değiştirildi.");
}

export async function deleteAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return fail(SESSION_EXPIRED);
  if (!hasAdminServiceKey()) {
    return fail("Hesap silme şu an panelden yapılamıyor. Destek ekibimize yaz, hesabını hemen silelim.");
  }
  const typed = String(formData.get("confirm") ?? "").trim().toLocaleLowerCase("tr-TR");
  if (typed !== user.email.toLocaleLowerCase("tr-TR")) {
    return fail("Onay için e-posta adresini aynen yaz.", { confirm: "E-posta adresin eşleşmiyor." });
  }
  if (user.role === "admin") return fail("Admin hesapları panelden silinemez.");

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (error) {
    console.error("Hesap silinemedi:", error);
    return fail("Hesabın silinemedi. Biraz sonra tekrar dene ya da destek ekibine yaz.");
  }

  await sendAdminNotification("Hesap silindi", [`${user.displayName} (${user.email}) hesabını sildi.`]);
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
