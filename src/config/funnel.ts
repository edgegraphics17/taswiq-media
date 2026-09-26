/**
 * 4-Schritte-Funnel nach asapmarketing.de (#contact): Vorhaben → Status → Budget → Kontakt.
 * IDs sind identisch mit den Postgres-Enums in supabase/migrations – nicht umbenennen,
 * ohne die Migration anzupassen.
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

export const FUNNEL_STEPS = ["Vorhaben", "Status", "Budget", "Kontakt"] as const;

export const funnelIndustries: { id: FunnelIndustry; label: string }[] = [
  { id: "gastro", label: "Gastronomie" },
  { id: "musik", label: "Festival & Musik" },
  { id: "andere", label: "Andere Branche" },
];

/** Icons werden in der Komponente per ID gemappt (Lucide) – keine Emojis. */
export const interests: { id: InterestId; label: string }[] = [
  { id: "aftermovie", label: "Aftermovie / Eventfilm" },
  { id: "reels", label: "Imagefilm & Reels" },
  { id: "foto", label: "Food- & Eventfotografie" },
  { id: "social", label: "Social-Media-Betreuung" },
  { id: "ki_content", label: "KI-Content & Voiceover" },
  { id: "automation", label: "KI-Automatisierung" },
  { id: "web", label: "Website & Speisekarte" },
  { id: "musikvideo", label: "Musikvideo & Artist-Promo" },
  { id: "unsicher", label: "Bin noch unsicher" },
];

export const projectStatuses: { id: ProjectStatus; label: string }[] = [
  { id: "neustart", label: "Neustart – wir haben noch keinen Content" },
  { id: "gelegentlich", label: "Ab und zu Handy-Content, wenig Plan" },
  { id: "regelmaessig", label: "Wir posten regelmäßig, wollen mehr Qualität" },
  { id: "projekt", label: "Konkretes Event oder Projekt mit Termin" },
  { id: "dringend", label: "Dringend – muss in 2 Wochen stehen" },
];

export const budgetBrackets: { id: BudgetBracket; label: string; wide?: boolean }[] = [
  { id: "unter_1k", label: "Unter 1.000 €" },
  { id: "1k_2_5k", label: "1.000 – 2.500 €" },
  { id: "2_5k_5k", label: "2.500 – 5.000 €" },
  { id: "ueber_5k", label: "Über 5.000 €" },
  { id: "keine_angabe", label: "Keine Angabe", wide: true },
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
 */
export const starterPackages: Record<FunnelIndustry, { name: string; price: string; text: string }[]> = {
  gastro: [
    { name: "Digitale Speisekarte", price: "199 €", text: "Mobile Karte mit QR-Codes für Tische & Fenster – jederzeit änderbar." },
    { name: "Food-Foto Express", price: "390 €", text: "2 Stunden vor Ort · 25 bearbeitete Fotos für Karte, Google & Instagram." },
    { name: "Reels aus deinem Material", price: "490 €", text: "Du lieferst Handy-Clips, wir schneiden 10 Reels mit Untertiteln & Musik." },
  ],
  musik: [
    { name: "KI-Visualizer", price: "290 €", text: "Animierter Visualizer für einen Song – in 16:9 und 9:16." },
    { name: "Artist-Shooting", price: "390 €", text: "2 Stunden · 25 bearbeitete Fotos für Press-Kit & Social Media." },
    { name: "Promo-Kit", price: "390 €", text: "5 Reels aus deinem Material · Beat-Sync · Untertitel." },
  ],
  andere: [
    { name: "Foto Express", price: "390 €", text: "2 Stunden vor Ort · 25 bearbeitete Fotos für Web & Social." },
    { name: "Reels aus deinem Material", price: "490 €", text: "Du lieferst Clips, wir schneiden 10 Reels mit Untertiteln & Musik." },
    { name: "KI-Workflow Starter", price: "490 €", text: "Ein automatisierter Ablauf, z. B. Captions oder Bewertungs-Antworten." },
  ],
};
