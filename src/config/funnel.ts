/**
 * 4-Schritte-Funnel nach asapmarketing.de (#contact): Vorhaben → Status → Budget → Kontakt.
 * IDs sind identisch mit den Postgres-Enums in supabase/migrations – nicht umbenennen,
 * ohne die Migration anzupassen. Labels: messages → funnel.
 */

export type FunnelIndustry = "gastro" | "musik" | "andere";
export type InterestId =
  | "aftermovie"
  | "reels"
  | "foto"
  | "social"
  | "ki_content"
  | "automation"
  | "web"
  | "musikvideo"
  | "unsicher";
export type ProjectStatus = "neustart" | "gelegentlich" | "regelmaessig" | "projekt" | "dringend";
export type BudgetBracket = "unter_1k" | "1k_2_5k" | "2_5k_5k" | "ueber_5k" | "keine_angabe";
export type LeadTier = "starter" | "growth" | "premium";
export type LeadSource = "funnel" | "rechner" | "ki_seite" | "branchen_seite";

export const funnelIndustries: FunnelIndustry[] = ["gastro", "musik", "andere"];

/** Icons werden in der Komponente per ID gemappt (Lucide) – keine Emojis. */
export const interests: InterestId[] = ["aftermovie", "reels", "foto", "social", "ki_content", "automation", "web", "musikvideo", "unsicher"];

export const projectStatuses: ProjectStatus[] = ["neustart", "gelegentlich", "regelmaessig", "projekt", "dringend"];

export const budgetBrackets: { id: BudgetBracket; wide?: boolean }[] = [
  { id: "unter_1k" },
  { id: "1k_2_5k" },
  { id: "2_5k_5k" },
  { id: "ueber_5k" },
  { id: "keine_angabe", wide: true },
];

/** Welche Budget-Stufe passt zu einer Preisspanne aus dem Rechner? (Mittelwert) */
export function bracketForRange(min: number, max: number): BudgetBracket {
  const mid = (min + max) / 2;
  if (mid < 1000) return "unter_1k";
  if (mid < 2500) return "1k_2_5k";
  if (mid < 5000) return "2_5k_5k";
  return "ueber_5k";
}

/**
 * Starter-Pakete – Abschluss-Screen für Leads mit "Unter 1.000 €".
 * Produktisiert, ohne Erstgespräch buchbar. Preise der Speisekarte stammen aus der Rechnung.
 * Texte: funnel.starter.<id>
 */
export type StarterPackageId =
  | "gastro-menu"
  | "gastro-photo"
  | "gastro-reels"
  | "musik-visualizer"
  | "musik-shooting"
  | "musik-promo"
  | "andere-photo"
  | "andere-reels"
  | "andere-workflow";

export const starterPackages: Record<FunnelIndustry, { id: StarterPackageId; price: number }[]> = {
  gastro: [
    { id: "gastro-menu", price: 199 },
    { id: "gastro-photo", price: 390 },
    { id: "gastro-reels", price: 490 },
  ],
  musik: [
    { id: "musik-visualizer", price: 290 },
    { id: "musik-shooting", price: 390 },
    { id: "musik-promo", price: 390 },
  ],
  andere: [
    { id: "andere-photo", price: 390 },
    { id: "andere-reels", price: 490 },
    { id: "andere-workflow", price: 490 },
  ],
};
