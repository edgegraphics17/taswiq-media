import "server-only";
import { unstable_cache } from "next/cache";
import { seoPages } from "@/config/seo-pages";
import { posts } from "@/content/blog";
import { routing, type AppPathname, type Locale } from "@/i18n/routing";

/**
 * Seitenstruktur fürs Dashboard: liest die ausgelieferte Website ein (jede Seite einmal abrufen, Links auswerten)
 * und bewertet daraus, wie die Seiten zusammenhängen – wer verlinkt wen, wo stehen die Call-to-Actions,
 * welche Seite führt nicht zurück zum Angebot.
 *
 * Bewusst die fertige Seite statt des Quellcodes: So zählt, was Besucher wirklich sehen – auch Links aus
 * Übersetzungen, Konfiguration und Blog-Texten. Start sind alle bekannten Routen; was darüber hinaus verlinkt ist,
 * kommt beim Einlesen dazu. Menü und Footer stehen auf jeder Seite gleich und werden nur einmal (von der Startseite) gemerkt.
 */

export const STRUCTURE_TAG = "seitenstruktur";

export type GroupId = "start" | "angebot" | "branchen" | "leistungen" | "ratgeber" | "demos" | "rechtliches" | "sonstige";
export type LinkKind = "seite" | "anker" | "kontakt" | "extern" | "sprache";
export type Verdict = "ok" | "schwach" | "sackgasse" | "neutral" | "fehler";

export interface PageLink {
  /** Zielpfad (intern) oder vollständige Adresse (extern, Kontakt) */
  to: string;
  hash?: string;
  text: string;
  kind: LinkKind;
  /** Als Button gestaltet (Pille) – im Unterschied zum Textlink */
  button: boolean;
  /** Führt zum Angebot: Anfrage-Formular, Preisrechner, Einstiegsangebot oder direkter Kontakt */
  offer: boolean;
  /** Position im Inhalt, 0 = ganz oben, 1 = ganz unten */
  pos: number;
  /** Ziel gibt es nicht ("seite") oder die Sprungmarke fehlt dort ("anker") */
  broken?: "seite" | "anker";
}

export interface PageNode {
  path: string;
  label: string;
  title: string;
  h1: string;
  group: GroupId;
  status: number;
  /** Seite hat Menü und Footer der Website */
  shell: boolean;
  /** Anfrage-Formular steht auf der Seite selbst */
  hasForm: boolean;
  /** Preisrechner oder Einstiegsangebot – selbst Teil des Angebots */
  offerPage: boolean;
  noindex: boolean;
  /** Klicks ab der Startseite (kürzester Weg, Menü und Footer zählen mit); null = nicht erreichbar */
  depth: number | null;
  /** Klicks bis zu einer Seite mit Anfrage-Möglichkeit; 0 = hier, null = kein Weg */
  toOffer: number | null;
  /** Im Menü oder Footer verlinkt */
  inNav: boolean;
  /** Links im Inhalt (ohne Menü und Footer) */
  links: PageLink[];
  verdict: Verdict;
}

export interface Issue {
  level: 1 | 2 | 3;
  kind: "defekt" | "anker" | "sackgasse" | "kein-cta" | "verwaist" | "tief" | "fehler";
  path: string;
  text: string;
}

export interface SiteStructure {
  locale: Locale;
  origin: string;
  scannedAt: string;
  pages: PageNode[];
  /** Menü- und Footer-Links, wie sie auf jeder Seite stehen */
  nav: PageLink[];
  footer: PageLink[];
  issues: Issue[];
}

/* ─── Bekannte Routen ─── */

const OFFER_ROUTES: AppPathname[] = ["/preisrechner", "/einstiegsangebot"];
const OFFER_HASHES = new Set(["kontakt", "anfrage"]);
const FIXED: { route: AppPathname; label: string; group: GroupId }[] = [
  { route: "/", label: "Startseite", group: "start" },
  { route: "/preisrechner", label: "Preisrechner", group: "angebot" },
  { route: "/einstiegsangebot", label: "Einstiegsangebot", group: "angebot" },
  { route: "/einstiegsangebot/kurzfassung", label: "Einstiegsangebot – Kurzfassung", group: "angebot" },
  { route: "/portfolio", label: "Portfolio", group: "angebot" },
  { route: "/blog", label: "Ratgeber-Übersicht", group: "ratgeber" },
  { route: "/impressum", label: "Impressum", group: "rechtliches" },
  { route: "/datenschutz", label: "Datenschutz", group: "rechtliches" },
];

