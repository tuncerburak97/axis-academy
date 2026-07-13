// src/app/(admin)/admin/login/page.tsx — gizli yönetici giriş sayfası (önyüzde linki yok, arama motorlarına kapalı)
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Yönetici Girişi",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Zaten giriş yapmış bir admin ise doğrudan panele geç
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (profile?.role === "admin") redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8 sm:px-6 sm:py-20">
      <p className="font-display text-lg font-bold tracking-tight">
        Axis<span className="text-accent"> Akademi</span>
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Yönetici Girişi</h1>
      <AdminLoginForm />
    </main>
  );
}
