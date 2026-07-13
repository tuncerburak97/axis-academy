// src/components/public/mobile-site-menu.tsx — public site mobil hamburger menü (Sheet drawer)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { publicNavLinks } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSiteMenu() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Ana menüyü aç">
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="border-b border-line">
          <SheetTitle>
            Axis<span className="text-accent"> Akademi</span>
          </SheetTitle>
        </SheetHeader>
        <nav aria-label="Ana menü" className="flex flex-col p-4">
          {publicNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`min-h-11 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Separator />
        <div className="flex flex-col gap-2 p-4">
          <Link
            href="/giris"
            onClick={() => setMenuOpen(false)}
            className="min-h-11 rounded-lg border border-line px-4 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-surface"
          >
            Giriş Yap
          </Link>
          <Link
            href="/kayit"
            onClick={() => setMenuOpen(false)}
            className="min-h-11 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-strong"
          >
            Kayıt Ol
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
