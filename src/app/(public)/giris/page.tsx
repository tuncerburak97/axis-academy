// src/app/(public)/giris/page.tsx — giriş: e-posta/şifre ya da Google; ?next ile kaldığın yere döner
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, safeNextPath } from "@/lib/auth";
import { Alert } from "@/components/ui/feedback";
import { AuthShell, GoogleSignIn } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { NextContextNote } from "@/components/auth/next-context";

export const metadata: Metadata = { title: "Giriş", robots: { index: false, follow: true } };

const errorMessages: Record<string, string> = {
  auth: "Bağlantının süresi dolmuş ya da daha önce kullanılmış. Tekrar giriş yap; gerekirse yeni bağlantı iste.",
  oauth: "Google ile giriş başlatılamadı. Birazdan tekrar dene ya da e-postanla giriş yap.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext);
  if (await getSessionUser()) redirect(next);

  const registerHref = next !== "/panel" ? `/kayit?next=${encodeURIComponent(next)}` : "/kayit";

  return (
    <AuthShell
      eyebrow="Hoş geldin"
      title="Giriş yap"
      description={<NextContextNote next={next} />}
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link href={registerHref} className="font-semibold text-accent hover:underline">
            Ücretsiz kayıt ol
          </Link>
        </>
      }
    >
      {error && errorMessages[error] && (
        <Alert tone="warning" className="mb-5">
          {errorMessages[error]}
        </Alert>
      )}
      <LoginForm next={next} />
      <GoogleSignIn next={next} />
    </AuthShell>
  );
}
