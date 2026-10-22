import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { removeDomain, runCrawl, runPageSpeed, setSources } from "@/app/admin/seo-actions";
import { PendingButton } from "@/components/admin/PendingButton";
import { Delta, Panel } from "@/components/admin/SeoBits";
import { requireAdmin } from "@/lib/admin/data";
import { ga4Report, getGoogle, googleSources, gscReport, listDomains, type PsiResult } from "@/lib/admin/seo";
import { cn, formatDateTime, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "SEO" };
// Seiten-Check und PageSpeed laufen als Server Action dieser Seite und brauchen Zeit.
export const maxDuration = 120;

const RANGES = [7, 28, 90] as const;
const n1 = (v: number) => v.toLocaleString("de-DE", { maximumFractionDigits: 1 });
const sec = (ms: number) => `${(ms / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} s`;
const tone = (good: boolean, ok: boolean) => (good ? "text-emerald-700" : ok ? "text-amber-700" : "text-red-700");
const path = (u: string) => u.replace(/^https?:\/\/[^/]+/, "") || "/";
const select = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink";

function Table({ rows, head, empty }: { rows: (string | number)[][]; head: string[]; empty: string }) {
  if (!rows.length) return <p className="mt-4 text-sm text-muted">{empty}</p>;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs text-muted">{head.map((h, i) => <th key={h} className={cn("pb-2 font-medium", i > 0 && "pl-3 text-right")}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((c, j) => <td key={j} className={cn("py-2", j ? "num pl-3 text-right whitespace-nowrap" : "max-w-0 w-full truncate text-body")} title={j ? undefined : String(c)}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Psi({ label, r }: { label: string; r?: PsiResult }) {
  if (!r) return <div className="rounded-xl bg-canvas p-4 text-sm text-muted">{label}: keine Messung</div>;
  return (
    <div className="rounded-xl bg-canvas p-4 text-sm">
      <p className="flex items-baseline justify-between"><span className="font-semibold text-ink">{label}</span><span className={cn("num text-2xl font-bold", tone(r.score >= 90, r.score >= 50))}>{r.score}</span></p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div><dt className="text-muted">LCP (Labor)</dt><dd className={cn("num font-semibold", tone(r.lcp <= 2500, r.lcp <= 4000))}>{sec(r.lcp)}</dd></div>
        <div><dt className="text-muted">CLS (Labor)</dt><dd className={cn("num font-semibold", tone(r.cls <= 0.1, r.cls <= 0.25))}>{r.cls.toFixed(2)}</dd></div>
        <div><dt className="text-muted">TBT</dt><dd className={cn("num font-semibold", tone(r.tbt <= 200, r.tbt <= 600))}>{formatNumber(r.tbt)} ms</dd></div>
        <div><dt className="text-muted">FCP</dt><dd className={cn("num font-semibold", tone(r.fcp <= 1800, r.fcp <= 3000))}>{sec(r.fcp)}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-muted">
        {r.field?.category
          ? <>Echte Nutzer (Chrome, 28 T.): LCP {r.field.lcp ? sec(r.field.lcp) : "–"} · INP {r.field.inp ?? "–"} ms · CLS {r.field.cls?.toFixed(2) ?? "–"}</>
          : "Für echte Nutzerdaten (Core Web Vitals) hat die Seite noch zu wenig Besucher."}
      </p>
    </div>
  );
}

