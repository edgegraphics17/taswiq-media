import type { CalculatorRequest, LeadEventRow, LeadRow } from "@/types/database";

/**
 * Demo-Daten fürs Dashboard, solange das Backend lokal nicht verbunden ist.
 * Fiktive Leads (Beispiel-Namen, example.com) – erscheinen nie in Produktion.
 */
const base = Date.parse("2026-09-26T10:00:00Z");
const ago = (h: number) => new Date(base - h * 3_600_000).toISOString();

type Seed = Partial<LeadRow> & Pick<LeadRow, "name" | "industry" | "budget" | "tier" | "status" | "score" | "source">;
const seeds: Seed[] = [
  { name: "Mara Beispiel", company: "Trattoria Beispiel", industry: "gastro", budget: "unter_5k", tier: "starter", status: "neu", score: 48, source: "funnel", interests: ["bestellsystem", "web"], project_status: "gelegentlich" },
  { name: "Jonas Muster", company: "Muster Immobilien GmbH", industry: "immobilien", budget: "15k_40k", tier: "premium", status: "angebot", score: 86, source: "branchen_seite", interests: ["webapp", "automation"], project_status: "projekt", estimate_min: 16200, estimate_max: 21400, deal_value: null },
  { name: "Lea Demo", company: "Salon Demo", industry: "beauty", budget: "unter_5k", tier: "starter", status: "kontaktiert", score: 39, source: "funnel", interests: ["buchungssystem"], project_status: "gelegentlich" },
  { name: "Ali Test", company: "Autohaus Testmann", industry: "automotive", budget: "5k_15k", tier: "premium", status: "verhandlung", score: 74, source: "rechner", interests: ["buchungssystem", "dashboard"], estimate_min: 9800, estimate_max: 12900 },
  { name: "Sophie Probe", company: "Kanzlei Probe", industry: "kanzlei", budget: "5k_15k", tier: "growth", status: "gewonnen", score: 63, source: "rechner", interests: ["webapp"], estimate_min: 9100, estimate_max: 11900, deal_value: 10900 },
  { name: "Tim Platzhalter", company: "Platzhalter Haustechnik", industry: "handwerk", budget: "keine_angabe", tier: "growth", status: "neu", score: 41, source: "blog", interests: ["software", "automation"], project_status: "regelmaessig" },
  { name: "Nora Sample", company: "Sample Festival", industry: "musik", budget: "5k_15k", tier: "growth", status: "neu", score: 58, source: "portfolio", interests: ["media"], project_status: "projekt" },
  { name: "Ben Beispiel", company: "Beispiel Fahrschule", industry: "automotive", budget: "5k_15k", tier: "growth", status: "verloren", score: 47, source: "funnel", interests: ["app", "buchungssystem"] },
  { name: "Emma Muster", company: "Muster Bäckerei", industry: "gastro", budget: "unter_5k", tier: "starter", status: "gewonnen", score: 44, source: "funnel", interests: ["bestellsystem"], project_status: "gelegentlich", deal_value: 3900 },
  { name: "Can Demo", company: "Demo Logistik GmbH", industry: "andere", budget: "ueber_40k", tier: "premium", status: "angebot", score: 92, source: "rechner", interests: ["software", "dashboard"], estimate_min: 36400, estimate_max: 47700 },
];

export const demoLeads: LeadRow[] = seeds.map((s, i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  created_at: ago(i * 19 + 2),
  updated_at: ago(i * 7),
  email: `${s.name.split(" ")[0].toLowerCase()}@example.com`,
  phone: i % 2 ? "+49 170 0000000" : null,
  company: null,
  message: i % 3 === 0 ? "Wir wollen weg von Excel und WhatsApp-Gruppen – bis Q1 soll ein eigenes System stehen." : null,
  interests: [],
  project_status: null,
  estimate_min: null,
  estimate_max: null,
  monthly_estimate: null,
  calculator_request_id: null,
  score_reasons: ["Demo-Daten"],
  deal_value: null,
  owner_notes: null,
  next_action_at: i % 4 === 0 ? ago(-24) : null,
  last_contacted_at: null,
  consent_at: ago(i * 19 + 2),
  source_meta: { utm_source: i % 2 ? "instagram" : "google" },
  automation: { notified_at: ago(i * 19 + 2), welcome_sent_at: ago(i * 19 + 2) },
  ip_hash: null,
  ...s,
})) as LeadRow[];

export const demoEvents = (leadId: string): LeadEventRow[] => [
  { id: "e1", lead_id: leadId, type: "created", from_status: null, to_status: "neu", body: null, payload: { source: "funnel" }, created_by: null, created_at: ago(40) },
  { id: "e2", lead_id: leadId, type: "automation", from_status: null, to_status: null, body: "Discord-Benachrichtigung & Willkommens-Mail versendet (n8n)", payload: {}, created_by: null, created_at: ago(39.9) },
  { id: "e3", lead_id: leadId, type: "status_change", from_status: "neu", to_status: "kontaktiert", body: null, payload: {}, created_by: null, created_at: ago(30) },
];

export const demoCalcRequests: CalculatorRequest[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  created_at: ago(i * 11 + 1),
  session_id: null,
  industry: (["gastro", "beauty", "immobilien", "automotive", "kanzlei", "handwerk", "gastro", "andere"] as const)[i],
  service_ids: [["bestellung"], ["buchung", "website"], ["portal"], ["buchung", "dashboard"], ["portal", "ki"], ["software"], ["bestellung", "website"], ["software", "dashboard"]][i],
  state: {},
  summary: [],
  line_items: {},
  estimate_min: [5750, 6950, 8900, 11700, 11100, 22400, 8000, 33200][i],
  estimate_max: [7550, 9100, 11700, 15300, 14550, 29400, 10450, 43500][i],
  monthly_total: [149, 149, 49, 149, 490, 490, 149, 490][i],
  pricing_version: "2026-09-software",
  utm: {},
  referrer: null,
  converted_lead_id: i % 3 === 0 ? `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}` : null,
}));
