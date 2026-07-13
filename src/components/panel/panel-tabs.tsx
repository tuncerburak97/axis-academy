// src/components/panel/panel-tabs.tsx — üye paneli üst sekme navigasyonu (mobil kaydırma + snap)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/panel", label: "Eğitimlerim" },
  { href: "/panel/kesfet", label: "Keşfet" },
  { href: "/panel/talepler", label: "Taleplerim" },
  { href: "/panel/hesap", label: "Hesap" },
];

export function PanelTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel menüsü" className="relative border-b border-line">
      <div className="scroll-fade-x mx-auto max-w-6xl">
        <div className="flex gap-1 overflow-x-auto px-4 scroll-smooth snap-x snap-mandatory sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = tab.href === "/panel" ? pathname === "/panel" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`min-h-11 shrink-0 snap-start whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
