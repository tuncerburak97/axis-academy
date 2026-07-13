// src/components/public/inquiry-form.tsx — public "bize ulaşın" formu (login gerektirmez)
"use client";

import { useActionState } from "react";
import { createPublicInquiry } from "@/lib/actions/public";
import { FormStatus } from "@/components/auth/auth-card";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};
const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent";

export function InquiryForm() {
  const [state, formAction, isPending] = useActionState(createPublicInquiry, initialState);

  return (
    <form action={formAction} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <FormStatus error={state.error} message={state.message} />

      {/* Honeypot: botlara görünür, kullanıcılara görünmez */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-name" className="block text-sm font-medium">Adınız Soyadınız</label>
          <input id="inquiry-name" name="name" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="inquiry-email" className="block text-sm font-medium">E-posta</label>
          <input id="inquiry-email" name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="inquiry-message" className="block text-sm font-medium">Mesajınız</label>
        <textarea
          id="inquiry-message"
          name="message"
          rows={5}
          required
          minLength={10}
          placeholder="Sorunuzu ya da ihtiyacınızı kısaca anlatın; size e-posta ile dönelim."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Gönderiliyor…" : "Mesajı Gönder"}
      </button>
    </form>
  );
}
