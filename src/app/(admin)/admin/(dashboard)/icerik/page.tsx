// src/app/(admin)/admin/(dashboard)/icerik/page.tsx — kritik public metinlerin yönetimi
import type { Metadata } from "next";
import { getContent } from "@/lib/queries/content";
import {
  defaultAnalysisIntro,
  defaultEducationIntro,
  defaultFaq,
  defaultHero,
  defaultThesisIntro,
} from "@/lib/types/content";
import type { FaqContent, HeroContent, ServiceIntroContent, EducationIntroContent } from "@/lib/types/content";
import {
  updateEducationIntro,
  updateFaq,
  updateHero,
  updateServiceIntro,
} from "@/lib/actions/admin-content";
import { StatusBanner, SubmitButton, TextArea, TextInput } from "@/components/admin/fields";

export const metadata: Metadata = { title: "İçerik Yönetimi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ContentManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;

  const [hero, analysisIntro, thesisIntro, educationIntro, faq] = await Promise.all([
    getContent<HeroContent>("home", "hero", defaultHero),
    getContent<ServiceIntroContent>("analysis", "intro", defaultAnalysisIntro),
    getContent<ServiceIntroContent>("thesis", "intro", defaultThesisIntro),
    getContent<EducationIntroContent>("education", "intro", defaultEducationIntro),
    getContent<FaqContent>("faq", "items", defaultFaq),
  ]);

  const faqText = faq.items.map((item) => `${item.question}::${item.answer}`).join("\n");

  return (
    <>
      <h1 className="font-display text-2xl font-bold tracking-tight">İçerik Yönetimi</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Kaydettiğin metinler public sayfalara anında yansır.
      </p>

      <div className="mt-6">
        <StatusBanner saved={saved} error={error} />
      </div>

      <div className="max-w-2xl space-y-6">
        <section aria-labelledby="hero-heading" className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 id="hero-heading" className="font-display text-lg font-semibold">Anasayfa Hero</h2>
          <form action={updateHero} className="mt-4 space-y-4">
            <TextInput label="Başlık" name="title" defaultValue={hero.title} required />
            <TextArea label="Alt metin" name="subtitle" defaultValue={hero.subtitle} rows={3} />
            <SubmitButton>Kaydet</SubmitButton>
          </form>
        </section>

        <ServiceIntroSection
          heading="Analiz Sayfası"
          pageKey="analysis"
          content={analysisIntro}
        />
        <ServiceIntroSection
          heading="Tez Düzenleme Sayfası"
          pageKey="thesis"
          content={thesisIntro}
        />

        <section aria-labelledby="education-heading" className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 id="education-heading" className="font-display text-lg font-semibold">Eğitim Sayfası Girişi</h2>
          <form action={updateEducationIntro} className="mt-4 space-y-4">
            <TextInput label="Başlık" name="title" defaultValue={educationIntro.title} required />
            <TextArea label="Açıklama" name="description" defaultValue={educationIntro.description} rows={2} />
            <SubmitButton>Kaydet</SubmitButton>
          </form>
        </section>

        <section aria-labelledby="faq-heading" className="rounded-xl border border-line bg-white p-6 shadow-sm">
          <h2 id="faq-heading" className="font-display text-lg font-semibold">SSS Maddeleri</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Her satıra bir madde, biçim: <code className="rounded bg-surface px-1 py-0.5">Soru::Cevap</code>
          </p>
          <form action={updateFaq} className="mt-4 space-y-4">
            <TextArea label="Maddeler" name="items" defaultValue={faqText} rows={8} />
            <SubmitButton>Kaydet</SubmitButton>
          </form>
        </section>
      </div>
    </>
  );
}

function ServiceIntroSection({
  heading,
  pageKey,
  content,
}: {
  heading: string;
  pageKey: "analysis" | "thesis";
  content: ServiceIntroContent;
}) {
  return (
    <section aria-labelledby={`${pageKey}-heading`} className="rounded-xl border border-line bg-white p-6 shadow-sm">
      <h2 id={`${pageKey}-heading`} className="font-display text-lg font-semibold">{heading}</h2>
      <form action={updateServiceIntro} className="mt-4 space-y-4">
        <input type="hidden" name="page_key" value={pageKey} />
        <TextInput label="Başlık" name="title" defaultValue={content.title} required />
        <TextArea label="Kısa açıklama (sayfa girişi)" name="description" defaultValue={content.description} rows={2} />
        <TextArea label="Gövde metni" name="body" defaultValue={content.body} rows={4} />
        <SubmitButton>Kaydet</SubmitButton>
      </form>
    </section>
  );
}
