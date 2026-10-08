import { keywordAreas, type KeywordArea } from "@/config/keywords";
import type { PageNode, SiteStructure } from "@/lib/admin/site-structure";
import type { LeadRow, PathStats, SiteScanData, SiteScanRow, TaskCategory, TaskRow } from "@/types/database";

/**
 * Aus der eingelesenen Website werden Befunde: je Problemart genau einer, mit allen betroffenen Seiten,
 * einer Begründung (warum kostet das Besucher oder Anfragen?) und einem Lösungsvorschlag in Schritten.
 * Ein Befund lässt sich im Dashboard mit einem Klick als Aufgabe anlegen oder direkt an Claude übergeben.
 *
 * Reine Auswertung ohne Zugriffe – Dashboard-Seite und Abruf für das Team (/api/struktur) nutzen dieselbe Logik.
 */

export type Topic = "Struktur" | "Call-to-Actions" | "SEO" | "Besucher" | "Suchbegriffe";

export interface Finding {
  id: string;
  /** Schlüssel der Aufgabe – ändert sich, wenn andere Seiten betroffen sind (dann ist es eine neue Aufgabe) */
  key: string;
  level: 1 | 2 | 3;
  topic: Topic;
  title: string;
  why: string;
  items: { path: string | null; note: string }[];
  steps: string[];
  category: TaskCategory;
  effort: "S" | "M" | "L";
  /** Dazu gibt es schon eine Aufgabe im Board */
  task: { id: string; status: TaskRow["status"]; run_state: TaskRow["run_state"]; exact: boolean } | null;
}

export interface AreaRow {
  id: KeywordArea;
  label: string;
  pages: number;
  strong: number;
  total: number;
  open: number;
  visitors: number;
  search: number;
  leads: number | null;
}

export interface SiteReport {
  findings: Finding[];
  summary: { pages: number; clean: number; level: [number, number, number]; views: number; search: number; ai: number; keywordsStrong: number; keywordsTotal: number };
  /** Vergleich mit dem letzten gespeicherten Stand eines früheren Tages */
  diff: { since: string; newPages: string[]; gonePages: string[]; newFindings: string[]; resolved: string[] } | null;
  areas: AreaRow[];
  /** Besucherzahlen je Seite und Klickwege (30 Tage) */
  paths: PathStats | null;
}

const hash = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

interface Spec {
  level: 1 | 2 | 3;
  topic: Topic;
  one: string;
  many: string;
  why: string;
  steps: string[];
  category: TaskCategory;
  effort: "S" | "M" | "L";
}

const RECHECK = "Danach im Dashboard unter Seitenstruktur „Neu einlesen“ und prüfen, dass der Befund weg ist";

