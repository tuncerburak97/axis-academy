// src/components/public/home-sections.tsx — anasayfa vitrin bölümleri
// Canlı veri (dönemler, yorumlar) sunucuda okunur; çizimler showcase-art.tsx'ten gelir.
import * as React from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, Building2, CalendarDays, GraduationCap } from "lucide-react";
import { formatDateShort } from "@/lib/format";
import type { CatalogCohort, PublicReview } from "@/lib/types/platform";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/public/section";
import { CohortMiniRow } from "@/components/public/cohort-row";
import { Checklist, Stars } from "@/components/public/blocks";
import {
  AnalysisComposite,
  CheckChip,
  NetworkMap,
  PanelMock,
  ThesisComposite,
  ThesisPage,
  TrainingComposite,
  WindowFrame,
} from "@/components/public/showcase-art";
import { ShowcaseTabs } from "@/components/public/showcase-tabs";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------
// "Kayıt açık" hapı: en yakın dönem (gerçek veri)
// ------------------------------------------------------------
export function LivePill({ cohort, className }: { cohort: CatalogCohort; className?: string }) {
  return (
    <Link
      href={`/programlar/${cohort.module_slug}#donemler`}
      className={cn(
        "group inline-flex max-w-full items-center gap-2.5 rounded-full bg-paper py-1 pl-1 pr-3.5 text-[13px] shadow-card ring-1 ring-line transition-[box-shadow] hover:shadow-raise hover:ring-line-strong",
        className,
      )}
    >
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success-ink">
        <span className="live-dot size-1.5 rounded-full bg-success" aria-hidden />
        Kayıt açık
      </span>
      <span className="min-w-0 truncate font-medium text-ink">{cohort.module_title}</span>
      <span className="tabular hidden shrink-0 font-mono text-ink-soft sm:inline">{formatDateShort(cohort.start_date)}</span>
      <ArrowRight className="size-3.5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
    </Link>
  );
}

