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
