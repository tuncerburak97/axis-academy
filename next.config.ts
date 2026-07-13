// next.config.ts — Next.js yapılandırması; uzak eğitim görselleri için Unsplash'e izin verir
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
