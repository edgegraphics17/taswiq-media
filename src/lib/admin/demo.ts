import type { AnalyticsData, CalculatorRequest, LeadEventRow, LeadRow, TaskRow, TeamState } from "@/types/database";
import { DEPARTMENT_IDS } from "@/config/team";

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

const task = (i: number, t: Partial<TaskRow> & Pick<TaskRow, "title" | "category" | "priority">): TaskRow => ({
  id: `20000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  key: null,
  why: "Demo-Aufgabe – im echten Dashboard steht hier, warum das Umsatz bringt.",
  steps: "Schritt 1\nSchritt 2\nSchritt 3",
  effort: "M",
  status: "offen",
  source: "claude",
  created_at: ago(i * 5),
  updated_at: ago(i * 5),
  done_at: null,
  executor: "claude",
  run_state: null,
  run_input: null,
  run_note: null,
  run_requested_at: null,
  department: "entwicklung",
  proposed_by: null,
  requested_by: null,
  risk: "niedrig",
  ...t,
});
export const demoTasks: TaskRow[] = [
  task(1, { title: "Lead-Benachrichtigung einrichten", category: "workflows", priority: 1, status: "in_arbeit" }),
  task(2, { title: "Google Search Console verbinden", category: "seo", priority: 1 }),
  task(3, { title: "Impressum mit Anschrift vervollständigen", category: "risiken", priority: 1 }),
  task(4, { title: "Drei Referenz-Fallstudien mit Zahlen", category: "angebote", priority: 2, source: "karim" }),
  task(5, { title: "Cookie-Banner einbauen", category: "fehlt", priority: 1, status: "erledigt", done_at: ago(1) }),
];

export function demoAnalytics(days: number): AnalyticsData {
  const daily = Array.from({ length: days }).map((_, i) => {
    const visitors = 18 + ((i * 7) % 23) + (i % 7 === 5 ? -9 : 0);
    return { day: new Date(base - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10), visitors, views: Math.round(visitors * 2.3) };
  });
  const visitors = daily.reduce((s, d) => s + d.visitors, 0);
  const share = (p: number) => Math.round(visitors * p);
  return {
    days,
    since: daily[0].day,
    totals: { visitors, views: daily.reduce((s, d) => s + d.views, 0) },
    daily,
    pages: [["/", 0.52], ["/preisrechner", 0.21], ["/portfolio", 0.14], ["/leistungen/bestellsystem-gastronomie", 0.09], ["/blog", 0.06]].map(([path, p]) => ({ path: path as string, visitors: share(p as number), views: share((p as number) * 1.4) })),
    channels: [["suche", 0.41], ["direkt", 0.27], ["social", 0.19], ["ki", 0.07], ["verweis", 0.06]].map(([channel, p]) => ({ channel: channel as string, visitors: share(p as number), views: share((p as number) * 2) })),
    sources: [["google.com", "suche", 0.38], ["direkt", "direkt", 0.27], ["instagram.com", "social", 0.15], ["chatgpt.com", "ki", 0.05], ["bing.com", "suche", 0.03]].map(([source, channel, p]) => ({ source: source as string, channel: channel as string, visitors: share(p as number) })),
    campaigns: [{ campaign: "herbst-gastro", visitors: share(0.08) }],
    devices: [{ device: "mobil", visitors: share(0.63) }, { device: "desktop", visitors: share(0.34) }, { device: "tablet", visitors: share(0.03) }],
    locales: [{ locale: "de", visitors: share(0.9) }, { locale: "en", visitors: share(0.1) }],
    events: [{ name: "rechner_schritt", n: share(0.4), visitors: share(0.16) }, { name: "rechner_ergebnis", n: share(0.09), visitors: share(0.08) }, { name: "funnel_step", n: share(0.12), visitors: share(0.06) }, { name: "generate_lead", n: share(0.02), visitors: share(0.02) }],
    leads: demoLeads.length,
    calculations: demoCalcRequests.length,
  };
}

export const demoTeam: TeamState = {
  settings: { team_active: "0", autonomy: "freigabe", max_tasks_per_day: "3" },
  running: null,
  departments: DEPARTMENT_IDS.map((id, i) => ({ id, queued: i === 1 ? 2 : 0, starts_today: i === 2 ? 1 : 0, last_plan_at: null, last_event: null })),
  events: [
    { id: 2, created_at: ago(1), agent: "wachstum", kind: "fertig", task_id: null, text: "Erledigt: Ratgeber „Bestellsystem für Bäckereien“ veröffentlicht", task_title: null },
    { id: 1, created_at: ago(2), agent: "wachstum", kind: "start", task_id: null, text: "Beginnt: Ratgeber „Bestellsystem für Bäckereien“", task_title: null },
  ],
};
