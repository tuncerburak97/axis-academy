// src/app/(public)/kayit/page.tsx — ücretsiz kayıt: e-posta doğrulamalı ya da Google; ?next korunur
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, safeNextPath } from "@/lib/auth";
import { AuthShell, GoogleSignIn } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { NextContextNote } from "@/components/auth/next-context";

export const metadata: Metadata = {
  title: "Ücretsiz kayıt ol",
  description: "Axis Akademi hesabını ücretsiz aç; başvurularını, tekliflerini ve belgelerini tek panelden izle.",
  alternates: { canonical: "/kayit" },
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext);
  if (await getSessionUser()) redirect(next);

  const loginHref = next !== "/panel" ? `/giris?next=${encodeURIComponent(next)}` : "/giris";

  return (
    <AuthShell
      eyebrow="Ücretsiz"
      title="Hesabını aç"
      description={
        <>
          <p>Bir dakika sürer. Başvuru ve taleplerin hep aynı panelde durur.</p>
          <NextContextNote next={next} />
        </>
      }
      footer={
        <>
          Zaten hesabın var mı?{" "}
          <Link href={loginHref} className="font-semibold text-accent hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
      <GoogleSignIn next={next} />
    </AuthShell>
  );
}
