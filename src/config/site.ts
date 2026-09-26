/**
 * Zentrale Stammdaten der Agentur.
 * Alles, was in Metadata, JSON-LD, Footer und E-Mails auftaucht, kommt von hier.
 *
 * TODO vor dem Launch:
 *  - `url` auf die finale Domain setzen (bzw. NEXT_PUBLIC_SITE_URL)
 *  - `address` + `geo` ausfüllen → erst dann wird das LocalBusiness-Schema vollständig
 *  - `social`-Profile eintragen (werden als `sameAs` ins JSON-LD übernommen)
 */
export const site = {
  name: "TasWiq Media.",
  shortName: "TasWiq",
  legalName: "TasWiq Media. – Karim Azzaoui",
  owner: "Karim Azzaoui",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://taswiq-media.de").replace(/\/$/, ""),
  locale: "de_DE",
  email: "karim@azzaoui.de",
  phone: "+49 162 2035499",
  phoneHref: "tel:+491622035499",
  whatsappHref: "https://wa.me/491622035499",
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "",

  address: {
    street: "", // z. B. "Musterstraße 1"
    postalCode: "",
    city: "", // z. B. "Köln"
    region: "", // z. B. "NRW"
    country: "DE",
  },
  /** Koordinaten des Standorts – verbessert lokale Rankings (Google Maps Pack) */
  geo: null as null | { lat: number; lng: number },
  areaServed: ["Deutschland", "Österreich", "Schweiz"],
  priceRange: "€€",

  social: {
    instagram: "",
    tiktok: "",
    youtube: "",
    linkedin: "",
  },

  /** Aus der Rechnung übernommen – Kleinunternehmerregelung */
  vatNote: "Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.",

  /** Showreel für den Hero (MP4 in /public/videos, ~17 s, stumm). Leer = nur Standbild. */
  heroVideo: "/videos/showreel.mp4" as string,
} as const;

/** Navigation wie bei asap: Sektionen der Startseite + zwei eigene Unterseiten */
export const nav = [
  { href: "/#home", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#ki", label: "KI-Lösungen" },
  { href: "/content-pipeline", label: "Content-Pipeline" },
  { href: "/#ablauf", label: "Ablauf" },
  { href: "/preisrechner", label: "Preisrechner" },
] as const;

export function sameAs(): string[] {
  return Object.values(site.social).filter(Boolean);
}

export function hasAddress(): boolean {
  return Boolean(site.address.street && site.address.city && site.address.postalCode);
}
