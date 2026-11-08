// src/lib/navigation.ts — public site navigasyon link sabitleri
export interface NavLink {
  href: string;
  label: string;
}

/** Üst menü: herkese açık katalog ve hizmetler */
export const publicNavLinks: NavLink[] = [
  { href: "/programlar", label: "Programlar" },
  { href: "/analiz", label: "Analiz" },
  { href: "/tez-duzenleme", label: "Tez Düzenleme" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/blog", label: "Blog" },
];

/** Alt bilgi sütunları */
export const footerNavGroups: { title: string; links: NavLink[] }[] = [
  {
    title: "Eğitim",
    links: [
      { href: "/programlar", label: "Tüm programlar" },
      { href: "/programlar?kategori=excel", label: "Excel" },
      { href: "/programlar?kategori=word", label: "Word" },
      { href: "/programlar?kategori=powerpoint", label: "PowerPoint" },
      { href: "/teklif/birebir", label: "Birebir ders talebi" },
    ],
  },
  {
    title: "Hizmetler",
    links: [
      { href: "/analiz", label: "Bibliyometrik & istatistiksel analiz" },
      { href: "/tez-duzenleme", label: "Tez düzenleme" },
      { href: "/kurumsal", label: "Kurumsal eğitim" },
      { href: "/sertifika", label: "Belge doğrulama" },
    ],
  },
  {
    title: "Axis Akademi",
    links: [
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/blog", label: "Blog" },
      { href: "/sss", label: "Sıkça sorulan sorular" },
      { href: "/iletisim", label: "İletişim" },
    ],
  },
];
