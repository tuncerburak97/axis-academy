// src/app/(public)/page.tsx — anasayfa: yaklaşan eğitimler hero, değer önerisi, hizmet kartları
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  GraduationCap,
  FileCheck2,
  ArrowRight,
  UserPlus,
  MousePointerClick,
  CalendarCheck,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { getContent } from "@/lib/queries/content";
import { getPublicAllUpcomingClasses } from "@/lib/queries/catalog";
import { defaultHero, type HeroContent } from "@/lib/types/content";
import { siteImages } from "@/lib/images";
import { FadeUp, FloatingBadge, Reveal } from "@/components/public/motion-primitives";
import { ProcessTimeline, StatBand, TrustStrip } from "@/components/public/marketing";
import { PublicUpcomingClassesHero } from "@/components/public/public-upcoming-classes-hero";
import { ValuePropositionSection } from "@/components/public/value-proposition-section";

const services = [
  {
    href: "/analiz",
    icon: BarChart3,
    image: siteImages.analysis,
    imageAlt: "Grafiklerle dolu analiz ekranı",
    title: "Analiz",
    description: "Bibliyometrik ve istatistiksel analizlerinizi uzman ekibimiz üstlenir; siz araştırmanıza odaklanın.",
  },
  {
    href: "/egitim",
    icon: GraduationCap,
    image: siteImages.education,
    imageAlt: "Birlikte çalışan öğrenciler",
    title: "Eğitim",
    description: "Excel, Word ve PowerPoint'te hazır paketler, size özel modüller veya sınıf eğitimleriyle ustalaşın.",
  },
  {
    href: "/tez-duzenleme",
    icon: FileCheck2,
    image: siteImages.thesis,
    imageAlt: "Dolma kalemle yazılmış notlar",
    title: "Tez Düzenleme",
    description: "Teziniz biçim, kaynakça ve şablon kurallarına uygun, teslime hazır hâle getirilir.",
  },
];

const steps = [
  { icon: UserPlus, title: "Ücretsiz kayıt ol", description: "E-posta ya da Google hesabınla saniyeler içinde üye ol." },
  { icon: MousePointerClick, title: "Hizmetini seç", description: "Eğitim paketi, kendi modülün, sınıf ya da analiz/tez talebi — netlik bizde." },
  { icon: CalendarCheck, title: "Takipte kal", description: "Panelinden her talebinin durumunu adım adım izle." },
];

export default async function HomePage() {
  const [hero, upcomingClasses] = await Promise.all([
    getContent<HeroContent>("home", "hero", defaultHero),
    getPublicAllUpcomingClasses(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-accent-soft),transparent_55%)]" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-3 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <FadeUp>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
                <Sparkles className="size-3.5" aria-hidden /> Analiz · Eğitim · Tez Düzenleme
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-5 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                {hero.title}
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-5 max-w-xl text-lg text-ink-soft">{hero.subtitle}</p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/kayit"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-md active:scale-[0.98] sm:px-6 sm:text-base"
                >
                  Hemen Kayıt Ol <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/egitim"
                  className="inline-flex items-center rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition-all hover:bg-surface active:scale-[0.98] sm:px-6 sm:text-base"
                >
                  Eğitimleri İncele
                </Link>
              </div>
            </FadeUp>
          </div>

          <div className="relative hidden md:block">
            <FadeUp delay={0.15}>
              <div className="overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src={siteImages.hero}
                  alt="Birlikte çalışan ve öğrenen bir ekip"
                  width={700}
                  height={500}
                  priority
                  className="h-[420px] w-full object-cover"
                />
              </div>
            </FadeUp>
            <FloatingBadge delay={0.5} className="absolute -left-6 top-8">
              <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 shadow-lg">
                <span className="rounded-lg bg-accent-soft p-2 text-accent"><ShieldCheck className="size-5" aria-hidden /></span>
                <div className="text-sm">
                  <p className="font-semibold leading-tight">Uzman ekip</p>
                  <p className="text-xs text-ink-soft">Birebir takip</p>
                </div>
              </div>
            </FloatingBadge>
            <FloatingBadge delay={0.7} className="absolute -bottom-5 right-8">
              <div className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 shadow-lg">
                <span className="rounded-lg bg-amber-soft p-2 text-amber"><Clock className="size-5" aria-hidden /></span>
                <div className="text-sm">
                  <p className="font-semibold leading-tight">Esnek program</p>
                  <p className="text-xs text-ink-soft">Sana uyan saatler</p>
                </div>
              </div>
            </FloatingBadge>
          </div>
        </div>
      </section>

      <PublicUpcomingClassesHero classes={upcomingClasses} />

      <ValuePropositionSection />

      <section aria-labelledby="services-heading" className="bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <Reveal>
            <h2 id="services-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Üç hizmet, tek çatı
            </h2>
            <p className="mt-2 max-w-lg text-ink-soft">Hangi aşamada olursanız olun, ihtiyacınıza uyan net bir çözüm var.</p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.href} delay={index * 0.12}>
                <Link
                  href={service.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg active:scale-[0.99]"
                >
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.imageAlt}
                      width={600}
                      height={320}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute bottom-3 left-4 inline-flex rounded-lg bg-white/95 p-2.5 text-accent shadow-sm">
                      <service.icon className="size-5" aria-hidden />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-semibold">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{service.description}</p>
                    <p className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
                      Detayları gör
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <TrustStrip
        items={[
          { icon: ShieldCheck, title: "Uzman ekip", subtitle: "Akademik + kurumsal deneyim" },
          { icon: Clock, title: "Esnek program", subtitle: "Sana uyan saatler" },
          { icon: Sparkles, title: "Şeffaf süreç", subtitle: "Panelden anlık takip" },
          { icon: GraduationCap, title: "Somut çıktı", subtitle: "Ertesi gün işinde kullan" },
        ]}
      />

      <StatBand
        stats={[
          { value: 15, label: "Yıllık Eğitim Deneyimi" },
          { value: 10000, suffix: "+", label: "Eğitim Verilen Katılımcı" },
          { value: 150, label: "Kurumsal İş Birliği" },
        ]}
        title="Rakamlarla Axis Akademi"
        description="Kurumsal eğitim ve akademik destek alanında birikmiş deneyim."
      />

      <ProcessTimeline steps={steps} title="Nasıl çalışır?" />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="rounded-2xl bg-ink px-8 py-12 text-center text-white md:px-16">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Açık sınıflar ve paket detayları üyelere açık
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Ücretsiz kayıt ol; yaklaşan eğitimleri, paket müfredatlarını ve sana özel modül seçeneklerini panelinden gör.
            </p>
            <Link
              href="/kayit"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-semibold text-ink transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
            >
              Ücretsiz Kayıt Ol <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
