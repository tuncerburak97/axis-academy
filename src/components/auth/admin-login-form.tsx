// src/components/auth/admin-login-form.tsx — yönetici giriş formu (Google yok, sade kart)
"use client";

import { useActionState } from "react";
import { adminLogin } from "@/lib/actions/auth";
import { FormField, FormStatus } from "@/components/auth/auth-card";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLogin, initialState);

  return (
    <div className="mt-8 rounded-xl border border-line bg-white p-6 shadow-sm">
      <form action={formAction} className="space-y-4">
        <FormStatus error={state.error} />
        <FormField label="E-posta" name="email" type="email" autoComplete="email" />
        <FormField label="Şifre" name="password" type="password" autoComplete="current-password" />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Giriş yapılıyor…" : "Yönetici Girişi"}
        </button>
      </form>
    </div>
  );
}
