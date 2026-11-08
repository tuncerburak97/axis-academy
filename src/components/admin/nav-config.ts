// src/components/admin/nav-config.ts — admin kenar çubuğu grupları ve komut paleti hızlı geçişleri
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  Inbox,
  MessageCircleQuestion,
  Newspaper,
  ShieldCheck,
  Star,
  TicketPercent,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavCounts } from "@/lib/queries/admin-shell";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: keyof AdminNavCounts;
  /** Yalnızca tam eşleşmede aktif (gelen kutusu) */
  exact?: boolean;
  keywords?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Genel",
    items: [
      { href: "/admin", label: "Gelen kutusu", icon: Inbox, exact: true, keywords: "dashboard özet bekleyen" },
      { href: "/admin/takvim", label: "Takvim", icon: CalendarDays, keywords: "oturum ders hafta" },
    ],
  },
  {
    label: "Operasyon",
    items: [
      { href: "/admin/talepler", label: "Talepler", icon: ClipboardList, count: "requests", keywords: "analiz tez kurumsal birebir teklif" },
      { href: "/admin/donemler", label: "Dönemler", icon: GraduationCap, count: "pendingApplications", keywords: "sınıf başvuru kayıt" },
      { href: "/admin/sorular", label: "Sorular", icon: MessageCircleQuestion, count: "newInquiries", keywords: "iletişim mesaj" },
    ],
  },
  {
    label: "Katalog",
    items: [{ href: "/admin/programlar", label: "Programlar", icon: BookOpen, keywords: "modül müfredat paket fiyat konu" }],
  },
  {
    label: "Kişiler",
    items: [{ href: "/admin/kisiler", label: "Kişiler", icon: Users, keywords: "üye kullanıcı öğrenci" }],
  },
  {
    label: "İçerik",
    items: [
      { href: "/admin/icerik", label: "Site içeriği", icon: FileText, keywords: "anasayfa sss metin" },
      { href: "/admin/blog", label: "Blog", icon: Newspaper, keywords: "yazı makale" },
      { href: "/admin/yorumlar", label: "Yorumlar", icon: Star, count: "unpublishedReviews", keywords: "değerlendirme" },
    ],
  },
  {
    label: "Ayarlar",
    items: [
      { href: "/admin/indirimler", label: "İndirim kodları", icon: TicketPercent, keywords: "kupon" },
      { href: "/admin/ayarlar", label: "Roller ve kayıt geçmişi", icon: ShieldCheck, keywords: "ekip admin eğitmen audit log" },
    ],
  },
];

export function isNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
