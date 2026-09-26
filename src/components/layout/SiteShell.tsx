"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/MobileMenu";

const FOLD_MS = 760;

/**
 * Seiten-Hülle mit dem asap-3D-Menü:
 * Öffnen → Seite wird fixiert (Scroll-Position gemerkt), klappt per
 * perspective/rotateY nach rechts weg, links erscheint das Menü.
 * Schließen → zurückklappen, danach Scroll-Position exakt wiederherstellen.
 * Tipp auf die weggeklappte Seite schließt. Nur unter 1024 px.
 */
export function SiteShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const savedY = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const openMenu = useCallback(() => {
    const canvas = canvasRef.current;
    const inner = innerRef.current;
    if (!canvas || !inner) return;
    if (timer.current) clearTimeout(timer.current);
    if (!canvas.classList.contains("is-lifted")) {
      savedY.current = window.scrollY;
      // Dokumenthöhe halten, sonst springt der Browser nach oben
      document.body.style.height = `${document.documentElement.scrollHeight}px`;
      inner.style.top = `${-savedY.current}px`;
      canvas.classList.add("is-lifted");
      document.documentElement.classList.add("menu3d-open");
    }
    const panelW = panelRef.current?.offsetWidth ?? 300;
    canvas.style.setProperty("--fold-x", `${Math.round(panelW * 1.22 + 14)}px`);
    setOpen(true);
    // Erst im übernächsten Frame klappen – Fixierung ist dann gezeichnet, kein Ruckler
    requestAnimationFrame(() => requestAnimationFrame(() => canvas.classList.add("is-folded")));
  }, []);

  const closeMenu = useCallback((after?: () => void) => {
    const canvas = canvasRef.current;
    const inner = innerRef.current;
    if (!canvas || !inner) return;
    canvas.classList.remove("is-folded");
    setOpen(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        canvas.classList.remove("is-lifted");
        inner.style.top = "";
        document.body.style.height = "";
        document.documentElement.classList.remove("menu3d-open");
        window.scrollTo({ top: savedY.current, behavior: "instant" });
        toggleRef.current?.focus();
        after?.();
      },
      reduced() ? 0 : FOLD_MS,
    );
  }, []);

  // Menüpunkt: erst zurückklappen, dann navigieren/scrollen
  const navigate = useCallback(
    (href: string) => {
      closeMenu(() => {
        const [path, hash] = href.split("#");
        const samePage = (path || "/") === pathname;
        if (hash && samePage) {
          document.getElementById(hash)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
          history.replaceState(null, "", `#${hash}`);
        } else {
          router.push(href);
        }
      });
    },
    [closeMenu, pathname, router],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    const onResize = () => window.innerWidth >= 1024 && closeMenu();
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, closeMenu]);

  return (
    <>
      <MobileMenu ref={panelRef} open={open} onNavigate={navigate} onClose={() => closeMenu()} />
      <div
        ref={canvasRef}
        className="page-canvas"
        onClickCapture={(e) => {
          if (!canvasRef.current?.classList.contains("is-folded")) return;
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        }}
        aria-hidden={open || undefined}
      >
        <div ref={innerRef} className="relative">
          <Header menuOpen={open} onToggleMenu={() => (open ? closeMenu() : openMenu())} toggleRef={toggleRef} />
          <main id="main">{children}</main>
          {footer}
        </div>
      </div>
    </>
  );
}
