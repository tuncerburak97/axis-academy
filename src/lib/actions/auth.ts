// src/lib/actions/auth.ts — kayıt, giriş, Google OAuth, şifre sıfırlama ve çıkış Server Action'ları
// Tüm giriş akışları ?next= ile kullanıcının kaldığı sayfaya döner (yalnızca site içi yollar: safeNextPath).
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth";
import type { AuthFormState } from "@/lib/types";

export interface LoginFormState extends AuthFormState {
  /** E-posta doğrulanmamışsa formda "doğrulama e-postasını tekrar gönder" seçeneği açılır */
  unconfirmedEmail?: string;
  email?: string;
}

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Adını ve soyadını yaz (en az 2 karakter).").max(100, "Ad soyad çok uzun."),
  email: z.string().trim().email("Geçerli bir e-posta adresi yaz."),
  password: z.string().min(8, "Şifren en az 8 karakter olmalı."),
});

const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi yaz."),
  password: z.string().min(1, "Şifreni yaz."),
});

const emailSchema = z.string().trim().email("Geçerli bir e-posta adresi yaz.");

// İsteğin geldiği origin; OAuth ve e-posta bağlantılarının dönüş adresi için
async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

function callbackUrl(origin: string, next: string): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const next = safeNextPath(formData.get("next")?.toString());

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: callbackUrl(origin, next),
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Bu e-postayla zaten bir hesap var. Giriş yapmayı ya da şifreni sıfırlamayı dene." };
    }
    if (error.code === "weak_password") {
      return { error: "Şifren çok zayıf. Harf ve rakam karışık, en az 8 karakterlik bir şifre seç." };
    }
    return { error: "Kayıt sırasında bir sorun oluştu. Birazdan tekrar dene." };
  }

  // E-posta doğrulaması kapalıysa oturum hemen açılır
  if (data.session) redirect(next);

  return { message: `Doğrulama bağlantısını ${parsed.data.email} adresine gönderdik. Bağlantıya tıklayınca kaldığın yere döneceksin.` };
}

export async function login(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, email: formData.get("email")?.toString() };
  }
  const next = safeNextPath(formData.get("next")?.toString());

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error: "E-posta adresin henüz doğrulanmamış. Gelen kutundaki bağlantıya tıkla ya da yeni bağlantı iste.",
        unconfirmedEmail: parsed.data.email,
        email: parsed.data.email,
      };
    }
    return { error: "E-posta ya da şifre hatalı. Tekrar dene veya şifreni sıfırla.", email: parsed.data.email };
  }

  redirect(next);
}

/** Doğrulama e-postasını yeniden gönderir */
export async function resendVerification(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const next = safeNextPath(formData.get("next")?.toString());

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: callbackUrl(origin, next) },
  });
  if (error) {
    if (error.status === 429) return { error: "Kısa süre içinde çok fazla istek geldi. Bir dakika sonra tekrar dene." };
    return { error: "Doğrulama e-postası gönderilemedi. Birazdan tekrar dene." };
  }
  return { message: "Yeni doğrulama bağlantısı gönderildi. Gelen kutunu (ve gereksiz klasörünü) kontrol et." };
}

/** Şifre sıfırlama bağlantısı; hesabın varlığı sızmasın diye her durumda aynı mesaj döner */
export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/callback?next=/sifre-yenile`,
  });
  if (error?.status === 429) {
    return { error: "Kısa süre içinde çok fazla istek geldi. Bir dakika sonra tekrar dene." };
  }
  return {
    message: `${parsed.data} adresine kayıtlı bir hesap varsa şifre yenileme bağlantısı birkaç dakika içinde gelir.`,
  };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Yeni şifren en az 8 karakter olmalı."),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, { message: "İki şifre birbiriyle aynı değil.", path: ["confirm"] });

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = newPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Şifre yenileme bağlantısının süresi dolmuş. Yeni bir bağlantı iste." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Yeni şifren eskisinden farklı olmalı." };
    if (error.code === "weak_password") return { error: "Şifren çok zayıf. Daha uzun ve karışık bir şifre seç." };
    return { error: "Şifren güncellenemedi. Birazdan tekrar dene." };
  }
  redirect("/panel");
}

// Admin girişi: rol kontrolü başarısızsa oturum kapatılır ve generic hata döner (rol bilgisi sızmaz)
export async function adminLogin(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !authData.user) {
    return { error: "E-posta veya şifre hatalı." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", authData.user.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "E-posta veya şifre hatalı." };
  }

  redirect("/admin");
}

export async function loginWithGoogle(formData?: FormData): Promise<void> {
  const next = safeNextPath(formData?.get("next")?.toString());
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(origin, next) },
  });

  if (error || !data.url) {
    redirect(`/giris?error=oauth&next=${encodeURIComponent(next)}`);
  }
  redirect(data.url);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
