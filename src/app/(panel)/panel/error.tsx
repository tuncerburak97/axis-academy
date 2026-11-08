// src/app/(panel)/panel/error.tsx — üye alanı hata sınırı
"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PanelError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-paper px-6 py-16 text-center shadow-card">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-lg font-semibold tracking-tight">Bu sayfa şu an yüklenemedi</h1>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">
        Bağlantında ya da bizim tarafımızda geçici bir sorun olabilir. Tekrar dene; düzelmezse Bugün ekranına dön.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcw aria-hidden /> Tekrar dene
        </Button>
        <Button variant="outline" asChild>
          <Link href="/panel">Bugün ekranına dön</Link>
        </Button>
      </div>
    </div>
  );
}
