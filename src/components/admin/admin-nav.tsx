// src/components/admin/admin-nav.tsx — admin sol menüsü (aktif bağlantı vurgulu + talep rozeti)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  Inbox,
  School,
  type LucideIcon,
} from "lucide-react";

interface AdminNavProps {
  activeRequestCount: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/icerik", label: "İçerik", icon: FileText },
  { href: "/admin/moduller", label: "Eğitimler", icon: BookOpen },
  { href: "/admin/siniflar", label: "Sınıflar", icon: School },
  { href: "/admin/talepler", label: "Talepler", icon: Inbox },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
];

function formatBadgeCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function AdminNav({ activeRequestCount }: AdminNavProps) {
  const pathname = usePathname();
  const showRequestBadge = activeRequestCount > 0;

  return (
    <nav aria-label="Yönetim menüsü" className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const isRequestsItem = item.href === "/admin/talepler";
        const ariaLabel =
          isRequestsItem && showRequestBadge
            ? `Talepler, ${activeRequestCount} aktif talep`
            : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            aria-label={ariaLabel}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface hover:text-ink"
            }`}
          >
            <span className="relative shrink-0">
              <item.icon className="size-4.5" aria-hidden />
              {isRequestsItem && showRequestBadge && (
                <span
                  aria-hidden
                  className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-amber-soft px-1 text-[10px] font-bold leading-none text-ink"
                >
                  {formatBadgeCount(activeRequestCount)}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
