// src/components/auth/login-form.tsx — e-posta + şifre girişi; ?next ile dönüş, doğrulanmamış hesapta yeniden gönderme
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, resendVerification, type LoginFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { PasswordInput } from "@/components/auth/password-input";
import type { AuthFormState } from "@/lib/types";

const initialState: LoginFormState = {};
const resendInitial: AuthFormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [resendState, resendAction, resendPending] = useActionState(resendVerification, resendInitial);

  return (
    <div className="flex flex-col gap-5">
      {state.error && (
        <Alert tone="danger">
          {state.error}
          {state.unconfirmedEmail && !resendState.message && (
            <form action={resendAction} className="mt-2">
              <input type="hidden" name="email" value={state.unconfirmedEmail} />
              <input type="hidden" name="next" value={next} />
              <Button type="submit" variant="link" size="sm" loading={resendPending} className="text-danger-ink underline">
                Doğrulama e-postasını tekrar gönder
              </Button>
            </form>
          )}
        </Alert>
      )}
      {resendState.message && <Alert tone="success">{resendState.message}</Alert>}
      {resendState.error && <Alert tone="danger">{resendState.error}</Alert>}

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />
        <Field id="login-email" label="E-posta">
          <Input name="email" type="email" required autoComplete="email" inputMode="email" defaultValue={state.email} key={state.email} />
        </Field>
        <div className="flex flex-col gap-1.5">
          <Field id="login-password" label="Şifre">
            <PasswordInput name="password" required autoComplete="current-password" />
          </Field>
          <Link
            href={`/sifremi-unuttum${next !== "/panel" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="self-end text-[13px] font-semibold text-accent hover:underline"
          >
            Şifremi unuttum
          </Link>
        </div>
        <Button type="submit" size="lg" loading={isPending} className="w-full">
          Giriş yap
        </Button>
      </form>
    </div>
  );
}
