import type { CalculatorRequest, LeadEventRow, LeadRow } from "@/types/database";

/**
 * Demo-Daten fürs Dashboard, solange Supabase lokal nicht verbunden ist.
 * Fiktive Leads (Beispiel-Namen, example.com) – erscheinen nie in Produktion.
 */
const base = Date.parse("2026-09-26T10:00:00Z");
const ago = (h: number) => new Date(base - h * 3_600_000).toISOString();

type Seed = Partial<LeadRow> & Pick<LeadRow, "name" | "industry" | "budget" | "tier" | "status" | "score" | "source">;
const seeds: Seed[] = [
  { name: "Mara Beispiel", company: "Trattoria Beispiel", industry: "gastro", budget: "1k_2_5k", tier: "growth", status: "neu", score: 58, source: "funnel", interests: ["reels", "foto"], project_status: "regelmaessig" },
  { name: "Jonas Muster", company: "Open Air Musterstadt", industry: "musik", budget: "ueber_5k", tier: "premium", status: "angebot", score: 88, source: "funnel", interests: ["aftermovie", "ki_content"], project_status: "projekt", estimate_min: 5200, estimate_max: 6800, deal_value: null },
  { name: "Lea Demo", company: "Café Demo", industry: "gastro", budget: "unter_1k", tier: "starter", status: "kontaktiert", score: 31, source: "funnel", interests: ["web"], project_status: "neustart" },
  { name: "Ali Test", company: "Club Testhaus", industry: "musik", budget: "2_5k_5k", tier: "premium", status: "verhandlung", score: 74, source: "rechner", interests: ["aftermovie", "foto"], estimate_min: 3550, estimate_max: 4650 },
  { name: "Sophie Probe", company: "Bistro Probe", industry: "gastro", budget: "2_5k_5k", tier: "growth", status: "gewonnen", score: 63, source: "rechner", interests: ["reels", "social"], estimate_min: 2150, estimate_max: 2800, deal_value: 2490 },
  { name: "Tim Platzhalter", company: "Platzhalter Events", industry: "andere", budget: "keine_angabe", tier: "growth", status: "neu", score: 29, source: "ki_seite", interests: ["automation"], project_status: "gelegentlich" },
  { name: "Nora Sample", company: "Sample Rooftop Bar", industry: "gastro", budget: "ueber_5k", tier: "premium", status: "neu", score: 91, source: "branchen_seite", interests: ["reels", "foto", "social", "web"], project_status: "dringend" },
  { name: "Ben Beispiel", company: "Beispiel Records", industry: "musik", budget: "1k_2_5k", tier: "growth", status: "verloren", score: 47, source: "funnel", interests: ["musikvideo"] },
  { name: "Emma Muster", company: "Muster Catering", industry: "gastro", budget: "unter_1k", tier: "starter", status: "gewonnen", score: 36, source: "funnel", interests: ["foto"], project_status: "regelmaessig", deal_value: 390 },
  { name: "Can Demo", company: "Demo Burger", industry: "gastro", budget: "1k_2_5k", tier: "growth", status: "angebot", score: 66, source: "rechner", interests: ["reels", "web"], estimate_min: 1400, estimate_max: 1850 },
];

export const demoLeads: LeadRow[] = seeds.map((s, i) => ({
  id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  created_at: ago(i * 19 + 2),
  updated_at: ago(i * 7),
  email: `${s.name.split(" ")[0].toLowerCase()}@example.com`,
  phone: i % 2 ? "+49 170 0000000" : null,
  company: null,
  message: i % 3 === 0 ? "Wir eröffnen im November und brauchen Content für den Launch." : null,
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
  industry: i % 3 ? "gastro" : "musik",
  service_ids: [["video"], ["video", "foto"], ["web"], ["video", "ki"], ["foto"], ["video", "foto", "web"], ["ki"], ["video"]][i],
  state: {},
  summary: [],
  line_items: {},
  estimate_min: [1700, 2450, 650, 2900, 700, 3400, 450, 3300][i],
  estimate_max: [2250, 3200, 850, 3800, 950, 4450, 600, 4350][i],
  monthly_total: [0, 790, 19, 49, 0, 1490, 49, 0][i],
  pricing_version: "2026-09",
  utm: {},
  referrer: null,
  converted_lead_id: i % 3 === 0 ? `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}` : null,
}));
