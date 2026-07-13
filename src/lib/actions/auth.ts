// src/lib/actions/auth.ts — kayıt, giriş, Google OAuth ve çıkış Server Action'ları
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/lib/types";

const registerSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter olmalı.").max(100, "Ad soyad çok uzun."),
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
});

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifre gerekli."),
});

// İsteğin geldiği origin'i döner; OAuth ve e-posta doğrulama yönlendirmeleri için
async function getOrigin(): Promise<string> {
  const headerList = await headers();
  return headerList.get("origin") ?? "http://localhost:3000";
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

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin." };
    }
    return { error: "Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin." };
  }

  return { message: "Doğrulama bağlantısı e-postana gönderildi. Gelen kutunu kontrol et." };
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "E-posta adresin henüz doğrulanmamış. Gelen kutundaki bağlantıya tıkla." };
    }
    return { error: "E-posta veya şifre hatalı." };
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

export async function loginWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/giris?error=oauth");
  }
  redirect(data.url);
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
