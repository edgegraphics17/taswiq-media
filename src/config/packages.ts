import type { InterestId } from "@/config/funnel";

/**
 * Pakete – Einstiegspreise in € (Kleinunternehmer, § 19 UStG). Texte: messages → packages.<id>
 *
 *  Software (Hauptgeschäft): Website · Bestell-/Buchungssystem · Individuelle Software
 *  Premium-Media (bewusst wenige Angebote): Festival & Event · Artist · Brand-Film
 *
 * `from: true` → Preis wird als "ab …" angezeigt (Umfang bestimmt der Workshop).
 */
export type SoftwarePackageId = "website" | "system" | "custom";
export type MediaPackageId = "festival" | "artist" | "brand";
export type PackageId = SoftwarePackageId | MediaPackageId;

export interface PackageDef {
  id: PackageId;
  price: number;
  billing: "once" | "monthly";
  from?: boolean;
  interest: InterestId;
  featured?: boolean;
}

export const softwarePackages: PackageDef[] = [
  { id: "website", price: 1190, billing: "once", from: true, interest: "web" },
  { id: "system", price: 2200, billing: "once", from: true, interest: "bestellsystem", featured: true },
  { id: "custom", price: 4900, billing: "once", from: true, interest: "software" },
];

export const mediaPackages: PackageDef[] = [
  { id: "brand", price: 2990, billing: "once", from: true, interest: "media" },
  { id: "artist", price: 3490, billing: "once", from: true, interest: "media" },
  { id: "festival", price: 4900, billing: "once", from: true, interest: "media", featured: true },
];

/**
 * Einstiege der Branchenseiten (Texte: messages → seoPages.<branche>.packages.items.<id>).
 * Preise folgen der Preis-Matrix in config/pricing.ts; `icon` = ID aus components/ui/Icon.tsx,
 * `highlight` = empfohlenes Paket.
 */
type IndustryPack = { id: string; price: number; icon: string };
export const industryPackages: Record<"gastro" | "immobilien" | "automotive" | "kanzlei" | "beauty" | "handwerk", { highlight: string; items: IndustryPack[] }> = {
  gastro: {
    highlight: "pro",
    items: [
      { id: "start", price: 2900, icon: "cart" },
      { id: "pro", price: 4900, icon: "chef" },
      { id: "standorte", price: 7900, icon: "building" },
    ],
  },
  immobilien: {
    highlight: "portal",
    items: [
      { id: "vermarktung", price: 3900, icon: "target" },
      { id: "portal", price: 7400, icon: "lock" },
      { id: "plattform", price: 10900, icon: "layers" },
    ],
  },
  automotive: {
    highlight: "app",
    items: [
      { id: "termine", price: 2200, icon: "calendar" },
      { id: "app", price: 3900, icon: "smartphone" },
      { id: "plattform", price: 10900, icon: "layers" },
    ],
  },
  kanzlei: {
    highlight: "portal",
    items: [
      { id: "onboarding", price: 3900, icon: "calendar" },
      { id: "portal", price: 7400, icon: "lock" },
      { id: "plattform", price: 12900, icon: "workflow" },
    ],
  },
  beauty: {
    highlight: "pro",
    items: [
      { id: "start", price: 2200, icon: "calendar" },
      { id: "pro", price: 3900, icon: "star" },
      { id: "team", price: 6400, icon: "users" },
    ],
  },
  handwerk: {
    highlight: "auftrag",
    items: [
      { id: "angebot", price: 4900, icon: "file" },
      { id: "auftrag", price: 10900, icon: "wrench" },
      { id: "plattform", price: 18900, icon: "layers" },
    ],
  },
};

/**
 * Stufen & Zusatzmodule der Leistungsseiten – Preise aus der Preis-Matrix (config/pricing.ts).
 * Texte der Stufen: messages → seoPages.<leistung>.tiers.items.<id>, der Extras: servicePage.extras.labels.<id>.
 */
