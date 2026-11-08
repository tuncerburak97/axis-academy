// src/components/public/service-landing.tsx — hizmet sayfası şablonu (analiz, tez düzenleme, kurumsal)
// Giriş + ne alırsın + süreç hattı + teslim edilenler + SSS + sihirbaza çağrı
import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/page-header";
import { AccentTitle, Container, Section, SectionIntro } from "@/components/public/section";
import { Checklist, CtaBand, FaqList, JsonLd, Pipeline, type PipelineStep } from "@/components/public/blocks";
import { organizationJsonLd, siteUrl } from "@/lib/queries/public-seo";
import type { FaqItem, ServiceIntroContent } from "@/lib/types/content";

export interface ServiceOffer {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
}

export function ServiceLanding({
  path,
  eyebrow,
  intro,
  ctaHref,
  ctaLabel,
  offers,
  deliverables,
  deliverablesNote,
  steps,
  faq,
  aside,
  children,
}: {
  path: string;
  eyebrow: string;
  intro: ServiceIntroContent;
  ctaHref: string;
  ctaLabel: string;
  offers: ServiceOffer[];
  deliverables: string[];
  deliverablesNote?: string;
  steps?: PipelineStep[];
  faq: FaqItem[];
  /** Giriş bölümünün sağ sütunu (ör. "teklif için gerekenler" kartı) */
  aside: React.ReactNode;
  /** Süreçten sonra eklenecek sayfaya özel bölümler */
  children?: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: intro.title,
          description: intro.description,
          url: siteUrl(path),
          provider: organizationJsonLd,
          areaServed: "TR",
        }}
      />
      <section className="border-b border-line bg-canvas">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14 lg:py-20">
          <div className="min-w-0">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.03] tracking-[-0.04em] text-balance sm:text-[56px]">
              <AccentTitle text={intro.title} />
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{intro.description}</p>
            {intro.body && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">{intro.body}</p>}
            <div className="mt-8 flex flex-wrap gap-2">
              <Button asChild size="lg">
                <Link href={ctaHref}>
                  {ctaLabel} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <a href="#surec">Süreç nasıl işler?</a>
              </Button>
            </div>
          </div>
          <div className="min-w-0">{aside}</div>
        </Container>
      </section>

      <Section aria-labelledby="neler-baslik">
        <Container>
          <SectionIntro id="neler-baslik" eyebrow="Kapsam" title="Neler yapıyoruz?" />
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <li key={offer.title} className="flex flex-col bg-paper p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <offer.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{offer.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{offer.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="surec" className="scroll-mt-16 border-y border-line bg-canvas" aria-labelledby="surec-baslik">
        <Container>
          <SectionIntro
            id="surec-baslik"
            eyebrow="Süreç"
            title="Beş adım, hepsi panelinde"
            description="Talebin hangi adımdaysa panelindeki durum hattında görürsün. Onaylamadığın hiçbir iş başlamaz."
          />
          <Pipeline steps={steps} className="mt-10" />
        </Container>
      </Section>

      <Section aria-labelledby="teslim-baslik">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <SectionIntro
            id="teslim-baslik"
            eyebrow="Teslim"
            title="Elinde ne olacak?"
            description={deliverablesNote}
            className="sm:flex-col sm:items-start"
          />
          <Card padding="lg">
            <Checklist items={deliverables} />
          </Card>
        </Container>
      </Section>

      {children}

      <Section className="border-t border-line bg-canvas" aria-labelledby="sss-baslik">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <SectionIntro
            id="sss-baslik"
            eyebrow="Sık sorulanlar"
            title="Merak edilenler"
            action={
              <Button asChild variant="link">
                <Link href="/sss">Tüm sorular</Link>
              </Button>
            }
            className="sm:flex-col sm:items-start"
          />
          <FaqList items={faq} />
        </Container>
      </Section>

      <Container className="py-16 sm:py-24">
        <CtaBand
          eyebrow="Teklif ücretsiz"
          title="İki dakikada anlat, net teklifini panelinde gör"
          description="Formu doldurmak için hesap gerekmez; göndermeden önce giriş yapman yeterli. Taslağın kaybolmaz."
        >
          <Button asChild size="lg" variant="secondary">
            <Link href={ctaHref}>
              {ctaLabel} <ArrowRight />
            </Link>
          </Button>
        </CtaBand>
      </Container>
    </>
  );
}
