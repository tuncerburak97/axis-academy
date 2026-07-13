// src/app/(public)/hakkimizda/page.tsx — kurumsal vitrin: anlatı, sayaçlı istatistikler,
// kadro kartları ve değerler (istatistik sayıları örnektir, güncellenebilir)
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Building2,
  Globe2,
  Target,
  HeartHandshake,
  LineChart,
  BookOpenCheck,
  Users,
  Presentation,
  ArrowRight,
} from "lucide-react";
import { siteImages } from "@/lib/images";
import { FadeUp, Reveal } from "@/components/public/motion-primitives";
import { FeatureCard, StatBand } from "@/components/public/marketing";

export const metadata: Metadata = { title: "Hakkımızda" };

// Örnek kurumsal istatistikler — gerçek değerlerle güncellenecek
const stats = [
  { value: 15, label: "Yıllık Eğitim Deneyimi" },
  { value: 10000, label: "Eğitim Verilen Katılımcı" },
  { value: 150, label: "Kurumsal İş Birliği" },
  { value: 40, label: "Ulusal & Uluslararası Panel" },
];

const teamProfiles = [
  {
    icon: GraduationCap,
    title: "Eski Akademisyenler",
    description:
      "Kadromuzun çekirdeği, üniversitelerde yıllarca ders vermiş ve araştırma yürütmüş eski akademisyenlerden oluşur. Müfredatlarımız akademik disiplinle kurulur, sahada test edilerek olgunlaştırılır.",
  },
  {
    icon: LineChart,
    title: "Alan Uzmanları",
    description:
      "Bibliyometrik ve istatistiksel analiz tarafında; yöntem seçiminden yayına hazır raporlamaya kadar yüzlerce akademik çalışmaya destek vermiş uzmanlar görev alır.",
  },
  {
    icon: Building2,
    title: "Kurumsal Eğitmenler",
    description:
      "Türkiye'nin önde gelen şirketlerinde binlerce saat sınıf eğitimi vermiş eğitmenlerimiz, kurumsal ihtiyaçları ve yetişkin öğrenme dinamiklerini yakından tanır.",
  },
];

const values = [
  {
    icon: Target,
    title: "Sonuç Odaklılık",
    description: "Her eğitim, katılımcının ertesi gün işinde kullanacağı somut çıktılarla tasarlanır.",
  },
  {
    icon: BookOpenCheck,
    title: "Akademik Titizlik",
    description: "İçeriklerimiz güncel literatür ve kanıta dayalı yöntemlerle hazırlanır, sürekli güncellenir.",
  },
  {
    icon: HeartHandshake,
    title: "Birebir Takip",
    description: "Talebinizden eğitim sonrasına kadar süreç panelinizden şeffaf biçimde izlenir.",
  },
  {
    icon: Globe2,
    title: "Uluslararası Perspektif",
    description: "Yurt içi ve yurt dışı panellerde edinilen deneyim, eğitim yaklaşımımıza doğrudan yansır.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Anlatı hero'su */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-3 py-16 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <FadeUp>
              <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
                Kurumsal
              </p>
              <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">
                Akademiden gelen disiplin, sahada kanıtlanmış deneyim
              </h1>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="mt-5 max-w-xl leading-relaxed text-ink-soft">
                Axis Akademi; üniversitelerde yıllarca ders vermiş eski akademisyenler ve kurumsal
                dünyada binlerce saat eğitim yürütmüş uzman eğitmenler tarafından kuruldu. Bugüne kadar
                yüzlerce kuruma ve binlerce katılımcıya analiz, ofis programları eğitimi ve tez düzenleme
                alanlarında destek verdik.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
                Eğitmenlerimiz yurt içi ve yurt dışında panellerde konuşmacı olarak yer alıyor; bu birikim,
                her programımızın müfredatına ve anlatım diline doğrudan yansıyor.
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} className="hidden md:block">
            <div className="relative">
              <Image
                src={siteImages.team}
                alt="Toplantıda birlikte çalışan eğitmen kadrosu"
                width={640}
                height={440}
                className="h-80 w-full rounded-2xl object-cover shadow-xl"
              />
              <Image
                src={siteImages.lecture}
                alt="Sınıf eğitiminde sunum yapan eğitmen"
                width={320}
                height={220}
                className="absolute -bottom-8 -left-8 h-40 w-56 rounded-xl border-4 border-white object-cover shadow-lg"
              />
            </div>
          </FadeUp>
        </div>
      </section>

      <StatBand stats={stats} />

      {/* Kadro */}
      <section aria-labelledby="team-heading" className="bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <Reveal>
            <h2 id="team-heading" className="font-display text-3xl font-bold tracking-tight">Kadromuz</h2>
            <p className="mt-2 max-w-xl text-ink-soft">
              Üç uzmanlık alanının kesişiminde, birbirini tamamlayan bir ekip.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {teamProfiles.map((profile, index) => (
              <FeatureCard
                key={profile.title}
                icon={profile.icon}
                title={profile.title}
                description={profile.description}
                delay={index * 0.12}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Değerler */}
      <section aria-labelledby="values-heading" className="mx-auto max-w-6xl px-3 py-16 sm:px-6 md:py-20">
        <Reveal>
          <h2 id="values-heading" className="font-display text-3xl font-bold tracking-tight">
            Neden Axis Akademi?
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <FeatureCard
              key={value.title}
              icon={value.icon}
              title={value.title}
              description={value.description}
              delay={index * 0.1}
              variant="compact"
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-ink px-8 py-12 text-center text-white md:px-16">
            <div className="flex items-center gap-3 text-white/80">
              <Users className="size-5" aria-hidden />
              <Presentation className="size-5" aria-hidden />
              <GraduationCap className="size-5" aria-hidden />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Bu kadroyla çalışmaya hazır mısın?
            </h2>
            <p className="max-w-xl text-white/70">
              Ücretsiz üye ol; eğitim kataloğunu, açık sınıfları ve sana özel seçenekleri panelinden incele.
            </p>
            <Link
              href="/kayit"
              className="inline-flex items-center gap-2 rounded-xl bg-amber px-6 py-3 font-semibold text-ink transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
            >
              Ücretsiz Kayıt Ol <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
