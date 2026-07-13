// src/components/auth/register-form.tsx — e-posta doğrulamalı kayıt formu (client)
"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { AuthCard, FormField, FormStatus } from "@/components/auth/auth-card";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <AuthCard>
      <form action={formAction} className="space-y-4">
        <FormStatus error={state.error} message={state.message} />
        <FormField label="Ad Soyad" name="fullName" type="text" autoComplete="name" />
        <FormField label="E-posta" name="email" type="email" autoComplete="email" />
        <FormField label="Şifre" name="password" type="password" autoComplete="new-password" minLength={8} />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Kayıt yapılıyor…" : "Kayıt Ol"}
        </button>
      </form>
    </AuthCard>
  );
}