function localize(route: AppPathname, locale: Locale, slug = ""): string {
  const p = routing.pathnames[route];
  const path = (typeof p === "string" ? p : p[locale]).replace("[slug]", slug);
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

const pretty = (slug: string) =>
  slug
    .split("-")
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

function knownPages(locale: Locale) {
  const known = new Map<string, { label: string; group: GroupId; offerPage: boolean }>();
  for (const f of FIXED) known.set(localize(f.route, locale), { label: f.label, group: f.group, offerPage: OFFER_ROUTES.includes(f.route) });
  for (const p of seoPages) {
    known.set(localize("/leistungen/[slug]", locale, p.slugs[locale]), { label: pretty(p.slugs[locale]), group: p.kind === "branche" ? "branchen" : "leistungen", offerPage: false });
  }
  // Ratgeber gibt es nur auf Deutsch.
  if (locale === "de") for (const p of posts) known.set(localize("/blog/[slug]", locale, p.slug), { label: p.title, group: "ratgeber", offerPage: false });
  return known;
}

/* ─── HTML auswerten (ohne Parser-Abhängigkeit: Next liefert sauberes, vorhersagbares Markup) ─── */

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", shy: "" };
const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? m;
  });
const text = (html: string) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (tag: string, name: string) => {
  const m = new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag);
  return m ? decode(m[1]) : "";
};

interface RawLink {
  href: string;
  text: string;
  button: boolean;
  pos: number;
}

function linksIn(html: string): RawLink[] {
  const out: RawLink[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const tag = ` ${m[1]}`;
    const href = attr(tag, "href");
    if (!href || href === "#main") continue;
    const cls = attr(tag, "class");
    const label = text(m[2]) || attr(tag, "aria-label") || attr(m[2], "alt") || "(ohne Text)";
    out.push({ href, text: label.slice(0, 120), button: /rounded-full/.test(cls) && /(bg-brand-500|bg-night|min-h-12)/.test(cls), pos: html.length ? m.index / html.length : 0 });
  }
  return out;
}

interface Fetched {
  path: string;
  status: number;
  title: string;
  h1: string;
  noindex: boolean;
  shell: boolean;
  ids: Set<string>;
  content: RawLink[];
  nav: RawLink[];
  footer: RawLink[];
}

async function fetchPage(origin: string, path: string): Promise<Fetched> {
  const empty: Fetched = { path, status: 0, title: "", h1: "", noindex: false, shell: false, ids: new Set(), content: [], nav: [], footer: [] };
  let res: Response;
  try {
    res = await fetch(origin + path, { cache: "no-store", redirect: "follow", headers: { "user-agent": "TasWiq-Strukturcheck" }, signal: AbortSignal.timeout(process.env.NODE_ENV === "production" ? 15_000 : 60_000) });
  } catch {
    return empty;
  }
  const raw = await res.text().catch(() => "");
  const html = raw.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "");
  const body = html.slice(Math.max(0, html.search(/<body\b/i)));
  const start = body.search(/<main\b/i);
  const end = body.lastIndexOf("</main>");
  const main = start >= 0 && end > start ? body.slice(start, end) : body;
  const before = start >= 0 ? body.slice(0, start) : "";
  const after = start >= 0 && end > start ? body.slice(end) : "";
  return {
    path,
    status: res.status,
    title: text(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "").replace(/\s*[|–-]\s*TasWiq Media\.?$/i, ""),
    h1: text(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(main)?.[1] ?? ""),
    noindex: /<meta[^>]+name="robots"[^>]+noindex/i.test(html),
    shell: /<header\b/i.test(before),
    ids: new Set(Array.from(body.matchAll(/\sid="([^"]+)"/g), (m) => m[1])),
    content: linksIn(main),
    nav: linksIn(before),
    footer: linksIn(after),
  };
}

/* ─── Einlesen und bewerten ─── */

const MAX_PAGES = 250;
const PARALLEL = 6;

