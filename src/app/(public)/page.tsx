// src/app/(public)/page.tsx — anasayfa: niyet seçimi + canlı dönemler, programlar, süreç, hizmetler, yorumlar, SSS
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, BookOpenCheck, Building2, CalendarDays, GraduationCap } from "lucide-react";
import { getContent } from "@/lib/queries/content";
import { getCatalogCohorts, getProgramSummaries, getPublicReviews } from "@/lib/queries/public-catalog";
import { defaultFaq, defaultHero, type FaqContent, type HeroContent } from "@/lib/types/content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusTrack } from "@/components/ui/progress";
import { Accent, Eyebrow } from "@/components/ui/page-header";
import { AccentTitle, Container, Section, SectionIntro } from "@/components/public/section";
import { CohortMiniRow } from "@/components/public/cohort-row";
import { ProgramCard } from "@/components/public/program-card";
import { CtaBand, FaqList, Pipeline, ReviewList, TrustStrip } from "@/components/public/blocks";

const intents = [
  { href: "/programlar", icon: GraduationCap, title: "Bir program öğrenmek", hint: "Excel, Word, PowerPoint · grup ya da birebir" },
  { href: "/analiz", icon: BarChart3, title: "Verimi analiz ettirmek", hint: "Bibliyometrik ve istatistiksel analiz" },
  { href: "/tez-duzenleme", icon: BookOpenCheck, title: "Tezimi teslime hazırlamak", hint: "Biçim, kaynakça, enstitü şablonu" },
  { href: "/kurumsal", icon: Building2, title: "Ekibime eğitim", hint: "Online, yerinde ya da karma" },
];

const services = [
  {
    href: "/analiz",
    eyebrow: "Analiz",
    title: "Bibliyometrik & istatistiksel analiz",
    points: ["Yöntem seçimi ve veri kontrolü", "SPSS, R, VOSviewer, Bibliometrix", "Yayına hazır tablo ve şekiller"],
  },
  {
    href: "/tez-duzenleme",
    eyebrow: "Tez",
    title: "Tez düzenleme",
    points: ["Enstitü şablonuna tam uyum", "APA, IEEE, Chicago kaynakça", "Otomatik içindekiler ve listeler"],
  },
  {
    href: "/kurumsal",
    eyebrow: "Kurumsal",
    title: "Ekibine özel eğitim",
    points: ["Seviye ölçümüyle başlayan program", "Kendi iş dosyalarınızla uygulama", "Kişi sayısına göre net fiyat"],
  },
];

