import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsData } from "@/lib/admin/data";
import { CHANNEL_LABEL, EVENT_LABEL } from "@/lib/admin/labels";
import { cn, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Analytics" };

const RANGES = [7, 30, 90] as const;
const dayLabel = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %` : "–");

/** Balkenliste: ein Farbton, Wert steht als Zahl daneben (Balken = Gestalt, Zahl = Information). */
function Bars({ rows, empty }: { rows: { label: string; value: number; hint?: string }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="mt-4 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-4 space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_48px] items-center gap-x-3 gap-y-1 text-sm">
          <span className="truncate text-body" title={r.label}>
            {r.label} {r.hint && <span className="text-xs text-muted">· {r.hint}</span>}
          </span>
          <span className="num text-right font-semibold text-ink">{formatNumber(r.value)}</span>
          <span className="col-span-2 h-1.5 rounded-full bg-canvas" aria-hidden>
            <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value ? 4 : 0 }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, hint, children, className }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5", className)}>
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {children}
    </section>
  );
}

/** Woher kommen Besucher, was sehen sie sich an, wo steigen sie aus – eigene Messung ohne Cookies. */
export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ tage?: string }> }) {
  const requested = Number((await searchParams).tage);
  const days = (RANGES as readonly number[]).includes(requested) ? requested : 30;
  const a = await getAnalyticsData(days);

  // Lücken füllen: Tage ohne Besuch sind 0, nicht „fehlen“.
  const byDay = new Map(a.daily.map((d) => [d.day, d]));
  const series = Array.from({ length: days }).map((_, i) => {
    const day = new Date(Date.parse(`${a.since}T00:00:00Z`) + i * 86_400_000).toISOString().slice(0, 10);
    return byDay.get(day) ?? { day, views: 0, visitors: 0 };
  });
  const maxV = Math.max(1, ...series.map((d) => d.visitors));
  const ev = (name: string) => a.events.find((e) => e.name === name)?.visitors ?? 0;
  const ai = a.channels.find((c) => c.channel === "ki")?.visitors ?? 0;
  const search = a.channels.find((c) => c.channel === "suche")?.visitors ?? 0;

  const tiles = [
    { label: "Besucher", value: formatNumber(a.totals.visitors), hint: `${formatNumber(a.totals.views)} Seitenaufrufe` },
    { label: "Anfragen", value: formatNumber(a.leads), hint: `${pct(a.leads, a.totals.visitors)} der Besucher` },
    { label: "Kalkulationen", value: formatNumber(a.calculations), hint: "Preisrechner abgeschlossen" },
    { label: "Über Suchmaschinen", value: formatNumber(search), hint: `${pct(search, a.totals.visitors)} · SEO` },
    { label: "Über KI-Assistenten", value: formatNumber(ai), hint: `${pct(ai, a.totals.visitors)} · GEO` },
  ];

  // Weg zur Anfrage: jede Stufe als Anteil der Besucher
  const funnel = [
    { label: "Besucher", value: a.totals.visitors },
    { label: "Rechner oder Funnel begonnen", value: Math.max(ev("rechner_schritt"), 0) + ev("funnel_step") },
    { label: "Rechner-Ergebnis gesehen", value: ev("rechner_ergebnis") },
    { label: "Anfrage gesendet", value: a.leads },
  ];

  return (
    <div className="mx-auto max-w-[1280px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-brand-600">Kunden &amp; Website</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Analytics</h1>
        </div>
        <nav aria-label="Zeitraum" className="flex rounded-full border border-line bg-white p-1">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?tage=${r}`}
              aria-current={r === days ? "page" : undefined}
              className={cn("num flex min-h-9 items-center rounded-full px-4 text-sm font-semibold", r === days ? "bg-night text-white" : "text-muted hover:text-ink")}
            >
              {r} Tage
            </Link>
          ))}
        </nav>
      </header>

      {a.totals.views === 0 && (
        <p className="mt-6 rounded-xl border border-line bg-white px-4 py-3 text-sm text-body">
          Noch keine Besuche in diesem Zeitraum. Die Messung läuft seit dem Einbau – Zahlen erscheinen, sobald die ersten Besucher kommen.
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-white p-4">
            <dt className="text-xs font-semibold tracking-wide text-muted">{t.label}</dt>
            <dd className="num mt-1.5 text-2xl font-extrabold tracking-tight text-ink">{t.value}</dd>
            <dd className="mt-0.5 text-xs text-muted">{t.hint}</dd>
          </div>
        ))}
      </dl>

      <Panel title="Besucher pro Tag" hint={`Höchstwert: ${formatNumber(maxV)} Besucher`} className="mt-6">
        <ol className="mt-5 flex h-40 items-end gap-px sm:gap-1" aria-label="Besucher pro Tag">
          {series.map((d) => (
            <li key={d.day} className="group relative flex h-full flex-1 items-end" title={`${dayLabel.format(new Date(d.day))}: ${d.visitors} Besucher, ${d.views} Aufrufe`}>
              <span className="block w-full rounded-t-[3px] bg-brand-500 transition-[filter] group-hover:brightness-90" style={{ height: `${(d.visitors / maxV) * 100}%`, minHeight: d.visitors ? 3 : 1, opacity: d.visitors ? 1 : 0.25 }} />
              <span className="sr-only">
                {dayLabel.format(new Date(d.day))}: {d.visitors} Besucher
              </span>
            </li>
          ))}
        </ol>
        <div className="num mt-2 flex justify-between text-xs text-muted">
          <span>{dayLabel.format(new Date(series[0].day))}</span>
          <span>{dayLabel.format(new Date(series[series.length - 1].day))}</span>
        </div>
      </Panel>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title="Woher kommt der Traffic?" hint="Besucher nach Kanal">
          <Bars empty="Noch keine Daten." rows={a.channels.map((c) => ({ label: CHANNEL_LABEL[c.channel] ?? c.channel, value: c.visitors, hint: pct(c.visitors, a.totals.visitors) }))} />
        </Panel>
        <Panel title="Quellen im Detail" hint="Websites, Suchmaschinen, KI-Assistenten und Kampagnen">
          <Bars empty="Noch keine Daten." rows={a.sources.map((s) => ({ label: s.source === "direkt" ? "Direkt / unbekannt" : s.source, value: s.visitors, hint: CHANNEL_LABEL[s.channel] ?? s.channel }))} />
        </Panel>
        <Panel title="Meistbesuchte Seiten" hint="Besucher je Seite">
          <Bars empty="Noch keine Daten." rows={a.pages.map((p) => ({ label: p.path, value: p.visitors, hint: `${formatNumber(p.views)} Aufrufe` }))} />
        </Panel>
        <Panel title="Weg zur Anfrage" hint="Wie viele Besucher kommen wie weit?">
          <Bars empty="Noch keine Daten." rows={funnel.map((f) => ({ label: f.label, value: f.value, hint: pct(f.value, a.totals.visitors) }))} />
        </Panel>
        <Panel title="Aktionen auf der Website" hint="Klicks und Schritte (Anzahl)">
          <Bars empty="Noch keine Aktionen gemessen." rows={a.events.map((e) => ({ label: EVENT_LABEL[e.name] ?? e.name, value: e.n, hint: `${formatNumber(e.visitors)} Besucher` }))} />
        </Panel>
        <Panel title="Geräte, Sprache & Kampagnen">
          <Bars
            empty="Noch keine Daten."
            rows={[
              ...a.devices.map((d) => ({ label: d.device === "mobil" ? "Smartphone" : d.device === "desktop" ? "Desktop" : d.device === "tablet" ? "Tablet" : "Unbekannt", value: d.visitors, hint: "Gerät" })),
              ...a.locales.map((l) => ({ label: l.locale === "en" ? "Englisch" : "Deutsch", value: l.visitors, hint: "Sprache" })),
              ...a.campaigns.map((c) => ({ label: c.campaign, value: c.visitors, hint: "Kampagne" })),
            ]}
          />
        </Panel>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Eigene Messung ohne Cookies: Besucher werden pro Tag gezählt (wer an zwei Tagen kommt, zählt zweimal). Bots und Aufrufe mit „Do Not Track“ sind nicht enthalten.
        Google-Rankings und Klickzahlen aus der Suche stehen nicht hier, sondern in der Google Search Console.
      </p>
    </div>
  );
}
