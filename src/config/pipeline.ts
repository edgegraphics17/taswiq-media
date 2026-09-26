import type { InterestId } from "@/config/funnel";

/**
 * Unterseite /content-pipeline – das Flaggschiff.
 * Aufbau 1:1 nach asapmarketing.de/ki-telefonassistent.html:
 * Hero → Problem → Funktionen → 3 Modi → Für wen → Unsere Rolle → Preise → FAQ → CTA
 * Texte: messages → "pipeline". Hier nur Icons und das Kaufmännische.
 */

/** Icons der 9 Funktionen (Reihenfolge = pipeline.features.items) */
export const pipelineFeatureIcons = ["frame", "zap", "audio", "captions", "message", "refresh", "split", "archive", "chart"] as const;

export type PackageId = "classic" | "aiPromo" | "retainer";

/** Pakete – Endpreise in € (Kleinunternehmer, § 19 UStG). Texte: pipeline.pricing.packages.<id> */
export const pipelinePackages: { id: PackageId; price: number; billing: "once" | "monthly"; interest: InterestId; featured?: boolean }[] = [
  { id: "classic", price: 2490, billing: "once", interest: "aftermovie" },
  { id: "aiPromo", price: 3490, billing: "once", interest: "ki_content", featured: true },
  { id: "retainer", price: 1490, billing: "monthly", interest: "social" },
];
