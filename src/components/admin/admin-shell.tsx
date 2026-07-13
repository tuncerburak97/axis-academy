// src/components/admin/admin-shell.tsx — admin layout kabuğu: desktop sidebar + mobil drawer
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminShellProps {
  activeRequestCount: number;
  logoutButton: React.ReactNode;
  children: React.ReactNode;
}

export function AdminShell({ activeRequestCount, logoutButton, children }: AdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobil üst bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-white px-3 md:hidden">
        <Link href="/admin" className="font-display text-base font-bold tracking-tight">
          Axis<span className="text-accent"> Admin</span>
        </Link>
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Yönetim menüsünü aç">
              <Menu className="size-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="border-b border-line">
              <SheetTitle>
                Axis<span className="text-accent"> Admin</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col p-3">
              <AdminNav
                activeRequestCount={activeRequestCount}
                onNavigate={() => setMenuOpen(false)}
              />
              <div className="mt-auto pt-4">{logoutButton}</div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white p-4 md:flex">
        <Link href="/admin" className="px-3 py-2 font-display text-lg font-bold tracking-tight">
          Axis<span className="text-accent"> Admin</span>
        </Link>
        <div className="mt-4 flex-1">
          <AdminNav activeRequestCount={activeRequestCount} />
        </div>
        {logoutButton}
      </aside>

      <main className="flex-1 bg-surface px-3 py-6 sm:px-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
