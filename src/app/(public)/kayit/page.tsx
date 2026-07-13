// src/app/(public)/kayit/page.tsx — kayıt sayfası; giriş yapmış kullanıcıyı panele yönlendirir
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/panel");

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="font-display text-3xl font-bold tracking-tight">Kayıt Ol</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Zaten üye misin?{" "}
        <Link href="/giris" className="font-semibold text-accent hover:underline">Giriş yap</Link>
      </p>
      <RegisterForm />
    </section>
  );
}
