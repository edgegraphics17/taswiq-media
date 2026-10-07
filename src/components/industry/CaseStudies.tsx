import { ArrowRight, Clock, FolderKanban, Info, Sparkles } from "lucide-react";
import { rental, rentPerMonth } from "@/config/packages";
import { ButtonLink } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { Icon } from "@/components/ui/Icon";
import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatEUR } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

export type CaseItem = {
  icon: string;
  segment: string;
  profile: string;
  title: string;
  situation: string;
  rows: { label: string; before: string; after: string }[];
  built: string[];
  integrated: string[];
  classic: string;
  ours: number;
  duration: string;
};

export type CasesContent = {
  tag: string;
  title: string;
  accent: string;
  text: string;
  disclaimer: string;
  situationLabel: string;
  beforeLabel: string;
  afterLabel: string;
  builtLabel: string;
  integratedLabel: string;
  classicLabel: string;
  oursLabel: string;
  from: string;
  durationLabel: string;
  expand: string;
  collapse: string;
  buyLabel: string;
  rentLabel: string;
  perMonth: string;
  once: string;
  rentNote: string;
  why: { title: string; text: string; cta: string };
  items: CaseItem[];
};

/**
 * Sechs Anwendungsfälle je Branche. Zugeklappt: Betrieb, Titel, Ausgangslage – ohne Preis.
 * Aufgeklappt: Vorher → Nachher, Umfang, Anbindungen und der Kostenrahmen
 * (klassische Agentur vs. TasWiq: kaufen oder mieten, Miete aus config/packages.ts).
 * Bewusst als Beispielrechnungen gekennzeichnet – keine Kundenprojekte.
 */
export function CaseStudies({ content: c, locale }: { content: CasesContent; locale: Locale }) {
  const rentNote = c.rentNote.replace("{trial}", String(rental.trialMonths)).replace("{term}", String(rental.minTermMonths));
  return (
    <section id="anwendungsfaelle" aria-labelledby="cases-title" className="scroll-mt-24 py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="cases-title" eyebrow={c.tag} icon={FolderKanban} title={c.title} accent={c.accent} text={c.text} />
        </Reveal>

        <InView className="stagger mt-12 grid items-start gap-4 lg:grid-cols-2">
          {c.items.map((k, i) => (
            <article key={k.title} style={{ "--i": i % 2 } as React.CSSProperties} className="card flex flex-col p-2">
              <div className="flex flex-col p-5 pb-4 sm:p-7 sm:pb-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="inline-flex items-center gap-2.5 rounded-full bg-canvas py-1.5 pr-4 pl-1.5 text-[13px] font-medium text-ink">
                    <span className="grid size-7 place-items-center rounded-full bg-blush-100 text-blush-600">
                      <Icon name={k.icon} className="size-3.5" />
                    </span>
                    {k.segment}
                  </p>
                  <span className="num text-4xl leading-none font-light text-ink/15" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 text-[1.55rem] leading-[1.15] font-medium text-balance">{k.title}</h3>
                <p className="num mt-1.5 text-sm text-muted">{k.profile}</p>

                <p className="mt-4 text-[15px] leading-relaxed text-body">
                  <span className="sr-only">{c.situationLabel}: </span>
                  {k.situation}
                </p>
              </div>

              <Disclosure openLabel={c.expand} closeLabel={c.collapse} className="mx-3 mb-3 sm:mx-5 sm:mb-5">
                <div className="px-5 pb-6 sm:px-7">
                  <div className="overflow-hidden rounded-3xl border border-line">
                    <div className="grid grid-cols-2 bg-canvas text-[11px] font-medium tracking-wide uppercase">
                      <span className="px-4 py-2 text-muted">{c.beforeLabel}</span>
                      <span className="px-4 py-2 text-[#157a40]">{c.afterLabel}</span>
                    </div>
                    {k.rows.map((r) => (
                      <div key={r.label} className="border-t border-line px-4 py-3">
                        <p className="text-xs text-muted">{r.label}</p>
                        <div className="num mt-1 grid grid-cols-2 gap-3 text-sm leading-snug">
                          <span className="text-body">{r.before}</span>
                          <span className="flex items-start gap-1.5 font-medium text-ink">
                            <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-mint-500" aria-hidden />
                            {r.after}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-[13px] font-medium text-ink">{c.builtLabel}</dt>
                      <dd className="mt-2 flex flex-wrap gap-1.5">
                        {k.built.map((b) => (
                          <span key={b} className="rounded-full bg-brand-50 px-3 py-1.5 text-[13px] font-medium text-brand-700">
                            {b}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[13px] font-medium text-ink">{c.integratedLabel}</dt>
                      <dd className="mt-2 flex flex-wrap gap-1.5">
                        {k.integrated.map((b) => (
                          <span key={b} className="rounded-full bg-canvas px-3 py-1.5 text-[13px] text-body">
                            {b}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-[1.6rem] bg-night p-5 text-white sm:p-6">
                  <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-xs text-night-muted">{c.classicLabel}</span>
                    <span className="num text-[15px] whitespace-nowrap text-white/60 line-through decoration-white/30">{k.classic}</span>
                  </p>
                  <p className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-night-muted">
                    {c.oursLabel}
                    <span className="num inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1.5 text-white/85">
                      <Clock className="size-3.5 text-mint-400" aria-hidden /> {c.durationLabel} {k.duration}
                    </span>
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <p className="rounded-2xl bg-white/[0.06] p-3.5">
                      <span className="block text-xs text-night-muted">
                        {c.buyLabel} {c.from}
                      </span>
                      <span className="num mt-1 block text-2xl font-medium tracking-tight whitespace-nowrap sm:text-[1.7rem]">{formatEUR(k.ours, locale)}</span>
                      <span className="block text-xs text-night-muted">{c.once}</span>
                    </p>
                    <p className="rounded-2xl bg-brand-500 p-3.5">
                      <span className="block text-xs text-white/80">
                        {c.rentLabel} {c.from}
                      </span>
                      <span className="num mt-1 block text-2xl font-medium tracking-tight whitespace-nowrap sm:text-[1.7rem]">{formatEUR(rentPerMonth(k.ours), locale)}</span>
                      <span className="block text-xs text-white/80">{c.perMonth}</span>
                    </p>
                  </div>
                  <p className="num mt-3 text-xs leading-relaxed text-night-muted">{rentNote}</p>
                </div>
              </Disclosure>
            </article>
          ))}
        </InView>

        <Reveal className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="card flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-brand)]">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div className="flex-1">
              <h3 className="text-xl font-medium">{c.why.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{c.why.text}</p>
            </div>
            <ButtonLink href="#anfrage" className="shrink-0">
              {c.why.cta} <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <p className="flex gap-3 rounded-[2rem] border border-line bg-white/60 p-6 text-[13px] leading-relaxed text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            {c.disclaimer}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
