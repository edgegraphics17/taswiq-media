/**
 * 4-Schritte-Funnel nach asapmarketing.de (#contact): Vorhaben → Status → Budget → Kontakt.
 * IDs sind identisch mit den Postgres-Enums in supabase/migrations – nicht umbenennen,
 * ohne die Migration anzupassen. Labels: messages → funnel.
 *
 * Fokus seit 2026-09: Software & Systeme für KMU und Mittelstand. Media (Video, Foto)
 * bleibt als Premium-Leistung für Events, Festivals und Artists buchbar.
 */

/** Branchen-Obergruppen – spiegeln die Branchen-Landingpages (config/seo-pages.ts) */
export type FunnelIndustry = "gastro" | "immobilien" | "automotive" | "kanzlei" | "beauty" | "handwerk" | "musik" | "andere";

/**
 * Interessen. Die ersten zehn zeigt der Funnel; die übrigen IDs bleiben gültig,
 * damit ältere Leads aus der Content-Zeit lesbar bleiben.
 */
export type InterestId =
  | "software"
  | "bestellsystem"
  | "buchungssystem"
  | "webapp"
  | "dashboard"
  | "app"
  | "web"
  | "automation"
  | "media"
  | "unsicher"
  // Legacy (Content-Zeit)
  | "aftermovie"
  | "reels"
  | "foto"
  | "social"
  | "ki_content"
  | "musikvideo";

export type ProjectStatus = "neustart" | "gelegentlich" | "regelmaessig" | "projekt" | "dringend";
/** Budget-Stufen, die der Funnel anbietet */
export type FunnelBudget = "unter_5k" | "5k_15k" | "15k_40k" | "ueber_40k" | "keine_angabe";
/** Inkl. Legacy-Stufen aus der Content-Zeit (Bestands-Leads, Dashboard) */
export type BudgetBracket = FunnelBudget | "unter_1k" | "1k_2_5k" | "2_5k_5k" | "ueber_5k";
export type LeadTier = "starter" | "growth" | "premium";
export type LeadSource = "funnel" | "rechner" | "ki_seite" | "branchen_seite" | "blog" | "portfolio";

export const funnelIndustries: FunnelIndustry[] = ["gastro", "immobilien", "automotive", "kanzlei", "beauty", "handwerk", "musik", "andere"];

export const interests: InterestId[] = ["software", "bestellsystem", "buchungssystem", "webapp", "dashboard", "app", "web", "automation", "media", "unsicher"];
export const legacyInterests: InterestId[] = ["aftermovie", "reels", "foto", "social", "ki_content", "musikvideo"];

export const projectStatuses: ProjectStatus[] = ["neustart", "gelegentlich", "regelmaessig", "projekt", "dringend"];

export const budgetBrackets: { id: FunnelBudget; wide?: boolean }[] = [
  { id: "unter_5k" },
  { id: "5k_15k" },
  { id: "15k_40k" },
  { id: "ueber_40k" },
  { id: "keine_angabe", wide: true },
];

/** Welche Budget-Stufe passt zu einer Preisspanne aus dem Rechner? (Mittelwert) */
export function bracketForRange(min: number, max: number): FunnelBudget {
  const mid = (min + max) / 2;
  if (mid < 5000) return "unter_5k";
  if (mid < 15000) return "5k_15k";
  if (mid < 40000) return "15k_40k";
  return "ueber_40k";
}

/**
 * Starter-Pakete – Abschluss-Screen für Leads mit "Unter 5.000 €".
 * Produktisiert, mit festem Einstiegspreis. Texte: funnel.starter.<id>
 */
export type StarterPackageId = "prototyp" | "website-start" | "bestell-start" | "buchung-start" | "ki-start";

export const starterPrices: Record<StarterPackageId, number> = {
  prototyp: 990,
  "ki-start": 1290,
  "website-start": 1490,
  "buchung-start": 2900,
  "bestell-start": 3900,
};

export const starterPackages: Record<FunnelIndustry, StarterPackageId[]> = {
  gastro: ["bestell-start", "website-start", "prototyp"],
  immobilien: ["website-start", "ki-start", "prototyp"],
  automotive: ["buchung-start", "website-start", "prototyp"],
  kanzlei: ["buchung-start", "ki-start", "prototyp"],
  beauty: ["buchung-start", "website-start", "prototyp"],
  handwerk: ["website-start", "ki-start", "prototyp"],
  musik: ["website-start", "ki-start", "prototyp"],
  andere: ["website-start", "ki-start", "prototyp"],
};
