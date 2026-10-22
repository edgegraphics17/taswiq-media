import "server-only";
import { unstable_cache } from "next/cache";
import { getSeoGoogle, listSeoDomains } from "@/lib/db";

/**
 * SEO-Modul: nur kostenlose Quellen – Search Console, GA4 (beide per OAuth mit Karims Google-Konto),
 * PageSpeed Insights und ein eigener Seiten-Check. Domains und gespeicherte Prüfungen liegen im Backend (seo_domains).
 */

export type Google = { clientId?: string; clientSecret?: string; refreshToken?: string; email?: string };
export type PsiResult = { score: number; lcp: number; cls: number; tbt: number; fcp: number; field?: { lcp?: number; inp?: number; cls?: number; category?: string } };
export type CrawlPage = { url: string; status: number; title: string; description: string; h1: number; indexable: boolean; schema: string[]; imgNoAlt: number; issues: string[] };
export type Crawl = { at: string; robots: string; sitemap: boolean; pages: CrawlPage[]; broken: { url: string; status: number; from: string }[] };
export type DomainData = { gscSite?: string; ga4?: string; crawl?: Crawl; psi?: { at: string; mobile?: PsiResult; desktop?: PsiResult; error?: string } };
export type SeoDomain = { domain: string; created_at: string; data: DomainData };

export const SCOPES = "openid email https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";

export const listDomains = () => listSeoDomains<DomainData>() as Promise<SeoDomain[]>;
export const getGoogle = () => getSeoGoogle<Google>();

/** Domain aus beliebiger Eingabe („https://www.x.de/seite“ → „x.de“). */
export function normalizeDomain(input: string) {
  const host = input.trim().toLowerCase().replace(/^[a-z]+:\/\//, "").split(/[/?#]/)[0].replace(/^www\./, "");
  return /^[a-z0-9.-]{3,100}$/.test(host) && host.includes(".") ? host : null;
}

// ─── Google-Zugriff ─────────────────────────────────────────────────
let token: { value: string; until: number } | null = null;

async function accessToken() {
  if (token && token.until > Date.now()) return token.value;
  const g = await getGoogle();
  if (!g.clientId || !g.clientSecret || !g.refreshToken) throw new Error("Google ist nicht verbunden.");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ client_id: g.clientId, client_secret: g.clientSecret, refresh_token: g.refreshToken, grant_type: "refresh_token" }),
    cache: "no-store",
  });
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!data.access_token) throw new Error(`Google-Anmeldung abgelaufen (${data.error ?? res.status}) – bitte neu verbinden.`);
  token = { value: data.access_token, until: Date.now() + ((data.expires_in ?? 3600) - 120) * 1000 };
  return token.value;
}

async function google<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: { authorization: `Bearer ${await accessToken()}`, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message ?? `Google ${res.status}`);
  return data;
}

/** Search-Console-Properties und GA4-Properties des verbundenen Kontos (für die Zuordnung je Domain). */
export const googleSources = unstable_cache(
  async () => {
    const [sites, ga] = await Promise.all([
      google<{ siteEntry?: { siteUrl: string }[] }>("https://searchconsole.googleapis.com/webmasters/v3/sites").then((d) => (d.siteEntry ?? []).map((s) => s.siteUrl).sort()),
      google<{ accountSummaries?: { displayName: string; propertySummaries?: { property: string; displayName: string }[] }[] }>("https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200")
        .then((d) => (d.accountSummaries ?? []).flatMap((a) => (a.propertySummaries ?? []).map((p) => ({ id: p.property, name: `${p.displayName} (${a.displayName})` }))))
        .catch(() => [] as { id: string; name: string }[]),
    ]);
    return { sites, ga };
  },
  ["seo-sources"],
  { revalidate: 600 },
);

/** Passende Search-Console-Property zur Domain: Domain-Property bevorzugt, sonst URL-Präfix. */
export const matchSite = (domain: string, sites: string[]) =>
  sites.find((s) => s === `sc-domain:${domain}`) ?? sites.find((s) => normalizeDomain(s.replace(/^sc-domain:/, "")) === domain);

const day = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
type Row = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

const gscQuery = (site: string, body: object) =>
  google<{ rows?: Row[] }>(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, body).then((d) => d.rows ?? []);

function sum(rows: Row[]) {
  const clicks = rows.reduce((a, r) => a + r.clicks, 0);
  const impressions = rows.reduce((a, r) => a + r.impressions, 0);
  // Position je Tag nach Impressionen gewichtet – entspricht dem Durchschnitt in der Search Console.
  const position = impressions ? rows.reduce((a, r) => a + r.position * r.impressions, 0) / impressions : 0;
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position };
}

