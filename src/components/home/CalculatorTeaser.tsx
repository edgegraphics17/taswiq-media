import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { calculatorTeaser as t } from "@/config/content";
import { computeEstimate, sanitizeState } from "@/lib/pricing-engine";
import { getPricingData } from "@/lib/pricing-source";
import { formatEUR, formatNumber } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

/**
 * asap #rechner-teaser: dunkle Box, links Argument + Pills + CTA, rechts Beispiel-Ergebnis.
 * Das Beispiel rechnet mit derselben Engine wie der Rechner – nie veraltete Zahlen.
 */
export async function CalculatorTeaser() {
  const data = await getPricingData();
  const e = computeEstimate(sanitizeState(t.example.state, data), Number.POSITIVE_INFINITY, data);

  return (
    <section id="preisrechner-teaser" aria-labelledby="teaser-title" className="px-4 py-24 sm:px-8 sm:py-28">
      <Reveal className="glow-box mx-auto grid max-w-[1200px] items-center gap-12 rounded-[28px] px-6 py-10 shadow-[0_30px_80px_rgb(90_174_184/0.18)] sm:px-12 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-14">
        <div>
          <p className="tag-line text-teal-light">{t.label}</p>
          <h2 id="teaser-title" className="mt-4 text-[clamp(1.7rem,2.8vw,2.4rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-white">
            {t.title}
            <br />
            <span className="text-teal-light">{t.titleAccent}</span>
          </h2>
          <p className="mt-4 max-w-[52ch] leading-relaxed text-mist">{t.text}</p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {t.pills.map((p) => (
              <li key={p} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/85">
                <Check className="size-3.5 text-teal-light" strokeWidth={3} aria-hidden /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[46ch] text-[13px] leading-relaxed text-haze">{t.hint}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href={t.primary.href} className="max-sm:w-full">
              {t.primary.label} <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <Link href={t.secondary.href} className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal-light transition-[gap] hover:gap-3.5">
              {t.secondary.label} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Beispiel-Ergebnis im Look der Rechnungs-Summenbox */}
        <div className="rounded-[22px] border border-white/15 bg-white/[0.05] p-6 backdrop-blur-sm sm:p-7">
          <p className="text-[11px] font-bold tracking-[0.14em] text-haze uppercase">{t.example.label}</p>
          <p className="num mt-2 text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold tracking-tight text-white">
            {formatNumber(e.von)} – {formatNumber(e.bis)} € <small className="text-sm font-semibold text-haze">einmalig</small>
          </p>
          <ul className="mt-4">
            {e.einmalig.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 border-t border-white/10 py-2.5 text-sm text-mist">
                <span>{l.label}</span>
                <b className="num font-semibold text-white/90">{formatEUR(l.betrag)}</b>
              </li>
            ))}
            {e.monatlich.map((l) => (
              <li key={l.key} className="flex justify-between gap-3 border-t border-white/10 py-2.5 text-sm text-mist">
                <span>{l.label}</span>
                <b className="num font-semibold text-teal-light">{formatEUR(l.betrag)}/Monat</b>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-haze">{t.example.foot}</p>
        </div>
      </Reveal>
    </section>
  );
}
