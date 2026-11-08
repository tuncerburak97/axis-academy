// src/lib/queries/public-seo.ts — site kök adresi ve ortak metadata yardımcıları (sitemap, JSON-LD, canonical)
export function siteUrl(path = ""): string {
  const base = (process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://axisakademi.com").replace(/\/+$/, "");
  return `${base}${path}`;
}

export const organizationJsonLd = {
  "@type": "EducationalOrganization",
  name: "Axis Akademi",
  url: siteUrl(),
};

/** Sayfa kendi openGraph nesnesini verdiğinde Next kökteki değerleri birleştirmez; bu alanları ayrıca ekle */
export const openGraphDefaults = {
  siteName: "Axis Akademi",
  locale: "tr_TR",
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Axis Akademi: analiz, eğitim ve tez düzenleme" }],
};
