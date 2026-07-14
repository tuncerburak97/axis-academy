// src/app/(panel)/panel/kesfet/page.tsx — Keşfet: yaklaşan eğitimler hero + aktif modül kartları
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getActiveModules } from "@/lib/queries/catalog";
import { getMemberUpcomingClasses } from "@/lib/queries/member";
import { UpcomingClassesHero } from "@/components/panel/upcoming-classes-hero";
import { categoryLabels } from "@/lib/types/catalog";

export const metadata: Metadata = { title: "Keşfet" };
export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const [upcomingClasses, modules] = await Promise.all([
    getMemberUpcomingClasses(),
    getActiveModules(),
  ]);

  return (
    <>
      <UpcomingClassesHero classes={upcomingClasses} />

      <h1 className="font-display text-2xl font-bold tracking-tight">Tüm Eğitim Modülleri</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Bir modül seç; paketleri, fiyat planlarını ve açık sınıfları gör, sana uyan biçimde talep oluştur.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={`/panel/kesfet/${mod.id}`}
            className="group relative flex flex-col rounded-xl border border-line bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            {mod.badge && (
              <span className="absolute -top-3 right-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow-sm">
                {mod.badge}
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {categoryLabels[mod.category]}
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold">{mod.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{mod.description}</p>
            {mod.features.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {mod.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
              Seçenekleri gör
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </p>
          </Link>
        ))}
        {modules.length === 0 && (
          <p className="rounded-xl border border-dashed border-line bg-white p-6 text-sm text-ink-soft md:col-span-2 xl:col-span-3">
            Şu anda aktif eğitim modülü yok. Yakında burada olacak.
          </p>
        )}
      </div>
    </>
  );
}
