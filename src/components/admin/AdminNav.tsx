"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calculator, CircleCheckBig, Inbox, ListChecks, Network, Tags, UsersRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/format";

interface Item {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

/**
 * Zwei Bereiche: „Kunden & Website“ (was reinkommt, wie die Seite läuft) und „Arbeit“ (was als Nächstes zu tun ist).
 * Aktive Seite ist markiert; Zähler zeigen, wo etwas wartet.
 */
export function AdminNav({ newLeads, openTasks, waiting }: { newLeads: number; openTasks: number; waiting: number }) {
  const pathname = usePathname();
  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Kunden & Website",
      items: [
        { href: "/admin", label: "Anfragen", icon: Inbox, badge: newLeads },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/struktur", label: "Seitenstruktur", icon: Network },
        { href: "/admin/rechner", label: "Kalkulationen", icon: Calculator },
        { href: "/admin/preise", label: "Preise", icon: Tags },
      ],
    },
    {
      title: "Arbeit",
      items: [
        { href: "/admin/aufgaben", label: "Fokus & Aufgaben", icon: ListChecks, badge: openTasks },
        { href: "/admin/freigaben", label: "Freigaben", icon: CircleCheckBig, badge: waiting },
        { href: "/admin/team", label: "Team", icon: UsersRound },
      ],
    },
  ];
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" || pathname.startsWith("/admin/leads") : pathname.startsWith(href));

  return (
    <nav aria-label="Dashboard" className="flex flex-1 gap-1 overflow-x-auto lg:mt-8 lg:flex-col lg:gap-0 lg:overflow-visible">
      {groups.map((g) => (
        <div key={g.title} className="flex gap-1 lg:mb-6 lg:flex-col">
          <p className="hidden px-3 pb-2 text-[11px] font-semibold tracking-wider text-night-muted uppercase lg:block">{g.title}</p>
          {g.items.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "bg-white/10 text-white" : "text-night-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <n.icon className="size-4 shrink-0" aria-hidden /> {n.label}
                {n.badge ? (
                  <span className="num ml-auto rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white" aria-label={`${n.badge} offen`}>
                    {n.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
