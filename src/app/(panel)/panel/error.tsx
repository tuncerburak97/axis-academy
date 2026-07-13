// src/app/(panel)/panel/error.tsx — panel hata sınırı (yeniden dene aksiyonlu)
"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PanelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="rounded-xl bg-red-50 p-4 text-red-600">
        <AlertTriangle className="size-8" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-xl font-bold tracking-tight">Panel yüklenemedi</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">
        Bir hata oluştu. Tekrar deneyebilir veya ana panele dönebilirsin.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Tekrar Dene
        </button>
        <Link
          href="/panel"
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface"
        >
          Panele Dön
        </Link>
      </div>
    </div>
  );
}
