// src/components/auth/next-context.tsx — girişten sonra dönülecek sayfaya göre kısa bağlam notu ("Başvurunu tamamlamak için…")
import { ArrowRight } from "lucide-react";

export function nextContextMessage(next: string): string | null {
  if (next.startsWith("/programlar/") && next.includes("basvur=")) return "Giriş yapınca başvuru formun açık olarak seni bekleyecek.";
  if (next.startsWith("/programlar")) return "Giriş yapınca baktığın programa geri döneceksin.";
  if (next.startsWith("/teklif/")) return "Giriş yapınca taslağınla birlikte talep formuna geri döneceksin.";
  return null;
}

export function NextContextNote({ next }: { next: string }) {
  const message = nextContextMessage(next);
  if (!message) return null;
  return (
    <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm font-medium text-accent-ink">
      <ArrowRight className="mt-0.5 size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
