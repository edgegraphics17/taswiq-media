import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Mehrere Lockfiles im Home-Verzeichnis → Projektwurzel explizit setzen
  turbopack: { root: path.join(__dirname) },
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
