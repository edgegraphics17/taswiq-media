"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { AppHref } from "@/config/site";
import type { SeoPage } from "@/config/seo-pages";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";

/**
 * Menüpunkt mit Dropdown (Desktop): Das Label bleibt ein Link zur Sektion, das Panel öffnet per Hover,
 * der Pfeil-Button per Klick/Tastatur (Touch-Geräte ≥ lg). Schließt bei Escape, Fokusverlust und Klick außerhalb.
 */
export function NavDropdown({ item, pages, active }: { item: { key: string; href: AppHref }; pages: SeoPage[]; active: boolean }) {
  // Schlüssel entstehen aus nav-Key + Seiten-ID → lose typisiert
  const tNav = useTranslations("nav") as unknown as (key: string, values?: Record<string, string>) => string;
  const locale = useLocale() as Locale;
  const { slug } = useParams<{ slug?: string }>();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hovering = useRef(false); // Maus hat bereits geöffnet → Klick auf den Pfeil darf nicht wieder schließen
  const panelId = `nav-menu-${item.key}`;
  const label = tNav(item.key);
  const current = pages.some((p) => p.slugs[locale] === slug);

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const hideSoon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <div
      ref={root}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = true;
        show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        hovering.current = false;
        hideSoon();
      }}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || !open) return;
        setOpen(false);
        toggle.current?.focus();
      }}
    >
      <div className={cn("flex items-center rounded-full transition-colors", active || current ? "bg-brand-50 text-brand-600" : open ? "text-ink" : "text-body hover:text-ink")}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          onClick={() => setOpen(false)}
          className="rounded-full py-2 pr-1 pl-3.5 text-[14.5px] font-medium whitespace-nowrap"
        >
          {label}
        </Link>
        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={tNav("submenu", { label })}
          onClick={() => setOpen((o) => hovering.current || !o)}
          className="grid h-9 w-7 place-items-center rounded-full pr-1.5"
        >
          <ChevronDown className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")} aria-hidden />
        </button>
      </div>

      <div
        id={panelId}
        className={cn(
          "absolute top-full -left-3 z-50 w-[36rem] pt-3 transition-[opacity,translate,visibility] duration-200 ease-[var(--ease-soft)]",
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1.5 opacity-0",
        )}
      >
        <div className="rounded-[1.75rem] border border-line bg-white p-2 shadow-[var(--shadow-float)]">
          <ul className="grid grid-cols-2 gap-0.5">
            {pages.map((p) => {
              const isCurrent = p.slugs[locale] === slug;
              return (
                <li key={p.id}>
                  <Link
                    href={{ pathname: "/leistungen/[slug]", params: { slug: p.slugs[locale] } }}
                    aria-current={isCurrent ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn("group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-canvas", isCurrent && "bg-brand-50")}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                      <Icon name={p.icon} className="size-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] leading-snug font-medium text-ink">{tNav(`menus.${item.key}.items.${p.id}.label`)}</span>
                      <span className="block truncate text-[13px] leading-snug text-muted">{tNav(`menus.${item.key}.items.${p.id}.hint`)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={item.href}
            onClick={() => setOpen(false)}
            className="group mt-2 flex min-h-11 items-center justify-between rounded-2xl border-t border-line px-3.5 text-sm font-medium text-ink transition-colors hover:text-brand-600"
          >
            {tNav(`menus.${item.key}.all`)}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
