"use client";

import { forwardRef, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Home, Layers, Mail, Phone, Sparkles, Workflow, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { nav, site } from "@/config/site";
import { cn } from "@/lib/format";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/#home": Home,
  "/#services": Layers,
  "/#ki": Sparkles,
  "/content-pipeline": Workflow,
  "/#ablauf": ArrowRight,
  "/preisrechner": Calculator,
};

/**
 * Menü-Panel links hinter der weggeklappten Seite (asap .mm-panel):
 * Links fliegen gestaffelt ein (120 ms + 30 ms je Punkt).
 */
export const MobileMenu = forwardRef<
  HTMLDivElement,
  { open: boolean; onNavigate: (href: string) => void; onClose: () => void }
>(function MobileMenu({ open, onNavigate, onClose }, ref) {
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => firstLink.current?.focus(), 200);
  }, [open]);

  const item = (i: number) => ({
    style: { transitionDelay: open ? `${120 + i * 30}ms` : "0ms" },
    className: cn(
      "transition-[opacity,transform] duration-500 ease-[var(--ease-expo)]",
      open ? "translate-x-0 opacity-100" : "-translate-x-3.5 opacity-0",
    ),
  });

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <div
      ref={ref}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menü"
      aria-hidden={!open}
      className={cn(
        "fixed inset-y-0 left-0 z-[1] flex w-[min(300px,78vw)] flex-col px-6 pt-6 pb-8 text-white transition-[opacity,transform,visibility] duration-500 lg:hidden",
        open ? "visible translate-x-0 opacity-100" : "invisible -translate-x-8 opacity-0",
      )}
    >
      <div className="flex items-center justify-between">
        <Logo className="h-10" />
        <button type="button" onClick={onClose} aria-label="Menü schließen" className="grid size-11 place-items-center rounded-full border border-white/15">
          <X className="size-5" />
        </button>
      </div>

      <p className="mt-10 text-[11px] font-semibold tracking-[0.2em] text-teal-light uppercase">Navigation</p>
      <nav className="mt-3 flex flex-col gap-1" aria-label="Mobile Navigation">
        {nav.map((n, i) => {
          const Ico = NAV_ICONS[n.href] ?? ArrowRight;
          return (
            <div key={n.href} {...item(i)}>
              <Link
                ref={i === 0 ? firstLink : undefined}
                href={n.href}
                onClick={(e) => go(e, n.href)}
                tabIndex={open ? 0 : -1}
                className="group flex min-h-12 items-center gap-3 rounded-xl border border-transparent px-3 text-[15px] font-medium text-white/80 transition hover:translate-x-1 hover:border-teal/25 hover:text-white"
              >
                <span className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 transition group-hover:border-teal group-hover:bg-teal group-hover:text-ink-950">
                  <Ico className="size-4" strokeWidth={1.75} />
                </span>
                {n.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div style={item(nav.length).style} className={cn("mt-auto space-y-2", item(nav.length).className)}>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-teal-light uppercase">Kontakt</p>
        <Link href="/#kontakt" onClick={(e) => go(e, "/#kontakt")} tabIndex={open ? 0 : -1} className="flex min-h-12 items-center justify-center rounded-full bg-teal font-semibold text-ink-950">
          Projekt starten
        </Link>
        <a href={site.phoneHref} tabIndex={open ? 0 : -1} className="flex min-h-11 items-center gap-2 text-sm text-mist">
          <Phone className="size-4 text-teal-light" /> {site.phone}
        </a>
        <a href={`mailto:${site.email}`} tabIndex={open ? 0 : -1} className="flex min-h-11 items-center gap-2 text-sm text-mist">
          <Mail className="size-4 text-teal-light" /> {site.email}
        </a>
      </div>
    </div>
  );
});
