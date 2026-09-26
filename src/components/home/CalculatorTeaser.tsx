import { ArrowRight, Check, Calculator } from "lucide-react";
import { calculatorTeaser as t } from "@/config/content";
import { computeEstimate, sanitizeState } from "@/lib/pricing-engine";
import { getPricingData } from "@/lib/pricing-source";
import { formatEUR, formatNumber } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";

/**
 * Rechner-Teaser: schwarze Kontrast-Karte (Argument + Mint-Checks) neben einer weißen
 * "Plan"-Karte im Stil der Pricing-Karten der Vorlage. Zahlen kommen live aus der Engine.
 */
export async function CalculatorTeaser() {
  const data = await getPricingData();
  const e = computeEstimate(sanitizeState(t.example.state, data), Number.POSITIVE_INFINITY, data);

  return (
    <section id="preisrechner-teaser" aria-labelledby="teaser-title" className="py-16 sm:py-24">
      <div className="container-x grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal className="card-night flex flex-col p-8 sm:p-11">
          <Eyebrow tone="dark" icon={Calculator}>
            {t.label}
          </Eyebrow>
          <h2 id="teaser-title" className="mt-5 text-[clamp(2rem,3.8vw,3.1rem)] leading-[1.05] font-medium text-white">
            {t.title} <span className="text-brand-300">{t.titleAccent}</span>
          </h2>
          <p className="mt-4 max-w-[52ch] leading-relaxed text-night-muted">{t.text}</p>
          <ul className="mt-7 flex flex-wrap gap-2">
            {t.pills.map((p) => (
              <li key={p} className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium text-white">
                <span className="grid size-5 place-items-center rounded-full bg-mint-500 text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-10">
            <ButtonLink href={t.primary.href}>
              {t.primary.label} <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href={t.secondary.href} variant="ghost-night">
              {t.secondary.label}
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="card flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-medium text-ink">{t.example.label}</p>
              <p className="text-sm text-muted">Video Standard · Drohne · 1 Sprache</p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-night text-white">
              <Calculator className="size-5" aria-hidden />
            </span>
          </div>
          <p className="num mt-6 flex items-baseline gap-2">
            <span className="text-[2.6rem] leading-none font-medium tracking-tight text-ink">{formatNumber(e.von)}</span>
            <span className="text-xl text-muted">– {formatNumber(e.bis)} €</span>
          </p>
          <p className="mt-1 text-sm text-muted">Richtwert einmalig · dazu {formatEUR(e.summeMtl)}/Monat</p>
          <p className="mt-6 text-sm font-medium text-ink">Das steckt drin</p>
          <ul className="mt-3 space-y-2">
            {[...e.einmalig, ...e.monatlich].map((l) => (
              <li key={l.key} className="flex items-center justify-between gap-3 rounded-full bg-canvas px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-body">
                  <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
                  {l.label}
                </span>
                <b className="num font-medium text-ink">{formatEUR(l.betrag)}</b>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-muted">{t.example.foot}</p>
        </Reveal>
      </div>
    </section>
  );
}
