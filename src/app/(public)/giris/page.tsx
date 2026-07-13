// src/app/(public)/giris/page.tsx — giriş sayfası; giriş yapmış kullanıcıyı panele yönlendirir
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Giriş Yap" };

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/panel");

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Giriş Yap</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-accent hover:underline">Kayıt ol</Link>
      </p>
      <LoginForm />
    </section>
  );
}