async function scan(origin: string, locale: Locale): Promise<SiteStructure> {
  const known = knownPages(locale);
  const home = localize("/", locale);
  const inLocale = (path: string) => {
    const other = routing.locales.filter((l) => l !== routing.defaultLocale).find((l) => path === `/${l}` || path.startsWith(`/${l}/`));
    return (other ?? routing.defaultLocale) === locale;
  };
  // Demos und Ratgeber gibt es nur auf Deutsch – von der englischen Website aus sind das Sprünge in die andere Sprache.
  const crawlable = (path: string) => inLocale(path) && !/^\/(admin|api|_next)(\/|$)/.test(path) && !/\.[a-z0-9]{2,5}$/i.test(path);

  const resolve = (raw: RawLink, from: string): PageLink => {
    const base = { text: raw.text, button: raw.button, pos: Math.round(raw.pos * 1000) / 1000 };
    if (/^(tel:|mailto:|sms:)/i.test(raw.href)) return { ...base, to: raw.href, kind: "kontakt", offer: true };
    let url: URL;
    try {
      url = new URL(raw.href, origin + from);
    } catch {
      return { ...base, to: raw.href, kind: "extern", offer: false };
    }
    if (url.origin !== origin) {
      const contact = /(^|\.)wa\.me$|whatsapp\.com$|calendly\.com$/.test(url.hostname);
      return { ...base, to: url.href, kind: contact ? "kontakt" : "extern", offer: contact };
    }
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const hash = url.hash.slice(1) || undefined;
    if (!crawlable(path)) return { ...base, to: path, hash, kind: inLocale(path) ? "extern" : "sprache", offer: false };
    const offer = (hash ? OFFER_HASHES.has(hash) : false) || (path !== from && (known.get(path)?.offerPage ?? false));
    return { ...base, to: path, hash, kind: path === from ? "anker" : "seite", offer };
  };

  // Breitensuche über alle Links (auch Menü und Footer), gestartet bei allen bekannten Routen.
  const fetched = new Map<string, Fetched>();
  const queue = [home, ...Array.from(known.keys()).filter((p) => p !== home)];
  const seen = new Set(queue);
  while (queue.length && fetched.size < MAX_PAGES) {
    const batch = queue.splice(0, PARALLEL);
    const results = await Promise.all(batch.map((p) => fetchPage(origin, p)));
    for (const f of results) {
      fetched.set(f.path, f);
      for (const raw of [...f.content, ...f.nav, ...f.footer]) {
        const l = resolve(raw, f.path);
        if (l.kind === "seite" && !seen.has(l.to)) {
          seen.add(l.to);
          queue.push(l.to);
        }
      }
    }
  }
  const start = fetched.get(home);
  if (!start || start.status !== 200) throw new Error(`Startseite nicht erreichbar (${origin}${home}, Status ${start?.status ?? 0})`);

  const check = (l: PageLink): PageLink => {
    if (l.kind !== "seite" && l.kind !== "anker") return l;
    const target = fetched.get(l.to);
    if (!target || target.status >= 400 || target.status === 0) return { ...l, broken: "seite", offer: false };
    if (l.hash && !target.ids.has(l.hash)) return { ...l, broken: "anker", offer: false };
    return l;
  };
  const nav = start.nav.map((r) => check(resolve(r, home)));
  const footer = start.footer.map((r) => check(resolve(r, home)));
  const navTargets = new Set([...nav, ...footer].filter((l) => l.kind === "seite" || l.kind === "anker").map((l) => l.to));

  const pages: PageNode[] = Array.from(fetched.values()).map((f) => {
    const k = known.get(f.path);
    const group: GroupId = k?.group ?? (f.path.startsWith("/demo") ? "demos" : "sonstige");
    return {
      path: f.path,
      label: k?.label ?? (f.title || f.h1 || f.path),
      title: f.title,
      h1: f.h1,
      group,
      status: f.status,
      shell: f.shell,
      hasForm: Array.from(OFFER_HASHES).some((id) => f.ids.has(id)),
      offerPage: k?.offerPage ?? false,
      noindex: f.noindex,
      depth: null,
      toOffer: null,
      inNav: navTargets.has(f.path),
      links: f.content.map((r) => check(resolve(r, f.path))),
      verdict: "schwach",
    };
  });
  const byPath = new Map(pages.map((p) => [p.path, p]));

  // Ausgehende Seiten-Links je Seite: Inhalt + (falls die Seite Menü/Footer hat) die Navigation.
  const out = (p: PageNode) => {
    const all = p.shell ? [...p.links, ...nav, ...footer] : p.links;
    return Array.from(new Set(all.filter((l) => l.kind === "seite" && !l.broken).map((l) => l.to)));
  };

  // Klicktiefe ab Startseite
  const startNode = byPath.get(home)!;
  startNode.depth = 0;
  for (let frontier = [startNode]; frontier.length; ) {
    const next: PageNode[] = [];
    for (const p of frontier)
      for (const to of out(p)) {
        const t = byPath.get(to);
        if (t && t.depth === null) {
          t.depth = p.depth! + 1;
          next.push(t);
        }
      }
    frontier = next;
  }

  // Klicks bis zur Anfrage: 0 = Formular hier oder Angebotsseite, 1 = Link im Inhalt dorthin, sonst kürzester Weg.
  const converts = (p: PageNode) => p.status === 200 && (p.hasForm || p.offerPage);
  for (const p of pages) if (converts(p)) p.toOffer = 0;
  for (let changed = true, round = 1; changed && round < 12; round++) {
    changed = false;
    const updates: PageNode[] = [];
    for (const p of pages) {
      if (p.toOffer !== null) continue;
      const direct = round === 1 && p.links.some((l) => l.offer);
      const viaPage = out(p).some((to) => byPath.get(to)?.toOffer === round - 1);
      if (direct || viaPage) updates.push(p);
    }
    for (const p of updates) p.toOffer = round;
    changed = updates.length > 0;
  }

  const inbound = new Map<string, number>();
  for (const p of pages) for (const to of new Set(p.links.filter((l) => l.kind === "seite").map((l) => l.to))) inbound.set(to, (inbound.get(to) ?? 0) + 1);

  const issues: Issue[] = [];
  for (const p of pages) {
    const pageLinks = p.links.filter((l) => l.kind === "seite" && !l.broken);
    if (p.status !== 200) p.verdict = "fehler";
    else if (p.group === "rechtliches") p.verdict = "neutral";
    else if (p.hasForm || p.offerPage || p.links.some((l) => l.offer)) p.verdict = "ok";
    else if (pageLinks.length === 0) p.verdict = "sackgasse";
    else p.verdict = "schwach";

    if (p.verdict === "fehler") issues.push({ level: 1, kind: "fehler", path: p.path, text: p.status ? `Seite antwortet mit Status ${p.status}` : "Seite war beim Einlesen nicht erreichbar" });
    for (const l of p.links) {
      if (l.broken === "seite") issues.push({ level: 1, kind: "defekt", path: p.path, text: `Link „${l.text}“ führt ins Leere: ${l.to}` });
      if (l.broken === "anker") issues.push({ level: 2, kind: "anker", path: p.path, text: `Link „${l.text}“ springt zu #${l.hash}, die Sprungmarke gibt es auf ${l.to} nicht` });
    }
    if (p.verdict === "sackgasse") issues.push({ level: 1, kind: "sackgasse", path: p.path, text: "Sackgasse: im Inhalt kein Link weiter und kein Weg zum Angebot" });
    if (p.verdict === "schwach") issues.push({ level: 2, kind: "kein-cta", path: p.path, text: "Kein Call-to-Action im Inhalt, der zum Angebot führt" });
    if (p.status === 200 && p.path !== home && !inbound.get(p.path) && !p.inNav) issues.push({ level: 2, kind: "verwaist", path: p.path, text: "Keine andere Seite verlinkt hierher – nur erreichbar, wenn man die Adresse kennt" });
    else if (p.status === 200 && p.depth === null) issues.push({ level: 2, kind: "verwaist", path: p.path, text: "Von der Startseite aus über keinen Klickweg erreichbar – weder Menü, Footer noch eine erreichbare Seite verlinkt hierher" });
    if (p.depth !== null && p.depth > 3) issues.push({ level: 3, kind: "tief", path: p.path, text: `${p.depth} Klicks von der Startseite entfernt` });
  }
  for (const [where, list] of [["Menü", nav], ["Footer", footer]] as const)
    for (const l of list) {
      if (l.broken === "seite") issues.push({ level: 1, kind: "defekt", path: home, text: `${where}-Link „${l.text}“ führt ins Leere: ${l.to}` });
      if (l.broken === "anker") issues.push({ level: 2, kind: "anker", path: home, text: `${where}-Link „${l.text}“ springt zu #${l.hash}, die Sprungmarke fehlt auf ${l.to}` });
    }
  issues.sort((a, b) => a.level - b.level || a.path.localeCompare(b.path));

  return { locale, origin, scannedAt: new Date().toISOString(), pages, nav, footer, issues };
}

/** Eingelesene Struktur – 30 Minuten gemerkt, „Neu einlesen“ im Dashboard verwirft den Stand sofort. */
export const getSiteStructure = unstable_cache(scan, ["seitenstruktur-v1"], { revalidate: 1800, tags: [STRUCTURE_TAG] });
