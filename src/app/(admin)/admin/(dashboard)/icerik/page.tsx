// src/app/(admin)/admin/(dashboard)/icerik/page.tsx — site içeriği: anasayfa, hizmet sayfaları, katalog girişi ve SSS
import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { PageHeader, SectionHeading } from "@/components/ui/page-header";
import { formatRelative } from "@/lib/format";
import {
  defaultAnalysisIntro,
  defaultCorporateIntro,
  defaultEducationIntro,
  defaultFaq,
  defaultHero,
  defaultThesisIntro,
} from "@/lib/types/content";
import { getSiteContentMap } from "@/lib/queries/admin-content";
import { saveContentSection } from "@/lib/actions/admin-content";
import { ActionForm, Hidden, SubmitButton } from "@/components/admin/action-form";
import { FaqEditor } from "@/components/admin/content/faq-editor";

export const metadata: Metadata = { title: "Site içeriği" };

type FieldDef = { name: string; label: string; rows?: number; max: number };

const SECTIONS: { key: string; title: string; path: string; defaults: Record<string, string>; fields: FieldDef[] }[] = [
  {
    key: "home/hero",
    title: "Anasayfa girişi",
    path: "/",
    defaults: { ...defaultHero },
    fields: [
      { name: "title", label: "Başlık", max: 200 },
      { name: "subtitle", label: "Alt başlık", rows: 3, max: 500 },
    ],
  },
  {
    key: "education/intro",
    title: "Program kataloğu girişi",
    path: "/programlar",
    defaults: { ...defaultEducationIntro },
    fields: [
      { name: "title", label: "Başlık", max: 150 },
      { name: "description", label: "Açıklama", rows: 2, max: 500 },
    ],
  },
  ...(
    [
      ["analysis/intro", "Analiz sayfası", "/analiz", defaultAnalysisIntro],
      ["thesis/intro", "Tez düzenleme sayfası", "/tez-duzenleme", defaultThesisIntro],
      ["corporate/intro", "Kurumsal sayfası", "/kurumsal", defaultCorporateIntro],
    ] as const
  ).map(([key, title, path, defaults]) => ({
    key,
    title,
    path,
    defaults: { ...defaults } as Record<string, string>,
    fields: [
      { name: "title", label: "Başlık", max: 150 },
      { name: "description", label: "Kısa açıklama", rows: 2, max: 500 },
      { name: "body", label: "Metin", rows: 4, max: 2000 },
    ],
  })),
];

export default async function ContentPage() {
  const content = await getSiteContentMap();
  const faq = content["faq/items"]?.content.items;
  const faqItems = Array.isArray(faq)
    ? faq.map((item) => ({ question: String(item?.question ?? ""), answer: String(item?.answer ?? "") }))
    : defaultFaq.items;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Site içeriği" description="Public sayfalardaki giriş metinleri ve sık sorulan sorular. Kaydedince ilgili sayfa hemen güncellenir." />
      <div className="grid gap-6 xl:grid-cols-2">
        {SECTIONS.map((section) => {
          const saved = content[section.key];
          const values = { ...section.defaults, ...(saved?.content as Record<string, string> | undefined) };
          return (
            <Card key={section.key}>
              <SectionHeading
                as="h3"
                title={section.title}
                description={saved ? `Son değişiklik ${formatRelative(saved.updated_at)}` : "Varsayılan metin kullanılıyor"}
                action={
                  <Button asChild variant="ghost" size="icon-sm" aria-label={`${section.title} sayfasını aç`}>
                    <a href={section.path} target="_blank" rel="noreferrer">
                      <ExternalLink />
                    </a>
                  </Button>
                }
              />
              <ActionForm action={saveContentSection} className="mt-4 flex flex-col gap-4">
                <Hidden name="section" value={section.key} />
                {section.fields.map((field) => (
                  <Field key={field.name} id={`${section.key}-${field.name}`} label={field.label}>
                    {field.rows ? (
                      <Textarea name={field.name} rows={field.rows} maxLength={field.max} required defaultValue={values[field.name] ?? ""} />
                    ) : (
                      <Input name={field.name} maxLength={field.max} required defaultValue={values[field.name] ?? ""} />
                    )}
                  </Field>
                ))}
                <div className="flex justify-end">
                  <SubmitButton variant="outline" size="sm">
                    Kaydet
                  </SubmitButton>
                </div>
              </ActionForm>
            </Card>
          );
        })}
      </div>
      <Card>
        <SectionHeading
          as="h3"
          title="Sık sorulan sorular"
          description="Sıralamayı oklarla değiştir. Anasayfada ve SSS sayfasında görünür."
          action={
            <Button asChild variant="ghost" size="icon-sm" aria-label="SSS sayfasını aç">
              <a href="/sss" target="_blank" rel="noreferrer">
                <ExternalLink />
              </a>
            </Button>
          }
        />
        <div className="mt-4">
          <FaqEditor initial={faqItems} />
        </div>
      </Card>
    </div>
  );
}
