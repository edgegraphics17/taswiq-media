import type { MetadataRoute } from "next";
import { seoPages } from "@/config/seo-pages";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl, languageAlternates, type PathHref } from "@/lib/seo";

type Entry = { hrefFor: (l: Locale) => PathHref; changeFrequency: "monthly" | "yearly"; priority: number };

/**
 * Zweisprachige Sitemap: jede URL je Sprache, jeweils mit <xhtml:link rel="alternate" hreflang>
 * auf alle Sprachfassungen – Google ordnet DE/EN so eindeutig einander zu.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: Entry[] = [
    { hrefFor: () => "/", changeFrequency: "monthly", priority: 1 },
    { hrefFor: () => "/content-pipeline", changeFrequency: "monthly", priority: 0.9 },
    { hrefFor: () => "/preisrechner", changeFrequency: "monthly", priority: 0.9 },
    ...seoPages.map((p) => ({
      hrefFor: (l: Locale) => ({ pathname: "/leistungen/[slug]" as const, params: { slug: p.slugs[l] } }),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { hrefFor: () => "/impressum", changeFrequency: "yearly", priority: 0.2 },
    { hrefFor: () => "/datenschutz", changeFrequency: "yearly", priority: 0.2 },
  ];

  return entries.flatMap((e) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(e.hrefFor(locale), locale),
      lastModified: now,
      changeFrequency: e.changeFrequency,
      priority: e.priority,
      alternates: { languages: languageAlternates(e.hrefFor, locale).languages as Record<string, string> },
    })),
  );
}