// ------------------------------------------------------------
// Koyu "Yaklaşan dönemler" kartı (gerçek kontenjan)
// ------------------------------------------------------------
export function LiveCohortsCard({ cohorts, className }: { cohorts: CatalogCohort[]; className?: string }) {
  return (
    <Card variant="inverse" padding="none" className={cn("overflow-hidden shadow-pop ring-1 ring-white/10", className)}>
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">Kayıt açık</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Yaklaşan dönemler</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
          <span className="live-dot size-1.5 rounded-full bg-[#86efac]" aria-hidden /> Canlı kontenjan
        </span>
      </div>
      {cohorts.length > 0 ? (
        <ul className="flex flex-col px-2.5">
          {cohorts.map((cohort) => (
            <li key={cohort.id} className="border-t border-white/10 first:border-t-0">
              <CohortMiniRow cohort={cohort} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mx-5 rounded-xl bg-white/5 px-4 py-6 text-sm text-white/70">
          <CalendarDays className="mb-2 size-5 text-white/60" aria-hidden />
          Yeni dönemler yakında açılıyor. Beklemek istemezsen birebir ders iste.
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
        <p className="text-xs text-white/55">Fiyatlar kişi başı, bilgi amaçlıdır.</p>
        <Link href="/programlar#donemler" className="inline-flex items-center gap-1 text-sm font-semibold text-accent-glow hover:text-white">
          Tüm dönemler <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

// ------------------------------------------------------------
// Hero vitrini: ortada canlı dönemler, iki yanda örnek çıktılar
// ------------------------------------------------------------
export function HeroShowcase({ cohorts }: { cohorts: CatalogCohort[] }) {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl sm:mt-16">
      <div aria-hidden className="glow-indigo pointer-events-none absolute left-1/2 top-10 -z-10 h-[520px] w-[min(900px,140vw)] -translate-x-1/2 opacity-70" />
      <div className="relative grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,400px)_minmax(0,1fr)] md:gap-0">
        {/* sol: bibliyometrik ağ haritası */}
        <figure
          className="tilt float-slow relative z-0 hidden md:mr-[-56px] md:mt-16 md:block"
          style={{ "--tilt": "-4deg" } as React.CSSProperties}
        >
          <WindowFrame title="ortak-kelime-agi.vos" bodyClassName="p-3 pb-2">
            <NetworkMap animate />
            <figcaption className="flex items-center justify-between border-t border-line px-1 pt-2 text-[10.5px] text-ink-soft">
              <span>Scopus · 1.248 yayın · 3 küme</span>
              <span className="font-semibold text-accent">Örnek çıktı</span>
            </figcaption>
          </WindowFrame>
        </figure>

        {/* orta: canlı dönemler */}
        <div className="relative z-10 min-w-0">
          <LiveCohortsCard cohorts={cohorts.slice(0, 3)} />
        </div>

        {/* sağ: tez sayfası */}
        <figure
          className="tilt float-slow-alt relative z-0 hidden md:ml-[-48px] md:mt-24 md:block"
          style={{ "--tilt": "4deg" } as React.CSSProperties}
        >
          <div className="ml-auto mr-2 w-[74%]">
            <ThesisPage />
          </div>
          <CheckChip className="absolute -right-3 top-[9%]">Enstitü şablonu</CheckChip>
          <CheckChip className="absolute -right-6 top-[58%]">APA 7 kaynakça</CheckChip>
          <figcaption className="sr-only">Örnek: enstitü şablonuna göre düzenlenmiş tez sayfası</figcaption>
        </figure>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Niyet çubuğu: ziyaretçiyi doğru yola tek tıkla gönderir
// ------------------------------------------------------------
const intents = [
  { href: "/programlar", icon: GraduationCap, title: "Program öğrenmek", hint: "Excel, Word, PowerPoint", tone: "bg-success-soft text-success-ink" },
  { href: "/analiz", icon: BarChart3, title: "Veri analizi", hint: "Bibliyometrik · istatistiksel", tone: "bg-accent-soft text-accent" },
  { href: "/tez-duzenleme", icon: BookOpenCheck, title: "Tez düzenleme", hint: "Biçim, kaynakça, şablon", tone: "bg-info-soft text-info-ink" },
  { href: "/kurumsal", icon: Building2, title: "Ekibime eğitim", hint: "Online, yerinde, karma", tone: "bg-amber-soft text-amber-ink" },
];

export function IntentDock({ className }: { className?: string }) {
  return (
    <nav aria-labelledby="niyet-baslik" className={cn("relative z-20", className)}>
      <Container>
        <div className="rounded-3xl bg-paper p-2 shadow-pop ring-1 ring-ink/[0.06]">
          <p id="niyet-baslik" className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft sm:sr-only">
            Neye ihtiyacın var?
          </p>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
            {intents.map((intent) => (
              <li key={intent.href} className="min-w-0">
                <Link
                  href={intent.href}
                  className="group flex min-h-[76px] items-center gap-3.5 rounded-2xl px-4 py-3 transition-colors hover:bg-surface"
                >
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", intent.tone)}>
                    <intent.icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug text-ink">{intent.title}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-soft">{intent.hint}</span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-ink-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </nav>
  );
}

// ------------------------------------------------------------
// Araç şeridi: çalıştığımız yazılım ve veri tabanları
// ------------------------------------------------------------
const tools = ["Excel", "Word", "PowerPoint", "SPSS", "R", "Python", "Stata", "Jamovi", "AMOS", "VOSviewer", "Bibliometrix", "Scopus", "Web of Science", "Zotero"];

export function ToolMarquee({ className }: { className?: string }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {tools.map((tool) => (
        <li key={tool} className="flex items-center whitespace-nowrap px-6 text-lg font-semibold tracking-[-0.02em] text-ink/35 sm:text-xl">
          {tool}
          <span className="ml-12 size-1 rounded-full bg-ink/20" aria-hidden />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Çalıştığımız araçlar ve veri tabanları" className={cn("py-12 sm:py-14", className)}>
      <p className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Çalıştığımız araçlar ve veri tabanları</p>
      <div className="marquee mask-fade-x mt-6 flex overflow-hidden">
        <div className="marquee-track flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------
// Koyu vitrin: teslim edilen işin örnekleri
// ------------------------------------------------------------
function DeliverableCopy({
  eyebrow,
  title,
  description,
  points,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  href: string;
  cta: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent-glow">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[28px]">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-white/65">{description}</p>
      <Checklist items={points} className="mt-6 [&_li]:text-white/85 [&_li>span]:bg-white/10 [&_li>span]:text-accent-glow" />
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link
          href={href}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-accent-soft"
        >
          {cta} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

export function DeliverablesSection() {
  const tabs = [
    {
      value: "analiz",
      label: "Analiz raporu",
      hint: "Bibliyometrik · istatistiksel",
      content: (
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <DeliverableCopy
            eyebrow="Analiz"
            title="Yayına hazır tablo ve şekiller"
            description="Veri kontrolünden yöntem seçimine, ağ haritalarından APA biçimli tablolara kadar; tezine ya da makalene doğrudan koyabileceğin çıktılar."
            points={["Scopus ve Web of Science verisiyle ağ haritaları", "SPSS, R ve Python ile istatistiksel analiz", "Bulguların akademik dille yorumu"]}
            href="/analiz"
            cta="Analiz teklifi al"
          />
          <AnalysisComposite tone="dark" />
        </div>
      ),
    },
    {
      value: "tez",
      label: "Tez düzenleme",
      hint: "Enstitü şablonuna tam uyum",
      content: (
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <DeliverableCopy
            eyebrow="Tez"
            title="Enstitüden geri dönmeyen tez"
            description="Kenar boşluklarından başlık numaralarına, kaynakçadan tablo listelerine kadar her şey enstitünün yazım kılavuzuna göre."
            points={["Enstitü şablonuna birebir uyum", "APA 7, IEEE, Chicago kaynakça", "Otomatik içindekiler, tablo ve şekil listeleri"]}
            href="/tez-duzenleme"
            cta="Tez teklifi al"
          />
          <ThesisComposite tone="dark" />
        </div>
      ),
    },
    {
      value: "egitim",
      label: "Eğitim projesi",
      hint: "Kendi dosyalarınla uygulama",
      content: (
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <DeliverableCopy
            eyebrow="Eğitim"
            title="Dönem sonunda elinde çalışan bir iş"
            description="Her program, gerçek bir dosya üzerinde biten bir projeyle kapanır: rapor, pano ya da sunum. Sertifikan da doğrulanabilir bir kodla gelir."
            points={["Canlı derslerle haftalık ilerleme", "Kendi iş dosyalarınla uygulama", "Doğrulanabilir katılım belgesi"]}
            href="/programlar"
            cta="Programları incele"
          />
          <TrainingComposite />
        </div>
      ),
    },
  ];

  return (
    <section id="hizmetler" aria-labelledby="ciktilar-baslik" className="relative isolate overflow-hidden bg-ink py-20 text-white sm:py-28">
      <div aria-hidden className="bg-grid-dark mask-fade-b absolute inset-0 -z-10" />
      <div aria-hidden className="glow-indigo absolute -left-40 top-0 -z-10 size-[640px] opacity-60" />
      <div aria-hidden className="glow-amber absolute -right-32 bottom-0 -z-10 size-[520px] opacity-50" />
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">Ne teslim ediyoruz</p>
          <h2 id="ciktilar-baslik" className="mt-3 text-[32px] font-semibold leading-[1.05] tracking-[-0.035em] text-balance sm:text-5xl">
            Söz değil, <span className="accent-word text-[1.06em] text-accent-glow">çıktı</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/65 sm:text-base">
            Analiz, tez ya da eğitim; işin sonunda elinde ne olacağını baştan görürsün. Aşağıdakiler gerçek teslimlerimizin temsilî örnekleri.
          </p>
        </div>
        <ShowcaseTabs tabs={tabs} className="mt-12" />
      </Container>
    </section>
  );
}

// ------------------------------------------------------------
// Ürün bölümü: talep süreci panelde
// ------------------------------------------------------------
export function ProductShot({ className }: { className?: string }) {
  return (
    <div className={cn("relative min-w-0", className)}>
      <div aria-hidden className="glow-indigo absolute -inset-10 -z-10 opacity-40" />
      <PanelMock />
    </div>
  );
}

// ------------------------------------------------------------
// Kanıt: rakamlar + öne çıkan yorum
// ------------------------------------------------------------
const proofStats = [
  { value: "15+", label: "yıllık eğitim deneyimi" },
  { value: "10.000+", label: "eğitim verilen katılımcı" },
  { value: "150+", label: "kurumsal iş birliği" },
];

export function ProofSection({ reviews }: { reviews: PublicReview[] }) {
  const [featured, ...rest] = reviews;
  return (
    <section aria-labelledby="kanit-baslik" className="py-20 sm:py-28">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">Rakamlarla Axis</p>
        <h2 id="kanit-baslik" className="sr-only">
          Rakamlar ve katılımcı yorumları
        </h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-3xl bg-line ring-1 ring-line sm:grid-cols-3">
          {proofStats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-2 bg-paper px-6 py-8 sm:px-8 sm:py-10">
              <dt className="text-sm text-ink-soft">{stat.label}</dt>
              <dd className="font-serif text-[64px] leading-[0.9] tracking-[-0.02em] text-ink sm:text-[80px]">
                {stat.value.replace("+", "")}
                <span className="text-accent">+</span>
              </dd>
            </div>
          ))}
        </dl>

        {featured && (
          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
            <figure className="min-w-0">
              <span aria-hidden className="block h-12 font-serif text-[96px] leading-none text-accent/30">“</span>
              <blockquote className="font-serif text-[28px] leading-[1.25] tracking-[-0.01em] text-ink text-balance sm:text-[36px]">
                {featured.comment}
              </blockquote>
              <figcaption className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="font-semibold text-ink">{featured.author}</span>
                {featured.program_title && <span className="text-ink-soft">{featured.program_title}</span>}
                <Stars rating={featured.rating} />
              </figcaption>
            </figure>
            {rest.length > 0 && (
              <ul className="flex min-w-0 flex-col gap-4 lg:pt-10">
                {rest.map((review) => (
                  <li key={review.id}>
                    <figure className="rounded-2xl border border-line bg-paper p-5 shadow-card">
                      <Stars rating={review.rating} />
                      <blockquote className="mt-2.5 text-[15px] leading-relaxed text-ink">“{review.comment}”</blockquote>
                      <figcaption className="mt-3 text-sm">
                        <span className="font-semibold text-ink">{review.author}</span>
                        {review.program_title && <span className="text-ink-soft"> · {review.program_title}</span>}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {featured && (
          <p className="mt-8 text-xs text-ink-soft">Yalnızca dönemini tamamlamış katılımcıların yorumları yayınlanır.</p>
        )}
      </Container>
    </section>
  );
}

// ------------------------------------------------------------
// Koyu kapanış çağrısı (alt bilgiyle birleşir)
// ------------------------------------------------------------
export function DarkCta({ title, description, children }: { title: React.ReactNode; description: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-center text-white sm:py-28">
      <div aria-hidden className="bg-grid-dark absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div aria-hidden className="glow-indigo absolute left-1/2 top-1/2 -z-10 h-[480px] w-[880px] -translate-x-1/2 -translate-y-1/2 opacity-80" />
      <Container className="max-w-3xl">
        <h2 className="text-[34px] font-semibold leading-[1.04] tracking-[-0.04em] text-balance sm:text-6xl">{title}</h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">{description}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">{children}</div>
      </Container>
    </section>
  );
}

/** Koyu zeminde birincil ve ikincil bağlantı butonları */
export function LightButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-[15px] font-semibold text-ink shadow-[0_0_0_4px_rgb(255_255_255/0.08)] transition-colors hover:bg-accent-soft"
    >
      {children}
    </Link>
  );
}

export function GhostDarkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center gap-2 rounded-xl px-5 text-[15px] font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10"
    >
      {children}
    </Link>
  );
}

