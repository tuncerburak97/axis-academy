// src/app/(public)/tez-duzenleme/page.tsx — tez düzenleme hizmeti: kapsam, süreç, teslim edilenler, SSS → /teklif/tez
import type { Metadata } from "next";
import { BookMarked, FileCheck2, Images, ListOrdered, Ruler, Quote } from "lucide-react";
import { getContent } from "@/lib/queries/content";
import { defaultThesisIntro, type ServiceIntroContent } from "@/lib/types/content";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/page-header";
import { ServiceLanding } from "@/components/public/service-landing";

export const metadata: Metadata = {
  title: "Tez Düzenleme",
  description: "Tezini enstitü yazım kılavuzuna uygun, teslime hazır hâle getiriyoruz: biçim, kaynakça, içindekiler, tablo ve şekil listeleri.",
  alternates: { canonical: "/tez-duzenleme" },
};

const offers = [
  { icon: Ruler, title: "Sayfa düzeni ve biçim", description: "Kenar boşlukları, yazı tipi, satır aralığı ve sayfa numaraları kılavuza birebir uyar." },
  { icon: ListOrdered, title: "Otomatik içindekiler", description: "Başlık stilleri kurulur; içindekiler, tablo ve şekil listeleri tek tıkla güncellenir." },
  { icon: Quote, title: "Kaynakça ve atıflar", description: "APA, IEEE, Chicago, Vancouver ya da enstitünün stili; metin içi atıflarla eşleşme kontrolü." },
  { icon: Images, title: "Tablo ve şekiller", description: "Numaralandırma, başlık konumu ve çapraz başvurular düzenlenir." },
  { icon: BookMarked, title: "Enstitü şablonu", description: "Kapak, onay sayfası, özet/abstract ve ön sayfalar şablona taşınır." },
  { icon: FileCheck2, title: "Son kontrol", description: "Teslim öncesi kılavuz maddelerine göre tek tek kontrol listesi." },
];

const deliverables = [
  "Düzenlenmiş Word dosyası (stiller kurulu, kendin de güncelleyebilirsin)",
  "PDF çıktısı",
  "Kılavuza uyum kontrol listesi",
  "Kaynakça–atıf eşleşme raporu",
  "Enstitü geri bildirimine göre düzeltme",
];

const faq = [
  { question: "Tezimin içeriğine dokunuyor musunuz?", answer: "Hayır. Yalnızca biçim, düzen ve kaynakça üzerinde çalışırız; bilimsel içerik ve ifadeler sana aittir." },
  { question: "Fiyat neye göre belirleniyor?", answer: "Sayfa sayısı, kaynakça büyüklüğü ve tablo/şekil yoğunluğuna göre. Formda bunları belirtirsen teklif daha hızlı ve net olur." },
  { question: "Ne kadar sürede teslim ediyorsunuz?", answer: "Süre sayfa sayısına ve kapsamına göre değişir. Teslim tarihini formda yazarsan teklifi o takvime göre hazırlarız." },
  { question: "Enstitü düzeltme isterse ne oluyor?", answer: "Geri bildirimi talep sayfana mesaj olarak yazman yeterli. Düzeltmelerin kapsamı teklifte yazılı olarak belirtilir." },
  { question: "Ödemeyi nasıl yapıyorum?", answer: "Sitede ödeme alınmaz. Teklifi onayladıktan sonra ödeme ayrıntılarını ekibimizle konuşursun." },
];

export default async function ThesisPage() {
  const intro = await getContent<ServiceIntroContent>("thesis", "intro", defaultThesisIntro);
  return (
    <ServiceLanding
      path="/tez-duzenleme"
      eyebrow="Tez düzenleme"
      intro={intro}
      ctaHref="/teklif/tez"
      ctaLabel="Tez teklifi al"
      offers={offers}
      deliverables={deliverables}
      deliverablesNote="Teslim dosyaların panelindeki Belgelerim bölümünde durur."
      faq={faq}
      aside={
        <Card padding="lg" className="shadow-raise">
          <Eyebrow>Teklif için gerekenler</Eyebrow>
          <dl className="mt-4 divide-y divide-line text-sm">
            {[
              ["Derece", "Yüksek lisans / doktora"],
              ["Enstitü", "Kılavuz buna göre seçilir"],
              ["Sayfa sayısı", "Yaklaşık değer yeterli"],
              ["Kaynakça stili", "APA 7, IEEE, Chicago…"],
              ["Teslim tarihi", "Enstitü son günü"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="font-semibold text-ink">{label}</dt>
                <dd className="text-right text-ink-soft">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-line pt-4 text-sm text-ink-soft">
            Tez dosyanı ve enstitü kılavuzunu ekleyebilirsin (en fazla <span className="tabular font-mono">20 MB</span>).
          </p>
        </Card>
      }
    />
  );
}
