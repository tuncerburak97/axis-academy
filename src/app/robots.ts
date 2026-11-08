// src/app/robots.ts — arama motoru kuralları: üye alanı, admin ve bileşen kiti taranmaz
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/queries/public-seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/admin", "/kit", "/auth", "/sifre-yenile"] }],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
