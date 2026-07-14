// src/components/public/public-upcoming-section.tsx — eğitim detay: modül-spesifik yaklaşan sınıflar bölümü
import { Flame } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";
import { PublicUpcomingClassCard } from "@/components/public/public-upcoming-class-card";
import type { PublicUpcomingClass } from "@/lib/queries/catalog";

interface PublicUpcomingSectionProps {
  classes: PublicUpcomingClass[];
  moduleId: string;
}

export function PublicUpcomingSection({ classes, moduleId }: PublicUpcomingSectionProps) {
  if (classes.length === 0) return null;

  return (
    <section
      aria-labelledby="module-upcoming-heading"
      className="relative overflow-hidden border-b border-line bg-surface py-12 md:py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--color-accent-soft),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-3 sm:px-6">
        <Reveal>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <Flame className="size-3.5" aria-hidden />
            Yaklaşan Eğitimler
          </p>
          <h2 id="module-upcoming-heading" className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Bu program yakında başlıyor
          </h2>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">
            Kontenjan sınırlı — kayıt ol, katılım isteğini hemen gönder.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((trainingClass, index) => (
            <Reveal key={trainingClass.id} delay={index * 0.08}>
              <PublicUpcomingClassCard
                id={trainingClass.id}
                title={trainingClass.title}
                start_date={trainingClass.start_date}
                schedule_note={trainingClass.schedule_note}
                duration_hours={trainingClass.duration_hours}
                capacity={trainingClass.capacity}
                approved_count={trainingClass.approved_count}
                module_id={moduleId}
                variant="detail"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