/** Detailansicht einer Domain: Search Console, GA4, PageSpeed, Seiten-Check. */
export default async function SeoDomainPage({ params, searchParams }: { params: Promise<{ domain: string }>; searchParams: Promise<{ tage?: string }> }) {
  await requireAdmin();
  const { domain } = await params;
  const requested = Number((await searchParams).tage);
  const days = (RANGES as readonly number[]).includes(requested) ? requested : 28;
  const d = (await listDomains()).find((x) => x.domain === domain);
  if (!d) notFound();
  const google = await getGoogle();
  const [sources, gsc, ga] = await Promise.all([
    google.refreshToken ? googleSources().catch(() => null) : null,
    d.data.gscSite ? gscReport(d.data.gscSite, days, true).catch((e: Error) => e) : null,
    d.data.ga4 ? ga4Report(d.data.ga4, days).catch((e: Error) => e) : null,
  ]);
  const maxClicks = gsc && !(gsc instanceof Error) ? Math.max(1, ...gsc.daily.map((x) => x.clicks)) : 1;
  const c = d.data.crawl;
  const problemPages = c?.pages.filter((p) => p.issues.length) ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/seo" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" aria-hidden /> Alle Domains</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight break-all text-ink">{domain}</h1>
        <nav className="flex gap-1 rounded-full bg-white p-1 text-sm" aria-label="Zeitraum">
          {RANGES.map((r) => (
            <Link key={r} href={`?tage=${r}`} aria-current={r === days ? "page" : undefined} className={cn("flex min-h-9 items-center rounded-full px-3", r === days ? "bg-ink text-white" : "text-muted hover:text-ink")}>{r} Tage</Link>
          ))}
        </nav>
      </div>

      {sources && (
        <form action={setSources} className="mt-4 grid gap-2 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="domain" value={domain} />
          <label className="text-xs text-muted">Search Console
            <select name="gscSite" defaultValue={d.data.gscSite ?? ""} className={select}>
              <option value="">– keine –</option>
              {sources.sites.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">Google Analytics 4
            <select name="ga4" defaultValue={d.data.ga4 ?? ""} className={select}>
              <option value="">– keine –</option>
              {sources.ga.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <button className="mt-auto min-h-11 cursor-pointer rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-brand-600">Zuordnen</button>
        </form>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Google-Suche" hint={`Search Console · ${days} Tage bis gestern, Vergleich zum Vorzeitraum`} className="lg:col-span-2">
          {gsc instanceof Error ? <p className="mt-3 text-sm text-red-700">{gsc.message}</p> : !gsc ? <p className="mt-3 text-sm text-muted">Keine Search-Console-Property zugeordnet.</p> : (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Klicks", formatNumber(gsc.total.clicks), <Delta key="d" now={gsc.total.clicks} prev={gsc.prev.clicks} />],
                  ["Impressionen", formatNumber(gsc.total.impressions), <Delta key="d" now={gsc.total.impressions} prev={gsc.prev.impressions} />],
                  ["CTR", `${n1(gsc.total.ctr * 100)} %`, <Delta key="d" now={gsc.total.ctr} prev={gsc.prev.ctr} />],
                  ["Ø Position", gsc.total.position ? n1(gsc.total.position) : "–", <Delta key="d" now={gsc.total.position} prev={gsc.prev.position} lowerIsBetter />],
                ].map(([l, v, delta]) => (
                  <div key={l as string}><dt className="text-xs text-muted">{l}</dt><dd className="num text-xl font-bold text-ink">{v} {delta}</dd></div>
                ))}
              </dl>
              <div className="mt-5 flex h-28 items-end gap-px" role="img" aria-label="Klicks pro Tag">
                {gsc.daily.map((x) => <span key={x.day} title={`${x.day}: ${x.clicks} Klicks, ${x.impressions} Impressionen`} className="flex-1 rounded-t bg-brand-500" style={{ height: `${(x.clicks / maxClicks) * 100}%`, minHeight: 2 }} />)}
              </div>
              <p className="mt-1 flex justify-between text-[11px] text-muted"><span>{gsc.daily[0]?.day}</span><span>Klicks pro Tag</span><span>{gsc.daily.at(-1)?.day}</span></p>
            </>
          )}
        </Panel>

        {gsc && !(gsc instanceof Error) && (
          <>
            <Panel title="Top-Suchbegriffe">
              <Table head={["Suchbegriff", "Klicks", "Impr.", "Pos."]} rows={gsc.queries.slice(0, 25).map((r) => [r.keys![0], r.clicks, formatNumber(r.impressions), n1(r.position)])} empty="Noch keine Suchbegriffe." />
            </Panel>
            <Panel title="Top-Seiten">
              <Table head={["Seite", "Klicks", "Impr.", "Pos."]} rows={gsc.pages.slice(0, 25).map((r) => [path(r.keys![0]), r.clicks, formatNumber(r.impressions), n1(r.position)])} empty="Noch keine Seiten." />
            </Panel>
          </>
        )}

        <Panel title="Besucher" hint={`Google Analytics 4 · ${days} Tage`}>
          {ga instanceof Error ? <p className="mt-3 text-sm text-red-700">{ga.message}</p> : !ga ? <p className="mt-3 text-sm text-muted">Keine GA4-Property zugeordnet.</p> : (
            <>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div><dt className="text-xs text-muted">Aktive Nutzer</dt><dd className="num text-xl font-bold text-ink">{formatNumber(ga.users)}</dd></div>
                <div><dt className="text-xs text-muted">Sitzungen</dt><dd className="num text-xl font-bold text-ink">{formatNumber(ga.sessions)}</dd></div>
              </dl>
              <Table head={["Kanal", "Nutzer", "Sitzungen"]} rows={ga.channels.map((x) => [x.name, formatNumber(x.users), formatNumber(x.sessions)])} empty="Keine Daten im Zeitraum." />
            </>
          )}
        </Panel>

        <Panel
          title="PageSpeed"
          hint={d.data.psi ? `Startseite · gemessen ${formatDateTime(d.data.psi.at)}` : "Startseite, mobil und Desktop"}
          action={<form action={runPageSpeed}><input type="hidden" name="domain" value={domain} /><PendingButton label="Messen" pendingLabel="Misst (bis 1 Min.) …" /></form>}
        >
          {d.data.psi?.error && <p className="mt-3 text-sm text-red-700">{d.data.psi.error}</p>}
          {d.data.psi && <div className="mt-4 grid gap-3 sm:grid-cols-2"><Psi label="Mobil" r={d.data.psi.mobile} /><Psi label="Desktop" r={d.data.psi.desktop} /></div>}
        </Panel>

        <Panel
          title="Seiten-Check"
          hint={c ? `${c.pages.length} Seiten gelesen · ${formatDateTime(c.at)} · robots.txt: ${c.robots} · Sitemap: ${c.sitemap ? "ja" : "fehlt"}` : "Liest bis zu 40 Seiten und prüft Titel, Beschreibung, H1, Alt-Texte, strukturierte Daten, Indexierbarkeit und Links."}
          action={<form action={runCrawl}><input type="hidden" name="domain" value={domain} /><PendingButton label="Prüfen" pendingLabel="Prüft …" /></form>}
          className="lg:col-span-2"
        >
          {c && (
            <>
              <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <span><b className="num">{c.pages.filter((p) => p.indexable).length}</b> von {c.pages.length} indexierbar</span>
                <span><b className={cn("num", problemPages.length ? "text-amber-700" : "text-emerald-700")}>{problemPages.length}</b> Seiten mit Hinweisen</span>
                <span><b className={cn("num", c.broken.length ? "text-red-700" : "text-emerald-700")}>{c.broken.length}</b> defekte Links</span>
                <span>Strukturierte Daten: {[...new Set(c.pages.flatMap((p) => p.schema))].join(", ") || "keine"}</span>
              </p>
              {c.broken.length > 0 && (
                <Table head={["Defekter Link", "Status", "gefunden auf"]} rows={c.broken.map((b) => [b.url, b.status || "nicht erreichbar", path(b.from)])} empty="" />
              )}
              <ul className="mt-4 divide-y divide-line text-sm">
                {problemPages.map((p) => (
                  <li key={p.url} className="py-2">
                    <a href={p.url} target="_blank" rel="noreferrer" className="font-medium break-all text-ink hover:underline">{path(p.url)}</a>
                    <p className="mt-0.5 text-xs text-amber-800">{p.issues.join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <form action={removeDomain} className="mt-8">
        <input type="hidden" name="domain" value={domain} />
        <button className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-muted hover:text-red-700"><Trash2 className="size-4" aria-hidden /> Domain entfernen</button>
      </form>
    </div>
  );
}