const SPECS: Record<string, Spec> = {
  fehler: { level: 1, topic: "Struktur", one: "Seite ist nicht erreichbar", many: "Seiten sind nicht erreichbar", why: "Besucher und Google landen auf einer Fehlerseite – jeder Klick dorthin ist verloren.", steps: ["Seite aufrufen und die Fehlermeldung in den Vercel-Protokollen nachsehen", "Ursache beheben – oder, wenn es die Seite nicht mehr geben soll, dauerhaft auf die passende Nachfolgeseite weiterleiten", RECHECK], category: "bugs", effort: "S" },
  defekt: { level: 1, topic: "Struktur", one: "Link führt ins Leere", many: "Links führen ins Leere", why: "Wer klickt, landet auf einer Fehlerseite. Das kostet Vertrauen, und Google wertet defekte Links als Zeichen einer ungepflegten Website.", steps: ["Je Link das richtige Ziel eintragen (Tippfehler im Pfad, umbenannte Seite) oder den Link entfernen", "Wurde eine Seite umbenannt: zusätzlich eine dauerhafte Weiterleitung von der alten Adresse anlegen", RECHECK], category: "bugs", effort: "S" },
  anker: { level: 2, topic: "Struktur", one: "Sprungmarke fehlt am Ziel", many: "Sprungmarken fehlen am Ziel", why: "Der Link soll zu einem bestimmten Abschnitt springen (z. B. zum Anfrage-Formular), landet aber nur oben auf der Seite – der Besucher muss selbst suchen.", steps: ["Am Zielabschnitt die fehlende Sprungmarke (id) ergänzen oder den Link auf die richtige Marke ändern", RECHECK], category: "bugs", effort: "S" },
  sackgasse: { level: 1, topic: "Call-to-Actions", one: "Seite ist eine Sackgasse", many: "Seiten sind Sackgassen", why: "Im Inhalt führt kein Link weiter. Wer zu Ende gelesen hat, kann nur das Menü benutzen oder gehen – die meisten gehen.", steps: ["Am Ende des Inhalts einen Button „Kostenloses Erstgespräch“ zum Anfrage-Formular einbauen", "Zusätzlich auf zwei thematisch passende Seiten verlinken (Leistung oder Branche, ein Ratgeber)", RECHECK], category: "angebote", effort: "S" },
  "kein-cta": { level: 2, topic: "Call-to-Actions", one: "Seite ohne Call-to-Action im Inhalt", many: "Seiten ohne Call-to-Action im Inhalt", why: "Zum Angebot geht es nur über Menü oder Footer. Besucher, die gerade überzeugt wurden, bekommen keinen nächsten Schritt angeboten.", steps: ["Nach dem ersten Drittel und am Ende des Inhalts je einen Button zum Anfrage-Formular oder Preisrechner setzen", "Button-Text am Thema der Seite ausrichten (z. B. „Bestellsystem durchrechnen“ statt „Kontakt“)", RECHECK], category: "angebote", effort: "S" },
  verwaist: { level: 2, topic: "Struktur", one: "Seite ist von der Website aus nicht erreichbar", many: "Seiten sind von der Website aus nicht erreichbar", why: "Kein Klickweg führt von der Startseite hierher. Besucher finden die Seite nur mit der genauen Adresse, und Google gibt unverlinkten Seiten kaum Gewicht.", steps: ["Entscheiden: Soll die Seite öffentlich gefunden werden oder nur per Direktlink verschickt werden?", "Öffentlich: von mindestens zwei passenden Seiten im Inhalt verlinken, bei Angebotsseiten zusätzlich im Footer", "Nur Direktlink: aus der Sitemap nehmen und für Google sperren (noindex), damit keine unverlinkte Seite gemeldet wird", RECHECK], category: "seo", effort: "S" },
  tief: { level: 3, topic: "Struktur", one: "Seite liegt mehr als drei Klicks tief", many: "Seiten liegen mehr als drei Klicks tief", why: "Je mehr Klicks nötig sind, desto weniger Besucher kommen an – und Google stuft tief vergrabene Seiten als unwichtig ein.", steps: ["Von einer Seite, die höchstens zwei Klicks von der Startseite entfernt ist, direkt hierher verlinken", RECHECK], category: "seo", effort: "S" },
  "cta-spaet": { level: 3, topic: "Call-to-Actions", one: "Seite zeigt den ersten Call-to-Action erst spät", many: "Seiten zeigen den ersten Call-to-Action erst spät", why: "Viele Besucher lesen nur den Anfang. Steht der erste Weg zum Angebot erst in der zweiten Hälfte, sehen ihn die meisten nie.", steps: ["Im ersten Drittel der Seite einen Button zum Anfrage-Formular oder Preisrechner ergänzen (bei Ratgebern: nach der Kurzfassung)", RECHECK], category: "angebote", effort: "S" },
  "cta-wenig": { level: 3, topic: "Call-to-Actions", one: "Lange Seite mit nur einem Call-to-Action", many: "Lange Seiten mit nur einem Call-to-Action", why: "Auf einer langen Seite ist ein einzelner Button schnell aus dem Blick. Ein zweiter an anderer Stelle fängt Leser ab, die später überzeugt sind.", steps: ["Einen zweiten Button etwa in der Mitte des Inhalts ergänzen, passend zum Abschnitt formuliert", RECHECK], category: "angebote", effort: "S" },
  "titel-fehlt": { level: 1, topic: "SEO", one: "Seite ohne Seitentitel", many: "Seiten ohne Seitentitel", why: "Der Seitentitel ist die blaue Überschrift im Google-Ergebnis. Ohne ihn erfindet Google selbst einen – meist einen schlechten.", steps: ["Seitentitel mit dem Haupt-Suchwort vorn eintragen (höchstens 60 Zeichen)", RECHECK], category: "seo", effort: "S" },
  "titel-lang": { level: 3, topic: "SEO", one: "Seitentitel ist zu lang", many: "Seitentitel sind zu lang", why: "Google schneidet Titel nach etwa 60 Zeichen ab. Was hinten steht, sieht niemand – oft genau der Teil, der zum Klick bewegen soll.", steps: ["Titel auf höchstens 60 Zeichen kürzen, Suchwort bleibt vorn", "Bei Ratgebern den kurzen Google-Titel (seoTitle) setzen, die lange Überschrift auf der Seite darf bleiben", RECHECK], category: "seo", effort: "S" },
  "titel-doppelt": { level: 2, topic: "SEO", one: "Seitentitel kommt doppelt vor", many: "Seiten teilen sich denselben Titel", why: "Bei gleichem Titel kann Google die Seiten nicht unterscheiden und zeigt oft keine von beiden.", steps: ["Jeder Seite einen eigenen Titel mit ihrem eigenen Haupt-Suchwort geben", RECHECK], category: "seo", effort: "S" },
  "beschreibung-fehlt": { level: 2, topic: "SEO", one: "Seite ohne Beschreibung für Google", many: "Seiten ohne Beschreibung für Google", why: "Die Beschreibung ist der Text unter dem Titel im Suchergebnis. Fehlt sie, nimmt Google einen beliebigen Satz von der Seite.", steps: ["Beschreibung mit Nutzen und Suchwort ergänzen (120 bis 155 Zeichen)", RECHECK], category: "seo", effort: "S" },
  "beschreibung-lang": { level: 3, topic: "SEO", one: "Beschreibung ist zu lang", many: "Beschreibungen sind zu lang", why: "Google schneidet nach etwa 155 Zeichen ab – der Schluss mit der Handlungsaufforderung geht verloren.", steps: ["Beschreibung auf höchstens 155 Zeichen kürzen, das Wichtigste nach vorn", RECHECK], category: "seo", effort: "S" },
  "h1-fehlt": { level: 2, topic: "SEO", one: "Seite ohne Hauptüberschrift", many: "Seiten ohne Hauptüberschrift", why: "Die Hauptüberschrift sagt Besuchern und Google in einem Satz, worum es geht. Fehlt sie, fehlt das stärkste Signal auf der Seite.", steps: ["Eine Hauptüberschrift (H1) mit dem Haupt-Suchwort ergänzen", RECHECK], category: "seo", effort: "S" },
  "h1-mehrfach": { level: 3, topic: "SEO", one: "Seite mit mehreren Hauptüberschriften", many: "Seiten mit mehreren Hauptüberschriften", why: "Mehrere Hauptüberschriften verwässern das Thema der Seite.", steps: ["Nur eine Hauptüberschrift (H1) behalten, die übrigen zu Zwischenüberschriften machen", RECHECK], category: "seo", effort: "S" },
  duenn: { level: 3, topic: "SEO", one: "Seite hat sehr wenig Inhalt", many: "Seiten haben sehr wenig Inhalt", why: "Unter 300 Wörtern beantwortet eine Seite selten eine Suchanfrage vollständig – Google bevorzugt ausführlichere Treffer.", steps: ["Inhalt ausbauen: typische Kundenfragen beantworten, ein Beispiel oder eine Rechnung, drei bis fünf häufige Fragen", RECHECK], category: "seo", effort: "M" },
  "wenig-links": { level: 3, topic: "SEO", one: "Seite ist intern kaum verlinkt", many: "Seiten sind intern kaum verlinkt", why: "Nur eine einzige Seite verweist hierher. Interne Links zeigen Google, welche Seiten wichtig sind – und bringen Leser weiter.", steps: ["Von zwei bis drei thematisch passenden Seiten (Ratgeber, Leistungs- oder Branchenseite) im Text hierher verlinken", "Als Linktext das Suchwort der Zielseite verwenden, nicht „hier klicken“", RECHECK], category: "seo", effort: "S" },
  "sitemap-fehlt": { level: 2, topic: "SEO", one: "Seite fehlt in der Sitemap", many: "Seiten fehlen in der Sitemap", why: "Die Seite ist für Google freigegeben, steht aber nicht in der Sitemap. Google findet sie später oder gar nicht.", steps: ["Seite in die Sitemap aufnehmen – oder, wenn sie nicht ranken soll, für Google sperren (noindex)", RECHECK], category: "seo", effort: "S" },
  "sitemap-gesperrt": { level: 2, topic: "SEO", one: "Sitemap nennt eine gesperrte oder fehlende Seite", many: "Sitemap nennt gesperrte oder fehlende Seiten", why: "Die Sitemap empfiehlt Google eine Seite, die gesperrt ist oder nicht lädt. Solche Widersprüche senken das Vertrauen in die ganze Sitemap.", steps: ["Seite aus der Sitemap nehmen oder die Sperre aufheben – je nachdem, ob sie ranken soll", RECHECK], category: "seo", effort: "S" },
  canonical: { level: 2, topic: "SEO", one: "Seite verweist Google auf eine andere Adresse", many: "Seiten verweisen Google auf eine andere Adresse", why: "Der Canonical-Hinweis sagt Google: „Das Original liegt woanders.“ Dann wird diese Seite nicht selbst in den Ergebnissen gezeigt.", steps: ["Prüfen, ob das gewollt ist; sonst den Canonical auf die Seite selbst setzen", RECHECK], category: "seo", effort: "S" },
  schema: { level: 3, topic: "SEO", one: "Seite ohne strukturierte Daten", many: "Seiten ohne strukturierte Daten", why: "Strukturierte Daten helfen Google und KI-Assistenten, Inhalte sicher zu verstehen (Leistung, Fragen und Antworten, Artikel).", steps: ["Passende strukturierte Daten ergänzen (Leistung, Artikel oder häufige Fragen)", RECHECK], category: "geo", effort: "S" },
  ausstieg: { level: 2, topic: "Besucher", one: "Seite, auf der fast alle Besucher aussteigen", many: "Seiten, auf denen fast alle Besucher aussteigen", why: "Mindestens vier von fünf Besuchen enden genau hier, ohne einen weiteren Klick. Die Seite bekommt Aufmerksamkeit, gibt sie aber nicht weiter.", steps: ["Seite auf dem Handy durchgehen: Ist nach dem ersten Bildschirm klar, was der nächste Schritt ist?", "Button zum Anfrage-Formular oder Preisrechner weiter nach oben holen und konkreter benennen", "Am Ende zwei passende Seiten zum Weiterlesen anbieten", "Nach zwei Wochen die Ausstiegsquote im Dashboard erneut ansehen"], category: "angebote", effort: "M" },
  "kein-besuch": { level: 3, topic: "Besucher", one: "Seite ohne einen einzigen Besuch in 30 Tagen", many: "Seiten ohne einen einzigen Besuch in 30 Tagen", why: "Diese Seiten sollen bei Google ranken, wurden aber in 30 Tagen von niemandem geöffnet. Entweder findet Google sie nicht, oder sie ranken zu weit hinten.", steps: ["Von gut besuchten Seiten im Text hierher verlinken", "Titel und Beschreibung prüfen: Steht das Suchwort vorn, macht der Text neugierig?", "Sobald die Search Console eingerichtet ist: Adresse dort prüfen und Indexierung beantragen", "Nach vier Wochen im Dashboard nachsehen, ob Besuche kommen"], category: "seo", effort: "M" },
  "keyword-offen": { level: 2, topic: "Suchbegriffe", one: "Suchbegriff ohne eigene Seite", many: "Suchbegriffe ohne eigene Seite", why: "Nach diesen Begriffen wird gesucht, aber TasWiq hat keine Seite, die genau diese Frage beantwortet. Hier ranken nur andere.", steps: ["Je Begriff einen Ratgeber nach dem Aufbau in team/seo-plan.md schreiben – zuerst den Begriff mit der klarsten Kaufabsicht", "Im Artikel früh auf die passende Leistungs- oder Branchenseite und auf den Preisrechner verlinken", "Die neue Seite in src/config/keywords.ts als Zielseite des Begriffs eintragen und in team/seo-plan.md abhaken", RECHECK], category: "seo", effort: "L" },
  "keyword-schwach": { level: 3, topic: "Suchbegriffe", one: "Suchbegriff steht nicht in Titel oder Überschrift der Zielseite", many: "Suchbegriffe stehen nicht in Titel oder Überschrift ihrer Zielseite", why: "Titel und Hauptüberschrift sind die stärksten Signale für Google. Steht der Begriff dort nicht, rankt die Seite für ihn deutlich schlechter.", steps: ["Den Begriff in den Google-Titel (vorn) und in die Hauptüberschrift der Zielseite aufnehmen – Titel bleibt bei höchstens 60 Zeichen", "Steht der Begriff gar nicht auf der Seite: einen eigenen Abschnitt mit Zwischenüberschrift dazu ergänzen", RECHECK], category: "seo", effort: "S" },
};

