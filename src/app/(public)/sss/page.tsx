// src/app/(public)/sss/page.tsx — sıkça sorulan sorular (maddeler site_content'ten)
import type { Metadata } from "next";
import { PageIntro } from "@/components/public/page-intro";
import { getContent } from "@/lib/queries/content";
import { defaultFaq, type FaqContent } from "@/lib/types/content";

export const metadata: Metadata = { title: "SSS" };

export default async function FaqPage() {
  const faq = await getContent<FaqContent>("faq", "items", defaultFaq);

  return (
    <>
      <PageIntro eyebrow="Destek" title="Sıkça Sorulan Sorular" description="Merak edilenlerin net yanıtları." />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <dl className="space-y-4">
          {faq.items.map((item) => (
            <div key={item.question} className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <dt className="font-display font-semibold">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
