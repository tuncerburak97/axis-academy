// src/components/panel/contact-request-form.tsx — analiz/tez talep formu (dosya yüklemeli, client)
"use client";

import { useActionState } from "react";
import { createContactRequest } from "@/lib/actions/member";
import { FormStatus } from "@/components/auth/auth-card";
import { serviceTypeLabels } from "@/lib/types/catalog";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function ContactRequestForm() {
  const [state, formAction, isPending] = useActionState(createContactRequest, initialState);

  return (
    <form action={formAction} className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <FormStatus error={state.error} />

      <div className="mt-2">
        <label htmlFor="service-type" className="block text-sm font-medium">Hizmet türü</label>
        <select
          id="service-type"
          name="service_type"
          className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent"
        >
          {Object.entries(serviceTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="request-message" className="block text-sm font-medium">Talebini anlat</label>
        <textarea
          id="request-message"
          name="message"
          rows={5}
          required
          minLength={10}
          placeholder="Çalışmanın konusu, veri/dosya durumu, beklentin ve varsa teslim tarihi…"
          className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="request-file" className="block text-sm font-medium">
          Dosya ekle <span className="font-normal text-ink-soft">(isteğe bağlı, max 10MB)</span>
        </label>
        <input
          id="request-file"
          name="file"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip"
          className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-accent"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Gönderiliyor…" : "Talebi Gönder"}
      </button>
      <p className="mt-3 text-center text-xs text-ink-soft">
        Talebin ekibimize iletilir; durumunu Taleplerim sekmesinden izleyebilirsin.
      </p>
    </form>
  );
}
