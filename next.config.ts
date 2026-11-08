// next.config.ts — Next.js yapılandırması: standalone çıktı, dosya yükleme sınırı ve eski adreslerden kalıcı yönlendirmeler
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      // Talep sihirbazı 20 MB'a kadar dosya kabul eder
      bodySizeLimit: "25mb",
    },
  },
  async redirects() {
    return [
      // Public katalog
      { source: "/egitim", destination: "/programlar", permanent: true },
      { source: "/egitim/:id", destination: "/programlar/:id", permanent: true },
      // Üye alanı (eski keşfet/sınıf/talep adresleri)
      { source: "/panel/kesfet", destination: "/programlar", permanent: true },
      { source: "/panel/kesfet/:id", destination: "/programlar/:id", permanent: true },
      { source: "/panel/sinif/:id", destination: "/panel/egitimler/:id", permanent: true },
      { source: "/panel/talepler/yeni", destination: "/teklif/analiz", permanent: true },
      { source: "/panel/talep/:id", destination: "/panel/talepler", permanent: true },
      // Admin
      { source: "/admin/moduller", destination: "/admin/programlar", permanent: true },
      { source: "/admin/moduller/:id", destination: "/admin/programlar/:id", permanent: true },
      { source: "/admin/siniflar", destination: "/admin/donemler", permanent: true },
      { source: "/admin/siniflar/:id", destination: "/admin/donemler/:id", permanent: true },
    ];
  },
};

export default nextConfig;
