import type { ComponentProps } from "react";
import type { Link } from "@/i18n/navigation";

/**
 * Zentrale Stammdaten der Agentur (sprachunabhängig).
 * Übersetzbare Texte (Claims, USt-Hinweis, Navigation) liegen in messages/{de,en}.json.
 *
 * TODO vor dem Launch:
 *  - `url` auf die finale Domain setzen (bzw. NEXT_PUBLIC_SITE_URL)
 *  - `geo` ausfüllen → erst dann wird das LocalBusiness-Schema vollständig
 *  - `social`-Profile eintragen (werden als `sameAs` ins JSON-LD übernommen)
 */
export const site = {
  name: "TasWiq Media.",
  shortName: "TasWiq",
  legalName: "TasWiq Media. – Karim Azzaoui",
  owner: "Karim Azzaoui",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://taswiq-media.de").replace(/\/$/, ""),
  email: "karim@azzaoui.de",
  phone: "+49 162 2035499",
  phoneHref: "tel:+491622035499",
  whatsappHref: "https://wa.me/491622035499",
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "",

  address: {
    street: "Taunusanlage 8",
    postalCode: "60329",
    city: "Frankfurt am Main",
    region: "Hessen",
    country: "DE",
  },
  /** Koordinaten des Standorts – verbessert lokale Rankings (Google Maps Pack) */
  geo: null as null | { lat: number; lng: number },
  priceRange: "€€",

  social: {
    instagram: "",
    tiktok: "",
    youtube: "",
    linkedin: "",
  },

  /** Showreel der Media-Sektion (MP4 in /public/videos, ~17 s, stumm). Leer = nur Standbild. */
  heroVideo: "/videos/showreel.mp4" as string,

  /**
   * Technologie-Partner: winsym.ai (Kuala Lumpur) liefert KI-Forschung, Modelle & Methodik,
   * TasWiq ist die Agentur – Beratung, Design und Entwicklung passieren in Deutschland.
   */
  partner: {
    name: "winsym.ai",
    url: "https://winsym-ai.vercel.app",
    city: "Kuala Lumpur",
  },
} as const;

/**
 * Bestätigung der Website gegenüber Suchmaschinen per Meta-Tag (Alternative zum DNS-Eintrag):
 * den Code aus der Search Console bzw. den Bing Webmaster Tools in Vercel als Umgebungsvariable hinterlegen.
 */
export const siteVerification = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
};

/** Sprachbewusstes Link-Ziel: interne Route (+ optional Hash/Params) – next-intl übersetzt den Pfad. */
export type AppHref = ComponentProps<typeof Link>["href"];

/** Navigation: erst die Sektionen der Startseite (Sprungmarken), dann die eigenen Unterseiten. Labels: messages → nav.<key> */
export const nav = [
  { key: "services", href: { pathname: "/", hash: "services" } },
  { key: "industries", href: { pathname: "/", hash: "branchen" } },
  { key: "process", href: { pathname: "/", hash: "ablauf" } },
  { key: "portfolio", href: "/portfolio" },
  { key: "blog", href: "/blog" },
  { key: "calculator", href: "/preisrechner" },
] as const satisfies readonly { key: string; href: AppHref }[];

export const contactHref = { pathname: "/", hash: "kontakt" } as const;

export function sameAs(): string[] {
  return Object.values(site.social).filter(Boolean);
}

export function hasAddress(): boolean {
  return Boolean(site.address.street && site.address.city && site.address.postalCode);
}
