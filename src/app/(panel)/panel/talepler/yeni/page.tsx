// src/app/(panel)/panel/talepler/yeni/page.tsx — yeni analiz/tez talebi sayfası
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactRequestForm } from "@/components/panel/contact-request-form";

export const metadata: Metadata = { title: "Yeni Talep" };

export default function NewContactRequestPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/panel/talepler" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Taleplerim
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">Yeni Analiz / Tez Talebi</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Talebini ilet; ekibimiz inceleyip sana özel teklif ve planlamayla dönsün.
      </p>
      <div className="mt-6">
        <ContactRequestForm />
      </div>
    </div>
  );
}
