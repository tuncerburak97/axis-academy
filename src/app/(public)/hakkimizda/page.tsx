// src/app/(public)/hakkimizda/page.tsx — hakkımızda: hikâye, kadro yapısı, çalışma ilkeleri (stok görsel yok, tipografi odaklı)
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Building2, GraduationCap, HeartHandshake, LineChart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accent } from "@/components/ui/page-header";
import { Container, PageHero, Section, SectionIntro } from "@/components/public/section";
import { CtaBand, TrustStrip } from "@/components/public/blocks";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Axis Akademi; eski akademisyenler, analiz uzmanları ve kurumsal eğitmenlerden oluşan bir ekip. Excel'den teze, işini bitiren akademik destek.",
  alternates: { canonical: "/hakkimizda" },
};

const team = [
  {
    icon: GraduationCap,
    title: "Eski akademisyenler",
    description: "Kadromuzun çekirdeği, üniversitelerde ders vermiş ve araştırma yürütmüş eğitmenlerden oluşur. Müfredatlarımız akademik disiplinle kurulur, sahada test edilerek olgunlaşır.",
  },
  {
    icon: LineChart,
    title: "Analiz uzmanları",
    description: "Bibliyometrik ve istatistiksel analizde yöntem seçiminden yayına hazır raporlamaya kadar akademik çalışmalara destek veren uzmanlar.",
  },
  {
    icon: Building2,
    title: "Kurumsal eğitmenler",
    description: "Şirketlerde binlerce saat sınıf eğitimi vermiş, yetişkin öğrenme dinamiklerini yakından tanıyan eğitmenler.",
  },
];

const principles = [
  { icon: Target, title: "Sonuç odaklı", description: "Her ders, ertesi gün işinde kullanacağın somut bir çıktıyla biter." },
  { icon: BookOpenCheck, title: "Akademik titizlik", description: "İçerikler güncel kaynaklarla hazırlanır ve düzenli olarak yenilenir." },
  { icon: HeartHandshake, title: "Yazılı ve şeffaf", description: "Fiyat, kapsam ve süreç önden yazılı. Her adım panelinde görünür." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Hakkımızda"
        title={
          <>
            Akademiden gelen disiplin, sahada <Accent>kanıtlanmış</Accent> deneyim
          </>
        }
        description="Axis Akademi; üniversitelerde ders vermiş akademisyenler ve kurumsal dünyada eğitim yürütmüş uzmanlar tarafından kuruldu. Analiz, ofis programları eğitimi ve tez düzenlemede tek bir ilkeyle çalışıyoruz: işini bitirmek."
      >
        <TrustStrip />
      </PageHero>

      <Section aria-labelledby="hikaye-baslik">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <SectionIntro id="hikaye-baslik" eyebrow="Hikâyemiz" title="Neden varız?" className="sm:flex-col sm:items-start" />
          <div className="flex max-w-2xl flex-col gap-5 text-[17px] leading-relaxed text-ink-soft">
            <p>
              Tez teslim haftasında kaynakçasıyla boğuşan araştırmacıyı da, her ay aynı raporu elle hazırlayan uzmanı da tanıyoruz. İkisinin de ihtiyacı aynı:
              <span className="text-ink"> doğru yöntemi bilen biri ve net bir süreç.</span>
            </p>
            <p>
              Bu yüzden fiyatları, dönem tarihlerini ve müfredatları sitede açıkça gösteriyoruz. Başvurun, teklifin, mesajların ve teslim dosyaların tek bir panelde
              duruyor; “ne oldu?” diye sormana gerek kalmıyor.
            </p>
            <p>
              Eğitmenlerimiz yurt içi ve yurt dışında panellerde konuşmacı olarak yer alıyor; bu birikim her programın müfredatına ve anlatım diline doğrudan yansıyor.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-line bg-canvas" aria-labelledby="kadro-baslik">
        <Container>
          <SectionIntro id="kadro-baslik" eyebrow="Kadro" title="Üç uzmanlık, tek ekip" description="Birbirini tamamlayan üç alan; her talep doğru kişiye gider." />
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {team.map((member) => (
              <li key={member.title} className="bg-paper p-6 sm:p-8">
                <member.icon className="size-6 text-accent" aria-hidden />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{member.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{member.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section aria-labelledby="ilke-baslik">
        <Container>
          <SectionIntro id="ilke-baslik" eyebrow="İlkeler" title="Nasıl çalışırız?" />
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {principles.map((principle, index) => (
              <li key={principle.title} className="border-t-2 border-ink pt-5">
                <span className="tabular font-mono text-sm text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <principle.icon className="size-5 text-accent" aria-hidden />
                  {principle.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{principle.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Container className="pb-16 sm:pb-24">
        <CtaBand title="Bu kadroyla çalışmaya hazır mısın?" description="Programlara göz at ya da ihtiyacını anlat; sana en uygun yolu birlikte bulalım.">
          <Button asChild size="lg" variant="secondary">
            <Link href="/programlar">
              Programları gör <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/iletisim">Bize yaz</Link>
          </Button>
        </CtaBand>
      </Container>
    </>
  );
}
