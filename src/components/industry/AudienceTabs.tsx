"use client";

import { useRef, useState } from "react";
import { Check, Minus } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";

export type Audience = { icon: string; label: string; title: string; text: string; pains: string[]; builds: string[] };

/**
 * "Für wen": Zielgruppen als Pillen-Tabs, darunter eine breite, zentrierte Karte –
 * links Ausgangslage, rechts (schwarz) was wir dafür bauen. Alle Panels stehen im
 * HTML (für Suchmaschinen), sichtbar ist nur das gewählte.
 */
export function AudienceTabs({ items, painsLabel, buildsLabel, ariaLabel }: { items: Audience[]; painsLabel: string; buildsLabel: string; ariaLabel: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + items.length) % items.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={ariaLabel} onKeyDown={onKey} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((a, i) => {
          const on = i === active;
          return (
            <button
              key={a.label}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`aud-tab-${i}`}
              aria-selected={on}
              aria-controls={`aud-panel-${i}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-300 ease-[var(--ease-soft)]",
                on ? "border-night bg-night text-white shadow-[var(--shadow-soft)]" : "border-line bg-white text-body hover:border-brand-200 hover:text-ink",
              )}
            >
              <Icon name={a.icon} className={cn("size-4", on ? "text-mint-400" : "text-muted")} />
              {a.label}
            </button>
          );
        })}
      </div>

      {items.map((a, i) => (
        <div
          key={a.label}
          role="tabpanel"
          id={`aud-panel-${i}`}
          aria-labelledby={`aud-tab-${i}`}
          hidden={i !== active}
          className={cn("card mx-auto mt-6 max-w-5xl overflow-hidden p-2", i === active && "animate-rise [animation-duration:0.5s]")}
        >
          <div className="grid gap-2 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-5 sm:p-8">
              <span className="grid size-12 place-items-center rounded-full bg-blush-100 text-blush-600">
                <Icon name={a.icon} className="size-5" />
              </span>
              <h3 className="mt-5 text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.1] font-medium text-balance">{a.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{a.text}</p>
              <p className="mt-7 text-sm font-medium text-ink">{painsLabel}</p>
              <ul className="mt-3 grid gap-2">
                {a.pains.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[14.5px] leading-snug text-body">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-canvas text-muted">
                      <Minus className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col rounded-[1.6rem] bg-night p-6 text-white sm:p-8">
              <p className="text-sm font-medium text-night-muted">{buildsLabel}</p>
              <ul className="mt-4 grid gap-2.5">
                {a.builds.map((b) => (
                  <li key={b} className="flex items-center gap-3 rounded-3xl bg-white/[0.07] p-2 pr-4 text-[14.5px] leading-snug">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
                      <Check className="size-4" strokeWidth={3} aria-hidden />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
