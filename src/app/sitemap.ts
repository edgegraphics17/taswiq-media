import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { seoPages } from "@/config/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/content-pipeline`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/preisrechner`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...seoPages.map((p) => ({ url: `${site.url}/leistungen/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${site.url}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site.url}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
