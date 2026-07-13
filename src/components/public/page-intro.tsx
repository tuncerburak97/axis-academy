// src/components/public/page-intro.tsx — public alt sayfalar için ortak başlık bölümü
interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
      <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-3 py-12 sm:px-6 sm:py-16">
        <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base text-ink-soft sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
