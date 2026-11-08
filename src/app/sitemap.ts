// src/app/sitemap.ts — site haritası: sabit public sayfalar + aktif programlar + yayındaki blog yazıları
import type { MetadataRoute } from "next";
import { getProgramSlugs } from "@/lib/queries/public-catalog";
import { getPublishedPosts } from "@/lib/queries/blog";
import { siteUrl } from "@/lib/queries/public-seo";

const staticPages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/programlar", priority: 0.9, changeFrequency: "daily" },
  { path: "/analiz", priority: 0.8, changeFrequency: "monthly" },
  { path: "/tez-duzenleme", priority: 0.8, changeFrequency: "monthly" },
  { path: "/kurumsal", priority: 0.8, changeFrequency: "monthly" },
  { path: "/teklif/analiz", priority: 0.5, changeFrequency: "yearly" },
  { path: "/teklif/tez", priority: 0.5, changeFrequency: "yearly" },
  { path: "/teklif/kurumsal", priority: 0.5, changeFrequency: "yearly" },
  { path: "/teklif/birebir", priority: 0.5, changeFrequency: "yearly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/hakkimizda", priority: 0.5, changeFrequency: "yearly" },
  { path: "/sss", priority: 0.5, changeFrequency: "monthly" },
  { path: "/iletisim", priority: 0.5, changeFrequency: "yearly" },
  { path: "/sertifika", priority: 0.3, changeFrequency: "yearly" },
  { path: "/kayit", priority: 0.4, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, posts] = await Promise.all([getProgramSlugs().catch(() => []), getPublishedPosts().catch(() => [])]);
  const now = new Date();

  return [
    ...staticPages.map((page) => ({ url: siteUrl(page.path), lastModified: now, changeFrequency: page.changeFrequency, priority: page.priority })),
    ...programs.map((program) => ({
      url: siteUrl(`/programlar/${program.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...posts.map((post) => ({
      url: siteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updated_at ?? post.published_at ?? now),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
