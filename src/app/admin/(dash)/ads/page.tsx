import type { Metadata } from "next";
import Link from "next/link";
import { refreshAds, saveMetaToken } from "@/app/admin/seo-actions";
import { PendingButton } from "@/components/admin/PendingButton";
import { Delta, Panel } from "@/components/admin/SeoBits";
import { requireAdmin } from "@/lib/admin/data";
import { adsReport, type Account, type Metrics } from "@/lib/admin/ads";
import { cn, formatDateTime, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Ads" };

const RANGES = [7, 30, 90] as const;
const input = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink";
const button = "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-brand-600";
const money = (n: number, currency: string) => n.toLocaleString("de-DE", { style: "currency", currency, maximumFractionDigits: n < 100 ? 2 : 0 });
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %` : "–");
const conv = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 1 });

function Kpis({ a }: { a: Account }) {
  const t: Metrics = a.total;
  const items = [
    ["Kosten", money(t.cost, a.currency), <Delta key="d" now={t.cost} prev={a.prev.cost} />],
    ["Klicks", formatNumber(t.clicks), <Delta key="d" now={t.clicks} prev={a.prev.clicks} />],
    ["Impressionen", formatNumber(t.impressions), <Delta key="d" now={t.impressions} prev={a.prev.impressions} />],
    ["CTR", pct(t.clicks, t.impressions), null],
    ["Ø CPC", t.clicks ? money(t.cost / t.clicks, a.currency) : "–", null],
    [a.platform === "google" ? "Conversions" : "Ergebnisse", conv(t.conversions), <Delta key="d" now={t.conversions} prev={a.prev.conversions} />],
    ["Kosten / Ergebnis", t.conversions ? money(t.cost / t.conversions, a.currency) : "–", null],
  ] as const;
  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-7">
      {items.map(([label, value, delta]) => (
        <div key={label} className="rounded-xl bg-canvas p-3">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="num mt-1 font-bold text-ink">{value} {delta}</dd>
        </div>
      ))}
    </dl>
  );
}

function Campaigns({ a }: { a: Account }) {
  if (!a.campaigns.length) return <p className="mt-4 text-sm text-muted">Keine Kampagne mit Ausspielung im Zeitraum.</p>;
  const head = ["Kampagne", "Status", "Kosten", "Klicks", "CTR", "Ø CPC", "Ergebnisse", "Kosten / Erg."];
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-xs text-muted">{head.map((h, i) => <th key={h} className={cn("pb-2 font-medium whitespace-nowrap", i > 1 && "pl-3 text-right")}>{h}</th>)}</tr></thead>
        <tbody>
          {a.campaigns.map((c) => (
            <tr key={c.id} className="border-t border-line">
              <td className="max-w-0 w-full truncate py-2 text-body" title={c.name}>{c.name}</td>
              <td className="py-2 pl-3"><span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", c.status === "aktiv" ? "bg-emerald-50 text-emerald-800" : "bg-canvas text-muted")}>{c.status}</span></td>
              <td className="num py-2 pl-3 text-right whitespace-nowrap">{money(c.cost, a.currency)}</td>
              <td className="num py-2 pl-3 text-right">{formatNumber(c.clicks)}</td>
              <td className="num py-2 pl-3 text-right whitespace-nowrap">{pct(c.clicks, c.impressions)}</td>
              <td className="num py-2 pl-3 text-right whitespace-nowrap">{c.clicks ? money(c.cost / c.clicks, a.currency) : "–"}</td>
              <td className="num py-2 pl-3 text-right whitespace-nowrap">{conv(c.conversions)} <span className="text-xs text-muted">{c.result}</span></td>
              <td className="num py-2 pl-3 text-right whitespace-nowrap">{c.conversions ? money(c.cost / c.conversions, a.currency) : "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Werbekonten aus Google Ads und Meta – Kennzahlen mit Vorzeitraum und Kampagnen. Stand höchstens 15 Minuten alt. */
export default async function AdsPage({ searchParams }: { searchParams: Promise<{ tage?: string; meta?: string }> }) {
  const admin = await requireAdmin();
  if (admin.demo) return <p className="text-sm text-muted">Das Ads-Modul braucht das Backend – im Demo-Modus nicht verfügbar.</p>;
  const sp = await searchParams;
  const requested = Number(sp.tage);
  const days = (RANGES as readonly number[]).includes(requested) ? requested : 30;
  const r = await adsReport(days);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Ads</h1>
          <p className="mt-1 text-sm text-muted">Google Ads und Meta (Facebook/Instagram) – letzte {days} Tage bis gestern, Vergleich zum Vorzeitraum.</p>
        </div>
        <nav className="flex gap-1 rounded-full bg-white p-1 text-sm" aria-label="Zeitraum">
          {RANGES.map((x) => (
            <Link key={x} href={`?tage=${x}`} aria-current={x === days ? "page" : undefined} className={cn("flex min-h-9 items-center rounded-full px-3", x === days ? "bg-ink text-white" : "text-muted hover:text-ink")}>{x} Tage</Link>
          ))}
        </nav>
      </div>

      {sp.meta && <p className={cn("mt-4 rounded-xl px-4 py-3 text-sm", sp.meta === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900")}>{sp.meta === "ok" ? "Meta ist verbunden." : sp.meta}</p>}
      {[["Google Ads", r.google.error], ["Meta", r.meta.error]].map(([p, e]) => e && <p key={p} className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">{p}: {e}</p>)}
      {!r.google.connected && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">Google Ads ist nicht verbunden.</p>}

      {!r.meta.connected && (
        <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
          <h2 className="font-bold">Meta verbinden (einmalig)</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>business.facebook.com → Einstellungen: Werbekonto ins Business-Portfolio aufnehmen (falls noch nicht).</li>
            <li>Nutzer → Systemnutzer → „Hinzufügen“ (Admin), dann „Assets zuweisen“ → Werbekonten, Recht „Kampagnen ansehen“.</li>
            <li>„Token generieren“ → eine App wählen, Ablauf „Nie“, Berechtigung <b>ads_read</b> → Token hier einfügen.</li>
          </ol>
          <form action={saveMetaToken} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input name="metaToken" type="password" required placeholder="Systemnutzer-Token" autoComplete="off" className={input} />
            <button className={button}>Speichern</button>
          </form>
        </section>
      )}

      <div className="mt-6 grid gap-4">
        {r.accounts.map((a) => (
          <Panel key={`${a.platform}-${a.id}`} title={a.name} hint={`${a.platform === "google" ? "Google Ads" : "Meta"} · Konto ${a.id}`}>
            <Kpis a={a} />
            <Campaigns a={a} />
          </Panel>
        ))}
      </div>
      {!r.accounts.length && <p className="mt-6 text-sm text-muted">Noch keine Werbekonten sichtbar.</p>}

      <form action={refreshAds} className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span>Stand {formatDateTime(r.at)} · aktualisiert sich alle 15 Minuten</span>
        <PendingButton label="Jetzt aktualisieren" pendingLabel="Lädt …" />
      </form>
    </div>
  );
}
