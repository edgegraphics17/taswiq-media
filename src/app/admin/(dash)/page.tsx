import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { computeKpis, getLeads } from "@/lib/admin/data";
import { BUDGET_LABEL, SOURCE_LABEL, STATUS_LABEL } from "@/lib/admin/labels";
import { LEAD_STATUSES } from "@/types/database";
import { isDemoMode } from "@/lib/env";
import { formatDateTime, formatEUR, formatNumber } from "@/lib/format";
import { ScoreBar, StatusPill, TierPill } from "@/components/admin/Pills";
import { LiveRefresh } from "@/components/admin/LiveRefresh";

const INDUSTRY = { gastro: "Gastro", musik: "Festival & Musik", andere: "Andere" } as const;

/**
 * Lead-Übersicht als Server Component: Filter über URL-Parameter (teilbar, Zurück-Taste funktioniert),
 * Daten direkt aus Supabase mit RLS, Realtime-Refresh bei neuen Leads.
 */
export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; tier?: string; q?: string }> }) {
  const filters = await searchParams;
  const [all, leads] = await Promise.all([getLeads(), getLeads(filters)]);
  const k = computeKpis(all);
  const perStatus = LEAD_STATUSES.map((s) => ({ s, n: all.filter((l) => l.status === s).length }));
  const maxN = Math.max(1, ...perStatus.map((p) => p.n));

  const tiles = [
    { label: "Unbeantwortet", value: formatNumber(k.unanswered), hint: "Status „Neu“" },
    { label: "Offene Pipeline", value: formatEUR(k.pipelineValue), hint: `${k.openCount} offene Leads` },
    { label: "Gewonnen", value: formatEUR(k.wonValue), hint: "Summe Auftragswerte" },
    { label: "Abschlussquote", value: k.winRate === null ? "–" : `${k.winRate} %`, hint: "gewonnen / entschieden" },
    { label: "Premium offen", value: formatNumber(k.premiumOpen), hint: "> 5.000 € oder hoher Score" },
  ];

  return (
    <div className="mx-auto max-w-[1280px]">
      {!isDemoMode() && <LiveRefresh />}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Leads</h1>
        </div>
        <p className="text-sm text-muted">{formatNumber(k.newThisMonth)} neue Leads diesen Monat</p>
      </header>

      {/* KPI-Kacheln – Zahl groß, Kontext klein, keine Deko-Charts */}
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-line bg-white p-4">
            <dt className="text-xs font-semibold tracking-wide text-muted">{t.label}</dt>
            <dd className="num mt-1.5 text-2xl font-extrabold tracking-tight text-ink">{t.value}</dd>
            <dd className="mt-0.5 text-xs text-muted">{t.hint}</dd>
          </div>
        ))}
      </dl>

      {/* Pipeline nach Status: feste Funnel-Reihenfolge, ein Farbton, Werte direkt beschriftet */}
      <section aria-labelledby="pipe-title" className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 id="pipe-title" className="text-sm font-bold text-ink">
          Pipeline nach Status
        </h2>
        <ul className="mt-4 space-y-2">
          {perStatus.map(({ s, n }) => (
            <li key={s}>
              <Link href={`/admin?status=${s}`} className="group grid grid-cols-[110px_1fr_36px] items-center gap-3 rounded-md py-0.5 text-sm" title={`${STATUS_LABEL[s]}: ${n} Leads`}>
                <span className="text-body group-hover:text-ink">{STATUS_LABEL[s]}</span>
                <span className="h-3.5 rounded-r bg-fog" aria-hidden>
                  <span className="block h-full rounded-r-[4px] bg-teal transition-[filter] group-hover:brightness-90" style={{ width: `${(n / maxN) * 100}%`, minWidth: n ? 4 : 0 }} />
                </span>
                <span className="num text-right font-semibold text-ink">{n}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Filter – eine Zeile über der Tabelle, GET-Formular → URL-State */}
      <form className="mt-6 flex flex-wrap items-end gap-3" role="search">
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Status
          <select name="status" defaultValue={filters.status ?? ""} className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink">
            <option value="">Alle</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Tier
          <select name="tier" defaultValue={filters.tier ?? ""} className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink">
            <option value="">Alle</option>
            <option value="premium">Premium</option>
            <option value="growth">Growth</option>
            <option value="starter">Starter</option>
          </select>
        </label>
        <label className="grid flex-1 gap-1 text-xs font-semibold text-muted">
          Suche
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input name="q" defaultValue={filters.q ?? ""} placeholder="Name, E-Mail oder Firma" className="h-11 w-full min-w-48 rounded-lg border border-line bg-white pr-3 pl-9 text-sm text-ink" />
          </span>
        </label>
        <button type="submit" className="h-11 rounded-lg bg-ink-900 px-5 text-sm font-semibold text-white">
          Filtern
        </button>
        {(filters.status || filters.tier || filters.q) && (
          <Link href="/admin" className="flex h-11 items-center px-2 text-sm font-semibold text-teal-deep">
            Zurücksetzen
          </Link>
        )}
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        {leads.length === 0 ? (
          <p className="p-10 text-center text-muted">Keine Leads für diese Filter. Setz die Filter zurück, um alle zu sehen.</p>
        ) : (
          <table className="w-full min-w-[920px] text-sm">
            <thead className="border-b border-line bg-fog/60 text-left text-xs text-muted">
              <tr>
                {["Eingang", "Lead", "Branche", "Quelle", "Budget / Schätzung", "Score", "Tier", "Status", ""].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-fog/60">
                  <td className="num px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/leads/${l.id}`} className="font-semibold text-ink hover:text-teal-deep">
                      {l.name}
                    </Link>
                    <p className="text-xs text-muted">{l.company ?? l.email}</p>
                  </td>
                  <td className="px-4 py-3 text-body">{INDUSTRY[l.industry]}</td>
                  <td className="px-4 py-3 text-body">{SOURCE_LABEL[l.source]}</td>
                  <td className="num px-4 py-3 text-body">
                    {l.estimate_min ? `${formatNumber(l.estimate_min)}–${formatNumber(l.estimate_max ?? 0)} €` : BUDGET_LABEL[l.budget]}
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBar score={l.score} />
                  </td>
                  <td className="px-4 py-3">
                    <TierPill tier={l.tier} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={l.status} />
                  </td>
                  <td className="px-2 py-3">
                    <Link href={`/admin/leads/${l.id}`} aria-label={`${l.name} öffnen`} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-fog hover:text-ink">
                      <ChevronRight className="size-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
