// src/app/(public)/kurumsal/page.tsx — kurumsal eğitim: kapsam, kişi sayısına göre fiyatlar, süreç, SSS → /teklif/kurumsal
import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, FolderKanban, Gauge, MonitorSmartphone, Presentation, UsersRound } from "lucide-react";
import { getContent } from "@/lib/queries/content";
import { getGroupPricing } from "@/lib/queries/public-catalog";
import { defaultCorporateIntro, type ServiceIntroContent } from "@/lib/types/content";
import { Card } from "@/components/ui/card";
import { Price } from "@/components/ui/data";
import { Eyebrow } from "@/components/ui/page-header";
import { Container, Section, SectionIntro } from "@/components/public/section";
import { ServiceLanding } from "@/components/public/service-landing";
import { TrainingComposite } from "@/components/public/showcase-art";
import { CategoryMark } from "@/components/public/program-card";
import type { PipelineStep } from "@/components/public/blocks";

export const metadata: Metadata = {
  title: "Kurumsal Eğitim",
  description: "Ekibine özel Excel, Word ve PowerPoint eğitimi: seviye ölçümü, kendi iş dosyalarınızla uygulama, online, yerinde ya da karma format.",
  alternates: { canonical: "/kurumsal" },
};

const offers = [
  { icon: Gauge, title: "Seviye ölçümü", description: "Program, ekibin gerçek seviyesine göre kurulur; herkes aynı yerden başlamak zorunda kalmaz." },
  { icon: FolderKanban, title: "Kendi dosyalarınızla", description: "Uygulamalar şirketinizin raporları, şablonları ve sunumları üzerinden yapılır." },
  { icon: MonitorSmartphone, title: "Online, yerinde ya da karma", description: "Ofisinizde, canlı online derslerde ya da ikisini birleştiren bir planla." },
  { icon: UsersRound, title: "Küçük gruplar", description: "Kalabalık sınıf yerine ekip büyüklüğüne göre bölünmüş gruplar." },
  { icon: Presentation, title: "Kurumsal şablonlar", description: "Marka uyumlu Word ve PowerPoint şablonları eğitimin parçası olarak kurulabilir." },
  { icon: ClipboardCheck, title: "Katılım belgesi", description: "Programı tamamlayan herkes doğrulama kodlu katılım belgesi alır." },
];

const steps: PipelineStep[] = [
  { label: "Alındı", title: "İhtiyacı anlat", description: "Ekip büyüklüğü, programlar ve format. Talebin panelinde hemen görünür." },
  { label: "Teklif", title: "Programı ve fiyatı gör", description: "Kapsam, takvim önerisi ve kişi başı tutar panelinde yazılı olarak sunulur." },
  { label: "Onay", title: "Takvimi netleştir", description: "Teklifi onaylarsın; ders tarihleri birlikte planlanır." },
  { label: "Devam", title: "Eğitim başlar", description: "Oturumlar, materyaller ve duyurular panelden takip edilir." },
  { label: "Teslim", title: "Belgeler ve rapor", description: "Katılım belgeleri ve istenirse ekip gelişim özeti." },
];

const deliverables = [
  "Ekibe göre uyarlanmış ders planı",
  "Ders materyalleri ve uygulama dosyaları",
  "Kurumsal şablonlar (isteğe bağlı)",
  "Doğrulama kodlu katılım belgeleri",
  "Eğitim sonrası soru-cevap için mesajlaşma",
];

const faq = [
  { question: "En az kaç kişiyle eğitim düzenleniyor?", answer: "Kişi sayısına göre fiyat aralıkları aşağıdaki tabloda. Daha küçük ekipler için birebir ya da grup dönemlerine katılım da bir seçenek." },
  { question: "Eğitim nerede yapılıyor?", answer: "Online, ofisinizde ya da karma. Formda tercihini belirtmen yeterli." },
  { question: "Fiyata neler dahil?", answer: "Teklifte nelerin dahil olduğu kalem kalem yazılır; onaylamadan hiçbir şey kesinleşmez." },
  { question: "Fatura kesiliyor mu?", answer: "Ödeme ve fatura ayrıntıları teklif onayından sonra ekibimizle doğrudan konuşulur; sitede ödeme alınmaz." },
];

export default async function CorporatePage() {
  const [intro, pricing] = await Promise.all([
    getContent<ServiceIntroContent>("corporate", "intro", defaultCorporateIntro),
    getGroupPricing(),
  ]);
  const lowest = pricing.flatMap((entry) => entry.tiers.map((tier) => tier.price));

  return (
    <ServiceLanding
      path="/kurumsal"
      eyebrow="Kurumsal"
      intro={intro}
      ctaHref="/teklif/kurumsal"
      ctaLabel="Kurumsal teklif al"
      offers={offers}
      steps={steps}
      deliverables={deliverables}
      faq={faq}
      visual={<TrainingComposite />}
      aside={
        <Card padding="lg" className="shadow-raise">
          <Eyebrow>Kişi başı fiyatlar</Eyebrow>
          {lowest.length > 0 ? (
            <>
              <p className="mt-3">
                <Price amount={Math.min(...lowest)} from className="text-3xl" />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Ekip büyüdükçe kişi başı ücret düşer. Programlara göre ayrıntılı tablo aşağıda.
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Fiyat, ekip büyüklüğü ve formata göre teklifle belirlenir.</p>
          )}
          <a href="#fiyatlar" className="mt-5 inline-flex text-sm font-semibold text-accent hover:underline">
            Fiyat tablosunu gör
          </a>
        </Card>
      }
    >
      {pricing.length > 0 && (
        <Section id="fiyatlar" className="scroll-mt-16 border-t border-line" aria-labelledby="fiyat-baslik">
          <Container>
            <SectionIntro
              id="fiyat-baslik"
              eyebrow="Fiyatlar"
              title="Kişi sayısına göre"
              description="Kişi başı, bilgi amaçlı fiyatlar. Kesin tutar program kapsamına ve formata göre teklifte yazılır."
            />
            <ul className="mt-8 grid gap-4 lg:grid-cols-3">
              {pricing.map((entry) => (
                <li key={entry.slug} className="min-w-0">
                  <Card padding="none" className="h-full overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                      <CategoryMark category={entry.category} className="size-9" />
                      <Link href={`/programlar/${entry.slug}`} className="min-w-0 font-semibold leading-snug hover:text-accent">
                        {entry.title}
                      </Link>
                    </div>
                    <table className="w-full text-sm">
                      <caption className="sr-only">{entry.title} kişi başı grup fiyatları</caption>
                      <tbody className="divide-y divide-line">
                        {entry.tiers.map((tier) => (
                          <tr key={tier.id}>
                            <th scope="row" className="tabular px-5 py-3 text-left font-mono font-normal text-ink-soft">
                              {tier.min_people}–{tier.max_people} kişi
                            </th>
                            <td className="px-5 py-3 text-right">
                              <Price amount={tier.price} unit="kişi" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </ServiceLanding>
  );
}
