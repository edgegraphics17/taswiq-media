/**
 * Umsatzziel und der Weg dorthin – Grundlage für das Arbeits-Dashboard (/admin/aufgaben).
 * Die Quoten sind Annahmen zum Start (Stand 10/2026, noch ohne eigene Erfahrungswerte):
 * sobald echte Zahlen da sind, hier anpassen – das Dashboard rechnet Soll-Werte daraus.
 */
export const goal = {
  /** Ziel: Umsatz pro Monat in € */
  monthly: 10_000,
  /** Ø Auftragswert: Bestell-/Buchungssysteme und Portale liegen meist bei 2.200–7.400 € */
  avgDeal: 4_000,
  /** Anteil der Anfragen, aus denen ein Auftrag wird */
  leadToDeal: 0.25,
  /** Anteil der Website-Besucher, die anfragen */
  visitorToLead: 0.02,
  /** Zwischenziele (Umsatz pro Monat) – jede Stufe ist ein eigener Erfolg */
  milestones: [
    { value: 1, label: "Erster Auftrag" },
    { value: 2_500, label: "2.500 €" },
    { value: 5_000, label: "5.000 €" },
    { value: 10_000, label: "10.000 €" },
  ],
} as const;

/** Was es pro Monat braucht, um das Ziel zu erreichen (aus den Annahmen oben). */
export function goalNeeds() {
  const deals = Math.ceil(goal.monthly / goal.avgDeal);
  const leads = Math.ceil(deals / goal.leadToDeal);
  const visitors = Math.ceil(leads / goal.visitorToLead / 50) * 50;
  return { deals, leads, visitors };
}
