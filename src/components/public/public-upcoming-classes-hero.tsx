// src/components/public/public-upcoming-classes-hero.tsx — ana sayfa: tüm modüllerden yaklaşan eğitimler hero bandı
import { Flame } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";
import { PublicUpcomingClassCard } from "@/components/public/public-upcoming-class-card";
import type { PublicAllUpcomingClass } from "@/lib/types/catalog";

interface PublicUpcomingClassesHeroProps {
  classes: PublicAllUpcomingClass[];
}

export function PublicUpcomingClassesHero({ classes }: PublicUpcomingClassesHeroProps) {
  if (classes.length === 0) {
    return (
      <section
        aria-label="Yaklaşan eğitimler"
        className="border-b border-line bg-surface px-3 py-8 sm:px-6"
      >
        <div className="mx-auto max-w-6xl rounded-2xl border border-dashed border-line bg-white px-6 py-5">
          <p className="text-sm text-ink-soft">
            Yeni dönem programları hazırlanıyor — ücretsiz kayıt ol, ilk haberdar ol.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="public-upcoming-hero-heading"
      className="relative overflow-hidden border-b border-line bg-surface py-10 md:py-14"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-accent-soft),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-3 sm:px-6">
        <Reveal>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <Flame className="size-3.5" aria-hidden />
            Yaklaşan Eğitimler
          </p>
          <h2 id="public-upcoming-hero-heading" className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Kontenjanlar dolmadan yerini ayırt
          </h2>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">
            Takvimi belli programlar — ücretsiz kayıt ol, açık sınıfları panelinden gör ve katılım isteği gönder.
          </p>
        </Reveal>

        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {classes.map((trainingClass, index) => (
            <Reveal
              key={trainingClass.id}
              delay={index * 0.08}
              className="w-[min(100%,320px)] shrink-0 snap-start md:w-auto"
            >
              <PublicUpcomingClassCard
                id={trainingClass.id}
                title={trainingClass.title}
                start_date={trainingClass.start_date}
                schedule_note={trainingClass.schedule_note}
                duration_hours={trainingClass.duration_hours}
                capacity={trainingClass.capacity}
                approved_count={trainingClass.approved_count}
                module_id={trainingClass.module_id}
                module_title={trainingClass.module_title}
                module_category={trainingClass.module_category}
                variant="hero"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
