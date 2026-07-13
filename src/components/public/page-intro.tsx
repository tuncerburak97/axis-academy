// src/components/public/page-intro.tsx — public alt sayfalar için ortak başlık bölümü
interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-wide text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">{description}</p>
      </div>
    </section>
  );
}
