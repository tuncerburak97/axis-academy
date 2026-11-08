// src/components/auth/register-form.tsx — e-posta doğrulamalı kayıt; doğrulama bağlantısı ?next ile kaldığın yere döner
"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { register } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { PasswordInput } from "@/components/auth/password-input";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(register, initialState);

  if (state.message) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success-soft text-success-ink">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <p className="mt-4 text-lg font-semibold">Gelen kutunu kontrol et</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft" role="status">
          {state.message}
        </p>
        <p className="mt-4 text-xs text-ink-muted">E-posta gelmediyse gereksiz klasörüne bak; birkaç dakika sürebilir.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <input type="hidden" name="next" value={next} />
      <Field id="register-name" label="Ad soyad">
        <Input name="fullName" required minLength={2} maxLength={100} autoComplete="name" />
      </Field>
      <Field id="register-email" label="E-posta">
        <Input name="email" type="email" required autoComplete="email" inputMode="email" />
      </Field>
      <Field id="register-password" label="Şifre" hint="En az 8 karakter">
        <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
      </Field>
      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Ücretsiz hesap aç
      </Button>
    </form>
  );
}
