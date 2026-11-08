// src/app/(public)/sss/page.tsx — sıkça sorulan sorular (maddeler site_content'ten, akordeon) + FAQPage yapısal verisi
import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/queries/content";
import { defaultFaq, type FaqContent } from "@/lib/types/content";
import { Button } from "@/components/ui/button";
import { Container, PageHero, Section } from "@/components/public/section";
import { FaqList, JsonLd } from "@/components/public/blocks";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Ödeme, dönem kaydı, bekleme listesi, analiz ve tez talepleri, katılım belgesi hakkında kısa yanıtlar.",
  alternates: { canonical: "/sss" },
};

export default async function FaqPage() {
  const faq = await getContent<FaqContent>("faq", "items", defaultFaq);
  const items = Array.isArray(faq.items) ? faq.items : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
      <PageHero eyebrow="Destek" title="Sıkça sorulan sorular" description="Merak edilenlerin kısa ve net yanıtları. Burada yoksa bize yaz." />
      <Section className="pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <FaqList items={items} />
          <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-ink">Sorunun yanıtını bulamadın mı?</p>
            <Button asChild variant="secondary">
              <Link href="/iletisim">Bize sor</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
