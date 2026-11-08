// src/components/admin/admin-login-form.tsx — yönetici giriş formu (adminLogin; rol bilgisi sızdırmayan tek hata metni)
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { adminLogin } from "@/lib/actions/auth";
import type { AuthFormState } from "@/lib/types";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(adminLogin, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      <Field id="admin-email" label="E-posta">
        <Input name="email" type="email" autoComplete="username" required autoFocus />
      </Field>
      <Field id="admin-password" label="Şifre">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" size="lg" loading={pending} className="mt-2 w-full">
        Giriş yap
      </Button>
    </form>
  );
}
