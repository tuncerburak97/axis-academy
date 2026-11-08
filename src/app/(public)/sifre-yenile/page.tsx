// src/app/(public)/sifre-yenile/page.tsx — yeni şifre belirleme (e-postadaki bağlantı oturumu açar; sonra /panel)
import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/password-forms";

export const metadata: Metadata = { title: "Yeni şifre", robots: { index: false, follow: false } };

export default async function ResetPasswordPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="bg-canvas px-4 py-16 sm:py-24">
        <EmptyState
          className="mx-auto max-w-md bg-paper"
          title="Bağlantı geçersiz ya da süresi dolmuş"
          description="Şifre yenileme bağlantıları kısa süre geçerlidir ve bir kez kullanılabilir. Yeni bir bağlantı iste."
          action={
            <Button asChild variant="secondary">
              <Link href="/sifremi-unuttum">Yeni bağlantı iste</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <AuthShell
      aside={false}
      eyebrow="Hesap"
      title="Yeni şifreni belirle"
      description={
        <>
          <span className="font-semibold text-ink">{user.email}</span> hesabı için yeni bir şifre seç.
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