/** Search Console: Summen (Zeitraum + Vorzeitraum), Tagesverlauf, Top-Suchbegriffe, Top-Seiten. 1 h zwischengespeichert. */
export const gscReport = unstable_cache(
  async (site: string, days: number, detail: boolean) => {
    const cur = { startDate: day(days + 1), endDate: day(1) };
    const [daily, prev, queries, pages] = await Promise.all([
      gscQuery(site, { ...cur, dimensions: ["date"], rowLimit: 500 }),
      gscQuery(site, { startDate: day(2 * days + 1), endDate: day(days + 2), dimensions: ["date"], rowLimit: 500 }),
      detail ? gscQuery(site, { ...cur, dimensions: ["query"], rowLimit: 50 }) : [],
      detail ? gscQuery(site, { ...cur, dimensions: ["page"], rowLimit: 50 }) : [],
    ]);
    return { total: sum(daily), prev: sum(prev), daily: daily.map((r) => ({ day: r.keys![0], clicks: r.clicks, impressions: r.impressions })), queries, pages };
  },
  ["seo-gsc"],
  { revalidate: 3600 },
);

/** GA4: aktive Nutzer, Sitzungen und Kanäle im Zeitraum. 1 h zwischengespeichert. */
export const ga4Report = unstable_cache(
  async (property: string, days: number) => {
    type R = { rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[]; totals?: { metricValues: { value: string }[] }[] };
    const d = await google<R>(`https://analyticsdata.googleapis.com/v1beta/${property}:runReport`, {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "yesterday" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      metricAggregations: ["TOTAL"],
    });
    const t = d.totals?.[0]?.metricValues ?? [];
    return {
      users: Number(t[0]?.value ?? 0),
      sessions: Number(t[1]?.value ?? 0),
      channels: (d.rows ?? []).map((r) => ({ name: r.dimensionValues[0].value, users: Number(r.metricValues[0].value), sessions: Number(r.metricValues[1].value) })),
    };
  },
  ["seo-ga4"],
  { revalidate: 3600 },
);

