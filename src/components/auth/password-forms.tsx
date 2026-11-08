// src/components/auth/password-forms.tsx — "şifremi unuttum" (bağlantı iste) ve "şifre yenile" (yeni şifre) formları
"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { requestPasswordReset, updatePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { PasswordInput } from "@/components/auth/password-input";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState);

  if (state.message) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success-ink">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <p className="mt-4 text-lg font-semibold">Bağlantı yolda</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft" role="status">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Field id="forgot-email" label="E-posta" hint="Hesabını açtığın adres">
        <Input name="email" type="email" required autoComplete="email" inputMode="email" />
      </Field>
      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Yenileme bağlantısı gönder
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Field id="reset-password" label="Yeni şifre" hint="En az 8 karakter">
        <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
      </Field>
      <Field id="reset-confirm" label="Yeni şifre (tekrar)">
        <PasswordInput name="confirm" required minLength={8} autoComplete="new-password" />
      </Field>
      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Şifremi güncelle
      </Button>
    </form>
  );
}
