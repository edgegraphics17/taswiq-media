import type { LeadStatusEnum } from "@/types/database";

export const STATUS_LABEL: Record<LeadStatusEnum, string> = {
  neu: "Neu",
  kontaktiert: "Kontaktiert",
  angebot: "Angebot raus",
  verhandlung: "Verhandlung",
  gewonnen: "Gewonnen",
  verloren: "Verloren",
  archiviert: "Archiviert",
};

/** Status-Farben: Punkt + Text, nie Farbe allein */
export const STATUS_TONE: Record<LeadStatusEnum, string> = {
  neu: "bg-teal-wash text-teal-deep ring-teal/30",
  kontaktiert: "bg-sky-50 text-sky-800 ring-sky-200",
  angebot: "bg-amber-50 text-amber-800 ring-amber-200",
  verhandlung: "bg-violet-50 text-violet-800 ring-violet-200",
  gewonnen: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  verloren: "bg-rose-50 text-rose-800 ring-rose-200",
  archiviert: "bg-slate-100 text-slate-600 ring-slate-200",
};

export const TIER_LABEL = { starter: "Starter", growth: "Growth", premium: "Premium" } as const;
export const BUDGET_LABEL: Record<string, string> = {
  unter_1k: "< 1.000 €",
  "1k_2_5k": "1.000–2.500 €",
  "2_5k_5k": "2.500–5.000 €",
  ueber_5k: "> 5.000 €",
  keine_angabe: "k. A.",
};
export const SOURCE_LABEL: Record<string, string> = { funnel: "Funnel", rechner: "Rechner", ki_seite: "Pipeline-Seite", branchen_seite: "SEO-Seite" };
