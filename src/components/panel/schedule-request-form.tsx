// src/components/panel/schedule-request-form.tsx — "uygun tarih yok mu?" mesajlı talep formu
"use client";

import { useActionState } from "react";
import { CalendarClock } from "lucide-react";
import { createScheduleRequest } from "@/lib/actions/member";
import { FormStatus } from "@/components/auth/auth-card";
import type { AuthFormState } from "@/lib/types";

const initialState: AuthFormState = {};

export function ScheduleRequestForm({ moduleId }: { moduleId: string }) {
  const [state, formAction, isPending] = useActionState(createScheduleRequest, initialState);

  return (
    <details className="rounded-xl border border-line bg-white shadow-sm">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2.5 p-4 text-sm font-semibold sm:p-5">
        <span className="rounded-lg bg-amber-soft p-2 text-ink">
          <CalendarClock className="size-4" aria-hidden />
        </span>
        Uygun tarih bulamadın mı? Bize yaz, sana göre planlayalım.
      </summary>
      <form action={formAction} className="space-y-4 border-t border-line p-5">
        <input type="hidden" name="module_id" value={moduleId} />
        <FormStatus error={state.error} />
        <div>
          <label htmlFor="schedule-message" className="block text-sm font-medium">
            Müsait olduğun gün/saatler ve beklentin
          </label>
          <textarea
            id="schedule-message"
            name="user_message"
            rows={4}
            required
            minLength={10}
            placeholder="Örn. Hafta içi akşam 20:00 sonrası uygunum; Ekim ayında başlayacak bir Excel sınıfı arıyorum…"
            className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm transition-colors focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isPending ? "Gönderiliyor…" : "Tarih Talebi Gönder"}
        </button>
      </form>
    </details>
  );
}
