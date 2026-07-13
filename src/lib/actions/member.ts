// src/lib/actions/member.ts — üye talepleri ve profil güncelleme Server Action'ları
// Fiyat her zaman sunucuda yeniden hesaplanır; istemciden gelen tutara güvenilmez.
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendAdminNotification } from "@/lib/email";
import type { AuthFormState } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");
  return { supabase, user };
}

// Hazır paket talebi: fiyat pakete ait fixed_price'tan alınır
export async function createBundleRequest(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const bundleId = String(formData.get("bundle_id"));
  const moduleId = String(formData.get("module_id"));

  const { data: bundle } = await supabase
    .from("bundle_packages")
    .select("*")
    .eq("id", bundleId)
    .eq("is_active", true)
    .maybeSingle();
  if (!bundle) redirect(`/panel/kesfet/${moduleId}?error=db`);

  const { error } = await supabase.from("individual_requests").insert({
    user_id: user.id,
    request_type: "bundle",
    module_id: bundle.module_id,
    bundle_id: bundle.id,
    total_hours: bundle.duration_hours,
    calculated_price: bundle.fixed_price,
  });
  if (error) redirect(`/panel/kesfet/${moduleId}?error=db`);

  await sendAdminNotification("Yeni paket eğitim talebi", [
    `Kullanıcı: ${user.email}`,
    `Paket: ${bundle.title}`,
    `Tutar: ${bundle.fixed_price}₺`,
  ]);

  revalidatePath("/panel");
  redirect("/panel?saved=1");
}

const customRequestSchema = z.object({
  module_id: z.string().uuid(),
  topic_ids: z.array(z.string().uuid()).min(1, "En az bir konu seçmelisin."),
  total_hours: z.coerce.number().int().min(1, "Toplam saat en az 1 olmalı.").max(500, "Toplam saat çok yüksek."),
});

// Özel modül talebi: canlı fiyat yalnız gösterim içindir; burada yeniden hesaplanır
export async function createCustomRequest(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { supabase, user } = await requireUser();

  const parsed = customRequestSchema.safeParse({
    module_id: formData.get("module_id"),
    topic_ids: formData.getAll("topic_ids").map(String),
    total_hours: formData.get("total_hours"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data: plan } = await supabase
    .from("pricing_plans")
    .select("price")
    .eq("module_id", parsed.data.module_id)
    .eq("training_type", "individual")
    .eq("unit", "per_hour")
    .eq("is_active", true)
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  if (!plan) {
    return { error: "Bu modül için bireysel fiyatlandırma henüz tanımlanmamış. Lütfen bizimle iletişime geçin." };
  }

  const { error } = await supabase.from("individual_requests").insert({
    user_id: user.id,
    request_type: "custom",
    module_id: parsed.data.module_id,
    topic_ids: parsed.data.topic_ids,
    total_hours: parsed.data.total_hours,
    calculated_price: plan.price * parsed.data.total_hours,
  });
  if (error) {
    return { error: "Talep oluşturulamadı. Lütfen tekrar deneyin." };
  }

  await sendAdminNotification("Yeni özel modül talebi", [
    `Kullanıcı: ${user.email}`,
    `Konu sayısı: ${parsed.data.topic_ids.length}`,
    `Toplam saat: ${parsed.data.total_hours}`,
    `Tutar: ${plan.price * parsed.data.total_hours}₺`,
  ]);

  revalidatePath("/panel");
  redirect("/panel?saved=1");
}

// Sınıfa katılım isteği: pending oluşturur, admin onayı bekler
export async function requestEnrollment(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const classId = String(formData.get("class_id"));
  const moduleId = String(formData.get("module_id"));

  const { error } = await supabase.rpc("request_class_enrollment", { p_class_id: classId });
  if (error) {
    const reason = error.message.includes("ALREADY_REQUESTED")
      ? "already"
      : error.message.includes("CLASS_NOT_OPEN")
        ? "notopen"
        : "db";
    redirect(`/panel/kesfet/${moduleId}?error=${reason}`);
  }

  await sendAdminNotification("Yeni sınıf katılım isteği", [
    `Kullanıcı: ${user.email}`,
    "Onay bekleyen katılım isteği var; admin panelinden Sınıflar ekranını kontrol edin.",
  ]);

  revalidatePath("/panel");
  redirect("/panel?saved=1");
}

const scheduleRequestSchema = z.object({
  module_id: z.string().uuid(),
  user_message: z.string().min(10, "Mesaj en az 10 karakter olmalı.").max(2000),
});

// Tarih talebi: uygun sınıf tarihi olmayan kullanıcı mesajla talep açar (admin manuel işler)
export async function createScheduleRequest(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { supabase, user } = await requireUser();

  const parsed = scheduleRequestSchema.safeParse({
    module_id: formData.get("module_id"),
    user_message: formData.get("user_message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("individual_requests").insert({
    user_id: user.id,
    request_type: "schedule",
    module_id: parsed.data.module_id,
    calculated_price: 0,
    user_message: parsed.data.user_message,
  });
  if (error) {
    return { error: "Talep oluşturulamadı. Lütfen tekrar deneyin." };
  }

  await sendAdminNotification("Yeni eğitim tarihi talebi", [
    `Kullanıcı: ${user.email}`,
    `Mesaj: ${parsed.data.user_message}`,
  ]);

  revalidatePath("/panel");
  redirect("/panel/talepler?saved=1");
}

const contactRequestSchema = z.object({
  service_type: z.enum(["analysis", "thesis"]),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalı.").max(5000),
});

// Analiz / Tez talebi: isteğe bağlı dosya private bucket'a yüklenir
export async function createContactRequest(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { supabase, user } = await requireUser();

  const parsed = contactRequestSchema.safeParse({
    service_type: formData.get("service_type"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let filePath: string | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      return { error: "Dosya 10MB'tan büyük olamaz." };
    }
    filePath = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("request-files").upload(filePath, file);
    if (uploadError) {
      return { error: "Dosya yüklenemedi. Lütfen tekrar deneyin." };
    }
  }

  const { error } = await supabase.from("contact_requests").insert({
    user_id: user.id,
    service_type: parsed.data.service_type,
    message: parsed.data.message,
    file_path: filePath,
  });
  if (error) {
    return { error: "Talep oluşturulamadı. Lütfen tekrar deneyin." };
  }

  await sendAdminNotification(
    `Yeni ${parsed.data.service_type === "analysis" ? "analiz" : "tez düzenleme"} talebi`,
    [
      `Kullanıcı: ${user.email}`,
      `Mesaj: ${parsed.data.message}`,
      filePath ? "Ekli dosya var (admin panelinden indirilebilir)." : "Ekli dosya yok.",
    ],
  );

  revalidatePath("/panel/talepler");
  redirect("/panel/talepler?saved=1");
}

const profileSchema = z.object({
  full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalı.").max(100),
  phone: z.string().max(20, "Telefon numarası çok uzun."),
});

export async function updateProfile(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { supabase, user } = await requireUser();

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("user_id", user.id);
  if (error) {
    return { error: "Profil güncellenemedi. Lütfen tekrar deneyin." };
  }

  revalidatePath("/panel/hesap");
  return { message: "Profil bilgilerin güncellendi." };
}
