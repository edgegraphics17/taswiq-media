"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { nav } from "@/config/site";
import { cn } from "@/lib/format";

const SPY_IDS = ["home", "services", "ki", "ablauf", "kontakt"];

/**
 * Schwebende Pillen-Navigation (Vorlage): weiße Kapsel mit weichem Schatten.
 * Mobil wie in der Vorlage: Logo · "Kostenloses Erstgespräch"-Pille · rosé Menü-Kreis.
 */
export function Header({
  menuOpen,
  onToggleMenu,
  toggleRef,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const els = SPY_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)), {
      rootMargin: "-45% 0px -50% 0px",
    });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  const isActive = (href: string) => {
    const [path, hash] = href.split("#");
    if (hash) return pathname === "/" && activeId === hash;
    return pathname.startsWith(path);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink">
        Zum Inhalt springen
      </a>
      <div
        className={cn(
          "mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 rounded-full border px-3 pl-5 transition-[background-color,box-shadow,border-color] duration-300",
          scrolled || menuOpen ? "border-line bg-white/90 shadow-[var(--shadow-soft)] backdrop-blur-xl" : "border-transparent bg-white/60 backdrop-blur-md",
        )}
      >
        <Link href="/" aria-label="TasWiq Media. – Startseite" className="shrink-0 rounded-full">
          <Logo className="h-9" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-[14.5px] font-medium transition-colors",
                isActive(item.href) ? "bg-brand-50 text-brand-600" : "text-body hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#kontakt"
            className="group inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-white px-4 text-[13px] font-medium text-ink shadow-sm transition hover:border-brand-200 sm:text-sm lg:border-transparent lg:bg-brand-500 lg:px-5 lg:text-white lg:shadow-[var(--shadow-brand)] lg:hover:bg-brand-600"
          >
            <span className="lg:hidden">Erstgespräch</span>
            <span className="hidden lg:inline">Kostenloses Erstgespräch</span>
            <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={onToggleMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            className="grid size-11 place-items-center rounded-full bg-blush-200 text-blush-600 transition hover:bg-blush-100 lg:hidden"
          >
            <span className="relative block h-3 w-4" aria-hidden>
              <span className={cn("absolute left-0 h-0.5 w-4 rounded-full bg-current transition-all duration-300", menuOpen ? "top-1.5 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-0.5 w-4 rounded-full bg-current transition-all duration-300", menuOpen ? "top-1.5 -rotate-45" : "top-2.5")} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
