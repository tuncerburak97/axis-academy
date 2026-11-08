// src/app/(public)/sifremi-unuttum/page.tsx — şifre sıfırlama bağlantısı iste (dönüş: /auth/callback → /sifre-yenile)
import type { Metadata } from "next";
import Link from "next/link";
import { safeNextPath } from "@/lib/auth";
import { Alert } from "@/components/ui/feedback";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export const metadata: Metadata = { title: "Şifremi unuttum", robots: { index: false, follow: true } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext);
  const loginHref = next !== "/panel" ? `/giris?next=${encodeURIComponent(next)}` : "/giris";

  return (
    <AuthShell
      aside={false}
      eyebrow="Hesap"
      title="Şifreni mi unuttun?"
      description="E-posta adresini yaz; yeni şifre belirlemen için bir bağlantı gönderelim."
      footer={
        <Link href={loginHref} className="font-semibold text-accent hover:underline">
          Girişe dön
        </Link>
      }
    >
      {error === "expired" && (
        <Alert tone="warning" className="mb-5">
          Yenileme bağlantısının süresi dolmuş ya da daha önce kullanılmış. Yeni bir bağlantı iste.
        </Alert>
      )}
      <ForgotPasswordForm />
    </AuthShell>
  );
}
