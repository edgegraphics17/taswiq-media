"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";

type Tone = "good" | "brand" | "warn" | "muted";
export type Module = {
  icon: string;
  title: string;
  short: string;
  benefit: string;
  text: string;
  bullets: string[];
  before: string;
  after: string;
  mock: { title: string; rows: { label: string; meta: string; status: string; tone: Tone }[] };
};

const TONES: Record<Tone, string> = {
  good: "bg-mint-500/12 text-[#157a40]",
  brand: "bg-brand-50 text-brand-700",
  warn: "bg-amber-100 text-amber-800",
  muted: "bg-canvas text-muted",
};

/**
 * Funktionen als Explorer: links die sechs Module zur Auswahl, rechts groß der Nutzen –
 * Ergebnis-Satz, Ablauf, Vorher/Nachher und eine Beispielansicht aus dem System.
 * Alle Panels stehen im HTML, sichtbar ist das gewählte.
 */
export function ModuleExplorer({ items, labels }: { items: Module[]; labels: { list: string; before: string; after: string; mockNote: string } }) {
  const [active, setActive] = useState(0);
  return (
    <div className="mt-12 grid items-start gap-4 lg:grid-cols-[0.82fr_1.18fr]">
      <div role="tablist" aria-label={labels.list} aria-orientation="vertical" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:gap-2.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map((m, i) => {
          const on = i === active;
          return (
            <button
              key={m.title}
              type="button"
              role="tab"
              id={`mod-tab-${i}`}
              aria-selected={on}
              aria-controls={`mod-panel-${i}`}
              onClick={() => setActive(i)}
              className={cn(
                "group flex shrink-0 items-center gap-3.5 rounded-full border p-2 pr-5 text-left transition-all duration-300 ease-[var(--ease-soft)] lg:rounded-[1.75rem] lg:p-3.5 lg:pr-5",
                on ? "border-transparent bg-white shadow-[var(--shadow-picked)] ring-2 ring-brand-500" : "border-line bg-white/60 hover:border-brand-200 hover:bg-white",
              )}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full transition-colors lg:size-12", on ? "bg-brand-500 text-white" : "bg-blush-100 text-blush-600")}>
                <Icon name={m.icon} className="size-[18px] lg:size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium whitespace-nowrap text-ink lg:text-[17px] lg:whitespace-normal">{m.title}</span>
                <span className="hidden text-sm text-muted lg:block">{m.short}</span>
              </span>
              <span className={cn("num hidden text-2xl font-light lg:block", on ? "text-brand-500" : "text-ink/15")}>{String(i + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <div className="lg:sticky lg:top-28">
        {items.map((m, i) => (
          <article
            key={m.title}
            role="tabpanel"
            id={`mod-panel-${i}`}
            aria-labelledby={`mod-tab-${i}`}
            hidden={i !== active}
            className={cn("card-night p-6 sm:p-9", i === active && "animate-rise [animation-duration:0.5s]")}
          >
            <p className="flex items-center gap-2 text-[13px] font-medium text-night-muted">
              <span className="grid size-6 place-items-center rounded-lg bg-white/10 text-mint-400">
                <Icon name={m.icon} className="size-3.5" />
              </span>
              {m.title}
            </p>
            <h3 className="mt-4 text-[clamp(1.5rem,2.6vw,2.1rem)] leading-[1.12] font-medium text-balance text-white">{m.benefit}</h3>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-night-muted">{m.text}</p>

            <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_1.05fr]">
              <div className="flex flex-col gap-4">
                <ul className="grid gap-2.5">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[14.5px] leading-snug text-white/90">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
                        <Check className="size-3" strokeWidth={3.5} aria-hidden />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <dl className="mt-auto grid gap-2 rounded-3xl bg-white/[0.06] p-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-medium tracking-wide text-night-muted uppercase">{labels.before}</dt>
                    <dd className="mt-0.5 text-white/70">{m.before}</dd>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <dt className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-mint-400 uppercase">
                      {labels.after} <ArrowRight className="size-3" aria-hidden />
                    </dt>
                    <dd className="mt-0.5 font-medium text-white">{m.after}</dd>
                  </div>
                </dl>
              </div>

              <figure className="rounded-3xl bg-white p-4 text-ink shadow-[var(--shadow-float)]">
                <figcaption className="flex items-center justify-between gap-3 px-1 pb-3">
                  <span className="truncate text-sm font-medium">{m.mock.title}</span>
                  <span className="shrink-0 rounded-full bg-canvas px-2.5 py-1 text-[11px] text-muted">{labels.mockNote}</span>
                </figcaption>
                <ul className="grid gap-2">
                  {m.mock.rows.map((r) => (
                    <li key={r.label} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-line px-3.5 py-3">
                      <span className="min-w-0 flex-1 basis-36">
                        <span className="block text-sm leading-snug font-medium">{r.label}</span>
                        <span className="num block text-xs leading-snug text-muted">{r.meta}</span>
                      </span>
                      <span className={cn("num shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", TONES[r.tone])}>{r.status}</span>
                    </li>
                  ))}
                </ul>
              </figure>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
