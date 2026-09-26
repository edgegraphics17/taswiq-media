import type { BudgetBracket, FunnelIndustry, InterestId, LeadSource, LeadTier, ProjectStatus } from "@/config/funnel";

/**
 * Lead-Scoring – entscheidet, welchen Abschluss-Screen ein Lead sieht und wie
 * n8n ihn behandelt. Läuft im Browser (sofortiges UI) UND auf dem Server
 * (gespeicherter Wert – der Client-Score wird nie übernommen).
 *
 *  Tier-Regeln (in dieser Reihenfolge):
 *   1. Budget "Unter 1.000 €"                        → starter  (Standard-Pakete, Self-Service)
 *   2. Budget "Über 5.000 €"                         → premium  (direkte Terminbuchung / Calendly)
 *   3. Budget 2.500–5.000 € + Termin/dringend + Score ≥ 70 → premium
 *   4. alles andere                                  → growth   (Angebot in 24 h)
 */

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
  unter_1k: 5,
  "1k_2_5k": 20,
  "2_5k_5k": 35,
  ueber_5k: 50,
  keine_angabe: 12,
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

  // Kernnische = passende Referenzen, höhere Abschlusswahrscheinlichkeit
  if (input.industry !== "andere") add(8, "Kernbranche");

  const concrete = input.interests.filter((i) => i !== "unsicher");
  add(Math.min(concrete.length, 3) * 3, `${concrete.length} Leistungen`);
  // KI = Upsell-Potenzial Richtung Retainer
  if (concrete.some((i) => i === "ki_content" || i === "automation")) add(4, "KI-Interesse");

  if (input.hasPhone) add(5, "Telefon angegeben");
  if (input.hasCompany) add(4, "Firma angegeben");

  score = Math.max(0, Math.min(100, score));

  let tier: LeadTier = "growth";
  if (input.budget === "unter_1k") tier = "starter";
  else if (input.budget === "ueber_5k") tier = "premium";
  else if (
    input.budget === "2_5k_5k" &&
    (input.projectStatus === "projekt" || input.projectStatus === "dringend" || input.source === "rechner") &&
    score >= 70
  ) {
    tier = "premium";
  }

  return { score, tier, reasons };
}
