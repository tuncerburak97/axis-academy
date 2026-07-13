// src/components/panel/custom-module-builder.tsx — kendi modülünü oluştur:
// konu çoklu seçimi, otomatik saat toplamı (düzenlenebilir) ve canlı fiyat gösterimi
"use client";

import { useActionState, useState } from "react";
import { createCustomRequest } from "@/lib/actions/member";
import { FormStatus } from "@/components/auth/auth-card";
import type { AuthFormState } from "@/lib/types";
import type { Topic } from "@/lib/types/catalog";

interface CustomModuleBuilderProps {
  moduleId: string;
  topics: Topic[];
  hourlyRate: number | null; // null → bu modülde bireysel saatlik plan tanımlı değil
}

const initialState: AuthFormState = {};

export function CustomModuleBuilder({ moduleId, topics, hourlyRate }: CustomModuleBuilderProps) {
  const [state, formAction, isPending] = useActionState(createCustomRequest, initialState);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hours, setHours] = useState(0);

  function toggleTopic(topicId: string) {
    const next = new Set(selectedIds);
    if (next.has(topicId)) next.delete(topicId);
    else next.add(topicId);
    setSelectedIds(next);
    // Seçim değişince tahmini saatler yeniden toplanır; kullanıcı sonrasında elle değiştirebilir
    setHours(topics.filter((topic) => next.has(topic.id)).reduce((sum, topic) => sum + topic.estimated_hours, 0));
  }

  const estimatedPrice = hourlyRate !== null ? hourlyRate * hours : null;

  if (topics.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white p-5 text-sm text-ink-soft">
        Bu modül için konu havuzu henüz hazırlanıyor.
      </p>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <input type="hidden" name="module_id" value={moduleId} />
      <FormStatus error={state.error} />

      <fieldset>
        <legend className="text-sm font-semibold">Konuları seç</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {topics.map((topic) => (
            <label
              key={topic.id}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${
                selectedIds.has(topic.id) ? "border-accent bg-accent-soft" : "border-line hover:bg-surface"
              }`}
            >
              <input
                type="checkbox"
                name="topic_ids"
                value={topic.id}
                checked={selectedIds.has(topic.id)}
                onChange={() => toggleTopic(topic.id)}
                className="mt-0.5 size-5 shrink-0 accent-[var(--color-accent)]"
              />
              <span>
                <span className="font-medium">{topic.title}</span>
                <span className="block text-xs text-ink-soft">~{topic.estimated_hours} saat</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="w-full sm:w-36">
          <label htmlFor="custom-total-hours" className="block text-sm font-medium">Toplam saat</label>
          <input
            id="custom-total-hours"
            name="total_hours"
            type="number"
            min={1}
            max={500}
            value={hours || ""}
            onChange={(event) => setHours(Number(event.target.value))}
            className="mt-1 min-h-11 w-full rounded-lg border border-line px-3 py-2.5 text-sm transition-colors focus:border-accent"
          />
        </div>
        <div aria-live="polite" className="text-left sm:text-right">
          <p className="text-xs font-medium text-ink-soft">Tahmini fiyat</p>
          <p className="font-display text-2xl font-bold">
            {estimatedPrice !== null && hours > 0 ? `${estimatedPrice.toLocaleString("tr-TR")}₺` : "—"}
          </p>
          {hourlyRate !== null && (
            <p className="text-xs text-ink-soft">{hourlyRate.toLocaleString("tr-TR")}₺ × {hours || 0} saat</p>
          )}
        </div>
      </div>

      {hourlyRate === null ? (
        <p className="mt-4 rounded-lg bg-amber-soft px-3 py-2.5 text-sm font-medium">
          Bu modül için bireysel fiyatlandırma henüz tanımlanmamış; talep şu anda oluşturulamıyor.
        </p>
      ) : (
        <button
          type="submit"
          disabled={isPending || selectedIds.size === 0 || hours < 1}
          className="mt-5 min-h-11 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Talep oluşturuluyor…" : "Talep Oluştur"}
        </button>
      )}
    </form>
  );
}
