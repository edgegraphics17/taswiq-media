import "server-only";
import { unstable_cache } from "next/cache";
import { getSeoGoogle } from "@/lib/db";

/**
 * Ads-Modul: Google-Ads- und Meta-Werbekonten, die unsere Zugänge sehen – Kennzahlen je Konto und Kampagne.
 * Zugänge liegen im Backend unter settings.seo_google (Feld `ads` = Google-Ads-OAuth, `metaToken` = Meta-Systemnutzer-Token).
 * Daten werden 15 Minuten zwischengespeichert, die Seite ist also nie älter.
 */

export type AdsKeys = { ads?: { clientId?: string; clientSecret?: string; refreshToken?: string }; metaToken?: string };
export type Metrics = { cost: number; impressions: number; clicks: number; conversions: number };
export type Campaign = Metrics & { id: string; name: string; status: string; result: string };
export type Account = { platform: "google" | "meta"; id: string; name: string; currency: string; total: Metrics; prev: Metrics; campaigns: Campaign[] };

const REVALIDATE = 900;
const GOOGLE_ADS = "https://googleads.googleapis.com/v25";
const GRAPH = "https://graph.facebook.com/v24.0";

export const getAdsKeys = () => getSeoGoogle<AdsKeys>();

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
/** Zeitraum bis gestern und gleich langer Vorzeitraum. */
const ranges = (days: number) => ({ cur: [day(days), day(1)], prev: [day(2 * days), day(days + 1)] });
const zero = (): Metrics => ({ cost: 0, impressions: 0, clicks: 0, conversions: 0 });
const add = (a: Metrics, b: Metrics): Metrics => ({ cost: a.cost + b.cost, impressions: a.impressions + b.impressions, clicks: a.clicks + b.clicks, conversions: a.conversions + b.conversions });

async function json<T>(res: Response, label: string): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(`${label}: ${data.error?.message ?? res.status}`);
  return data;
}

// ─── Google Ads ─────────────────────────────────────────────────────
let gToken: { value: string; until: number } | null = null;

async function googleToken(k: NonNullable<AdsKeys["ads"]>) {
  if (gToken && gToken.until > Date.now()) return gToken.value;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    // Desktop-Client: Secret ist optional.
    body: new URLSearchParams({ client_id: k.clientId!, ...(k.clientSecret ? { client_secret: k.clientSecret } : {}), refresh_token: k.refreshToken!, grant_type: "refresh_token" }),
    cache: "no-store",
  });
  const d = await json<{ access_token: string; expires_in?: number }>(res, "Google-Anmeldung");
  gToken = { value: d.access_token, until: Date.now() + ((d.expires_in ?? 3600) - 120) * 1000 };
  return gToken.value;
}

type GRow = { campaign?: { id: string; name: string; status: string }; customer?: { descriptiveName?: string; currencyCode?: string }; metrics?: { costMicros?: string; impressions?: string; clicks?: string; conversions?: number } };

