"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Estimate, RentEstimate } from "@/lib/pricing-engine";
import { rental } from "@/config/packages";
import { site } from "@/config/site";
import { LOCALE_META } from "@/i18n/routing";
import { formatEUR, formatRange, cn } from "@/lib/format";
import { Logo } from "@/components/ui/Logo";

/**
 * Kostenrahmen als A4-Blatt im Soft-UI-Look: schwarzer Kopf mit violettem Schein,
 * Posten-Tabelle mit Job-Nr., violette Gesamt-Pille. Vorschau im Ergebnis UND PDF-Druckvorlage.
 */
export function QuoteSheet({ estimate, rent, rows, title, className }: { estimate: Estimate; rent?: RentEstimate | null; rows: { id: string; label: string; wert: string }[]; title: string; className?: string }) {
  const t = useTranslations("calculator.sheet");
  const tr = useTranslations("calculator");
  const tSite = useTranslations("site");
  const locale = useLocale();
  const eur = (n: number) => formatEUR(n, locale);
  const range = formatRange(estimate.von, estimate.bis, locale);
  const rentRate = rent ? tr("engine.perMonth", { amount: formatRange(rent.von, rent.bis, locale) }) : "";
  const today = new Intl.DateTimeFormat(LOCALE_META[locale].intl, { dateStyle: "medium" }).format(new Date());
  return (
    <article className={cn("overflow-hidden bg-white text-ink", className)}>
      <header className="relative overflow-hidden bg-night px-8 pt-8 pb-7 text-white sm:px-10">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.5),transparent)]" aria-hidden />
        <div className="relative flex items-start justify-between gap-6">
          <Logo tone="light" className="h-12" />
          <p className="rounded-full bg-white/10 px-3 py-1 text-xs">{t("asOf", { date: today })}</p>
        </div>
        <p className="relative mt-8 text-[clamp(1.9rem,5vw,2.8rem)] leading-none font-medium tracking-tight">{t("title")}</p>
        <p className="relative mt-2 text-[15px] text-night-muted">{title}</p>
        <div className="relative mt-6 flex flex-wrap gap-2">
          <span className="num rounded-full bg-brand-500 px-4 py-2 text-sm font-medium">
            {t("oneTime", { range })}
          </span>
          <span className="num rounded-full bg-white/10 px-4 py-2 text-sm">{estimate.summeMtl > 0 ? t("monthly", { amount: eur(estimate.summeMtl) }) : t("noRunning")}</span>
          {rent && <span className="num rounded-full bg-white/10 px-4 py-2 text-sm">{t("rentPill", { rate: rentRate })}</span>}
        </div>
      </header>

      <div className="px-8 py-7 sm:px-10">
        <p className="text-sm font-medium text-brand-600">{t("selection")}</p>
        <dl className="mt-3 grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.id} className="flex justify-between gap-3 border-b border-line pb-1.5">
              <dt className="text-muted">{r.label}</dt>
              <dd className="text-right font-medium">{r.wert}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm font-medium text-brand-600">{t("services")}</p>
        <table className="mt-2 w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="py-2 pr-3 font-medium">{t("no")}</th>
              <th className="py-2 pr-3 font-medium">{t("description")}</th>
              <th className="py-2 text-right font-medium">{t("sum")}</th>
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
                <td className="num py-3 text-right font-medium whitespace-nowrap">{eur(l.betrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-sm space-y-1.5 text-[13px]">
          <p className="flex justify-between">
            <span>{t("sum")}</span>
            <span className="num">{eur(estimate.summeEin)}</span>
          </p>
          <p className="flex justify-between text-brand-600">
            <span>{t("rangeLabel")}</span>
            <span>{locale === "en" ? "−10% / +18%" : "−10 % / +18 %"}</span>
          </p>
          <div className="mt-3 flex items-center justify-between rounded-full bg-night px-5 py-3 text-white">
            <span className="text-xs text-night-muted">{t("total")}</span>
            <span className="num text-lg font-medium">{range}</span>
          </div>
        </div>

        {estimate.monatlich.length > 0 && (
          <>
            <p className="mt-8 text-sm font-medium text-brand-600">{t("monthlyTitle")}</p>
            <table className="mt-2 w-full text-[13px]">
              <tbody>
                {estimate.monatlich.map((l) => (
                  <tr key={l.key} className="border-b border-line">
                    <td className="py-2.5 pr-3">
                      <span className="font-medium">{l.label}</span>
                      {l.detail && <span className="text-muted"> · {l.detail}</span>}
                    </td>
                    <td className="num py-2.5 text-right font-medium whitespace-nowrap">{t("perMonth", { amount: eur(l.betrag) })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {rent && (
          <div className="mt-8 break-inside-avoid rounded-3xl bg-brand-50 px-5 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-sm font-medium text-brand-600">{t("rentTitle")}</p>
              <p className="num text-lg font-medium whitespace-nowrap">{rentRate}</p>
            </div>
            <p className="num mt-1.5 text-[12px] leading-relaxed text-body">
              {tr("rent.included")}. {tr("rent.terms", { trial: rental.trialMonths, term: rental.minTermMonths })}
              {rent.restBis > 0 && <> {tr("rent.rest", { rest: formatRange(rent.restVon, rent.restBis, locale) })}</>}
            </p>
          </div>
        )}

        <p className="mt-6 text-[11px] leading-relaxed text-muted">
          <b className="text-ink">{t("disclaimerStrong")}</b> {t("disclaimer")} {tSite("vatNote")}
        </p>
      </div>

      <footer className="grid gap-4 bg-canvas px-8 py-5 text-[11px] sm:grid-cols-3 sm:px-10">
        <div>
          <p className="font-medium text-brand-600">{t("contact")}</p>
          <p className="mt-1.5">
            <b>{site.name}</b> · {site.owner}
            <br />
            {site.phone}
            <br />
            {site.email}
          </p>
        </div>
        <div>
          <p className="font-medium text-brand-600">{t("nextStep")}</p>
          <p className="mt-1.5">{t("nextStepText")}</p>
        </div>
        <div>
          <p className="font-medium text-brand-600">{t("rights")}</p>
          <p className="mt-1.5">{t("rightsText")}</p>
        </div>
      </footer>
    </article>
  );
}
