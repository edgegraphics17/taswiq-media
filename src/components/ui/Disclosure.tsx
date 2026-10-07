"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * Aufklapp-Bereich: Button bleibt an seiner Stelle, der Inhalt fährt darunter auf (Grid-Zeile 0fr → 1fr,
 * keine Höhenmessung). Zugeklappt ist der Inhalt unsichtbar und nicht fokussierbar, bleibt aber im HTML.
 * `desktopOpen`: ab lg immer offen, der Button erscheint nur mobil.
 */
export function Disclosure({
  openLabel,
  closeLabel,
  tone = "light",
  desktopOpen,
  className,
  children,
}: {
  openLabel: string;
  closeLabel: string;
  tone?: "light" | "dark";
  desktopOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex min-h-11 items-center justify-between gap-3 rounded-full px-5 text-sm font-medium transition-colors duration-300",
          tone === "dark" ? "bg-white/[0.08] text-white hover:bg-white/[0.14]" : "bg-brand-50 text-brand-700 hover:bg-brand-100",
          desktopOpen && "lg:hidden",
          className,
        )}
      >
        {open ? closeLabel : openLabel}
        <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>
      <div
        id={id}
        className={cn(
          "grid transition-[grid-template-rows,visibility] duration-500 ease-[var(--ease-soft)]",
          open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
          desktopOpen && "lg:visible lg:grid-rows-[1fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </>
  );
}
