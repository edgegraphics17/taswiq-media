import Image from "next/image";
import type { Estimate } from "@/lib/pricing-engine";
import { site } from "@/config/site";
import { formatEUR, formatNumber, cn } from "@/lib/format";
import { Logo } from "@/components/ui/Logo";
import fog from "../../../public/images/fog.jpg";

/**
 * Kostenrahmen als A4-Blatt – exakt im Layout der TasWiq-Rechnung:
 * Nebel-Kopf in Navy, gesperrte Teal-Labels, Job-Nr.-Tabelle, dunkle Gesamt-Box,
 * Fog-Fuß mit Teal-Linie. Dient als Vorschau im Ergebnis UND als PDF-Druckvorlage.
 */
export function QuoteSheet({
  estimate,
  rows,
  title,
  className,
}: {
  estimate: Estimate;
  rows: { id: string; label: string; wert: string }[];
  title: string;
  className?: string;
}) {
  const today = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(new Date());
  const label = "text-[10px] font-semibold tracking-[0.22em] uppercase";
  return (
    <article className={cn("overflow-hidden bg-white text-ink", className)}>
      <header className="relative isolate overflow-hidden bg-ink-900 px-8 pt-8 pb-7 text-white sm:px-10">
        <Image src={fog} alt="" fill sizes="800px" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(24_34_46/0.35),rgb(24_34_46/0.92))]" />
        <div className="flex items-start justify-between gap-6">
          <Logo className="h-14" />
          <dl className="text-right text-[10px] leading-5 tracking-[0.18em] text-white/75 uppercase">
            <div>
              <dt className="inline">Stand </dt>
              <dd className="inline font-bold text-white">{today}</dd>
            </div>
            <div>
              <dt className="inline">Art </dt>
              <dd className="inline font-bold text-white">Richtwert</dd>
            </div>
          </dl>
        </div>
        <p className="mt-8 text-[clamp(1.8rem,5vw,2.7rem)] leading-none font-extrabold tracking-[0.12em]">KOSTENRAHMEN</p>
        <p className="mt-2.5 border-b border-white/25 pb-4 text-[15px] text-white/85">{title}</p>
        <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div>
            <p className={cn(label, "text-teal-light")}>Richtwert einmalig</p>
            <p className="num mt-1 text-xl font-extrabold">
              {formatNumber(estimate.von)} – {formatNumber(estimate.bis)} €
            </p>
          </div>
          <div>
            <p className={cn(label, "text-teal-light")}>Laufend pro Monat</p>
            <p className="num mt-1 text-lg font-bold">{estimate.summeMtl > 0 ? formatEUR(estimate.summeMtl) : "keine"}</p>
          </div>
          <div className="max-sm:hidden">
            <p className={cn(label, "text-teal-light")}>Kunde</p>
            <p className="mt-1 text-lg font-bold">Deine Anfrage</p>
          </div>
        </div>
      </header>

      <div className="px-8 py-7 sm:px-10">
        <p className={cn(label, "text-teal-deep")}>Deine Auswahl</p>
        <dl className="mt-3 grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="flex justify-between gap-3 border-b border-line pb-1.5">
              <dt className="text-muted">{r.label}</dt>
              <dd className="text-right font-semibold">{r.wert}</dd>
            </div>
          ))}
        </dl>

        <p className={cn(label, "mt-8 text-teal-deep")}>Leistungen</p>
        <table className="mt-2 w-full text-[13px]">
          <thead>
            <tr className={cn(label, "border-b-[1.5px] border-ink text-left text-muted")}>
              <th className="py-2 pr-3 font-semibold">Job-Nr.</th>
              <th className="py-2 pr-3 font-semibold">Beschreibung</th>
              <th className="py-2 text-right font-semibold">Summe</th>
            </tr>
          </thead>
          <tbody>
            {estimate.einmalig.map((l, i) => (
              <tr key={l.key} className="border-b border-line align-top">
                <td className="num py-3 pr-3 font-semibold text-muted">{12001 + i}</td>
                <td className="py-3 pr-3">
                  <p className="font-bold">{l.label}</p>
                  {l.detail && <p className="mt-0.5 text-[12px] text-muted">{l.detail}</p>}
                </td>
                <td className="num py-3 text-right font-bold whitespace-nowrap">{formatEUR(l.betrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-sm space-y-1.5 text-[13px]">
          <p className="flex justify-between">
            <span>Summe</span>
            <span className="num">{formatEUR(estimate.summeEin)}</span>
          </p>
          <p className="flex justify-between font-semibold text-teal-deep">
            <span>Richtwert-Spanne</span>
            <span>−10 % / +18 %</span>
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-ink-800 px-5 py-4 text-white">
            <span className={cn(label, "text-teal-light")}>Gesamtrahmen</span>
            <span className="num text-xl font-extrabold">
              {formatNumber(estimate.von)} – {formatNumber(estimate.bis)} €
            </span>
          </div>
        </div>

        {estimate.monatlich.length > 0 && (
          <>
            <p className={cn(label, "mt-8 text-teal-deep")}>Laufend pro Monat</p>
            <table className="mt-2 w-full text-[13px]">
              <tbody>
                {estimate.monatlich.map((l) => (
                  <tr key={l.key} className="border-b border-line">
                    <td className="py-2.5 pr-3">
                      <span className="font-bold">{l.label}</span>
                      {l.detail && <span className="text-muted"> · {l.detail}</span>}
                    </td>
                    <td className="num py-2.5 text-right font-bold whitespace-nowrap">{formatEUR(l.betrag)}/Monat</td>
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

      <footer className="grid gap-4 border-t-[3px] border-teal bg-fog px-8 py-5 text-[11px] sm:grid-cols-3 sm:px-10">
        <div>
          <p className={cn(label, "text-teal-deep")}>Kontakt</p>
          <p className="mt-1.5">
            <b>{site.name}</b> · {site.owner}
            <br />
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div>
          <p className={cn(label, "text-teal-deep")}>Nächster Schritt</p>
          <p className="mt-1.5">Angebot anfordern – Antwort innerhalb von 24 Stunden mit Festpreis.</p>
        </div>
        <div>
          <p className={cn(label, "text-teal-deep")}>Nutzungsrechte</p>
          <p className="mt-1.5">Ausschließlich, zeitlich und räumlich unbegrenzt – nach Zahlungseingang.</p>
        </div>
      </footer>
    </article>
  );
}