const AREA_INDUSTRY: Partial<Record<KeywordArea, string>> = { gastro: "gastro", beauty: "beauty", immobilien: "immobilien", automotive: "automotive", kanzlei: "kanzlei", handwerk: "handwerk" };
const SEO_GROUPS: PageNode["group"][] = ["branchen", "leistungen", "ratgeber"];

export function buildReport(site: SiteStructure, paths: PathStats | null, tasks: TaskRow[], scans: SiteScanRow[], leads: LeadRow[]): SiteReport {
  const home = site.pages.find((p) => p.group === "start")?.path ?? "/";
  const found = new Map<string, Finding["items"]>();
  const add = (id: string, path: string | null, note = "") => found.set(id, [...(found.get(id) ?? []), { path, note }]);

  const inbound = new Map<string, number>();
  for (const p of site.pages) for (const to of new Set(p.links.filter((l) => l.kind === "seite").map((l) => l.to))) inbound.set(to, (inbound.get(to) ?? 0) + 1);
  const stats = new Map((paths?.pages ?? []).map((p) => [p.path.replace(/\/+$/, "") || "/", p]));
  const totalViews = (paths?.pages ?? []).reduce((s, p) => s + p.views, 0);
  const titles = new Map<string, string[]>();

  for (const p of site.pages) {
    const indexable = p.status === 200 && !p.noindex;
    // Struktur
    if (p.verdict === "fehler") add("fehler", p.path, p.status ? `Status ${p.status}` : "beim Einlesen nicht erreichbar");
    for (const l of p.links) {
      if (l.broken === "seite") add("defekt", p.path, `Link „${l.text}“ → ${l.to}`);
      if (l.broken === "anker") add("anker", p.path, `Link „${l.text}“ → ${l.to}#${l.hash}`);
    }
    if (p.verdict === "sackgasse") add("sackgasse", p.path);
    if (p.verdict === "schwach") add("kein-cta", p.path);
    if (p.status === 200 && p.path !== home && (p.depth === null || (!inbound.get(p.path) && !p.inNav))) add("verwaist", p.path, inbound.get(p.path) ? "nur von ebenfalls unerreichbaren Seiten verlinkt" : "keine Seite verlinkt hierher");
    if (p.depth !== null && p.depth > 3) add("tief", p.path, `${p.depth} Klicks`);
    if (p.status !== 200) continue;

    // Call-to-Actions: Qualität
    const offers = p.links.filter((l) => l.offer);
    if (p.verdict === "ok" && SEO_GROUPS.includes(p.group) && p.words > 500 && !p.path.endsWith("/blog")) {
      if (offers.length && offers[0].pos > 0.4) add("cta-spaet", p.path, `erster Call-to-Action nach ${Math.round(offers[0].pos * 100)} % der Seite`);
      if (p.words > 1500 && offers.length <= 1) add("cta-wenig", p.path, `${p.words.toLocaleString("de-DE")} Wörter, ${offers.length} Call-to-Action`);
    }

    // SEO
    if (!indexable) {
      if (p.inSitemap) add("sitemap-gesperrt", p.path, "für Google gesperrt (noindex)");
      continue;
    }
    if (!p.titleLen) add("titel-fehlt", p.path);
    else if (p.titleLen > 65) add("titel-lang", p.path, `${p.titleLen} Zeichen: „${p.title}“`);
    if (p.title) titles.set(p.title, [...(titles.get(p.title) ?? []), p.path]);
    if (!p.description) add("beschreibung-fehlt", p.path);
    else if (p.description.length > 165) add("beschreibung-lang", p.path, `${p.description.length} Zeichen`);
    if (p.h1Count === 0) add("h1-fehlt", p.path);
    if (p.h1Count > 1) add("h1-mehrfach", p.path, `${p.h1Count} Hauptüberschriften`);
    if (SEO_GROUPS.includes(p.group) && p.words < 300 && !p.path.endsWith("/blog")) add("duenn", p.path, `${p.words} Wörter`);
    if (p.path !== home && p.depth !== null && !p.inNav && (inbound.get(p.path) ?? 0) === 1) add("wenig-links", p.path);
    if (site.sitemapRead && !p.inSitemap && p.group !== "rechtliches") add("sitemap-fehlt", p.path);
    if (p.canonicalElsewhere) add("canonical", p.path, `verweist auf ${p.canonicalElsewhere}`);
    if (!p.schema) add("schema", p.path);

    // Besucher – erst aussagekräftig, wenn die Messung genug Daten hat
    const s = stats.get(p.path);
    if (s && s.views >= 20 && s.exits / s.views >= 0.8 && !["angebot", "rechtliches"].includes(p.group) && p.path !== home) add("ausstieg", p.path, `${s.exits} von ${s.views} Besuchen enden hier`);
    if (totalViews >= 100 && !s && SEO_GROUPS.includes(p.group)) add("kein-besuch", p.path);
  }
  for (const [title, list] of titles) if (list.length > 1) for (const path of list) add("titel-doppelt", path, `„${title}“`);
  for (const p of site.pages) if (p.status !== 200 && p.inSitemap) add("sitemap-gesperrt", p.path, "Seite lädt nicht");
  for (const k of site.keywords) {
    if (k.status === "offen") add("keyword-offen", null, k.term);
    else if (k.status !== "stark") add("keyword-schwach", k.target, k.status === "fehlt" ? `„${k.term}“ kommt auf der Zielseite nicht vor` : `„${k.term}“ steht nur im Text`);
  }

  const open = tasks.filter((t) => t.key?.startsWith("struktur-"));
  const findings: Finding[] = Array.from(found, ([id, items]) => {
    const spec = SPECS[id];
    const key = `struktur-${id}-${hash(items.map((i) => `${i.path}|${i.note}`).sort().join("\n"))}`;
    const exact = open.find((t) => t.key === key);
    const similar = exact ?? open.find((t) => t.key!.startsWith(`struktur-${id}-`) && t.status !== "erledigt");
    return {
      id,
      key,
      level: spec.level,
      topic: spec.topic,
      title: `${items.length} ${items.length === 1 ? spec.one : spec.many}`,
      why: spec.why,
      items,
      steps: spec.steps,
      category: spec.category,
      effort: spec.effort,
      task: similar ? { id: similar.id, status: similar.status, run_state: similar.run_state, exact: Boolean(exact) } : null,
    };
  }).sort((a, b) => a.level - b.level || b.items.length - a.items.length);

  // Seiten ohne Befund der Stufen 1 und 2
  const flagged = new Set(findings.filter((f) => f.level < 3).flatMap((f) => f.items.map((i) => i.path)));
  const level = [1, 2, 3].map((l) => findings.filter((f) => f.level === l).length) as [number, number, number];

  // Vergleich mit dem letzten Stand eines früheren Tages
  const today = site.scannedAt.slice(0, 10);
  const prev = scans.find((s) => s.day < today);
  const label = (id: string, n?: number) => (SPECS[id] ? `${n ?? ""} ${n === 1 ? SPECS[id].one : SPECS[id].many}`.trim() : id);
  const diff = prev
    ? {
        since: prev.day,
        newPages: site.pages.filter((p) => !prev.data.pages.some((x) => x.p === p.path)).map((p) => p.path),
        gonePages: prev.data.pages.filter((x) => !site.pages.some((p) => p.path === x.p)).map((x) => x.p),
        newFindings: findings.filter((f) => !prev.data.findings.some((x) => x.id === f.id)).map((f) => f.title),
        resolved: prev.data.findings.filter((x) => !findings.some((f) => f.id === x.id)).map((x) => label(x.id, x.n)),
      }
    : null;

  const since = Date.now() - 30 * 86_400_000;
  const areas: AreaRow[] = keywordAreas
    .map((a) => {
      const kws = site.keywords.filter((k) => k.area === a.id);
      const targets = Array.from(new Set(kws.map((k) => k.target).filter((t): t is string => Boolean(t))));
      const industry = AREA_INDUSTRY[a.id];
      return {
        id: a.id,
        label: a.label,
        pages: targets.length,
        strong: kws.filter((k) => k.status === "stark").length,
        total: kws.length,
        open: kws.filter((k) => k.status === "offen").length,
        visitors: targets.reduce((s, t) => s + (stats.get(t)?.visitors ?? 0), 0),
        search: targets.reduce((s, t) => s + (stats.get(t)?.search ?? 0), 0),
        leads: industry ? leads.filter((l) => !l.is_test && l.industry === industry && Date.parse(l.created_at) >= since).length : null,
      };
    })
    .filter((a) => a.total > 0);

  return {
    findings,
    summary: {
      pages: site.pages.length,
      clean: site.pages.filter((p) => !flagged.has(p.path)).length,
      level,
      views: totalViews,
      search: (paths?.pages ?? []).reduce((s, p) => s + p.search, 0),
      ai: (paths?.pages ?? []).reduce((s, p) => s + p.ai, 0),
      keywordsStrong: site.keywords.filter((k) => k.status === "stark").length,
      keywordsTotal: site.keywords.length,
    },
    diff,
    areas,
    paths,
  };
}

/** Kompakter Stand für den Verlauf */
export const snapshotOf = (site: SiteStructure, report: SiteReport): SiteScanData => ({
  pages: site.pages.map((p) => ({ p: p.path, v: p.verdict })),
  findings: report.findings.map((f) => ({ id: f.id, level: f.level, n: f.items.length })),
});

/** Text der Aufgabe, wie sie im Board landet: Begründung, betroffene Seiten, Schritte. */
export function taskOf(f: Finding) {
  const shown = f.items.slice(0, 20).map((i) => `• ${[i.path, i.note].filter(Boolean).join(" – ")}`);
  if (f.items.length > 20) shown.push(`… und ${f.items.length - 20} weitere (Dashboard → Seitenstruktur)`);
  return { key: f.key, title: f.title, why: `${f.why}\n\nBetroffen:\n${shown.join("\n")}`, steps: f.steps.join("\n"), category: f.category, priority: f.level, effort: f.effort };
}
