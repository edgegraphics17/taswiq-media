"use client";

import type { ReactNode } from "react";
import { cx, hm } from "@/demos/kit/util";

/**
 * Tagesraster der Verwaltungsansichten: Spalten (Plätze, Kabinen, Fahrlehrer) nebeneinander, Termine als Blöcke.
 * Die Demos liefern nur Spalten, Blöcke und gesperrte Zeiten – Raster, Uhrzeiten und Hervorhebung sind überall gleich.
 */
export interface GridItem {
  id: number;
  col: string;
  start: number;
  min: number;
  title: string;
  sub?: string;
  /** Klassen für Rand und Fläche des Blocks */
  tone: string;
  /** In der Demo selbst angelegt – wird hervorgehoben */
  own?: boolean;
  /** Ausgefallen oder abgesagt: schraffiert und durchgestrichen */
  off?: boolean;
}

export function DayGrid({ cols, items, open, close, blocks = [], px = 1.3, onPick }: { cols: { id: string; title: string; sub?: ReactNode }[]; items: GridItem[]; open: number; close: number; blocks?: { col: string; from: number; to: number; label: string }[]; px?: number; onPick?: (id: number) => void }) {
  const hours = Array.from({ length: Math.floor((close - open) / 60) + 1 }, (_, i) => open + i * 60);
  const height = (close - open) * px;
  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ minWidth: 150 + cols.length * 150, gridTemplateColumns: `3.25rem repeat(${cols.length}, minmax(0, 1fr))` }}>
        <div className="border-b border-bo-line" />
        {cols.map((c) => (
          <div key={c.id} className="border-b border-l border-bo-line px-3 py-2">
            <p className="truncate text-[13px] leading-tight font-semibold text-bo-ink">{c.title}</p>
            {c.sub && <p className="num mt-0.5 truncate text-[11.5px] leading-tight text-bo-muted">{c.sub}</p>}
          </div>
        ))}
        <div className="relative" style={{ height }}>
          {hours.map((h) => (
            <span key={h} className="num absolute right-2 -translate-y-1/2 text-[11px] text-bo-muted" style={{ top: Math.max(8, (h - open) * px) }}>
              {hm(h)}
            </span>
          ))}
        </div>
        {cols.map((c) => (
          <div key={c.id} className="relative border-l border-bo-line" style={{ height, backgroundImage: "linear-gradient(to bottom, var(--color-bo-line) 1px, transparent 1px)", backgroundSize: `100% ${60 * px}px` }}>
            {blocks
              .filter((b) => b.col === c.id)
              .map((b) => (
                <div key={b.from} className="absolute inset-x-0 grid place-items-center bg-[repeating-linear-gradient(135deg,var(--color-bo-line)_0_6px,var(--color-bo-bg)_6px_12px)] text-[11px] text-bo-muted" style={{ top: (b.from - open) * px, height: (b.to - b.from) * px }}>
                  {b.label}
                </div>
              ))}
            {items
              .filter((a) => a.col === c.id)
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onPick?.(a.id)}
                  className={cx("absolute inset-x-1 overflow-hidden rounded border-l-[3px] px-2 py-0.5 text-left leading-tight transition-shadow hover:shadow-md", a.off ? "border-l-bo-muted bg-[repeating-linear-gradient(135deg,#eceeef_0_5px,#f6f7f8_5px_10px)]" : a.tone, a.own && "animate-demo-flash ring-1 ring-bo-ink")}
                  style={{ top: (a.start - open) * px + 1, height: Math.max(18, a.min * px - 2) }}
                >
                  {a.min < 35 ? (
                    <span className={cx("block truncate text-[12px] text-bo-ink", a.off && "line-through")}>
                      <span className="num text-bo-muted">{hm(a.start)}</span> <span className="font-semibold">{a.title}</span>
                    </span>
                  ) : (
                    <>
                      <span className="num block truncate text-[11px] text-bo-muted">
                        {hm(a.start)}–{hm(a.start + a.min)}
                      </span>
                      <span className={cx("block truncate text-[12.5px] font-semibold text-bo-ink", a.off && "line-through")}>{a.title}</span>
                      {a.sub && a.min >= 50 && <span className="block truncate text-[11.5px] text-bo-body">{a.sub}</span>}
                    </>
                  )}
                </button>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
