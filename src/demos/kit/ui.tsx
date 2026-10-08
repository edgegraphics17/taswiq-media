"use client";

import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { cx, fmtDayLong, day, initials } from "@/demos/kit/util";

/**
 * Bausteine der Verwaltungsansichten ("Backoffice") aller Demos.
 * Bewusst nüchtern: flache Flächen, feine Linien, enge Radien, tabellarische Ziffern, Farbe nur für Bedeutung.
 * Die Markenfarbe der Musterfirma kommt über --d-accent (siehe registry.ts → theme).
 */

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export function Backoffice({ nav, user, role, title, actions, children }: { nav: NavItem[]; user: string; role: string; title: string; actions?: ReactNode; children: ReactNode }) {
  const { def, tab, setTab } = useDemo();
  return (
    <div className="min-h-[calc(100dvh-var(--bar-h))] bg-bo-bg font-plex text-[14px] leading-normal text-bo-body lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)]">
      <aside className="border-bo-line bg-white lg:sticky lg:top-[var(--bar-h)] lg:flex lg:h-[calc(100dvh-var(--bar-h))] lg:flex-col lg:border-r">
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-d-deep text-[13px] font-semibold text-white" aria-hidden>
            {def.firm.replace(/^(Pizzeria|Autohaus)\s/, "")[0]}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] leading-tight font-semibold text-bo-ink">{def.firm}</p>
            <p className="text-[11.5px] leading-tight text-bo-muted">Verwaltung</p>
          </div>
        </div>
        <nav aria-label="Bereiche" className="flex gap-1 overflow-x-auto border-b border-bo-line px-3 pb-2 [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-0 lg:px-2 lg:pb-0">
          {nav.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => setTab(n.id)}
                className={cx(
                  "relative flex min-h-10 shrink-0 items-center gap-2.5 rounded-md px-2.5 text-left text-[13.5px] whitespace-nowrap transition-colors lg:min-h-9",
                  active ? "bg-bo-bg font-medium text-bo-ink" : "text-bo-body hover:bg-bo-bg/70 hover:text-bo-ink",
                )}
              >
                {active && <span className="absolute inset-y-2 left-0 hidden w-[3px] rounded-full bg-d-accent lg:block" aria-hidden />}
                <n.icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="flex-1">{n.label}</span>
                {n.count ? <span className="num rounded bg-d-accent px-1.5 text-[11px] leading-[18px] font-semibold text-d-on">{n.count}</span> : null}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto hidden items-center gap-2.5 border-t border-bo-line px-4 py-3 lg:flex">
          <Avatar name={user} />
          <div className="min-w-0">
            <p className="truncate text-[13px] leading-tight font-medium text-bo-ink">{user}</p>
            <p className="truncate text-[11.5px] leading-tight text-bo-muted">{role}</p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-[12.5px] text-bo-muted">{fmtDayLong(day())}</p>
            <h1 className="text-[1.35rem] leading-tight font-semibold tracking-[-0.01em] text-bo-ink">{title}</h1>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function Panel({ title, aside, children, className, flush, tour }: { title?: ReactNode; aside?: ReactNode; children: ReactNode; className?: string; flush?: boolean; tour?: string }) {
  return (
    <section data-tour={tour} className={cx("rounded-[10px] border border-bo-line bg-white", className)}>
      {(title || aside) && (
        <header className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-bo-line px-4 py-2">
          <h2 className="text-[13.5px] font-semibold text-bo-ink">{title}</h2>
          {aside && <div className="flex items-center gap-2 text-[12.5px] text-bo-muted">{aside}</div>}
        </header>
      )}
      <div className={flush ? "" : "p-4"}>{children}</div>
    </section>
  );
}

type Tone = "neutral" | "ok" | "warn" | "bad" | "info" | "accent";
const TONES: Record<Tone, string> = {
  neutral: "bg-bo-bg text-bo-body",
  ok: "bg-[#e3f3ea] text-bo-ok",
  warn: "bg-[#fbf0d9] text-bo-warn",
  bad: "bg-[#fbe7e5] text-bo-bad",
  info: "bg-[#e6eefb] text-[#1d4fa8]",
  accent: "bg-d-soft text-bo-ink",
};
const DOTS: Record<Tone, string> = { neutral: "bg-bo-muted", ok: "bg-bo-ok", warn: "bg-[#c8860a]", bad: "bg-bo-bad", info: "bg-[#2f6ad8]", accent: "bg-d-accent" };

/** Status-Etikett: Punkt + Text, nie nur Farbe */
export function Tag({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[12px] leading-[18px] font-medium whitespace-nowrap", TONES[tone], className)}>
      <span className={cx("size-1.5 rounded-full", DOTS[tone])} aria-hidden />
      {children}
    </span>
  );
}

/** Kennzahlen als schlichte Zeile mit Trennlinien – keine Kachel-Parade */
export function Figures({ items, tour }: { items: { label: string; value: ReactNode; note?: ReactNode }[]; tour?: string }) {
  return (
    <dl data-tour={tour} className="grid grid-cols-2 overflow-hidden rounded-[10px] border border-bo-line bg-white sm:flex">
      {items.map((it, i) => (
        <div key={it.label} className={cx("flex-1 px-4 py-3", i > 0 && "sm:border-l sm:border-bo-line", i > 1 && "max-sm:border-t max-sm:border-bo-line", i % 2 === 1 && "max-sm:border-l max-sm:border-bo-line")}>
          <dt className="text-[12px] text-bo-muted">{it.label}</dt>
          <dd className="num mt-0.5 text-[1.35rem] leading-tight font-semibold tracking-[-0.01em] text-bo-ink">{it.value}</dd>
          {it.note && <p className="num mt-0.5 text-[12px] text-bo-muted">{it.note}</p>}
        </div>
      ))}
    </dl>
  );
}

/** Säulen mit Wert über jeder Säule; `mark` hebt eine Säule in der Markenfarbe hervor */
export function Bars({ data, mark, format = String, height = 132, label }: { data: { label: string; value: number }[]; mark?: number; format?: (n: number) => string; height?: number; label: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${format(d.value)}`).join(", ")}`} className="flex items-end gap-1.5" style={{ height: height + 38 }}>
      {data.map((d, i) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className={cx("num text-[11px]", i === mark ? "font-semibold text-bo-ink" : "text-bo-muted")}>{d.value ? format(d.value) : ""}</span>
          <span className={cx("w-full max-w-9 rounded-t-[3px]", i === mark ? "bg-d-accent" : "bg-[#c9ced8]")} style={{ height: Math.max(2, (d.value / max) * height) }} />
          <span className="num w-full truncate text-center text-[11px] text-bo-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Rangliste mit waagerechten Balken */
export function Ranks({ data, format = String }: { data: { label: string; value: number; note?: string }[]; format?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-2.5">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="truncate text-bo-ink">{d.label}</span>
            <span className="num shrink-0 text-bo-muted">
              {d.note && <span className="mr-2">{d.note}</span>}
              <span className="font-medium text-bo-ink">{format(d.value)}</span>
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-bo-bg">
            <div className={cx("h-full rounded-full", i === 0 ? "bg-d-accent" : "bg-[#b4bac6]")} style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const BTN = {
  primary: "bg-d-accent text-d-on hover:brightness-95",
  dark: "bg-bo-ink text-white hover:bg-[#2a2e37]",
  line: "border border-bo-line bg-white text-bo-ink hover:border-[#b9bfca]",
  quiet: "text-bo-body hover:bg-bo-bg hover:text-bo-ink",
  danger: "border border-bo-line bg-white text-bo-bad hover:border-bo-bad",
};
export function Btn({ variant = "line", size = "md", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BTN; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-[filter,background-color,border-color] disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "min-h-9 px-2.5 text-[12.5px] sm:min-h-8" : "min-h-11 px-3.5 text-[13.5px] sm:min-h-9",
        BTN[variant],
        className,
      )}
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="grid min-h-11 place-items-center px-1 sm:min-h-9">
      <span className={cx("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", checked ? "bg-bo-ok" : "bg-[#c3c8d2]")}>
        <span className={cx("size-4 rounded-full bg-white shadow-sm transition-transform", checked && "translate-x-4")} />
      </span>
    </button>
  );
}

const AVATAR_TONES = ["bg-[#dfe7f5] text-[#24457d]", "bg-[#f3e4d2] text-[#7a4a12]", "bg-[#dcefe4] text-[#1c5c3c]", "bg-[#efe0ee] text-[#6b2f66]", "bg-[#e6e7ea] text-[#3a3f4a]"];
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const tone = AVATAR_TONES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TONES.length];
  return (
    <span className={cx("grid shrink-0 place-items-center rounded-full font-semibold", size === "sm" ? "size-6 text-[10px]" : "size-8 text-[11.5px]", tone)} aria-hidden>
      {initials(name)}
    </span>
  );
}

/** Tabellenkopf-Zelle und Zeilenstil – die Demos schreiben echte <table>, damit Screenreader und Dichte stimmen */
export const th = "px-3 py-2 text-left text-[11.5px] font-medium tracking-wide text-bo-muted uppercase whitespace-nowrap first:pl-4 last:pr-4";
export const td = "px-3 py-2.5 align-middle first:pl-4 last:pr-4";
export const tr = "border-t border-bo-line";

/** Dialog: mittig am Desktop, als Blatt von unten am Handy. Escape und Klick daneben schließen. */
export function Sheet({ open, onClose, title, children, footer, wide, tone = "bo" }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean; tone?: "bo" | "brand" }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const last = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      last?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgb(16_18_22/0.5)] sm:items-center sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={cx(
          "flex max-h-[90dvh] w-full animate-demo-in flex-col overflow-hidden bg-white shadow-[0_24px_60px_-18px_rgb(17_17_19/0.35)] outline-none",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg",
          tone === "bo" ? "rounded-t-xl font-plex text-[14px] text-bo-body sm:rounded-xl" : "rounded-t-2xl sm:rounded-2xl",
        )}
      >
        <header className={cx("flex items-start justify-between gap-4 px-5 pt-4 pb-3", tone === "bo" && "border-b border-bo-line")}>
          <h2 id={id} className={tone === "bo" ? "text-[15px] font-semibold text-bo-ink" : "text-lg leading-snug font-semibold"}>
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Schließen" className="-mt-1.5 -mr-2 grid size-11 shrink-0 place-items-center rounded-full opacity-60 hover:bg-black/5 hover:opacity-100">
            <X className="size-[18px]" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className={cx("flex flex-wrap justify-end gap-2 px-5 py-3", tone === "bo" && "border-t border-bo-line bg-bo-bg/60")}>{footer}</footer>}
      </div>
    </div>
  );
}

