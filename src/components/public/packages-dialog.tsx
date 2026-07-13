// src/components/public/packages-dialog.tsx — örnek paketleri native <dialog> ile gösteren popup
// Erişilebilirlik: showModal() focus'u hapseder, Esc ile kapanır, backdrop tıklaması kapatır
"use client";

import { useRef } from "react";
import { X, Clock } from "lucide-react";
import type { BundlePackage } from "@/lib/types/catalog";

interface PackagesDialogProps {
  moduleTitle: string;
  bundles: BundlePackage[];
}

export function PackagesDialog({ moduleTitle, bundles }: PackagesDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (bundles.length === 0) return null;

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex items-center rounded-xl border border-accent px-6 py-3 font-semibold text-accent transition-colors hover:bg-accent-soft"
      >
        Örnek Paketleri Gör
      </button>

      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-labelledby="packages-dialog-title"
        className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl p-0 shadow-xl backdrop:bg-ink/40"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="packages-dialog-title" className="font-display text-2xl font-bold tracking-tight">
                Örnek Paketler
              </h2>
              <p className="mt-1 text-sm text-ink-soft">{moduleTitle} için hazır şablonlar</p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Kapat"
              className="min-touch rounded-lg p-2 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="rounded-xl border border-line bg-surface p-5">
                <p className="font-display font-semibold">{bundle.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{bundle.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
                    <Clock className="size-3.5" aria-hidden /> {bundle.duration_hours} saat
                  </span>
                  <span className="rounded-full bg-amber-soft px-3 py-1 text-sm font-bold">
                    {bundle.fixed_price.toLocaleString("tr-TR")}₺
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-ink-soft">
            Talep oluşturmak ve tüm fiyat seçeneklerini görmek için ücretsiz üye olun.
          </p>
        </div>
      </dialog>
    </>
  );
}
