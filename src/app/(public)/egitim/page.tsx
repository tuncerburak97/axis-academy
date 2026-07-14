// src/app/(public)/egitim/page.tsx — eğitim modülleri: kategori görselli, animasyonlu kartlar
// (içerik admin'in yönettiği DB verisinden dinamik gelir)
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, FileSpreadsheet, FileText, Presentation, type LucideIcon } from "lucide-react";
import { PageIntro } from "@/components/public/page-intro";
import { getActiveModules } from "@/lib/queries/catalog";
import { categoryLabels, type ModuleCategory } from "@/lib/types/catalog";
import { getContent } from "@/lib/queries/content";
import { defaultEducationIntro, type EducationIntroContent } from "@/lib/types/content";
import { categoryBadgeClasses, categoryImages } from "@/lib/images";
import { Reveal } from "@/components/public/motion-primitives";
import { TrustStrip } from "@/components/public/marketing";
import { CheckCircle2, Layers, Users } from "lucide-react";

export const metadata: Metadata = { title: "Eğitim" };

const categoryIcons: Record<ModuleCategory, LucideIcon> = {
  excel: FileSpreadsheet,
  word: FileText,
  powerpoint: Presentation,
};

export default async function EducationPage() {
  const [modules, intro] = await Promise.all([
    getActiveModules(),
    getContent<EducationIntroContent>("education", "intro", defaultEducationIntro),
  ]);

  return (
    <>
      <PageIntro eyebrow="Hizmet" title={intro.title} description={intro.description} />
      <TrustStrip
        items={[
          { icon: Layers, title: "Hazır paketler", subtitle: "Excel · Word · PowerPoint" },
          { icon: Users, title: "Sınıf eğitimleri", subtitle: "Açık kontenjanlar" },
          { icon: CheckCircle2, title: "Kişiye özel modül", subtitle: "Üyelere özel modül oluşturma" },
        ]}
      />
      <section className="mx-auto max-w-6xl px-3 py-16 sm:px-6">
        {modules.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-ink-soft">
            Eğitim programları çok yakında burada. Bizi takipte kalın.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {modules.map((mod, index) => {
              const CategoryIcon = categoryIcons[mod.category];
              return (
                <Reveal key={mod.id} delay={index * 0.1}>
                  <Link
                    href={`/egitim/${mod.id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg active:scale-[0.99]"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <Image
                        src={categoryImages[mod.category]}
                        alt={`${categoryLabels[mod.category]} eğitimi görseli`}
                        width={600}
                        height={280}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        className={`absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-sm ${categoryBadgeClasses[mod.category]}`}
                      >
                        <CategoryIcon className="size-4" aria-hidden />
                        {categoryLabels[mod.category]}
                      </span>
                      {mod.badge && (
                        <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow-sm">
                          {mod.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-display text-xl font-semibold">{mod.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{mod.description}</p>

                      {mod.features.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {mod.features.slice(0, 4).map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-ink-soft">
                              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-auto pt-5">
                        <p className="flex items-center gap-1 text-sm font-semibold text-accent">
                          Detayları gör
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal>
          <div className="mt-12 rounded-2xl bg-accent-soft p-8 text-center">
            <p className="font-display text-lg font-semibold">
              Açık sınıflar, paket müfredatları ve kişiye özel modül oluşturma üyelere açıktır.
            </p>
            <Link
              href="/kayit"
              className="mt-4 inline-flex rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-md active:scale-[0.98]"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
