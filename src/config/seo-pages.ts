import type { FunnelIndustry, InterestId } from "@/config/funnel";
import type { PackageId } from "@/config/packages";
import type { PortfolioId } from "@/config/content";
import type { DemoSlug } from "@/demos/registry";
import type { Locale } from "@/i18n/routing";

/**
 * SEO-Landingpages unter /leistungen/[slug] (EN: /en/services/[slug]) – je eine Seite pro Suchintention.
 *  - kind "branche":  Branchen-Obergruppe ("Software für Steuerberater") → Zielgruppe fühlt sich direkt angesprochen
 *  - kind "leistung": Leistung ("Bestellsystem ohne Provision") → Suchende mit konkretem Bedarf
 *  - kind "media":    Premium-Media für Events, Festivals & Artists (bewusst nur eine Seite)
 * Aufbau: Hero → Problem → Funktionen → Referenzen → Pakete → Ratgeber → FAQ → Funnel.
 * Branchenseiten (kind "branche") haben einen eigenen Aufbau: components/industry/IndustryPage.tsx,
 * Leistungsseiten (kind "leistung"): components/service/ServicePage.tsx. Der Aufbau oben gilt nur noch für "media".
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
  /** Software-Demo zum Ausprobieren (/demo/<slug>) – Hero und Hinweis-Pille verlinken dorthin */
  demo?: DemoSlug;
  /** Hero: Screenshot im Browser-Rahmen, Foto/Film oder – ohne passendes Bild – Beispielansicht aus den Modulen ("mock") */
  hero: { image: string; frame: "browser" | "photo" | "mock"; url?: string; video?: string };
  /** Branchenseiten: Demo oder passende Ergänzung unter den Paketen (Texte: seoPages.<id>.spotlight) · `demo` verlinkt die Demo statt des Portfolios */
  spotlight?: { image: string; href: "/portfolio"; demo?: DemoSlug };
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
    demo: "restaurant",
    portfolio: ["demo-restaurant", "cinnamon", "il-forno", "mangal"],
    blog: ["tischreservierungssystem", "digitalisierung-handwerk-foerderung", "qr-code-bestellsystem", "bestellsystem-baeckerei", "eigenes-bestellsystem-statt-lieferando", "saas-abo-oder-eigene-software"],
    hero: { image: "/images/demo/restaurant.jpg", frame: "browser", url: "taswiq-media.de/demo/restaurant" },
    spotlight: { image: "/images/cases/il-forno.jpg", href: "/portfolio" },
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
    demo: "immobilien",
    portfolio: ["demo-immobilien", "agile"],
    blog: ["mieterportal", "software-fuer-makler-und-hausverwaltungen", "individualsoftware-mittelstand-kosten"],
    hero: { image: "/images/portfolio/agile.jpg", frame: "photo", video: "/videos/portfolio/agile-hero.mp4" },
    spotlight: { image: "/images/portfolio/agile.jpg", href: "/portfolio" },
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
    demo: "werkstatt",
    portfolio: ["demo-werkstatt", "demo-friseur", "taswiq-system"],
    blog: ["werkstatt-termin-online-buchen", "digitalisierung-autohaus-fahrschule", "web-app-oder-native-app"],
    hero: { image: "/images/demo/werkstatt.jpg", frame: "browser", url: "taswiq-media.de/demo/werkstatt" },
    spotlight: { image: "/images/demo/werkstatt.jpg", href: "/portfolio", demo: "werkstatt" },
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
    demo: "steuerkanzlei",
    portfolio: ["demo-steuerkanzlei", "demo-immobilien", "taswiq-system"],
    blog: ["kundenportal-erstellen-lassen", "mandantenportal-steuerberater", "ki-automatisierung-mittelstand"],
    hero: { image: "/images/demo/steuerkanzlei.jpg", frame: "browser", url: "taswiq-media.de/demo/steuerkanzlei" },
    spotlight: { image: "/images/demo/steuerkanzlei.jpg", href: "/portfolio", demo: "steuerkanzlei" },
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
    demo: "friseur",
    portfolio: ["demo-friseur", "demo-restaurant", "demo-werkstatt"],
    blog: ["treatwell-alternative", "buchungssystem-friseur-ohne-provision", "was-kostet-eine-website"],
    hero: { image: "/images/demo/friseur.jpg", frame: "browser", url: "taswiq-media.de/demo/friseur" },
    spotlight: { image: "/images/demo/friseur.jpg", href: "/portfolio", demo: "friseur" },
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
    demo: "handwerk",
    portfolio: ["demo-handwerk", "demo-steuerkanzlei", "taswiq-system"],
    blog: ["digitalisierung-handwerk-foerderung", "handwerkersoftware-kleinbetriebe", "software-fuer-handwerker-und-dienstleister", "unternehmens-dashboard-kennzahlen"],
    hero: { image: "/images/demo/handwerk.jpg", frame: "browser", url: "taswiq-media.de/demo/handwerk" },
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
    demo: "handwerk",
    portfolio: ["demo-handwerk", "demo-steuerkanzlei", "taswiq-system"],
    blog: ["individualsoftware-vs-standardsoftware", "software-entwickeln-lassen-kosten", "individualsoftware-mittelstand-kosten", "software-mit-ki-entwickeln"],
    hero: { image: "/images/demo/handwerk.jpg", frame: "browser", url: "taswiq-media.de/demo/handwerk" },
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
    demo: "restaurant",
    portfolio: ["demo-restaurant", "il-forno", "mangal"],
    blog: ["qr-code-bestellsystem", "bestellsystem-baeckerei", "eigenes-bestellsystem-statt-lieferando", "saas-abo-oder-eigene-software"],
    hero: { image: "/images/demo/restaurant.jpg", frame: "browser", url: "taswiq-media.de/demo/restaurant" },
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
    demo: "friseur",
    portfolio: ["demo-friseur", "demo-werkstatt", "demo-restaurant"],
    blog: ["online-buchungssystem-fuer-kurse", "treatwell-alternative", "buchungssystem-physiotherapie", "buchungssystem-friseur-ohne-provision", "digitalisierung-autohaus-fahrschule"],
    hero: { image: "/images/demo/friseur.jpg", frame: "browser", url: "taswiq-media.de/demo/friseur" },
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
    demo: "steuerkanzlei",
    portfolio: ["demo-steuerkanzlei", "demo-immobilien", "demo-werkstatt"],
    blog: ["kundenportal-erstellen-lassen", "software-entwickeln-lassen-kosten", "web-app-oder-native-app", "mandantenportal-steuerberater"],
    hero: { image: "/images/demo/steuerkanzlei.jpg", frame: "browser", url: "taswiq-media.de/demo/steuerkanzlei" },
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
    portfolio: ["taswiq-system", "demo-restaurant", "demo-handwerk"],
    blog: ["unternehmens-dashboard-kennzahlen", "ki-automatisierung-mittelstand"],
    hero: { image: "/images/demo/handwerk.jpg", frame: "mock" },
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
    portfolio: ["reviews", "taswiq-system", "demo-steuerkanzlei"],
    blog: ["ki-telefonassistent-kosten", "ki-automatisierung-mittelstand", "software-mit-ki-entwickeln"],
    hero: { image: "/images/demo/steuerkanzlei.jpg", frame: "mock" },
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
    demo: "immobilien",
    portfolio: ["demo-immobilien", "demo-friseur", "demo-restaurant"],
    blog: ["website-erstellen-lassen-monatliche-kosten", "was-kostet-eine-website", "saas-abo-oder-eigene-software"],
    hero: { image: "/images/demo/immobilien.jpg", frame: "browser", url: "taswiq-media.de/demo/immobilien" },
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
    portfolio: ["dj-presskits", "motion-reel", "agile", "zuan-yuan"],
    blog: ["aftermovie-premium-festivalfilm"],
    hero: { image: "/images/showreel-poster.jpg", frame: "photo" },
  },
];

export const industryPages = seoPages.filter((p) => p.kind === "branche");
export const servicePages = seoPages.filter((p) => p.kind === "leistung");
export const mediaPage = seoPages.find((p) => p.kind === "media")!;

/** Dropdowns der Hauptnavigation: nav-Key (config/site.ts) → verlinkte Seiten. Labels: messages → nav.menus.<key>.items.<id> */
export const navMenus: Record<string, SeoPage[] | undefined> = {
  services: [...servicePages, mediaPage],
  industries: [...industryPages, mediaPage],
};

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