async function gaql(k: NonNullable<AdsKeys["ads"]>, cid: string, query: string) {
  const res = await fetch(`${GOOGLE_ADS}/customers/${cid}/googleAds:search`, {
    method: "POST",
    headers: { authorization: `Bearer ${await googleToken(k)}`, "content-type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  return (await json<{ results?: GRow[] }>(res, "Google Ads")).results ?? [];
}

const gMetrics = (m: GRow["metrics"] = {}): Metrics => ({ cost: Number(m.costMicros ?? 0) / 1e6, impressions: Number(m.impressions ?? 0), clicks: Number(m.clicks ?? 0), conversions: Number(m.conversions ?? 0) });
const M = "metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions";

async function googleAccounts(k: NonNullable<AdsKeys["ads"]>, days: number): Promise<Account[]> {
  const res = await fetch(`${GOOGLE_ADS}/customers:listAccessibleCustomers`, { headers: { authorization: `Bearer ${await googleToken(k)}` }, cache: "no-store" });
  const ids = ((await json<{ resourceNames?: string[] }>(res, "Google Ads")).resourceNames ?? []).map((r) => r.split("/")[1]);
  const { cur, prev } = ranges(days);
  const during = (r: string[]) => `segments.date BETWEEN '${r[0]}' AND '${r[1]}'`;
  // shortcut: Verwaltungskonten (MCC) und deren Unterkonten werden nicht aufgelöst – nötig, sobald Kunden über ein MCC laufen.
  return Promise.all(
    ids.map(async (cid) => {
      const [info, total, before, camps] = await Promise.all([
        gaql(k, cid, "SELECT customer.descriptive_name, customer.currency_code FROM customer"),
        gaql(k, cid, `SELECT ${M} FROM customer WHERE ${during(cur)}`),
        gaql(k, cid, `SELECT ${M} FROM customer WHERE ${during(prev)}`),
        gaql(k, cid, `SELECT campaign.id, campaign.name, campaign.status, ${M} FROM campaign WHERE ${during(cur)} AND campaign.status != 'REMOVED' ORDER BY metrics.cost_micros DESC`),
      ]);
      return {
        platform: "google" as const,
        id: cid,
        name: info[0]?.customer?.descriptiveName || "Google-Ads-Konto ohne Namen",
        currency: info[0]?.customer?.currencyCode ?? "EUR",
        total: total.map((r) => gMetrics(r.metrics)).reduce(add, zero()),
        prev: before.map((r) => gMetrics(r.metrics)).reduce(add, zero()),
        campaigns: camps.map((r) => ({ id: r.campaign!.id, name: r.campaign!.name, status: r.campaign!.status === "ENABLED" ? "aktiv" : "pausiert", result: "Conversions", ...gMetrics(r.metrics) })),
      };
    }),
  );
}

// ─── Meta ───────────────────────────────────────────────────────────
/** Welche Aktion bei welchem Kampagnenziel als Ergebnis zählt (wie „Ergebnisse“ im Werbeanzeigenmanager). */
const META_RESULT: Record<string, [string, string[]]> = {
  OUTCOME_LEADS: ["Leads", ["lead", "onsite_conversion.lead_grouped", "offsite_conversion.fb_pixel_lead"]],
  LEAD_GENERATION: ["Leads", ["lead", "onsite_conversion.lead_grouped"]],
  OUTCOME_ENGAGEMENT: ["Chats", ["onsite_conversion.messaging_conversation_started_7d", "post_engagement"]],
  MESSAGES: ["Chats", ["onsite_conversion.messaging_conversation_started_7d"]],
  OUTCOME_SALES: ["Käufe", ["omni_purchase", "purchase"]],
  OUTCOME_AWARENESS: ["Reichweite", []],
};
const DEFAULT_RESULT: [string, string[]] = ["LP-Aufrufe", ["landing_page_view", "omni_landing_page_view", "link_click"]];

type MRow = { campaign_id?: string; campaign_name?: string; objective?: string; spend?: string; impressions?: string; clicks?: string; actions?: { action_type: string; value: string }[] };

async function graph<T>(path: string, token: string, params: Record<string, string>) {
  const url = new URL(`${GRAPH}/${path}`);
  url.search = new URLSearchParams({ ...params, access_token: token }).toString();
  return json<T>(await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(20_000) }), "Meta");
}

function metaRow(r: MRow) {
  const [result, types] = META_RESULT[r.objective ?? ""] ?? DEFAULT_RESULT;
  const hit = types.map((t) => r.actions?.find((a) => a.action_type === t)).find(Boolean);
  return { result, cost: Number(r.spend ?? 0), impressions: Number(r.impressions ?? 0), clicks: Number(r.clicks ?? 0), conversions: Number(hit?.value ?? 0) };
}

async function metaAccounts(token: string, days: number): Promise<Account[]> {
  const { data = [] } = await graph<{ data?: { id: string; name: string; currency: string }[] }>("me/adaccounts", token, { fields: "id,name,currency", limit: "100" });
  const { cur, prev } = ranges(days);
  const range = (r: string[]) => JSON.stringify({ since: r[0], until: r[1] });
  const fields = "campaign_id,campaign_name,objective,spend,impressions,clicks,actions";
  return Promise.all(
    data.map(async (a) => {
      const [now, before, status] = await Promise.all([
        graph<{ data?: MRow[] }>(`${a.id}/insights`, token, { level: "campaign", fields, time_range: range(cur), limit: "200" }),
        graph<{ data?: MRow[] }>(`${a.id}/insights`, token, { level: "campaign", fields, time_range: range(prev), limit: "200" }),
        graph<{ data?: { id: string; effective_status: string }[] }>(`${a.id}/campaigns`, token, { fields: "effective_status", limit: "200" }),
      ]);
      const state = new Map((status.data ?? []).map((c) => [c.id, c.effective_status]));
      const campaigns = (now.data ?? []).map((r) => ({ id: r.campaign_id!, name: r.campaign_name ?? "", status: state.get(r.campaign_id!) === "ACTIVE" ? "aktiv" : "pausiert", ...metaRow(r) })).sort((x, y) => y.cost - x.cost);
      return {
        platform: "meta" as const,
        id: a.id.replace(/^act_/, ""),
        name: a.name || a.id,
        currency: a.currency,
        total: campaigns.reduce(add, zero()),
        prev: (before.data ?? []).map(metaRow).reduce(add, zero()),
        campaigns,
      };
    }),
  );
}

/** Alle Werbekonten beider Plattformen; Fehler einer Plattform werden gemeldet, ohne die andere zu verdecken. */
export const adsReport = unstable_cache(
  async (days: number) => {
    const k = await getAdsKeys();
    const [google, meta] = await Promise.allSettled([
      k.ads?.clientId && k.ads.refreshToken ? googleAccounts(k.ads, days) : Promise.resolve(null),
      k.metaToken ? metaAccounts(k.metaToken, days) : Promise.resolve(null),
    ]);
    const err = (r: PromiseSettledResult<unknown>) => (r.status === "rejected" ? String((r.reason as Error)?.message ?? r.reason).slice(0, 300) : null);
    return {
      at: new Date().toISOString(),
      accounts: [...(google.status === "fulfilled" ? (google.value ?? []) : []), ...(meta.status === "fulfilled" ? (meta.value ?? []) : [])],
      google: { connected: Boolean(k.ads?.refreshToken), error: err(google) },
      meta: { connected: Boolean(k.metaToken), error: err(meta) },
    };
  },
  ["ads-report"],
  { revalidate: REVALIDATE, tags: ["ads"] },
);

/** Prüft ein Meta-Token, bevor es gespeichert wird. */
export const checkMetaToken = (token: string) => graph<{ name?: string }>("me", token, { fields: "name" });