/** Beschriftetes Formularfeld (Label immer sichtbar) */
export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1 block text-[12.5px] font-medium opacity-80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] opacity-60">{hint}</span>}
    </label>
  );
}
/** Eingabefeld-Stil: 16 px am Handy (kein Zoom unter iOS) */
export const input = "block min-h-11 w-full rounded-md border border-[#cfd3db] bg-white px-3 text-[16px] text-[#15171c] placeholder:text-[#8b909c] focus:border-[#15171c] focus:outline-none sm:text-[14px]";

/** Fortschritt in Schritten – für Bestell-, Fahrzeug- und Auftragsstatus auf den Kundenseiten */
export function Track({ steps, current, className }: { steps: string[]; current: number; className?: string }) {
  return (
    <ol className={cx("flex", className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={s} className="relative flex-1 text-center" aria-current={now ? "step" : undefined}>
            {i > 0 && <span className={cx("absolute top-[9px] right-1/2 h-0.5 w-full", done || now ? "bg-d-accent" : "bg-black/10")} aria-hidden />}
            <span className={cx("relative mx-auto grid size-5 place-items-center rounded-full border-2 bg-white", done ? "border-d-accent bg-d-accent" : now ? "border-d-accent" : "border-black/15")}>
              {done ? (
                <svg viewBox="0 0 12 12" className="size-2.5 text-d-on" aria-hidden>
                  <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : now ? (
                <span className="size-2 rounded-full bg-d-accent" />
              ) : null}
            </span>
            <span className={cx("mt-1.5 block px-1 text-[11.5px] leading-tight sm:text-[12.5px]", now ? "font-semibold" : done ? "" : "opacity-55")}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
