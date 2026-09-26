import { getCalculatorRequests } from "@/lib/admin/data";
import { formatDateTime, formatNumber } from "@/lib/format";
import { OPTIONEN } from "@/config/pricing";

/** Auswertung des Preisrechners: Was wird kalkuliert, was konvertiert? */
export default async function CalcPage() {
  const reqs = await getCalculatorRequests();
  const converted = reqs.filter((r) => r.converted_lead_id).length;
  const avgMid = reqs.length ? Math.round(reqs.reduce((s, r) => s + (r.estimate_min + r.estimate_max) / 2, 0) / reqs.length) : 0;
  const serviceCount = OPTIONEN.leistungen.map((o) => ({ label: o.label, n: reqs.filter((r) => r.service_ids.includes(o.id)).length }));
  const max = Math.max(1, ...serviceCount.map((s) => s.n));
  const label = (id: string) => OPTIONEN.leistungen.find((o) => o.id === id)?.label ?? id;

  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="eyebrow">Preisrechner</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Kalkulationen</h1>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4"><dt className="text-xs font-semibold text-muted">Abgeschlossene Kalkulationen</dt><dd className="num mt-1.5 text-2xl font-extrabold text-ink">{reqs.length}</dd></div>
        <div className="rounded-2xl border border-line bg-white p-4"><dt className="text-xs font-semibold text-muted">Daraus Anfragen</dt><dd className="num mt-1.5 text-2xl font-extrabold text-ink">{converted} <span className="text-base font-semibold text-muted">({reqs.length ? Math.round((converted / reqs.length) * 100) : 0} %)</span></dd></div>
        <div className="rounded-2xl border border-line bg-white p-4"><dt className="text-xs font-semibold text-muted">Ø Richtwert (Mitte)</dt><dd className="num mt-1.5 text-2xl font-extrabold text-ink">{formatNumber(avgMid)} €</dd></div>
      </dl>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold text-ink">Gewählte Leistungen</h2>
        <ul className="mt-4 space-y-2">
          {serviceCount.map((s) => (
            <li key={s.label} className="grid grid-cols-[150px_1fr_36px] items-center gap-3 text-sm" title={`${s.label}: ${s.n}`}>
              <span className="text-body">{s.label}</span>
              <span className="h-3.5 rounded-r bg-fog" aria-hidden><span className="block h-full rounded-r-[4px] bg-teal" style={{ width: `${(s.n / max) * 100}%` }} /></span>
              <span className="num text-right font-semibold text-ink">{s.n}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line bg-fog/60 text-left text-xs text-muted">
            <tr>{["Datum", "Branche", "Leistungen", "Richtwert", "Monatlich", "Anfrage"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {reqs.map((r) => (
              <tr key={r.id}>
                <td className="num px-4 py-3 whitespace-nowrap text-muted">{formatDateTime(r.created_at)}</td>
                <td className="px-4 py-3 text-body">{r.industry === "musik" ? "Festival & Musik" : "Gastro"}</td>
                <td className="px-4 py-3 text-body">{r.service_ids.map(label).join(", ")}</td>
                <td className="num px-4 py-3 font-semibold text-ink">{formatNumber(r.estimate_min)}–{formatNumber(r.estimate_max)} €</td>
                <td className="num px-4 py-3 text-body">{r.monthly_total ? `${formatNumber(r.monthly_total)} €` : "–"}</td>
                <td className="px-4 py-3">{r.converted_lead_id ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200 ring-inset">✓ Lead</span> : <span className="text-muted">–</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
