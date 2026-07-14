// src/app/(public)/egitim/[id]/page.tsx — modül detayı: yaklaşan eğitimler, paket kartları, müfredat popup
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ListChecks,
  MousePointerClick,
  Package,
  Timer,
  UserPlus,
} from "lucide-react";
import { getActiveBundlesWithSyllabus, getModuleById, getPublicUpcomingClasses } from "@/lib/queries/catalog";
import { BundleCardsSection } from "@/components/public/bundle-cards-section";
import { PublicUpcomingSection } from "@/components/public/public-upcoming-section";
import { categoryLabels } from "@/lib/types/catalog";
import { categoryImages } from "@/lib/images";
import { FadeUp, Reveal } from "@/components/public/motion-primitives";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const educationModule = await getModuleById(id);
  return { title: educationModule?.title ?? "Eğitim" };
}

function formatHourRange(bundles: { duration_hours: number }[]) {
  if (bundles.length === 0) return "İhtiyaca göre";
  const min = Math.min(...bundles.map((bundle) => bundle.duration_hours));
  const max = Math.max(...bundles.map((bundle) => bundle.duration_hours));
  return min === max ? `${min} saat` : `${min}–${max} saat`;
}

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const educationModule = await getModuleById(id);
  if (!educationModule || !educationModule.is_active) notFound();

  const [bundles, upcomingClasses] = await Promise.all([
    getActiveBundlesWithSyllabus(id),
    getPublicUpcomingClasses(id),
  ]);

  const hasBundleSyllabus = bundles.some((bundle) => bundle.weeks.length > 0);
  const maxWeeks = Math.max(...bundles.map((bundle) => bundle.weeks.length), 0);
  const minWeeks = bundles.filter((bundle) => bundle.weeks.length > 0).length > 0
    ? Math.min(...bundles.filter((bundle) => bundle.weeks.length > 0).map((bundle) => bundle.weeks.length))
    : 0;

  return (
    <>
      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-3 py-16 pb-8 sm:px-6 md:grid-cols-[3fr_2fr]">
          <div>
            <Link href="/egitim" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
              <ArrowLeft className="size-4" aria-hidden /> Tüm Eğitimler
            </Link>
            <FadeUp>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
                  {categoryLabels[educationModule.category]}
                </p>
                {educationModule.badge && (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                    {educationModule.badge}
                  </span>
                )}
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{educationModule.title}</h1>
              <p className="mt-3 max-w-2xl text-lg text-ink-soft">{educationModule.description}</p>
            </FadeUp>
          </div>
          <FadeUp delay={0.15} className="hidden md:block">
            <Image
              src={categoryImages[educationModule.category]}
              alt={`${categoryLabels[educationModule.category]} eğitimi görseli`}
              width={520}
              height={340}
              className="h-64 w-full rounded-2xl object-cover shadow-lg"
            />
          </FadeUp>
        </div>
      </section>

      <PublicUpcomingSection classes={upcomingClasses} moduleId={id} />

      <section aria-label="Program özeti" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Reveal>
          <dl className="grid gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-accent-soft p-2.5 text-accent"><Package className="size-5" aria-hidden /></span>
              <div>
                <dt className="text-xs font-medium text-ink-soft">Hazır Paket</dt>
                <dd className="font-display text-xl font-bold">{bundles.length} program</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-accent-soft p-2.5 text-accent"><Timer className="size-5" aria-hidden /></span>
              <div>
                <dt className="text-xs font-medium text-ink-soft">Program Süresi</dt>
                <dd className="font-display text-xl font-bold">{formatHourRange(bundles)}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-accent-soft p-2.5 text-accent"><ListChecks className="size-5" aria-hidden /></span>
              <div>
                <dt className="text-xs font-medium text-ink-soft">Müfredat</dt>
                <dd className="font-display text-xl font-bold">
                  {hasBundleSyllabus
                    ? `${minWeeks}–${maxWeeks} haftalık paketler`
                    : `${educationModule.features.length} net çıktı`}
                </dd>
              </div>
            </div>
          </dl>
        </Reveal>
      </section>

      {bundles.length > 0 && (
        <BundleCardsSection moduleTitle={educationModule.title} bundles={bundles} />
      )}

      <section className="mx-auto max-w-3xl px-3 py-16 sm:px-6">
        {educationModule.long_description ? (
          <div className="space-y-4 leading-relaxed text-ink-soft">
            {educationModule.long_description.split("\n").filter(Boolean).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft">Bu eğitimin detaylı açıklaması yakında eklenecek.</p>
        )}

        {educationModule.features.length > 0 && (
          <Reveal>
            <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">Bu eğitim neyi çözer?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Program sonunda somut olarak kazanacağın yetkinlikler:
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {educationModule.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 rounded-xl border border-line bg-white p-4 text-sm shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-10 rounded-xl border border-line bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-ink-soft">
              Paket detayları, açık sınıflar ve katılım seçenekleri üye panelinde.
            </p>
            <Link
              href="/kayit"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Ücretsiz Kayıt Ol <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="flow-heading" className="mx-auto max-w-6xl px-3 py-16 sm:px-6">
        <Reveal>
          <div className="rounded-2xl bg-ink px-8 py-12 text-white md:px-12">
            <h2 id="flow-heading" className="text-center font-display text-2xl font-bold tracking-tight md:text-3xl">
              Nasıl katılırım?
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              <li className="text-center">
                <span className="inline-flex rounded-xl bg-white/10 p-3.5">
                  <UserPlus className="size-6 text-amber" aria-hidden />
                </span>
                <p className="mt-3 font-display font-semibold">1. Ücretsiz üye ol</p>
                <p className="mt-1.5 text-sm text-white/70">
                  Tüm paketleri, açık sınıf detaylarını ve katılım seçeneklerini panelinden gör.
                </p>
              </li>
              <li className="text-center">
                <span className="inline-flex rounded-xl bg-white/10 p-3.5">
                  <MousePointerClick className="size-6 text-amber" aria-hidden />
                </span>
                <p className="mt-3 font-display font-semibold">2. Tarihini seç ya da talep aç</p>
                <p className="mt-1.5 text-sm text-white/70">
                  Sana uyan sınıfa katılım isteği gönder; uygun tarih yoksa mesajla tarih talebi oluştur.
                </p>
              </li>
              <li className="text-center">
                <span className="inline-flex rounded-xl bg-white/10 p-3.5">
                  <CalendarDays className="size-6 text-amber" aria-hidden />
                </span>
                <p className="mt-3 font-display font-semibold">3. Panelinden takip et</p>
                <p className="mt-1.5 text-sm text-white/70">
                  Onay, haftalık ders dokümanları, ödevler ve notlar — hepsi eğitim panelinde.
                </p>
              </li>
            </ol>
            <div className="mt-10 text-center">
              <Link
                href="/kayit"
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-semibold text-ink transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
              >
                Hemen Başla <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
