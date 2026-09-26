import type { FunnelIndustry, InterestId } from "@/config/funnel";
import type { PackageId } from "@/config/pipeline";
import type { Locale } from "@/i18n/routing";

/**
 * Geo-SEO-Landingpages unter /leistungen/[slug] (EN: /en/services/[slug]) – je eine Seite pro Suchintention.
 * Aufbau wie die asap-Produktseite (Hero → Problem → Funktionen → Paket → FAQ → Funnel).
 * Texte: messages → seoPages.<id>. Slugs sind pro Sprache auf das Such-Keyword optimiert.
 *
 * Städte-Seiten später: Eintrag mit `city` duplizieren, z. B. slug "festival-videograf-koeln".
 */

export type SeoPageId = "gastro" | "festival" | "ai";

export interface SeoPage {
  id: SeoPageId;
  slugs: Record<Locale, string>;
  industry: FunnelIndustry;
  interests: InterestId[];
  highlightPackage: PackageId;
  city?: string;
}

export const seoPages: SeoPage[] = [
  {
    id: "gastro",
    slugs: { de: "medienagentur-gastronomie", en: "restaurant-media-agency" },
    industry: "gastro",
    interests: ["reels", "foto", "social"],
    highlightPackage: "retainer",
  },
  {
    id: "festival",
    slugs: { de: "festival-videograf", en: "festival-videographer" },
    industry: "musik",
    interests: ["aftermovie", "musikvideo", "ki_content"],
    highlightPackage: "aiPromo",
  },
  {
    id: "ai",
    slugs: { de: "ki-marketing-agentur", en: "ai-marketing-agency" },
    industry: "andere",
    interests: ["ki_content", "automation"],
    highlightPackage: "aiPromo",
  },
];

/** Icons der sechs Feature-Karten (gleiche Reihenfolge auf allen SEO-Seiten) */
export const seoFeatureIcons = ["camera", "clapperboard", "smartphone", "workflow", "message", "languages"] as const;

export const getSeoPageBySlug = (slug: string, locale: Locale) => seoPages.find((p) => p.slugs[locale] === slug);
export const getSeoPageById = (id: SeoPageId) => seoPages.find((p) => p.id === id)!;

/** Slug einer SEO-Seite in eine andere Sprache übersetzen (für den Language Switcher) */
export function translateSeoSlug(slug: string, to: Locale): string | undefined {
  return seoPages.find((p) => Object.values(p.slugs).includes(slug))?.slugs[to];
}
