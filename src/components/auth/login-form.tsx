// src/components/auth/login-form.tsx — e-posta + şifre giriş formu (client)
"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { AuthCard, FormField, FormStatus } from "@/components/auth/auth-card";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <AuthCard>
      <form action={formAction} className="space-y-4">
        <FormStatus error={state.error} />
        <FormField label="E-posta" name="email" type="email" autoComplete="email" />
        <FormField label="Şifre" name="password" type="password" autoComplete="current-password" />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
    </AuthCard>
  );
}
