// src/components/admin/admin-nav.tsx — admin sol menüsü (aktif bağlantı vurgulu)
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

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Yönetim menüsü" className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              isActive ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-surface hover:text-ink"
            }`}
          >
            <item.icon className="size-4.5 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
