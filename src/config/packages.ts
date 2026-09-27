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
  { id: "website", price: 1490, billing: "once", from: true, interest: "web" },
  { id: "system", price: 2900, billing: "once", from: true, interest: "bestellsystem", featured: true },
  { id: "custom", price: 6900, billing: "once", from: true, interest: "software" },
];

export const mediaPackages: PackageDef[] = [
  { id: "brand", price: 2990, billing: "once", from: true, interest: "media" },
  { id: "artist", price: 3490, billing: "once", from: true, interest: "media" },
  { id: "festival", price: 4900, billing: "once", from: true, interest: "media", featured: true },
];

export const allPackages = [...softwarePackages, ...mediaPackages];

/** Laufender Betrieb (monatlich) – auf allen Software-Seiten als Hinweis */
export const runningCosts = { hosting: 49, betrieb: 149, wachstum: 490 } as const;
