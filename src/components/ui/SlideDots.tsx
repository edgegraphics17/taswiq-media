"use client";

import { cn } from "@/lib/format";

/** Punkte unter mobilen Slidern – tippbar, zeigen die aktive Karte. */
export function SlideDots({
  count,
  active,
  onSelect,
  tone = "light",
  label,
}: {
  count: number;
  active: number;
  onSelect: (i: number) => void;
  tone?: "light" | "dark";
  label: string;
}) {
  return (
    <div className="-mt-4 flex justify-center min-[900px]:hidden" role="tablist" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Karte ${i + 1} von ${count}`}
          onClick={() => onSelect(i)}
          className="grid h-11 w-7 place-items-center"
        >
          <span
            className={cn(
              "block h-2 rounded-full transition-all duration-300",
              i === active ? "w-6 bg-teal" : cn("w-2", tone === "dark" ? "bg-white/25" : "bg-ink/20"),
            )}
          />
        </button>
      ))}
    </div>
  );
}
