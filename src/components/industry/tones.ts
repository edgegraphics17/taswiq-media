/** Status-Farben der Beispielansichten (Hero-Mock und Modul-Explorer) */
export type Tone = "good" | "brand" | "warn" | "muted";

export const TONES: Record<Tone, string> = {
  good: "bg-mint-500/12 text-[#157a40]",
  brand: "bg-brand-50 text-brand-700",
  warn: "bg-amber-100 text-amber-800",
  muted: "bg-canvas text-muted",
};
