import type { BudgetBracket, FunnelIndustry, InterestId, LeadSource, LeadTier, ProjectStatus } from "@/config/funnel";

/**
 * Lead-Scoring – entscheidet, welchen Abschluss-Screen ein Lead sieht und wie
 * n8n ihn behandelt. Läuft im Browser (sofortiges UI) UND auf dem Server
 * (gespeicherter Wert – der Client-Score wird nie übernommen).
 *
 *  Tier-Regeln (in dieser Reihenfolge):
 *   1. Budget "Unter 5.000 €"                              → starter  (Einstiegspakete, Prototyp-Sprint)
 *   2. Budget "15.000–40.000 €" oder "Über 40.000 €"       → premium  (Terminwunsch direkt im Abschluss)
 *   3. Budget 5.000–15.000 € + Termin/dringend/Rechner + Score ≥ 70 → premium
 *   4. alles andere                                        → growth   (Angebot in 24 h)
 */

const SYSTEMS: InterestId[] = ["software", "bestellsystem", "buchungssystem", "webapp", "dashboard", "app"];

export interface ScoreInput {
  industry: FunnelIndustry;
  interests: InterestId[];
  projectStatus: ProjectStatus | null;
  budget: BudgetBracket;
  source: LeadSource;
  hasPhone: boolean;
  hasCompany: boolean;
}

export interface ScoreResult {
  score: number;
  tier: LeadTier;
  reasons: string[];
}

const BUDGET_POINTS: Record<BudgetBracket, number> = {
  unter_5k: 10,
  "5k_15k": 30,
  "15k_40k": 45,
  ueber_40k: 55,
  keine_angabe: 12,
  // Legacy-Stufen (Content-Zeit)
  unter_1k: 5,
  "1k_2_5k": 12,
  "2_5k_5k": 18,
  ueber_5k: 30,
};

const STATUS_POINTS: Record<ProjectStatus, number> = {
  neustart: 6,
  gelegentlich: 10,
  regelmaessig: 14,
  projekt: 20,
  dringend: 24,
};

export function scoreLead(input: ScoreInput): ScoreResult {
  const reasons: string[] = [];
  let score = 0;
  const add = (points: number, reason: string) => {
    if (!points) return;
    score += points;
    reasons.push(`${reason} (+${points})`);
  };

  add(BUDGET_POINTS[input.budget], `Budget ${input.budget}`);
  if (input.projectStatus) add(STATUS_POINTS[input.projectStatus], `Status ${input.projectStatus}`);
  // Wer den Rechner durchklickt, hat ein konkretes Projekt im Kopf
  if (input.source === "rechner") add(12, "Kalkulation im Rechner");

  // Zielbranchen mit eigener Landingpage = passende Referenzen & Pakete
  if (input.industry !== "andere") add(8, "Zielbranche");

  const concrete = input.interests.filter((i) => i !== "unsicher");
  add(Math.min(concrete.length, 3) * 3, `${concrete.length} Leistungen`);
  // Systeme = laufender Betrieb, höchster Kundenwert
  if (concrete.some((i) => SYSTEMS.includes(i))) add(6, "System-Projekt");

  if (input.hasPhone) add(5, "Telefon angegeben");
  if (input.hasCompany) add(4, "Firma angegeben");

  score = Math.max(0, Math.min(100, score));

  let tier: LeadTier = "growth";
  if (input.budget === "unter_5k" || input.budget === "unter_1k" || input.budget === "1k_2_5k") tier = "starter";
  else if (input.budget === "15k_40k" || input.budget === "ueber_40k") tier = "premium";
  else if (
    input.budget === "5k_15k" &&
    (input.projectStatus === "projekt" || input.projectStatus === "dringend" || input.source === "rechner") &&
    score >= 70
  ) {
    tier = "premium";
  }

  return { score, tier, reasons };
}
