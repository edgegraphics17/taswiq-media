import type { FunnelIndustry, InterestId } from "@/config/funnel";
import type { PackageId } from "@/config/packages";
import type { PortfolioId } from "@/config/content";
import type { Locale } from "@/i18n/routing";

/**
 * SEO-Landingpages unter /leistungen/[slug] (EN: /en/services/[slug]) – je eine Seite pro Suchintention.
 *  - kind "branche":  Branchen-Obergruppe ("Software für Steuerberater") → Zielgruppe fühlt sich direkt angesprochen
 *  - kind "leistung": Leistung ("Bestellsystem ohne Provision") → Suchende mit konkretem Bedarf
 *  - kind "media":    Premium-Media für Events, Festivals & Artists (bewusst nur eine Seite)
 * Aufbau: Hero → Problem → Funktionen → Referenzen → Pakete → Ratgeber → FAQ → Funnel.
 * Texte: messages → seoPages.<id>. Slugs sind pro Sprache auf das Such-Keyword optimiert.
 *
 * Städte-Seiten später: Eintrag mit `city` duplizieren, z. B. slug "software-steuerberater-koeln".
 */

export type IndustryPageId = "gastro" | "immobilien" | "automotive" | "kanzlei" | "beauty" | "handwerk";
export type ServicePageId = "bestellsystem" | "buchungssystem" | "individualsoftware" | "webapp" | "dashboard" | "ki" | "website";
export type SeoPageId = IndustryPageId | ServicePageId | "media";

export interface SeoPage {
  id: SeoPageId;
  kind: "branche" | "leistung" | "media";
  slugs: Record<Locale, string>;
  /** Lucide-Icon-ID (components/ui/Icon.tsx) */
  icon: string;
  industry: FunnelIndustry;
  interests: InterestId[];
  packages: "software" | "media";
  highlightPackage: PackageId;
  /** Icons der sechs Funktionskarten (Texte: seoPages.<id>.features) */
  featureIcons: [string, string, string, string, string, string];
  /** Passende Projekte aus dem Portfolio */
  portfolio: PortfolioId[];
  /** Passende Ratgeber-Artikel (Blog-Slugs) */
  blog: string[];
  /** Hero-Bild: Screenshot im Browser-Rahmen (Software) oder Foto (Media/Immobilien) */
  hero: { image: string; frame: "browser" | "photo"; url?: string };
  city?: string;
}