export default async function HomePage() {
  const [hero, cohorts, programs, reviews, faq] = await Promise.all([
    getContent<HeroContent>("home", "hero", defaultHero),
    getCatalogCohorts(undefined, 4),
    getProgramSummaries(),
    getPublicReviews(undefined, 3),
    getContent<FaqContent>("faq", "items", defaultFaq),
  ]);

  return (
    <>
      {/* HERO: başlık + niyet seçimi | canlı dönemler */}
      <section className="relative border-b border-line bg-canvas">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-line)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
        />
        <Container className="relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14 lg:py-20">
          <div className="min-w-0">
            <Eyebrow>Analiz · Eğitim · Tez düzenleme</Eyebrow>
            <h1 className="mt-4 text-[38px] font-semibold leading-[1.02] tracking-[-0.04em] text-balance sm:text-6xl">
              <AccentTitle text={hero.title} />
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{hero.subtitle}</p>

            <div className="mt-9">
              <p className="text-sm font-semibold text-ink" id="niyet">
                Neye ihtiyacın var?
              </p>
              <ul aria-labelledby="niyet" className="mt-3 grid gap-2 sm:grid-cols-2">
                {intents.map((intent) => (
                  <li key={intent.href} className="min-w-0">
                    <Link
                      href={intent.href}
                      className="group flex min-h-[72px] items-center gap-3.5 rounded-2xl border border-line-strong bg-paper p-3.5 pr-4 transition-[border-color,box-shadow] hover:border-accent hover:shadow-[0_0_0_3px_rgb(79_70_229/0.12)]"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                        <intent.icon className="size-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold leading-snug text-ink">{intent.title}</span>
                        <span className="mt-0.5 block truncate text-[13px] text-ink-soft">{intent.hint}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ink-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <TrustStrip className="mt-9" />
          </div>

          <Card variant="inverse" padding="none" className="self-start overflow-hidden lg:mt-2">
            <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/60">Kayıt açık</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">Yaklaşan dönemler</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                <span className="size-1.5 rounded-full bg-[#86efac]" aria-hidden /> Canlı kontenjan
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
              <p className="text-xs text-white/60">Fiyatlar kişi başı, bilgi amaçlıdır.</p>
              <Link href="/programlar#donemler" className="inline-flex items-center gap-1 text-sm font-semibold text-accent-glow hover:text-white">
                Tüm dönemler <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Card>
        </Container>
      </section>

      {/* PROGRAMLAR */}
      {programs.length > 0 && (
        <Section aria-labelledby="programlar-baslik">
          <Container>
            <SectionIntro
              id="programlar-baslik"
              eyebrow="Programlar"
              title={
                <>
                  Ertesi gün işinde <Accent>kullanacağın</Accent> beceriler
                </>
              }
              description="Her programın müfredatı, dönem tarihleri ve fiyatı açık. Grup dönemine katıl, birebir çalış ya da ekibinle öğren."
              action={
                <Button asChild variant="outline">
                  <Link href="/programlar">
                    Tüm programlar <ArrowRight />
                  </Link>
                </Button>
              }
            />
            <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((summary) => (
                <li key={summary.program.id} className="min-w-0">
                  <ProgramCard summary={summary} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* NASIL İŞLER */}
      <Section className="border-y border-line bg-canvas" aria-labelledby="surec-baslik">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center">
            <div className="min-w-0">
              <SectionIntro
                id="surec-baslik"
                eyebrow="Nasıl işler"
                title={
                  <>
                    Her adım panelinde, <Accent>yazılı</Accent>
                  </>
                }
                description="Talebin, teklifin, mesajların ve dosyaların tek bir sayfada. Telefon trafiği yok, “ne oldu?” diye sormana gerek yok."
              />
              <Pipeline vertical className="mt-10" />
            </div>
            <figure className="min-w-0">
              <Card padding="none" className="overflow-hidden shadow-raise">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Talep</p>
                    <p className="truncate font-semibold">Tez düzenleme · 142 sayfa</p>
                  </div>
                  <Badge tone="amber" dot>
                    Teklif hazır
                  </Badge>
                </div>
                <div className="px-3 py-6 sm:px-5">
                  <StatusTrack steps={["Alındı", "Teklif", "Onay", "Devam", "Teslim"]} current={1} />
                </div>
                <dl className="grid grid-cols-2 gap-4 border-t border-line bg-surface/60 px-5 py-4 text-sm">
                  <div>
                    <dt className="text-xs text-ink-soft">Teklif</dt>
                    <dd className="tabular font-mono text-base text-ink">₺9.500</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft">Teslim</dt>
                    <dd className="tabular font-mono text-base text-ink">5 iş günü</dd>
                  </div>
                </dl>
              </Card>
              <figcaption className="mt-3 text-center text-xs text-ink-soft">Örnek: talebin panelinde böyle görünür.</figcaption>
            </figure>
          </div>
        </Container>
      </Section>

      {/* HİZMETLER */}
      <Section aria-labelledby="hizmetler-baslik">
        <Container>
          <SectionIntro
            id="hizmetler-baslik"
            eyebrow="Hizmetler"
            title={
              <>
                Akademik işin <Accent>zor</Accent> kısmını bize bırak
              </>
            }
            description="Kapsamı sen anlat, net teklifi biz yazalım. Onaylamadan hiçbir iş başlamaz."
          />
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <li key={service.href} className="min-w-0">
                <Link
                  href={service.href}
                  className="group flex h-full flex-col rounded-3xl border border-line bg-paper p-6 shadow-card transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raise"
                >
                  <div className="flex items-center justify-between">
                    <Eyebrow>{service.eyebrow}</Eyebrow>
                    <ArrowUpRight className="size-5 text-ink-muted transition-colors group-hover:text-accent" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{service.title}</h3>
                  <ul className="mt-5 flex flex-col gap-2.5 border-t border-line pt-5 text-sm text-ink-soft">
                    {service.points.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-6 text-sm font-semibold text-accent">Nasıl çalıştığını gör</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* YORUMLAR */}
      {reviews.length > 0 && (
        <Section className="border-t border-line bg-canvas" aria-labelledby="yorumlar-baslik">
          <Container>
            <SectionIntro
              id="yorumlar-baslik"
              eyebrow="Katılımcılar"
              title={
                <>
                  Programı bitirenler <Accent>anlatıyor</Accent>
                </>
              }
              description="Yalnızca dönemini tamamlamış katılımcıların yorumları yayınlanır."
            />
            <ReviewList reviews={reviews} className="mt-10" />
          </Container>
        </Section>
      )}

      {/* SSS */}
      <Section aria-labelledby="sss-baslik">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <SectionIntro
            id="sss-baslik"
            eyebrow="Sık sorulanlar"
            title="Aklına takılanlar"
            description="Ödeme, kayıt, bekleme listesi ve belge hakkında kısa yanıtlar."
            action={
              <Button asChild variant="link">
                <Link href="/sss">Tüm sorular</Link>
              </Button>
            }
            className="sm:flex-col sm:items-start lg:sticky lg:top-24 lg:self-start"
          />
          <FaqList items={faq.items.slice(0, 4)} />
        </Container>
      </Section>

      {/* KAPANIŞ */}
      <Container className="pb-16 sm:pb-24">
        <CtaBand
          eyebrow="Başlamak ücretsiz"
          title={
            <>
              Hesabını aç, ilk adımı <Accent>bugün</Accent> at
            </>
          }
          description="Kayıt olmak ücretsiz ve bir dakika sürer. Başvurularını, tekliflerini ve belgelerini tek panelden izlersin."
        >
          <Button asChild size="lg" variant="secondary">
            <Link href="/kayit">
              Ücretsiz kayıt ol <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/iletisim">Soru sor</Link>
          </Button>
        </CtaBand>
      </Container>
    </>
  );
}
