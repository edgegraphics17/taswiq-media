import { getLocale, getTranslations } from "next-intl/server";
import { Check, KeyRound, Repeat } from "lucide-react";
import { rental, runningCosts } from "@/config/packages";
import type { Locale } from "@/i18n/routing";
import { formatEUR } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

/**
 * "Kaufen oder mieten": erklärt das Miet-Modell direkt unter den Preisen –
 * Laufzeiten kommen aus config/packages.ts (rental), damit Text und Rechnung nie auseinanderlaufen.
 */
export async function RentExplainer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("packages.rent");
  const vars = { trial: rental.trialMonths, term: rental.minTermMonths, ops: formatEUR(runningCosts.betrieb, locale) };
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k: keyof typeof vars) => String(vars[k]));
  const buy = (t.raw("buy.points") as string[]).map(fill);
  const rent = (t.raw("rent.points") as string[]).map(fill);
  return (
    <Reveal className="card mt-4 grid gap-2 p-2 lg:grid-cols-[0.9fr_1fr_1.1fr]">
      <div className="p-5 sm:p-6">
        <p className="text-[13px] font-medium text-brand-600">{t("tag")}</p>
        <h3 className="mt-2 text-[1.45rem] leading-tight font-medium text-balance">{t("title")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("text")}</p>
      </div>
      <div className="rounded-[1.6rem] bg-canvas p-5 sm:p-6">
        <p className="flex items-center gap-2.5 font-medium text-ink">
          <span className="grid size-8 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-soft)]">
            <KeyRound className="size-4" aria-hidden />
          </span>
          {t("buy.title")}
        </p>
        <p className="mt-2 text-sm text-muted">{t("buy.lead")}</p>
        <ul className="mt-3 space-y-1.5">
          {buy.map((p) => (
            <li key={p} className="num flex items-start gap-2 text-sm text-body">
              <Check className="mt-0.5 size-4 shrink-0 text-mint-500" strokeWidth={2.5} aria-hidden /> {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[1.6rem] bg-night p-5 text-white sm:p-6">
        <p className="flex flex-wrap items-center gap-2.5 font-medium">
          <span className="grid size-8 place-items-center rounded-full bg-brand-500 text-white">
            <Repeat className="size-4" aria-hidden />
          </span>
          {t("rent.title")}
          <span className="num rounded-full bg-mint-500 px-2.5 py-1 text-xs font-medium text-white">{t("rent.badge")}</span>
        </p>
        <p className="mt-2 text-sm text-night-muted">{t("rent.lead")}</p>
        <ul className="mt-3 space-y-1.5">
          {rent.map((p) => (
            <li key={p} className="num flex items-start gap-2 text-sm text-white/90">
              <Check className="mt-0.5 size-4 shrink-0 text-mint-400" strokeWidth={2.5} aria-hidden /> {p}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
