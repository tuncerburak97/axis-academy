// src/app/(public)/page.tsx — anasayfa vitrini
// Akış: büyük başlık + canlı vitrin → niyet çubuğu → araçlar → programlar → koyu "çıktılar" → panel → rakamlar/yorumlar → SSS → koyu kapanış
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getContent } from "@/lib/queries/content";
import { getCatalogCohorts, getProgramSummaries, getPublicReviews } from "@/lib/queries/public-catalog";
import { defaultFaq, defaultHero, type FaqContent, type HeroContent } from "@/lib/types/content";
import { Button } from "@/components/ui/button";
import { Accent } from "@/components/ui/page-header";
import { AccentTitle, Container, Section, SectionIntro } from "@/components/public/section";
import { ProgramCard } from "@/components/public/program-card";
import { FaqList, Pipeline } from "@/components/public/blocks";
import {
  DarkCta,
  DeliverablesSection,
  GhostDarkButton,
  HeroShowcase,
  IntentDock,
  LightButton,
  LivePill,
  ProductShot,
  ProofSection,
  ToolMarquee,
} from "@/components/public/home-sections";

export default async function HomePage() {
  const [hero, cohorts, programs, reviews, faq] = await Promise.all([
    getContent<HeroContent>("home", "hero", defaultHero),
    getCatalogCohorts(undefined, 4),
    getProgramSummaries(),
    getPublicReviews(undefined, 9),
    getContent<FaqContent>("faq", "items", defaultFaq),
  ]);
  const next = cohorts.find((cohort) => cohort.status === "open") ?? cohorts[0];
  // Öne çıkan yorum: en yüksek puanlı, sonra en dolu yorum
  const featuredReviews = [...reviews].sort((a, b) => b.rating - a.rating || b.comment.length - a.comment.length).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-canvas pb-24 pt-12 sm:pb-28 sm:pt-16 lg:pt-20">
        <div aria-hidden className="bg-grid-light absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <Container className="text-center">
          {next && <LivePill cohort={next} />}
          <h1 className="mx-auto mt-7 max-w-4xl text-[40px] font-semibold leading-[1] tracking-[-0.045em] text-balance sm:text-6xl lg:text-[76px]">
            <AccentTitle text={hero.title} />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-soft text-pretty sm:text-lg">{hero.subtitle}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/programlar">
                Programları keşfet <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-paper">
              <Link href="#hizmetler">Analiz ya da tez teklifi al</Link>
            </Button>
          </div>
          <p className="mt-6 text-[13px] text-ink-soft">
            <span className="tabular font-mono font-medium text-ink">15+</span> yıl deneyim
            <span className="mx-2.5 text-line-strong" aria-hidden>/</span>
            <span className="tabular font-mono font-medium text-ink">10.000+</span> katılımcı
            <span className="mx-2.5 text-line-strong" aria-hidden>/</span>
            <span className="tabular font-mono font-medium text-ink">150+</span> kurum
          </p>
        </Container>
        <Container>
          <HeroShowcase cohorts={cohorts} />
        </Container>
      </section>

      {/* NİYET ÇUBUĞU: hero'nun altına biner */}
      <IntentDock className="-mt-12" />

      <ToolMarquee />

      {/* PROGRAMLAR */}
      {programs.length > 0 && (
        <Section aria-labelledby="programlar-baslik" className="pt-6 sm:pt-10">
          <Container>
            <SectionIntro
              id="programlar-baslik"
              eyebrow="Programlar"
              title={
                <>
                  Ertesi gün işinde <Accent>kullanacağın</Accent> beceriler
                </>
              }
              description="Müfredat, dönem tarihleri ve fiyat açık. Grup dönemine katıl, birebir çalış ya da ekibinle öğren."
              action={
                <Button asChild variant="outline">
                  <Link href="/programlar">
                    Tüm programlar <ArrowRight />
                  </Link>
                </Button>
              }
            />
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {programs.map((summary) => (
                <li key={summary.program.id} className="reveal min-w-0">
                  <ProgramCard summary={summary} />
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {/* ÇIKTILAR (koyu vitrin) */}
      <DeliverablesSection />

      {/* NASIL İŞLER: panel */}
      <Section aria-labelledby="surec-baslik" className="overflow-x-clip">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="min-w-0">
              <SectionIntro
                id="surec-baslik"
                eyebrow="Nasıl işler"
                title={
                  <>
                    Her adım panelinde, <Accent>yazılı</Accent>
                  </>
                }
                description="Talebin, teklifin, mesajların ve dosyaların tek sayfada. Telefon trafiği yok, “ne oldu?” diye sormana gerek yok."
              />
              <Pipeline vertical className="mt-10" />
            </div>
            <ProductShot className="reveal" />
          </div>
        </Container>
      </Section>

      {/* RAKAMLAR + YORUMLAR */}
      <div className="border-t border-line bg-canvas">
        <ProofSection reviews={featuredReviews} />
      </div>

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
          <FaqList items={faq.items.slice(0, 5)} />
        </Container>
      </Section>

      {/* KAPANIŞ */}
      <DarkCta
        title={
          <>
            İlk adımı <span className="accent-word text-[1.06em] text-accent-glow">bugün</span> at
          </>
        }
        description="Hesap açmak ücretsiz ve bir dakika sürer. Başvurularını, tekliflerini ve belgelerini tek panelden izlersin."
      >
        <LightButton href="/kayit">
          Ücretsiz kayıt ol <ArrowRight className="size-4" aria-hidden />
        </LightButton>
        <GhostDarkButton href="/iletisim">Bize soru sor</GhostDarkButton>
      </DarkCta>
    </>
  );
}
