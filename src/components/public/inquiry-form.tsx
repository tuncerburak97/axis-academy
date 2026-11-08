// src/components/public/inquiry-form.tsx — giriş gerektirmeyen "bize yaz" formu (honeypot korumalı)
"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPublicInquiry } from "@/lib/actions/public";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/feedback";
import { toast } from "@/components/ui/toast";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function InquiryForm() {
  const [state, formAction, isPending] = useActionState(createPublicInquiry, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast.success("Mesajın bize ulaştı", { description: "Yanıtımızı bıraktığın e-posta adresine göndereceğiz." });
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card padding="lg">
      <form ref={formRef} action={formAction} className="flex flex-col gap-5" noValidate={false}>
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.message && <Alert tone="success">{state.message}</Alert>}

        {/* Honeypot: botlar doldurur, insanlar görmez */}
        <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="inquiry-website">Web sitesi</label>
          <input id="inquiry-website" type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="inquiry-name" label="Adın soyadın">
            <Input name="name" required minLength={2} maxLength={100} autoComplete="name" />
          </Field>
          <Field id="inquiry-email" label="E-posta">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
        </div>
        <Field id="inquiry-message" label="Mesajın" hint="Analiz, eğitim ya da tez; aklındaki soruyu kısaca yaz.">
          <Textarea name="message" rows={6} required minLength={10} maxLength={5000} />
        </Field>
        <Button type="submit" size="lg" loading={isPending} className="sm:self-start">
          Mesajı gönder
        </Button>
      </form>
    </Card>
  );
}
