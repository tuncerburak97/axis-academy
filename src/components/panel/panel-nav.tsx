// src/components/panel/panel-nav.tsx — üye alanı gezinmesi: masaüstü kenar çubuğu, mobil alt sekme çubuğu ve menü sayfası
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  Bell,
  CalendarDays,
  Compass,
  Ellipsis,
  GraduationCap,
  Inbox,
  Plus,
  Presentation,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { NewRequestMenu } from "@/components/panel/new-request-menu";
import { PanelLogo } from "@/components/panel/panel-logo";

interface NavItem {
  href: string;
  label: string;
  short?: string;
  icon: LucideIcon;
  count?: number;
  countTone?: "amber" | "accent";
  exact?: boolean;
}

export interface PanelNavProps {
  role: string;
  awaitingCount: number;
  unreadCount: number;
}

function buildNav({ role, awaitingCount, unreadCount }: PanelNavProps): NavItem[] {
  const items: NavItem[] = [
    { href: "/panel", label: "Bugün", icon: Sun, exact: true },
    { href: "/panel/takvim", label: "Takvim", icon: CalendarDays },
    { href: "/panel/egitimler", label: "Eğitimlerim", short: "Eğitimler", icon: GraduationCap },
    { href: "/panel/talepler", label: "Taleplerim", short: "Talepler", icon: Inbox, count: awaitingCount, countTone: "amber" },
    { href: "/panel/belgeler", label: "Belgelerim", icon: Award },
    { href: "/panel/bildirimler", label: "Bildirimler", icon: Bell, count: unreadCount, countTone: "accent" },
  ];
  if (role === "instructor") items.push({ href: "/panel/derslerim", label: "Derslerim", icon: Presentation });
  items.push({ href: "/panel/hesap", label: "Hesap", icon: UserRound });
  return items;
}

function isActive(pathname: string, item: Pick<NavItem, "href" | "exact">) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function CountPill({ count, tone }: { count?: number; tone?: "amber" | "accent" }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "tabular ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-none",
        tone === "amber" ? "bg-amber text-ink" : "bg-accent text-white",
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function PanelSidebar(props: PanelNavProps) {
  const pathname = usePathname();
  const items = buildNav(props);
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-paper print:hidden lg:flex">
      <div className="flex h-16 shrink-0 items-center px-6">
        <PanelLogo />
      </div>
      <nav aria-label="Üye alanı" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                active ? "bg-accent-soft text-accent-ink" : "text-ink-soft hover:bg-surface hover:text-ink",
              )}
            >
              <item.icon className={cn("size-[18px] shrink-0", active ? "text-accent" : "text-ink-muted group-hover:text-ink-soft")} aria-hidden />
              <span>{item.label}</span>
              <CountPill count={item.count} tone={item.countTone} />
              {item.count ? (
                <span className="sr-only">{item.countTone === "amber" ? `, ${item.count} işlem bekliyor` : `, ${item.count} okunmamış`}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-2 border-t border-line p-3">
        <Link
          href="/programlar"
          className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface hover:text-ink"
        >
          <Compass className="size-[18px] text-ink-muted" aria-hidden />
          Program keşfet
        </Link>
        <NewRequestMenu variant="secondary" className="w-full" align="start" side="top" />
      </div>
    </aside>
  );
}

export function MobileTabbar(props: PanelNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = buildNav(props);
  const primary = items.filter((item) => ["/panel", "/panel/takvim", "/panel/egitimler", "/panel/talepler"].includes(item.href));
  const rest = items.filter((item) => !primary.includes(item));
  const menuActive = rest.some((item) => isActive(pathname, item));
  const menuCount = rest.reduce((sum, item) => sum + (item.count ?? 0), 0);

  const tabClass = (active: boolean) =>
    cn(
      "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
      active ? "text-accent" : "text-ink-soft",
    );

  return (
    <>
      <nav
        aria-label="Üye alanı"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur print:hidden lg:hidden"
      >
        <div className="mx-auto flex max-w-lg">
          {primary.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
                <span className="relative">
                  <item.icon className="size-[22px]" aria-hidden />
                  {item.count ? (
                    <span className="tabular absolute -right-2.5 -top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-amber px-1 font-mono text-[10px] leading-4 text-ink">
                      {item.count}
                    </span>
                  ) : null}
                </span>
                {item.short ?? item.label}
                {item.count ? <span className="sr-only">, {item.count} işlem bekliyor</span> : null}
              </Link>
            );
          })}
          <button type="button" onClick={() => setOpen(true)} className={tabClass(menuActive)} aria-haspopup="dialog">
            <span className="relative">
              <Ellipsis className="size-[22px]" aria-hidden />
              {menuCount ? <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-paper" aria-hidden /> : null}
            </span>
            Menü
          </button>
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="gap-0 rounded-t-3xl pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden">
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong" />
          <SheetTitle className="px-5 pb-2 pt-4 text-base font-semibold">Menü</SheetTitle>
          <nav aria-label="Diğer sayfalar" className="flex flex-col px-3">
            {rest.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium",
                    active ? "bg-accent-soft text-accent-ink" : "text-ink hover:bg-surface",
                  )}
                >
                  <item.icon className="size-5 text-ink-soft" aria-hidden />
                  {item.label}
                  <CountPill count={item.count} tone={item.countTone} />
                </Link>
              );
            })}
            <Link
              href="/programlar"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-ink hover:bg-surface"
            >
              <Compass className="size-5 text-ink-soft" aria-hidden />
              Program keşfet
            </Link>
          </nav>
          <div className="px-5 pt-3">
            <NewRequestMenu variant="secondary" className="w-full" align="center" side="top" icon={<Plus aria-hidden />} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
