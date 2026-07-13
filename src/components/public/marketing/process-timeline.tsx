// src/components/public/marketing/process-timeline.tsx — adım adım süreç zaman çizelgesi
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";

export interface ProcessStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
  title?: string;
  description?: string;
}

export function ProcessTimeline({ steps, title, description }: ProcessTimelineProps) {
  return (
    <section aria-labelledby={title ? "process-heading" : undefined} className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        {(title || description) && (
          <Reveal>
            {title && (
              <h2 id="process-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h2>
            )}
            {description && <p className="mt-2 max-w-lg text-ink-soft">{description}</p>}
          </Reveal>
        )}
        <ol className={`grid gap-8 md:grid-cols-3 ${title || description ? "mt-10" : ""}`}>
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.12}>
              <li className="relative">
                {index < steps.length - 1 && (
                  <span
                    className="absolute left-6 top-14 hidden h-px w-[calc(100%+2rem)] bg-line md:block"
                    aria-hidden
                  />
                )}
                <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
                  <step.icon className="size-6" aria-hidden />
                </span>
                <p className="mt-4 font-display text-lg font-semibold">
                  <span className="mr-2 text-accent">{index + 1}.</span>
                  {step.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
