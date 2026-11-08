// src/app/(public)/analiz/page.tsx — analiz hizmeti: kapsam, süreç, teslim edilenler, SSS → /teklif/analiz
import type { Metadata } from "next";
import { BarChart3, FileSpreadsheet, LineChart, Microscope, Network, Table2 } from "lucide-react";
import { getContent } from "@/lib/queries/content";
import { defaultAnalysisIntro, type ServiceIntroContent } from "@/lib/types/content";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/page-header";
import { ServiceLanding } from "@/components/public/service-landing";

export const metadata: Metadata = {
  title: "Bibliyometrik ve İstatistiksel Analiz",
  description: "Bibliyometrik ve istatistiksel analiz: yöntem seçimi, analiz ve yayına hazır raporlama. Teklifini panelinde gör, süreci adım adım izle.",
  alternates: { canonical: "/analiz" },
};

const offers = [
  { icon: Microscope, title: "Bibliyometrik analiz", description: "Scopus ve Web of Science verisiyle yayın eğilimleri, etkili yazar ve kaynaklar, tema evrimi." },
  { icon: Network, title: "Ağ ve harita görselleri", description: "Ortak yazarlık, ortak atıf ve anahtar kelime ağları; VOSviewer ve Bibliometrix çıktıları." },
  { icon: LineChart, title: "İstatistiksel analiz", description: "Hipotez testleri, regresyon, faktör analizi, güvenilirlik; doğru testi birlikte seçeriz." },
  { icon: FileSpreadsheet, title: "Veri hazırlığı", description: "Eksik veri, ters kodlama ve değişken dönüşümleri; analiz öncesi veri setinin temizliği." },
  { icon: Table2, title: "Yayına hazır tablolar", description: "APA biçiminde tablo ve şekiller, bulguların akademik dille yazılmış yorumları." },
  { icon: BarChart3, title: "Yöntem danışmanlığı", description: "Örneklem, ölçek ve analiz planı; danışmanına sunabileceğin gerekçeleriyle." },
];

const deliverables = [
  "Analiz çıktıları (SPSS/R dosyaları ya da VOSviewer haritaları)",
  "APA biçiminde tablo ve şekiller",
  "Bulgular bölümü için yorum metni",
  "Kullanılan yöntemlerin kısa gerekçesi",
  "Teslim sonrası sorular için mesajlaşma",
];

const faq = [
  { question: "Teklif ne kadar sürede gelir?", answer: "Kapsam netse teklif doğrudan panelinde görünür ve e-posta ile haber veririz. Eksik bilgi varsa talep sayfandan mesajla sorarız." },
  { question: "Verim güvende mi?", answer: "Dosyaların herkese kapalı bir depoda durur; yalnızca sen ve ekibimiz erişebilir." },
  { question: "Hangi programları kullanıyorsunuz?", answer: "İstatistikte SPSS ve R gibi yaygın programlar, bibliyometride VOSviewer ve Bibliometrix gibi araçlar. Tercih ettiğin bir program varsa formda belirt." },
  { question: "Revizyon hakkım var mı?", answer: "Revizyon kapsamı teklifte yazılı olarak belirtilir. Danışmanından gelen geri bildirimi talep sayfana mesaj olarak yazman yeterli." },
  { question: "Ödemeyi nasıl yapıyorum?", answer: "Sitede ödeme alınmaz. Teklifi onayladıktan sonra ödeme ayrıntılarını ekibimizle konuşursun." },
];

export default async function AnalysisPage() {
  const intro = await getContent<ServiceIntroContent>("analysis", "intro", defaultAnalysisIntro);
  return (
    <ServiceLanding
      path="/analiz"
      eyebrow="Analiz"
      intro={intro}
      ctaHref="/teklif/analiz"
      ctaLabel="Analiz teklifi al"
      offers={offers}
      deliverables={deliverables}
      deliverablesNote="Teslim dosyaların panelindeki Belgelerim bölümünde durur; istediğin zaman indirirsin."
      faq={faq}
      aside={
        <Card padding="lg" className="shadow-raise">
          <Eyebrow>Teklif için hazırla</Eyebrow>
          <ol className="mt-4 flex flex-col gap-4">
            {[
              ["Analiz türü", "Bibliyometrik, istatistiksel ya da ikisi"],
              ["Veri kaynağı", "Scopus/WoS sorgusu ya da veri setin"],
              ["Konu ve alan", "Birkaç kelime yeterli"],
              ["Teslim tarihi", "Danışman ya da dergi takvimin"],
            ].map(([title, hint], index) => (
              <li key={title} className="flex gap-3">
                <span className="tabular w-6 shrink-0 pt-0.5 font-mono text-sm text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-sm text-ink-soft">{hint}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5 border-t border-line pt-4 text-sm text-ink-soft">
            Dosya eklemek isteğe bağlı, en fazla <span className="tabular font-mono">20 MB</span>.
          </p>
        </Card>
      }
    />
  );
}
