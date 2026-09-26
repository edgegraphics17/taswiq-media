"use client";

import { Minus, Plus } from "lucide-react";
import type { CalcState, Field, Option } from "@/config/pricing";
import { priceHint } from "@/lib/pricing-engine";
import { cn } from "@/lib/format";

const COLS = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;

/** Radio-/Checkbox-Karte mit Preis-Hinweis rechts (asap .karte) */
function OptionCard({
  name,
  option,
  multi,
  checked,
  onChange,
}: {
  name: string;
  option: Option;
  multi: boolean;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={cn(
        "relative block cursor-pointer rounded-2xl border bg-white px-4 py-3.5 transition-[border-color,background-color,transform,box-shadow] duration-250 ease-[var(--ease-wobble)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
        checked
          ? "border-teal bg-teal-wash shadow-[inset_0_0_0_1px_var(--color-teal)]"
          : "border-line hover:-translate-y-0.5 hover:border-teal hover:shadow-[0_10px_26px_rgb(90_174_184/0.12)]",
      )}
    >
      <input type={multi ? "checkbox" : "radio"} name={name} value={option.id} checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <span
            aria-hidden
            className={cn(
              "grid size-4 shrink-0 place-items-center border-[1.5px] transition-colors",
              multi ? "rounded-[5px]" : "rounded-full",
              checked ? "border-teal-deep bg-teal-deep" : "border-ink/25",
            )}
          >
            {checked && <span className={cn("bg-white", multi ? "h-1.5 w-2 -rotate-45 rounded-[1px] border-b-2 border-l-2 border-white bg-transparent" : "size-1.5 rounded-full")} />}
          </span>
          {option.label}
          {option.badge && <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">{option.badge}</span>}
        </span>
        <span className={cn("num shrink-0 text-[13px] whitespace-nowrap", checked ? "font-semibold text-teal-deep" : "text-muted")}>
          {priceHint(option)}
        </span>
      </span>
      {option.hint && <span className="mt-1 block pl-6 text-[13.5px] leading-snug text-muted">{option.hint}</span>}
    </label>
  );
}

export function CalcField({
  field,
  state,
  options,
  onChange,
}: {
  field: Field;
  state: CalcState;
  options: Record<string, Option[]>;
  onChange: (id: string, value: CalcState[string]) => void;
}) {
  if (field.typ === "schalter") {
    const on = state[field.id] === true;
    return (
      <label
        className={cn(
          "flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink",
          on ? "border-teal bg-teal-wash shadow-[inset_0_0_0_1px_var(--color-teal)]" : "border-line bg-white hover:border-teal",
        )}
      >
        <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(field.id, e.target.checked)} className="sr-only" />
        <span aria-hidden className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-teal-deep" : "bg-ink/20")}>
          <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-bounce)]", on && "translate-x-5")} />
        </span>
        <span>
          <span className="block text-[15px] font-semibold text-ink">{field.label}</span>
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
      <div>
        <label htmlFor={inputId} className="block text-sm font-bold tracking-wide text-ink">
          {field.label}
        </label>
        {field.hint && <p className="mt-1 text-[13.5px] text-muted">{field.hint}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center overflow-hidden rounded-full border-[1.5px] border-line bg-white">
            <button type="button" onClick={() => set(n - 1)} disabled={n <= field.min} aria-label={`${field.label} verringern`} className="grid h-12 w-12 place-items-center hover:bg-teal-wash hover:text-teal-deep disabled:opacity-35">
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
              className="num h-12 w-16 border-x border-line text-center font-bold text-ink outline-none [appearance:textfield] focus:bg-teal-wash [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button type="button" onClick={() => set(n + 1)} disabled={n >= field.max} aria-label={`${field.label} erhöhen`} className="grid h-12 w-12 place-items-center hover:bg-teal-wash hover:text-teal-deep disabled:opacity-35">
              <Plus className="size-4" aria-hidden />
            </button>
          </div>
          <span className="num text-sm text-muted">
            je {field.preisProEinheit} € {n > 0 && <b className="font-semibold text-teal-deep">= {n * field.preisProEinheit} €</b>}
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
      {field.label && <legend className="text-sm font-bold tracking-wide text-ink">{field.label}</legend>}
      {field.hint && <p className="mt-1 text-[13.5px] text-muted">{field.hint}</p>}
      <div className={cn("mt-3 grid gap-2.5", COLS[field.spalten ?? 1])}>
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
