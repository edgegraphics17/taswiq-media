import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";
import { legacySeoRedirects, seoPages } from "./src/config/seo-pages";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Mehrere Lockfiles im Home-Verzeichnis → Projektwurzel explizit setzen
  turbopack: { root: path.join(__dirname) },
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
  /**
   * Alte URLs aus der Content-Zeit → neue Seiten (301, Rankings bleiben erhalten).
   * Blog-Artikel gibt es nur auf Deutsch → /en/blog/<slug> zeigt auf die deutsche Fassung.
   */
  async redirects() {
    const seo = legacySeoRedirects.flatMap((r) => {
      const to = seoPages.find((p) => p.id === r.to)!;
      return [
        { source: `/leistungen/${r.from.de}`, destination: `/leistungen/${to.slugs.de}`, permanent: true },
        { source: `/en/services/${r.from.en}`, destination: `/en/services/${to.slugs.en}`, permanent: true },
      ];
    });
    const media = seoPages.find((p) => p.kind === "media")!;
    return [
      ...seo,
      { source: "/content-pipeline", destination: `/leistungen/${media.slugs.de}`, permanent: true },
      { source: "/en/content-pipeline", destination: `/en/services/${media.slugs.en}`, permanent: true },
      { source: "/en/blog/:slug", destination: "/blog/:slug", permanent: false },
    ];
  },
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

export default withNextIntl(nextConfig);
