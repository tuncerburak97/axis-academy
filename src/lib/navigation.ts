// src/lib/navigation.ts — public site navigasyon link sabitleri
export interface NavLink {
  href: string;
  label: string;
}

export const publicNavLinks: NavLink[] = [
  { href: "/analiz", label: "Analiz" },
  { href: "/egitim", label: "Eğitim" },
  { href: "/tez-duzenleme", label: "Tez Düzenleme" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/sss", label: "SSS" },
  { href: "/iletisim", label: "İletişim" },
];
