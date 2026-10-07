import NextLink from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Building2, Calculator, CalendarClock, Check, CircleSlash, Minus, Plus, Route, Table2 } from "lucide-react";
import { getPost } from "@/content/blog";
import { Link } from "@/i18n/navigation";
import type { AppHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn, formatEUR, formatNumber, eurAffix } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

/* ─── So funktioniert's: vier Schritte entlang einer Linie ─── */

export type FlowContent = { tag: string; title: string; accent: string; text: string; steps: { who: string; title: string; text: string }[] };

/** Der Ablauf im Produkt (nicht im Projekt): wer macht was, in welcher Reihenfolge. Letzter Schritt = Ergebnis, schwarz. */
export function FlowSection({ content: c }: { content: FlowContent }) {
  return (
    <section id="ablauf-im-system" aria-labelledby="flow-title" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="flow-title" eyebrow={c.tag} icon={Route} title={c.title} accent={c.accent} text={c.text} />
        </Reveal>
        <InView className="stagger mt-12">
          <ol className="grid gap-4 lg:grid-cols-4">
            {c.steps.map((s, i) => {
              const last = i === c.steps.length - 1;
              return (
                <li key={s.title} style={{ "--i": i } as React.CSSProperties} className="relative flex gap-4 lg:flex-col lg:gap-0">
                  <div className="flex flex-col items-center lg:flex-row">
                    <span className={cn("num grid size-11 shrink-0 place-items-center rounded-full text-[15px] font-medium", last ? "bg-mint-500 text-white" : "bg-brand-500 text-white shadow-[var(--shadow-brand)]")}>{i + 1}</span>
                    {!last && <span className="w-px flex-1 bg-brand-200 lg:-mr-4 lg:ml-3 lg:h-px lg:w-auto" aria-hidden />}
                  </div>
                  <div className={cn("mb-2 flex-1 rounded-[2rem] p-6 lg:mt-5 lg:mb-0", last ? "bg-night text-white shadow-[var(--shadow-float)]" : "border border-line bg-white shadow-[var(--shadow-soft)]")}>
                    <p className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", last ? "bg-white/10 text-mint-400" : "bg-blush-100 text-blush-600")}>{s.who}</p>
                    <h3 className={cn("mt-4 text-xl leading-tight font-medium", last && "text-white")}>{s.title}</h3>
                    <p className={cn("mt-2 text-[15px] leading-relaxed", last ? "text-night-muted" : "text-muted")}>{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </InView>
      </div>
    </section>
  );
}

/* ─── Umfang & Preise: Stufen als Matrix ─── */

type Cell = boolean | string;
export type Tier = { id: string; name: string; audience: string; price: number };
export type TiersContent = {
  tag: string;
  title: string;
  accent: string;
  text: string;
  from: string;
  once: string;
  recommended: string;
  included: string;
  notIncluded: string;
  request: string;
  rows: { label: string; cells: Cell[] }[];
};
export type Extra = { id: string; price: number; label: string; hint: string };

/**
 * Stufen einer Leistung nebeneinander: Kopf mit Preis, darunter Zeile für Zeile, was enthalten ist.
 * Spalten sind Karten, die Zeilen liegen per Subgrid auf einer Höhe; mobil stehen die Karten untereinander
 * und jede Zelle trägt ihr eigenes Label.
 */
export function TierMatrix({ content: c, tiers, highlight, extras, extrasLabel, extrasText, locale }: { content: TiersContent; tiers: Tier[]; highlight: string; extras: Extra[]; extrasLabel: string; extrasText: string; locale: Locale }) {
  const eur = eurAffix(locale);
  const span = { gridRow: `span ${c.rows.length + 2}` };
  return (
    <section id="pakete" aria-labelledby="tiers-title" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="tiers-title" eyebrow={c.tag} icon={Table2} title={c.title} accent={c.accent} text={c.text} />
        </Reveal>

        <Reveal delay={0.08} className="mt-12 grid gap-x-3 gap-y-4 md:grid-cols-[0.85fr_1fr_1fr_1fr]">
          <div style={span} className="hidden grid-rows-subgrid py-6 md:grid" aria-hidden>
            <span />
            {c.rows.map((r) => (
              <span key={r.label} className="flex items-center border-t border-line pr-4 text-sm font-medium text-ink">
                {r.label}
              </span>
            ))}
            <span />
          </div>
          {tiers.map((t, ti) => {
            const dark = t.id === highlight;
            return (
              <article key={t.id} style={span} className={cn("grid grid-rows-subgrid gap-0 rounded-[2rem] p-6", dark ? "bg-night text-white shadow-[var(--shadow-float)]" : "border border-line bg-white shadow-[var(--shadow-soft)]")}>
                <header className="flex flex-col pb-5">
                  {dark ? <span className="mb-3 self-start rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">{c.recommended}</span> : <span className="mb-3 hidden h-6 md:block" aria-hidden />}
                  <h3 className={cn("text-xl leading-tight font-medium", dark && "text-white")}>{t.name}</h3>
                  <p className={cn("mt-1 text-sm", dark ? "text-night-muted" : "text-muted")}>{t.audience}</p>
                  <p className="mt-auto flex items-baseline gap-1.5 pt-5">
                    <span className={cn("text-sm", dark ? "text-night-muted" : "text-muted")}>{c.from}</span>
                    {eur.pre && <span className={cn("text-base", dark ? "text-night-muted" : "text-muted")}>€</span>}
                    <span className="num text-4xl font-medium tracking-tight">{formatNumber(t.price, locale)}</span>
                    {eur.post && <span className={cn("text-base", dark ? "text-night-muted" : "text-muted")}>€</span>}
                    <span className={cn("text-xs", dark ? "text-night-muted" : "text-muted")}>{c.once}</span>
                  </p>
                </header>
                {c.rows.map((r) => {
                  const v = r.cells[ti];
                  return (
                    <div key={r.label} className={cn("flex items-center justify-between gap-3 border-t py-3 md:justify-start", dark ? "border-white/10" : "border-line")}>
                      <span className={cn("text-sm md:hidden", dark ? "text-night-muted" : "text-muted")}>{r.label}</span>
                      {v === true ? (
                        <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", dark ? "bg-mint-500 text-white" : "bg-mint-500/15 text-[#157a40]")}>
                          <Check className="size-3.5" strokeWidth={3} aria-hidden />
                          <span className="sr-only">{c.included}</span>
                        </span>
                      ) : v === false ? (
                        <span className={cn("grid size-6 shrink-0 place-items-center", dark ? "text-white/30" : "text-ink/25")}>
                          <Minus className="size-4" aria-hidden />
                          <span className="sr-only">{c.notIncluded}</span>
                        </span>
                      ) : (
                        <span className={cn("num text-right text-sm leading-snug md:text-left", dark ? "font-medium text-white" : "text-body")}>{v}</span>
                      )}
                    </div>
                  );
                })}
                <footer className="pt-5">
                  <ButtonLink href="#anfrage" variant={dark ? "primary" : "white"} className="w-full px-4 text-center text-sm">
                    {c.request.replace("{name}", t.name)}
                  </ButtonLink>
                </footer>
              </article>
            );
          })}
        </Reveal>

        {extras.length > 0 && (
          <Reveal className="card mt-4 p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="flex items-center gap-2.5 text-lg font-medium">
                <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Plus className="size-4" aria-hidden />
                </span>
                {extrasLabel}
              </h3>
              <p className="text-sm text-muted">{extrasText}</p>
            </div>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {extras.map((x) => (
                <li key={x.id} className="flex items-center justify-between gap-3 rounded-3xl bg-canvas px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink">{x.label}</span>
                    <span className="block text-xs leading-snug text-muted">{x.hint}</span>
                  </span>
                  <span className="num shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-[var(--shadow-soft)]">+ {formatEUR(x.price, locale)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ─── Beispielrechnung + ehrliche Einordnung ─── */

export type CalcContent = {
  tag: string;
  title: string;
  accent: string;
  text: string;
  lines: { label: string; value: string }[];
  resultLabel: string;
  result: string;
  note: string;
  disclaimer: string;
  whenNotTitle: string;
  whenNot: string;
  guidesLabel: string;
};

/** Rechnung als "Kassenbon" auf Schwarz, daneben: wann sich die Leistung nicht lohnt + passende Artikel. */
export function CalcSection({ content: c, guides }: { content: CalcContent; guides: string[] }) {
  const posts = guides.map(getPost).filter((p) => p !== undefined);
  return (
    <section aria-labelledby="calc-title" className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="calc-title" eyebrow={c.tag} icon={Calculator} title={c.title} accent={c.accent} text={c.text} />
        </Reveal>
        <Reveal delay={0.08} className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card-night flex flex-col p-7 sm:p-9">
            <dl className="grid gap-3">
              {c.lines.map((l) => (
                <div key={l.label} className="flex items-baseline justify-between gap-4 text-[15px]">
                  <dt className="text-night-muted">{l.label}</dt>
                  <dd className="num shrink-0 text-right font-medium text-white">{l.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 border-t border-dashed border-white/20 pt-6">
              <p className="text-sm text-night-muted">{c.resultLabel}</p>
              <p className="num mt-1 text-[clamp(2rem,4.4vw,3.2rem)] leading-none font-medium tracking-tight text-mint-400">{c.result}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/85">{c.note}</p>
            </div>
            <p className="mt-auto pt-6 text-xs leading-relaxed text-night-muted">{c.disclaimer}</p>
          </div>
          <div className="grid gap-4">
            <div className="card p-7 sm:p-8">
              <p className="flex items-center gap-2.5 text-sm font-medium text-ink">
                <span className="grid size-8 place-items-center rounded-full bg-blush-100 text-blush-600">
                  <CircleSlash className="size-4" aria-hidden />
                </span>
                {c.whenNotTitle}
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-body">{c.whenNot}</p>
            </div>
            {posts.length > 0 && (
              <div className="card p-7 sm:p-8">
                <p className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-600">
                    <BookOpen className="size-4" aria-hidden />
                  </span>
                  {c.guidesLabel}
                </p>
                <ul className="mt-3 divide-y divide-line">
                  {posts.map((p) => (
                    <li key={p.slug}>
                      <NextLink href={`/blog/${p.slug}`} className="group flex items-start justify-between gap-3 py-3 text-[14.5px] leading-snug text-body transition-colors hover:text-brand-600">
                        {p.title}
                        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" aria-hidden />
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Branchen: so wird die Leistung dort eingesetzt ─── */

export type IndustryLink = { id: string; icon: string; name: string; text: string; href: AppHref };

export function IndustryLinks({ tag, title, accent, text, cta, items }: { tag: string; title: string; accent: string; text: string; cta: string; items: IndustryLink[] }) {
  return (
    <section aria-labelledby="branchen-title" className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="branchen-title" eyebrow={tag} icon={Building2} title={title} accent={accent} text={text} />
        </Reveal>
        <InView className={cn("stagger mt-12 grid gap-4 sm:grid-cols-2", items.length === 4 ? "lg:grid-cols-4" : items.length < 3 ? "mx-auto max-w-3xl" : "lg:grid-cols-3")}>
          {items.map((it, i) => (
            <Link
              key={it.id}
              href={it.href}
              style={{ "--i": i } as React.CSSProperties}
              className="group flex flex-col rounded-[2rem] border border-line bg-white p-6 shadow-[var(--shadow-soft)] transition-all duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:border-brand-200"
            >
              <span className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-full bg-blush-100 text-blush-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <Icon name={it.icon} className="size-5" />
                </span>
                <ArrowUpRight className="size-5 text-ink/25 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" aria-hidden />
              </span>
              <span className="mt-5 text-lg leading-tight font-medium text-ink">{it.name}</span>
              <span className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{it.text}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                {cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </InView>
      </div>
    </section>
  );
}

/* ─── Zeitplan: vom Erstgespräch bis live ─── */

export type TimelineContent = { tag: string; title: string; accent: string; text: string; phases: { when: string; title: string; text: string }[] };

const BARS = ["bg-brand-300", "bg-brand-400", "bg-brand-500", "bg-mint-500"];

export function Timeline({ content: c }: { content: TimelineContent }) {
  return (
    <section id="zeitplan" aria-labelledby="timeline-title" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="timeline-title" eyebrow={c.tag} icon={CalendarClock} title={c.title} accent={c.accent} text={c.text} />
        </Reveal>
        <Reveal delay={0.08} className="card-night mt-12 p-6 sm:p-9">
          <ol className="grid gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {c.phases.map((p, i) => (
              <li key={p.title}>
                <span className={cn("block h-1.5 rounded-full", BARS[i] ?? BARS[3])} aria-hidden />
                <p className="num mt-5 text-[1.7rem] leading-none font-medium tracking-tight text-white">{p.when}</p>
                <h3 className="mt-3 text-lg font-medium text-white">{p.title}</h3>
                <p className="mt-1.5 pr-3 text-[15px] leading-relaxed text-night-muted">{p.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
