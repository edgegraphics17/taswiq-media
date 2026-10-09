"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  CalendarCheck,
  Car,
  GraduationCap,
  Hammer,
  Plug,
  Scale,
  Sparkles,
  Sun,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/format";

/** Zeichen je Reiter: die Branche der Demo, nicht die Art der Software – das erkennt man schneller */
const ICONS: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed,
  friseur: CalendarCheck,
  immobilien: Building2,
  werkstatt: Car,
  steuerkanzlei: Scale,
  handwerk: Hammer,
  kosmetik: Sparkles,
  sonnenstudio: Sun,
  fahrschule: GraduationCap,
  anbindungen: Plug,
};

/**
 * Reiterleiste der Demo-Übersicht: springt zu den Systemen und zeigt beim Scrollen, wo man gerade ist –
 * wie die Bereichs-Reiter in einem Dashboard. Am Handy seitlich wischbar; der aktive Reiter bleibt im Blick.
 */
export function PortalNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  const [active, setActive] = useState("");
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).at(-1);
        if (hit) setActive(hit.target.id);
      },
      // Schmaler Streifen etwas über der Fenstermitte: aktiv ist, was dort gerade liegt
      { rootMargin: "-35% 0px -60% 0px" },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [items]);

  // Nur die Leiste selbst verschieben – scrollIntoView würde die Seite mitziehen
  useEffect(() => {
    const ul = list.current;
    const el = ul?.querySelector<HTMLElement>("[aria-current]");
    if (ul && el)
      ul.scrollTo({
        left: el.offsetLeft - (ul.clientWidth - el.offsetWidth) / 2,
        behavior: "smooth",
      });
  }, [active]);

  return (
    <nav
      aria-label="Systeme"
      className="border-b border-line bg-white/90 backdrop-blur-md"
    >
      <ul
        ref={list}
        className="container-x relative flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it) => {
          const Ico = ICONS[it.id];
          return (
            <li key={it.id} className="shrink-0">
              <a
                href={`#${it.id}`}
                aria-current={active === it.id ? "location" : undefined}
                className={cn(
                  "relative flex min-h-12 items-center gap-2 px-3 text-sm font-medium whitespace-nowrap transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                  active === it.id
                    ? "text-ink after:bg-brand-500"
                    : "text-muted after:bg-transparent hover:text-ink",
                )}
              >
                {Ico && (
                  <Ico
                    className={cn(
                      "size-[18px] transition-colors",
                      active === it.id ? "text-brand-500" : "text-muted",
                    )}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                )}
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