type Priced = { id: string; price: number };
export const serviceOffers: Record<"individualsoftware" | "bestellsystem" | "buchungssystem" | "webapp" | "dashboard" | "ki" | "website", { highlight: string; tiers: Priced[]; extras: Priced[] }> = {
  bestellsystem: {
    highlight: "pro",
    tiers: [{ id: "start", price: 2900 }, { id: "pro", price: 4900 }, { id: "filialen", price: 7900 }],
    extras: [{ id: "whatsapp", price: 590 }, { id: "mehrsprachig", price: 690 }, { id: "schnittstellen", price: 1490 }, { id: "bewertungen", price: 590 }, { id: "migration", price: 990 }, { id: "seo", price: 490 }],
  },
  buchungssystem: {
    highlight: "pro",
    tiers: [{ id: "start", price: 2200 }, { id: "pro", price: 3900 }, { id: "team", price: 6400 }],
    extras: [{ id: "zahlung", price: 890 }, { id: "whatsapp", price: 590 }, { id: "mehrsprachig", price: 690 }, { id: "migration", price: 990 }, { id: "telefon", price: 1490 }, { id: "gmb", price: 190 }],
  },
  webapp: {
    highlight: "portal",
    tiers: [{ id: "pwa", price: 3900 }, { id: "portal", price: 7400 }, { id: "workflows", price: 12900 }],
    extras: [{ id: "zahlung", price: 890 }, { id: "schnittstellen", price: 1490 }, { id: "ki", price: 1490 }, { id: "mehrsprachig", price: 690 }, { id: "whatsapp", price: 590 }, { id: "migration", price: 990 }],
  },
  dashboard: {
    highlight: "dashboard",
    tiers: [{ id: "report", price: 890 }, { id: "dashboard", price: 4900 }, { id: "pro", price: 8900 }],
    extras: [{ id: "schnittstellen", price: 1490 }, { id: "ki", price: 1490 }, { id: "whatsapp", price: 590 }, { id: "migration", price: 990 }],
  },
  individualsoftware: {
    highlight: "m",
    tiers: [{ id: "s", price: 10900 }, { id: "m", price: 18900 }, { id: "l", price: 29900 }],
    extras: [{ id: "zahlung", price: 890 }, { id: "schnittstellen", price: 1490 }, { id: "ki", price: 1490 }, { id: "mehrsprachig", price: 690 }, { id: "whatsapp", price: 590 }, { id: "migration", price: 990 }],
  },
  ki: {
    highlight: "anfragen",
    tiers: [{ id: "bewertungen", price: 590 }, { id: "anfragen", price: 990 }, { id: "telefon", price: 1490 }],
    extras: [{ id: "dokumente", price: 1290 }, { id: "chatbot", price: 1190 }, { id: "reporting", price: 890 }],
  },
  website: {
    highlight: "business",
    tiers: [{ id: "onepager", price: 1190 }, { id: "business", price: 1990 }, { id: "pro", price: 3490 }],
    extras: [{ id: "seo", price: 490 }, { id: "geo", price: 390 }, { id: "gmb", price: 190 }, { id: "texte", price: 490 }, { id: "mehrsprachig", price: 690 }, { id: "chatbot", price: 1190 }],
  },
};

export const allPackages = [...softwarePackages, ...mediaPackages];

/** Laufender Betrieb (monatlich) – auf allen Software-Seiten als Hinweis */
export const runningCosts = { hosting: 49, betrieb: 149, wachstum: 490 } as const;

/**
 * Miet-Modell: jede Software gibt es statt zum Einmalpreis auch im Abo.
 *  - Rate = Einmalpreis verteilt auf `spreadMonths` + laufender Betrieb (Hosting, Wartung, Support, Updates inklusive)
 *  - `trialMonths` Testzeit (monatlich kündbar), danach `minTermMonths` Mindestlaufzeit
 * Kleine Projekte (< 2.000 €) und Websites rechnen mit Hosting statt vollem Betrieb.
 * Die Zahlen hier steuern alle Mietpreise der Seite – Texte: messages → packages.rent.
 */
export const rental = { trialMonths: 3, minTermMonths: 12, spreadMonths: 24, setupFee: 0 } as const;

/** Monatliche Miete zu einem Einmalpreis, auf "…9" gerundet (3.900 € → 309 €/Monat). */
export function rentPerMonth(price: number, ops: number = price < 2000 ? runningCosts.hosting : runningCosts.betrieb) {
  return Math.round((price / rental.spreadMonths + ops) / 10) * 10 - 1;
}
