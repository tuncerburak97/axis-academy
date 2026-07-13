// src/app/error.tsx — beklenmeyen hatalar için kök hata sınırı (yeniden dene aksiyonlu)
"use client";

import { AlertTriangle } from "lucide-react";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="rounded-xl bg-red-50 p-4 text-red-600">
        <AlertTriangle className="size-8" aria-hidden />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Bir şeyler ters gitti</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-soft">
        Beklenmeyen bir hata oluştu. Sorun devam ederse lütfen daha sonra tekrar deneyin.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        Tekrar Dene
      </button>
    </main>
  );
}
