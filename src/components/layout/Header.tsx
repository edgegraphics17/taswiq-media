"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { nav } from "@/config/site";
import { cn } from "@/lib/format";

/** Seiten ohne dunklen Hero bekommen von Anfang an die helle Leiste (wie asap/rechner.html). */
const SOLID_ROUTES = ["/preisrechner", "/impressum", "/datenschutz"];
const SPY_IDS = ["home", "services", "ki", "ablauf", "kontakt"];

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
  const solid = scrolled || SOLID_ROUTES.includes(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-Spy für die Sektions-Links der Startseite
  useEffect(() => {
    if (pathname !== "/") return;
    const els = SPY_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  const isActive = (href: string) => {
    const [path, hash] = href.split("#");
    if (hash) return pathname === "/" && activeId === hash;
    return pathname.startsWith(path);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300",
        solid
          ? "bg-white/95 shadow-[0_1px_0_rgb(90_174_184/0.18),0_8px_30px_rgb(15_23_32/0.06)] backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-ink"
      >
        Zum Inhalt springen
      </a>
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[72px]">
        <Link href="/" aria-label="TasWiq Media. – Startseite" className="-ml-1 shrink-0 rounded-md p-1">
          <Logo tone={solid ? "dark" : "light"} className="h-10 lg:h-11" />
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-full px-3 py-2 text-[14.5px] font-medium transition-colors",
                solid ? "text-ink/75 hover:text-ink" : "text-white/75 hover:text-white",
                isActive(item.href) && (solid ? "text-teal-deep" : "text-white"),
              )}
            >
              {item.label}
              {isActive(item.href) && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-teal" />}
            </Link>
          ))}
          <ButtonLink href="/#kontakt" className="ml-3 min-h-11 px-5 text-sm">
            Projekt starten
          </ButtonLink>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={onToggleMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
          className="grid size-11 place-items-center rounded-full lg:hidden"
        >
          <span className="flex w-6 flex-col gap-[5px]" aria-hidden>
            <span className={cn("h-0.5 rounded-full", solid ? "bg-ink" : "bg-white")} />
            <span className="h-0.5 w-4 rounded-full bg-teal" />
            <span className={cn("h-0.5 rounded-full", solid ? "bg-ink" : "bg-white")} />
          </span>
        </button>
      </div>
    </header>
  );
}