// ─── PageSpeed Insights (kostenlos, ohne Schlüssel) ─────────────────
export async function pageSpeed(url: string, strategy: "mobile" | "desktop"): Promise<PsiResult> {
  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance`, {
    cache: "no-store",
    signal: AbortSignal.timeout(55_000),
  });
  type M = { percentile?: number };
  const d = (await res.json()) as {
    error?: { message?: string };
    lighthouseResult?: { categories: { performance: { score: number } }; audits: Record<string, { numericValue?: number }> };
    loadingExperience?: { overall_category?: string; metrics?: Record<string, M> };
  };
  if (!d.lighthouseResult) throw new Error(d.error?.message ?? `PageSpeed ${res.status}`);
  const a = d.lighthouseResult.audits;
  const m = d.loadingExperience?.metrics;
  return {
    score: Math.round(d.lighthouseResult.categories.performance.score * 100),
    lcp: a["largest-contentful-paint"]?.numericValue ?? 0,
    cls: a["cumulative-layout-shift"]?.numericValue ?? 0,
    tbt: a["total-blocking-time"]?.numericValue ?? 0,
    fcp: a["first-contentful-paint"]?.numericValue ?? 0,
    // Felddaten echter Chrome-Nutzer – nur bei genug Besuchern vorhanden.
    field: m
      ? { lcp: m.LARGEST_CONTENTFUL_PAINT_MS?.percentile, inp: m.INTERACTION_TO_NEXT_PAINT?.percentile, cls: m.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile !== undefined ? m.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100 : undefined, category: d.loadingExperience?.overall_category }
      : undefined,
  };
}

// ─── Eigener Seiten-Check ───────────────────────────────────────────
const MAX_PAGES = 40;
const UA = { "user-agent": "Mozilla/5.0 (compatible; TasWiq-SEO-Check/1.0; +https://www.taswiq-media.de)" };
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))?.slice(2).find((v) => v !== undefined);
const text = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const sameSite = (a: URL, domain: string) => a.hostname.replace(/^www\./, "") === domain;

function analyse(html: string, url: string, status: number, robotsHeader: string) {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  const meta = (n: string) => metas.find((m) => attr(m, "name")?.toLowerCase() === n);
  const title = text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = (meta("description") && attr(meta("description")!, "content")) ?? "";
  const robots = `${(meta("robots") && attr(meta("robots")!, "content")) ?? ""} ${robotsHeader}`.toLowerCase();
  const canonical = (html.match(/<link\b[^>]*rel=["']?canonical[^>]*>/i) ?? []).map((l) => attr(l, "href"))[0];
  const canonicalElsewhere = canonical ? new URL(canonical, url).href.replace(/\/$/, "") !== url.replace(/\/$/, "") : false;
  const h1 = (html.match(/<h1[\s>]/gi) ?? []).length;
  const imgNoAlt = (html.match(/<img\b[^>]*>/gi) ?? []).filter((i) => attr(i, "alt") === undefined).length;
  const schema = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => {
    try {
      const types: string[] = [];
      JSON.stringify(JSON.parse(m[1]), (k, v) => (k === "@type" && types.push(...[v].flat()), v));
      return types;
    } catch {
      return ["(fehlerhaft)"];
    }
  });
  const indexable = status === 200 && !robots.includes("noindex") && !canonicalElsewhere;
  const issues = [
    !title && "Titel fehlt",
    title.length > 60 && `Titel zu lang (${title.length} Zeichen)`,
    !description && "Meta-Beschreibung fehlt",
    description.length > 160 && `Meta-Beschreibung zu lang (${description.length})`,
    h1 === 0 && "Keine H1",
    h1 > 1 && `${h1} × H1`,
    imgNoAlt > 0 && `${imgNoAlt} Bild${imgNoAlt > 1 ? "er" : ""} ohne Alt-Text`,
    robots.includes("noindex") && "noindex gesetzt",
    canonicalElsewhere && "Canonical zeigt auf andere URL",
    schema.includes("(fehlerhaft)") && "Strukturierte Daten fehlerhaft",
  ].filter((v): v is string => Boolean(v));
  const links = [...html.matchAll(/<a\b[^>]*>/gi)].map((m) => attr(m[0], "href")).filter((h): h is string => Boolean(h));
  return { page: { url, status, title, description, h1, indexable, schema: [...new Set(schema)], imgNoAlt, issues }, links };
}

async function get(url: string, method = "GET") {
  return fetch(url, { method, headers: UA, redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(12_000) });
}

/** Liest bis zu 40 Seiten der Domain (Breitensuche ab Startseite) und prüft gefundene Links auf 404/5xx. */
export async function crawl(domain: string): Promise<Crawl> {
  const start = await get(`https://${domain}/`).catch(() => get(`https://www.${domain}/`));
  const origin = new URL(start.url).origin;
  const queue = [new URL(start.url).href];
  const seen = new Set(queue);
  const linkFrom = new Map<string, string>();
  const pages: CrawlPage[] = [];
  const broken: Crawl["broken"] = [];

  while (queue.length && pages.length < MAX_PAGES) {
    const batch = queue.splice(0, Math.min(6, MAX_PAGES - pages.length));
    await Promise.all(
      batch.map(async (url) => {
        const res = await get(url).catch(() => null);
        if (!res) return void broken.push({ url, status: 0, from: linkFrom.get(url) ?? "" });
        if (res.status >= 400) return void broken.push({ url, status: res.status, from: linkFrom.get(url) ?? "" });
        if (!res.headers.get("content-type")?.includes("text/html")) return;
        const { page, links } = analyse(await res.text(), res.url, res.status, res.headers.get("x-robots-tag") ?? "");
        pages.push(page);
        for (const href of links) {
          let u: URL;
          try {
            u = new URL(href, res.url);
          } catch {
            continue;
          }
          if (!/^https?:$/.test(u.protocol)) continue;
          u.hash = "";
          if (!linkFrom.has(u.href)) linkFrom.set(u.href, page.url);
          if (sameSite(u, domain) && !seen.has(u.href) && !/\.(pdf|jpe?g|png|webp|gif|svg|zip|mp4|xml)$/i.test(u.pathname)) {
            seen.add(u.href);
            queue.push(u.href);
          }
        }
      }),
    );
  }

  // Externe Links: nur echte Fehler zählen (403/429 sind meist Bot-Sperren, keine toten Links).
  const external = [...linkFrom.keys()].filter((u) => !sameSite(new URL(u), domain)).slice(0, 60);
  await Promise.all(
    external.map(async (url) => {
      const res = await get(url, "HEAD").then((r) => (r.status === 405 ? get(url) : r)).catch(() => null);
      if (res && (res.status === 404 || res.status === 410 || res.status >= 500)) broken.push({ url, status: res.status, from: linkFrom.get(url)! });
    }),
  );

  const robotsTxt = await get(`${origin}/robots.txt`).then((r) => (r.ok ? r.text() : "")).catch(() => "");
  const blocksAll = /^user-agent:\s*\*\s*\n(?:(?!user-agent).*\n)*?disallow:\s*\/\s*$/im.test(robotsTxt);
  // Doppelte Titel sind ein eigenes Problem: Google kann die Seiten nicht unterscheiden.
  const titles = new Map<string, number>();
  for (const p of pages) if (p.title) titles.set(p.title, (titles.get(p.title) ?? 0) + 1);
  for (const p of pages) if ((titles.get(p.title) ?? 0) > 1) p.issues.push("Titel doppelt");

  return {
    at: new Date().toISOString(),
    robots: !robotsTxt ? "fehlt" : blocksAll ? "sperrt alles" : "ok",
    sitemap: /^sitemap:/im.test(robotsTxt) || (await get(`${origin}/sitemap.xml`, "HEAD").then((r) => r.ok).catch(() => false)),
    pages: pages.sort((a, b) => a.url.length - b.url.length),
    broken,
  };
}
