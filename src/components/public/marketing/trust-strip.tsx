// src/components/public/marketing/trust-strip.tsx — güven rozetleri şeridi
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/public/motion-primitives";

export interface TrustItem {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

interface TrustStripProps {
  items: TrustItem[];
}

export function TrustStrip({ items }: TrustStripProps) {
  return (
    <section aria-label="Güven göstergeleri" className="border-y border-line bg-surface py-8">
      <div className="mx-auto max-w-6xl px-3 sm:px-6">
        <Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <li
                key={item.title}
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-sm"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="rounded-lg bg-accent-soft p-2 text-accent">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold leading-tight">{item.title}</p>
                  {item.subtitle && <p className="text-xs text-ink-soft">{item.subtitle}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