export const seoPages: SeoPage[] = [
  /* ─── Branchen ─── */
  {
    id: "gastro",
    kind: "branche",
    slugs: { de: "software-gastronomie", en: "restaurant-software" },
    icon: "utensils",
    industry: "gastro",
    interests: ["bestellsystem", "web"],
    packages: "software",
    highlightPackage: "system",
    featureIcons: ["cart", "chef", "card", "calendar", "chart", "languages"],
    portfolio: ["daron", "mangal", "land-of-plenty", "lilys"],
    blog: ["eigenes-bestellsystem-statt-lieferando", "saas-abo-oder-eigene-software"],
    hero: { image: "/images/portfolio/site-daron.jpg", frame: "browser", url: "daron-brot-ii.vercel.app" },
  },
  {
    id: "immobilien",
    kind: "branche",
    slugs: { de: "software-immobilien", en: "real-estate-software" },
    icon: "building",
    industry: "immobilien",
    interests: ["webapp", "automation"],
    packages: "software",
    highlightPackage: "custom",
    featureIcons: ["building", "users", "file", "wrench", "workflow", "chart"],
    portfolio: ["agile", "antragsbruder", "taswiq-system"],
    blog: ["software-fuer-makler-und-hausverwaltungen", "individualsoftware-mittelstand-kosten"],
    hero: { image: "/images/portfolio/agile.jpg", frame: "photo" },
  },
  {
    id: "automotive",
    kind: "branche",
    slugs: { de: "software-autohaus-fahrschule", en: "software-car-dealers-driving-schools" },
    icon: "car",
    industry: "automotive",
    interests: ["buchungssystem", "app"],
    packages: "software",
    highlightPackage: "system",
    featureIcons: ["car", "calendar", "smartphone", "users", "card", "chart"],
    portfolio: ["omed", "taswiq-system", "daron"],
    blog: ["digitalisierung-autohaus-fahrschule", "web-app-oder-native-app"],
    hero: { image: "/images/portfolio/site-omed.jpg", frame: "browser", url: "omed-friseursalon.vercel.app" },
  },
  {
    id: "kanzlei",
    kind: "branche",
    slugs: { de: "software-steuerberater-kanzlei", en: "software-tax-advisors-law-firms" },
    icon: "scale",
    industry: "kanzlei",
    interests: ["webapp", "automation"],
    packages: "software",
    highlightPackage: "custom",
    featureIcons: ["lock", "file", "sparkles", "calendar", "workflow", "shield"],
    portfolio: ["antragsbruder", "klarvoran", "taswiq-system"],
    blog: ["mandantenportal-steuerberater", "ki-automatisierung-mittelstand"],
    hero: { image: "/images/portfolio/site-antragsbruder.jpg", frame: "browser", url: "antragsbruder.de" },
  },
  {
    id: "beauty",
    kind: "branche",
    slugs: { de: "buchungssystem-friseur-beauty", en: "booking-system-salon-beauty" },
    icon: "scissors",
    industry: "beauty",
    interests: ["buchungssystem", "web"],
    packages: "software",
    highlightPackage: "system",
    featureIcons: ["calendar", "users", "message", "card", "star", "chart"],
    portfolio: ["omed", "klarvoran", "daron"],
    blog: ["buchungssystem-friseur-ohne-provision", "was-kostet-eine-website"],
    hero: { image: "/images/portfolio/site-omed.jpg", frame: "browser", url: "omed-friseursalon.vercel.app" },
  },
  {
    id: "handwerk",
    kind: "branche",
    slugs: { de: "software-handwerk-dienstleister", en: "software-trades-service-businesses" },
    icon: "wrench",
    industry: "handwerk",
    interests: ["software", "automation"],
    packages: "software",
    highlightPackage: "custom",
    featureIcons: ["file", "calendar", "smartphone", "camera", "card", "chart"],
    portfolio: ["taswiq-system", "antragsbruder", "omed"],
    blog: ["software-fuer-handwerker-und-dienstleister", "unternehmens-dashboard-kennzahlen"],
    hero: { image: "/images/portfolio/site-antragsbruder.jpg", frame: "browser", url: "antragsbruder.de" },
  },

  /* ─── Leistungen ─── */
  {
    id: "individualsoftware",
    kind: "leistung",
    slugs: { de: "individualsoftware-mittelstand", en: "custom-software-development" },
    icon: "code",
    industry: "andere",
    interests: ["software"],
    packages: "software",
    highlightPackage: "custom",
    featureIcons: ["search", "frame", "code", "plug", "shield", "refresh"],
    portfolio: ["antragsbruder", "daron", "taswiq-system"],
    blog: ["individualsoftware-mittelstand-kosten", "software-mit-ki-entwickeln"],
    hero: { image: "/images/portfolio/site-antragsbruder.jpg", frame: "browser", url: "antragsbruder.de" },
  },
  {
    id: "bestellsystem",
    kind: "leistung",
    slugs: { de: "bestellsystem-ohne-provision", en: "online-ordering-system" },
    icon: "cart",
    industry: "gastro",
    interests: ["bestellsystem"],
    packages: "software",
    highlightPackage: "system",
    featureIcons: ["cart", "card", "chef", "map", "message", "chart"],
    portfolio: ["daron", "lilys", "mangal"],
    blog: ["eigenes-bestellsystem-statt-lieferando", "saas-abo-oder-eigene-software"],
    hero: { image: "/images/portfolio/site-daron.jpg", frame: "browser", url: "daron-brot-ii.vercel.app" },
  },
  {
    id: "buchungssystem",
    kind: "leistung",
    slugs: { de: "online-buchungssystem", en: "online-booking-system" },
    icon: "calendar",
    industry: "beauty",
    interests: ["buchungssystem"],
    packages: "software",
    highlightPackage: "system",
    featureIcons: ["calendar", "shield", "message", "card", "users", "chart"],
    portfolio: ["omed", "klarvoran", "daron"],
    blog: ["buchungssystem-friseur-ohne-provision", "digitalisierung-autohaus-fahrschule"],
    hero: { image: "/images/portfolio/site-omed.jpg", frame: "browser", url: "omed-friseursalon.vercel.app" },
  },
  {
    id: "webapp",
    kind: "leistung",
    slugs: { de: "web-app-entwicklung", en: "web-app-development" },
    icon: "smartphone",
    industry: "andere",
    interests: ["webapp", "app"],
    packages: "software",
    highlightPackage: "custom",
    featureIcons: ["lock", "file", "smartphone", "languages", "plug", "zap"],
    portfolio: ["antragsbruder", "daron", "omed"],
    blog: ["web-app-oder-native-app", "mandantenportal-steuerberater"],
    hero: { image: "/images/portfolio/site-antragsbruder.jpg", frame: "browser", url: "antragsbruder.de" },
  },
  {
    id: "dashboard",
    kind: "leistung",
    slugs: { de: "dashboard-entwicklung", en: "business-dashboard-development" },
    icon: "chart",
    industry: "andere",
    interests: ["dashboard"],
    packages: "software",
    highlightPackage: "custom",
    featureIcons: ["chart", "plug", "zap", "users", "sparkles", "smartphone"],
    portfolio: ["taswiq-system", "daron", "antragsbruder"],
    blog: ["unternehmens-dashboard-kennzahlen", "ki-automatisierung-mittelstand"],
    hero: { image: "/images/portfolio/site-daron.jpg", frame: "browser", url: "daron-brot-ii.vercel.app" },
  },
  {
    id: "ki",
    kind: "leistung",
    slugs: { de: "ki-automatisierung-unternehmen", en: "ai-automation-for-business" },
    icon: "sparkles",
    industry: "andere",
    interests: ["automation"],
    packages: "software",
    highlightPackage: "system",
    featureIcons: ["message", "file", "phone", "workflow", "star", "chart"],
    portfolio: ["reviews", "taswiq-system", "antragsbruder"],
    blog: ["ki-automatisierung-mittelstand", "software-mit-ki-entwickeln"],
    hero: { image: "/images/portfolio/site-antragsbruder.jpg", frame: "browser", url: "antragsbruder.de" },
  },
  {
    id: "website",
    kind: "leistung",
    slugs: { de: "website-erstellen-lassen", en: "website-development" },
    icon: "monitor",
    industry: "andere",
    interests: ["web"],
    packages: "software",
    highlightPackage: "website",
    featureIcons: ["monitor", "search", "sparkles", "zap", "languages", "chart"],
    portfolio: ["klarvoran", "omed", "mipp"],
    blog: ["was-kostet-eine-website", "saas-abo-oder-eigene-software"],
    hero: { image: "/images/portfolio/site-klarvoran.jpg", frame: "browser", url: "klarvoran.de" },
  },

  /* ─── Premium-Media ─── */
  {
    id: "media",
    kind: "media",
    slugs: { de: "premium-eventvideo-festival", en: "premium-event-festival-video" },
    icon: "clapperboard",
    industry: "musik",
    interests: ["media"],
    packages: "media",
    highlightPackage: "festival",
    featureIcons: ["clapperboard", "camera", "split", "languages", "sparkles", "zap"],
    portfolio: ["festivals", "dj-presskits", "agile", "zuan-yuan"],
    blog: ["aftermovie-premium-festivalfilm"],
    hero: { image: "/images/showreel-poster.jpg", frame: "photo" },
  },
];

export const industryPages = seoPages.filter((p) => p.kind === "branche");
export const servicePages = seoPages.filter((p) => p.kind === "leistung");
export const mediaPage = seoPages.find((p) => p.kind === "media")!;

export const getSeoPageBySlug = (slug: string, locale: Locale) => seoPages.find((p) => p.slugs[locale] === slug);
export const getSeoPageById = (id: SeoPageId) => seoPages.find((p) => p.id === id)!;

/** Slug einer SEO-Seite in eine andere Sprache übersetzen (für den Language Switcher) */
export function translateSeoSlug(slug: string, to: Locale): string | undefined {
  return seoPages.find((p) => Object.values(p.slugs).includes(slug))?.slugs[to];
}

/** Alte Slugs aus der Content-Zeit → neue Seiten (301 in next.config.ts) */
export const legacySeoRedirects: { from: Record<Locale, string>; to: SeoPageId }[] = [
  { from: { de: "medienagentur-gastronomie", en: "restaurant-media-agency" }, to: "gastro" },
  { from: { de: "festival-videograf", en: "festival-videographer" }, to: "media" },
  { from: { de: "ki-marketing-agentur", en: "ai-marketing-agency" }, to: "ki" },
];
