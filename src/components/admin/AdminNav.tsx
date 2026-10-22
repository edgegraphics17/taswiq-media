"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calculator, CalendarDays, ChevronDown, Inbox, Network, PanelLeftClose, PanelLeftOpen, Search, Tags, UserRound, Video, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const KEY = "admin-nav";
// Schmale Leiste: Beschriftungen nur auf dem Desktop ausblenden (Handy zeigt ohnehin nur Symbole).
const mini = "[[data-nav=mini]_&]:lg:sr-only";

/**
 * Drei Bereiche: Arbeit (was reinkommt), Analyse (wie die Seiten laufen), Einstellungen.
 * Bereiche lassen sich zuklappen, die ganze Leiste auf Symbole verkleinern – beides merkt sich der Browser.
 */
export function AdminNav({ newLeads, upcoming = 0 }: { newLeads: number; upcoming?: number }) {
  const pathname = usePathname();
  const [closed, setClosed] = useState<string[]>([]);
  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Arbeit",
      items: [
        { href: "/admin", label: "Anfragen", icon: Inbox, badge: newLeads },
        { href: "/admin/kalender", label: "Kalender", icon: CalendarDays, badge: upcoming },
        { href: "/admin/meetings", label: "Meetings", icon: Video },
      ],
    },
    {
      title: "Analyse",
      items: [
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/seo", label: "SEO", icon: Search },
        { href: "/admin/struktur", label: "Seitenstruktur", icon: Network },
        { href: "/admin/rechner", label: "Kalkulationen", icon: Calculator },
      ],
    },
    {
      title: "Einstellungen",
      items: [
        { href: "/admin/preise", label: "Preise", icon: Tags },
        { href: "/admin/konto", label: "Konto", icon: UserRound },
      ],
    },
  ];
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/leads") : pathname.startsWith(href));

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "{}") as { closed?: string[]; mini?: boolean };
      setClosed(s.closed ?? []);
      if (s.mini) document.documentElement.dataset.nav = "mini";
    } catch {}
  }, []);
  const save = (next: { closed?: string[]; mini?: boolean }) => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      localStorage.setItem(KEY, JSON.stringify({ ...s, ...next }));
    } catch {}
  };
  const toggleGroup = (t: string) => {
    const next = closed.includes(t) ? closed.filter((x) => x !== t) : [...closed, t];
    setClosed(next);
    save({ closed: next });
  };
  const toggleMini = () => {
    const on = document.documentElement.dataset.nav !== "mini";
    if (on) document.documentElement.dataset.nav = "mini";
    else delete document.documentElement.dataset.nav;
    save({ mini: on });
  };

  return (
    <nav aria-label="Dashboard" className="flex flex-1 gap-1 overflow-x-auto lg:mt-8 lg:flex-col lg:gap-0 lg:overflow-visible">
      {groups.map((g) => {
        const open = !closed.includes(g.title);
        return (
          <div key={g.title} className="flex gap-1 lg:mb-4 lg:flex-col">
            <button
              type="button"
              onClick={() => toggleGroup(g.title)}
              aria-expanded={open}
              className="hidden min-h-8 cursor-pointer items-center justify-between rounded-lg px-3 text-[11px] font-semibold tracking-wider text-night-muted uppercase hover:text-white lg:flex [[data-nav=mini]_&]:lg:hidden"
            >
              {g.title} <ChevronDown className={cn("size-3.5 transition-transform", !open && "-rotate-90")} aria-hidden />
            </button>
            {g.items.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  title={n.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "bg-white/10 text-white" : "text-night-muted hover:bg-white/5 hover:text-white",
                    // Zugeklappt bleibt die aktive Seite sichtbar; in der schmalen Leiste sind alle Symbole da.
                    !open && !active && "lg:hidden [[data-nav=mini]_&]:lg:flex",
                  )}
                >
                  <n.icon className="size-4 shrink-0" aria-hidden /> <span className={mini}>{n.label}</span>
                  {n.badge ? (
                    <span className="num ml-auto rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white [[data-nav=mini]_&]:lg:absolute [[data-nav=mini]_&]:lg:top-0.5 [[data-nav=mini]_&]:lg:right-0.5 [[data-nav=mini]_&]:lg:px-1.5" aria-label={`${n.badge} offen`}>
                      {n.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        );
      })}
      <button type="button" onClick={toggleMini} className="mt-auto hidden min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm text-night-muted hover:bg-white/5 hover:text-white lg:flex" title="Leiste ein- oder ausklappen">
        <PanelLeftClose className="size-4 shrink-0 [[data-nav=mini]_&]:hidden" aria-hidden />
        <PanelLeftOpen className="hidden size-4 shrink-0 [[data-nav=mini]_&]:block" aria-hidden />
        <span className={mini}>Leiste verkleinern</span>
      </button>
    </nav>
  );
}
