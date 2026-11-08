// src/components/public/site-nav.tsx — üst menünün istemci parçaları: aktif bağlantı, mobil menü, kullanıcı menüsü
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, FileText, GraduationCap, LayoutDashboard, LogOut, Menu as MenuIcon, Settings, ShieldCheck } from "lucide-react";
import { publicNavLinks } from "@/lib/navigation";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/data";
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface Viewer {
  name: string;
  email: string;
  isAdmin: boolean;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Ana menü" className="hidden items-center gap-1 lg:flex">
      {publicNavLinks.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface hover:text-ink",
              active ? "text-ink after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-accent" : "text-ink-soft",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function UserMenu({ viewer }: { viewer: Viewer }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          className="hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:inline-flex"
          aria-label="Hesap menüsü"
        >
          <Avatar name={viewer.name} />
        </button>
      </MenuTrigger>
      <MenuContent className="w-60">
        <MenuLabel className="normal-case tracking-normal">
          <span className="block truncate text-sm font-semibold text-ink">{viewer.name}</span>
          <span className="block truncate text-xs font-normal text-ink-soft">{viewer.email}</span>
        </MenuLabel>
        <MenuSeparator />
        <MenuItem asChild>
          <Link href="/panel">
            <LayoutDashboard /> Panelim
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/panel/egitimler">
            <GraduationCap /> Eğitimlerim
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/panel/talepler">
            <FileText /> Taleplerim
          </Link>
        </MenuItem>
        <MenuItem asChild>
          <Link href="/panel/hesap">
            <Settings /> Hesap
          </Link>
        </MenuItem>
        {viewer.isAdmin && (
          <MenuItem asChild>
            <Link href="/admin">
              <ShieldCheck /> Yönetim
            </Link>
          </MenuItem>
        )}
        <MenuSeparator />
        <form action={logout}>
          <MenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut /> Çıkış yap
            </button>
          </MenuItem>
        </form>
      </MenuContent>
    </Menu>
  );
}

export function MobileMenu({ viewer }: { viewer: Viewer | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menüyü aç">
          <MenuIcon className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,88vw)] gap-0 p-0" aria-describedby={undefined}>
        <div className="flex h-16 items-center border-b border-line px-5">
          <SheetTitle className="font-sans text-lg font-semibold">
            Axis <span className="accent-word text-[1.12em] font-normal text-accent">Akademi</span>
          </SheetTitle>
        </div>
        {viewer && (
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <Avatar name={viewer.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{viewer.name}</p>
              <p className="truncate text-xs text-ink-soft">{viewer.email}</p>
            </div>
          </div>
        )}
        <nav aria-label="Mobil menü" className="flex flex-col gap-0.5 overflow-y-auto p-3">
          {[...publicNavLinks, { href: "/hakkimizda", label: "Hakkımızda" }, { href: "/iletisim", label: "İletişim" }].map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center justify-between rounded-xl px-3 text-[15px] font-semibold transition-colors",
                  active ? "bg-accent-soft text-accent-ink" : "text-ink hover:bg-surface",
                )}
              >
                {link.label}
                <ArrowRight className="size-4 text-ink-muted" aria-hidden />
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {viewer ? (
            <>
              <Button asChild size="lg">
                <Link href="/panel">Panelim</Link>
              </Button>
              <form action={logout}>
                <Button type="submit" variant="ghost" size="lg" className="w-full">
                  <LogOut /> Çıkış yap
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/kayit">Ücretsiz kayıt ol</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/giris">Giriş</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
