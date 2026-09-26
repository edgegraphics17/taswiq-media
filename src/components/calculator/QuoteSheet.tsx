import type { Estimate } from "@/lib/pricing-engine";
import { site } from "@/config/site";
import { formatEUR, formatNumber, cn } from "@/lib/format";
import { Logo } from "@/components/ui/Logo";

/**
 * Kostenrahmen als A4-Blatt im Soft-UI-Look: schwarzer Kopf mit violettem Schein,
 * Posten-Tabelle mit Job-Nr., violette Gesamt-Pille. Vorschau im Ergebnis UND PDF-Druckvorlage.
 */
export function QuoteSheet({ estimate, rows, title, className }: { estimate: Estimate; rows: { id: string; label: string; wert: string }[]; title: string; className?: string }) {
  const today = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date());
  return (
    <article className={cn("overflow-hidden bg-white text-ink", className)}>
      <header className="relative overflow-hidden bg-night px-8 pt-8 pb-7 text-white sm:px-10">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.5),transparent)]" aria-hidden />
        <div className="relative flex items-start justify-between gap-6">
          <Logo tone="light" className="h-12" />
          <p className="rounded-full bg-white/10 px-3 py-1 text-xs">Stand {today}</p>
        </div>
        <p className="relative mt-8 text-[clamp(1.9rem,5vw,2.8rem)] leading-none font-medium tracking-tight">Kostenrahmen</p>
        <p className="relative mt-2 text-[15px] text-night-muted">{title}</p>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <span className="num rounded-full bg-brand-500 px-4 py-2 text-sm font-medium">
            {formatNumber(estimate.von)} – {formatNumber(estimate.bis)} € einmalig
          </span>
          <span className="num rounded-full bg-white/10 px-4 py-2 text-sm">{estimate.summeMtl > 0 ? `${formatEUR(estimate.summeMtl)} / Monat` : "keine laufenden Kosten"}</span>
        </div>
      </header>

      <div className="px-8 py-7 sm:px-10">
        <p className="text-sm font-medium text-brand-600">Deine Auswahl</p>
        <dl className="mt-3 grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="flex justify-between gap-3 border-b border-line pb-1.5">
              <dt className="text-muted">{r.label}</dt>
              <dd className="text-right font-medium">{r.wert}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm font-medium text-brand-600">Leistungen</p>
        <table className="mt-2 w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="py-2 pr-3 font-medium">Nr.</th>
              <th className="py-2 pr-3 font-medium">Beschreibung</th>
              <th className="py-2 text-right font-medium">Summe</th>
            </tr>
          </thead>
          <tbody>
            {estimate.einmalig.map((l, i) => (
              <tr key={l.key} className="border-b border-line align-top">
                <td className="num py-3 pr-3 text-muted">{12001 + i}</td>
                <td className="py-3 pr-3">
                  <p className="font-medium">{l.label}</p>
                  {l.detail && <p className="mt-0.5 text-[12px] text-muted">{l.detail}</p>}
                </td>
                <td className="num py-3 text-right font-medium whitespace-nowrap">{formatEUR(l.betrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-sm space-y-1.5 text-[13px]">
          <p className="flex justify-between">
            <span>Summe</span>
            <span className="num">{formatEUR(estimate.summeEin)}</span>
          </p>
          <p className="flex justify-between text-brand-600">
            <span>Richtwert-Spanne</span>
            <span>−10 % / +18 %</span>
          </p>
          <div className="mt-3 flex items-center justify-between rounded-full bg-night px-5 py-3 text-white">
            <span className="text-xs text-night-muted">Gesamtrahmen</span>
            <span className="num text-lg font-medium">
              {formatNumber(estimate.von)} – {formatNumber(estimate.bis)} €
            </span>
          </div>
        </div>

        {estimate.monatlich.length > 0 && (
          <>
            <p className="mt-8 text-sm font-medium text-brand-600">Laufend pro Monat</p>
            <table className="mt-2 w-full text-[13px]">
              <tbody>
                {estimate.monatlich.map((l) => (
                  <tr key={l.key} className="border-b border-line">
                    <td className="py-2.5 pr-3">
                      <span className="font-medium">{l.label}</span>
                      {l.detail && <span className="text-muted"> · {l.detail}</span>}
                    </td>
                    <td className="num py-2.5 text-right font-medium whitespace-nowrap">{formatEUR(l.betrag)}/Monat</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-muted">
          <b className="text-ink">Richtwert, kein Angebot.</b> Die Spanne beruht allein auf deinen Angaben. Was dein Projekt wirklich braucht, klären wir gemeinsam – danach nennen wir einen festen Preis. {site.vatNote}
        </p>
      </div>

      <footer className="grid gap-4 bg-canvas px-8 py-5 text-[11px] sm:grid-cols-3 sm:px-10">
        <div>
          <p className="font-medium text-brand-600">Kontakt</p>
          <p className="mt-1.5">
            <b>{site.name}</b> · {site.owner}
            <br />
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div>
          <p className="font-medium text-brand-600">Nächster Schritt</p>
          <p className="mt-1.5">Angebot anfordern – Antwort innerhalb von 24 Stunden mit Festpreis.</p>
        </div>
        <div>
          <p className="font-medium text-brand-600">Nutzungsrechte</p>
          <p className="mt-1.5">Ausschließlich, zeitlich und räumlich unbegrenzt – nach Zahlungseingang.</p>
        </div>
      </footer>
    </article>
  );
}
