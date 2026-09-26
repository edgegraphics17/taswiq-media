"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { CalcState, Field, Option } from "@/config/pricing";
import { priceHint } from "@/lib/pricing-engine";
import { cn } from "@/lib/format";

const COLS = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;

/** Große, weiche Auswahlkarte: Auswahl = violetter Ring + weicher Schatten + Häkchen. */
function OptionCard({ name, option, multi, checked, onChange }: { name: string; option: Option; multi: boolean; checked: boolean; onChange: () => void }) {
  const hint = priceHint(option);
  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col rounded-3xl border bg-white p-5 transition-all duration-300 ease-[var(--ease-soft)]",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500",
        checked ? "border-transparent shadow-[var(--shadow-picked)] ring-2 ring-brand-500" : "border-line hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-soft)]",
      )}
    >
      <input type={multi ? "checkbox" : "radio"} name={name} value={option.id} checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex items-start justify-between gap-3">
        <span className="text-[15.5px] font-medium text-ink">{option.label}</span>
        <span
          aria-hidden
          className={cn(
            "grid size-6 shrink-0 place-items-center border-2 transition-all duration-300",
            multi ? "rounded-lg" : "rounded-full",
            checked ? "border-brand-500 bg-brand-500 text-white" : "border-line text-transparent",
          )}
        >
          <Check className="size-3.5" strokeWidth={3.5} />
        </span>
      </span>
      {option.hint && <span className="mt-1.5 text-[13.5px] leading-snug text-muted">{option.hint}</span>}
      {(hint || option.badge) && (
        <span className="mt-4 flex flex-wrap items-center gap-1.5">
          {hint && <span className={cn("num rounded-full px-3 py-1 text-xs font-medium", checked ? "bg-brand-500 text-white" : "bg-canvas text-ink")}>{hint}</span>}
          {option.badge && <span className="rounded-full bg-night px-3 py-1 text-xs font-medium text-white">{option.badge}</span>}
        </span>
      )}
    </label>
  );
}

export function CalcField({ field, state, options, onChange }: { field: Field; state: CalcState; options: Record<string, Option[]>; onChange: (id: string, value: CalcState[string]) => void }) {
  if (field.typ === "schalter") {
    const on = state[field.id] === true;
    return (
      <label
        className={cn(
          "flex cursor-pointer items-center gap-4 rounded-3xl border bg-white p-5 transition-all duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500",
          on ? "border-transparent shadow-[var(--shadow-picked)] ring-2 ring-brand-500" : "border-line hover:border-brand-200",
        )}
      >
        <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(field.id, e.target.checked)} className="sr-only" />
        <span aria-hidden className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300", on ? "bg-brand-500" : "bg-line")}>
          <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-soft)]", on && "translate-x-5")} />
        </span>
        <span>
          <span className="block text-[15.5px] font-medium text-ink">{field.label}</span>
          {field.hint && <span className="mt-0.5 block text-[13.5px] text-muted">{field.hint}</span>}
        </span>
      </label>
    );
  }

  if (field.typ === "zahl") {
    const n = Number(state[field.id]) || 0;
    const set = (v: number) => onChange(field.id, Math.min(field.max, Math.max(field.min, Number.isNaN(v) ? field.min : v)));
    const inputId = `calc-${field.id}`;
    return (
      <div className="rounded-3xl border border-line bg-white p-5">
        <label htmlFor={inputId} className="block text-[15.5px] font-medium text-ink">
          {field.label}
        </label>
        {field.hint && <p className="mt-1 text-[13.5px] text-muted">{field.hint}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full bg-canvas p-1">
            <button type="button" onClick={() => set(n - 1)} disabled={n <= field.min} aria-label={`${field.label} verringern`} className="grid size-11 place-items-center rounded-full bg-white shadow-sm transition hover:text-brand-600 disabled:opacity-35">
              <Minus className="size-4" aria-hidden />
            </button>
            <input
              id={inputId}
              type="number"
              inputMode="numeric"
              min={field.min}
              max={field.max}
              value={n}
              onChange={(e) => set(parseInt(e.target.value, 10))}
              className="num h-11 w-14 bg-transparent text-center text-lg font-medium text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button type="button" onClick={() => set(n + 1)} disabled={n >= field.max} aria-label={`${field.label} erhöhen`} className="grid size-11 place-items-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600 disabled:opacity-35">
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <span className="num rounded-full bg-canvas px-3 py-1.5 text-sm text-muted">
            je {field.preisProEinheit} € {n > 0 && <b className="font-medium text-brand-600">· {n * field.preisProEinheit} €</b>}
          </span>
        </div>
      </div>
    );
  }

  const list = options[field.quelle] ?? [];
  const multi = field.typ === "check";
  const value = state[field.id];
  return (
    <fieldset>
      {field.label && <legend className="mb-3 text-sm font-medium text-muted">{field.label}</legend>}
      {field.hint && <p className="mb-3 text-[13.5px] text-muted">{field.hint}</p>}
      <div className={cn("grid gap-3", COLS[field.spalten ?? 1])}>
        {list.map((o) => {
          const checked = multi ? (value as string[]).includes(o.id) : value === o.id;
          return (
            <OptionCard
              key={o.id}
              name={`calc-${field.id}`}
              option={o}
              multi={multi}
              checked={checked}
              onChange={() => {
                if (!multi) return onChange(field.id, o.id);
                const arr = value as string[];
                onChange(field.id, checked ? arr.filter((x) => x !== o.id) : [...arr, o.id]);
              }}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
