// src/app/(public)/page.tsx — anasayfa: görselli hero kompozisyonu, animasyonlu hizmet
// kartları, nasıl çalışır adımları ve kayıt CTA bandı (hero metni site_content'ten)
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
import { defaultHero, type HeroContent } from "@/lib/types/content";
import { siteImages } from "@/lib/images";
import { FadeUp, FloatingBadge, Reveal } from "@/components/public/motion-primitives";

const services = [
  {
    href: "/analiz",
    icon: BarChart3,
    image: siteImages.analysis,
    imageAlt: "Grafiklerle dolu analiz ekranı",
    title: "Analiz",
    description: "Bibliyometrik ve istatistiksel analizlerinizi uzman ekibimiz üstlenir; siz araştırmanıza odaklanın.",
    priceHint: "Projeye özel teklif",
  },
  {
    href: "/egitim",
    icon: GraduationCap,
    image: siteImages.education,
    imageAlt: "Birlikte çalışan öğrenciler",
    title: "Eğitim",
    description: "Excel, Word ve PowerPoint'te hazır paketler, size özel modüller veya sınıf eğitimleriyle ustalaşın.",
    priceHint: "800₺'den başlayan fiyatlarla",
  },
  {
    href: "/tez-duzenleme",
    icon: FileCheck2,
    image: siteImages.thesis,
    imageAlt: "Dolma kalemle yazılmış notlar",
    title: "Tez Düzenleme",
    description: "Teziniz biçim, kaynakça ve şablon kurallarına uygun, teslime hazır hâle getirilir.",
    priceHint: "Projeye özel teklif",
  },
];

const steps = [
  { icon: UserPlus, title: "Ücretsiz kayıt ol", description: "E-posta ya da Google hesabınla saniyeler içinde üye ol." },
  { icon: MousePointerClick, title: "Hizmetini seç", description: "Eğitim paketi, kendi modülün, sınıf ya da analiz/tez talebi — netlik bizde." },
  { icon: CalendarCheck, title: "Takipte kal", description: "Panelinden her talebinin durumunu adım adım izle." },
];

export default async function HomePage() {
  const hero = await getContent<HeroContent>("home", "hero", defaultHero);

  return (
    <>
      {/* Hero: solda metin, sağda yüzen rozetli görsel kompozisyonu */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-accent-soft),transparent_55%)]" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div>
            <FadeUp>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
                <Sparkles className="size-3.5" aria-hidden /> Analiz · Eğitim · Tez Düzenleme
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl xl:text-6xl">
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
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-md active:scale-[0.98]"
                >
                  Hemen Kayıt Ol <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/egitim"
                  className="inline-flex items-center rounded-xl border border-line bg-white px-6 py-3 font-semibold text-ink transition-all hover:bg-surface active:scale-[0.98]"
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

      {/* Hizmet kartları: görselli, hover'da yükselen */}
      <section aria-labelledby="services-heading" className="bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 id="services-heading" className="font-display text-3xl font-bold tracking-tight">
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
                    <div className="mt-auto pt-4">
                      <p className="inline-flex rounded-full bg-amber-soft px-3 py-1 text-xs font-semibold">
                        {service.priceHint}
                      </p>
                      <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent">
                        Detayları gör
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                      </p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section aria-labelledby="how-heading" className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 id="how-heading" className="font-display text-3xl font-bold tracking-tight">
              Nasıl çalışır?
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.12}>
                <li>
                  <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
                    <step.icon className="size-6" aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-lg font-semibold">
                    <span className="mr-2 text-accent">{index + 1}.</span>
                    {step.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Kayıt CTA bandı */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="rounded-2xl bg-ink px-8 py-12 text-center text-white md:px-16">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Aktif eğitimler ve detaylı fiyatlar üyelere açık
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Ücretsiz kayıt ol; açık sınıfları, paket fiyatlarını ve sana özel modül seçeneklerini panelinden gör.
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
