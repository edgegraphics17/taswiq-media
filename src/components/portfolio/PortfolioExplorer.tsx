"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { portfolioFilters, portfolioItems, type PortfolioFilter, type PortfolioId, type PortfolioItem } from "@/config/content";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PortfolioLightbox } from "@/components/portfolio/PortfolioLightbox";
import { track } from "@/lib/track";
import { cn } from "@/lib/format";

/**
 * Interaktives Portfolio: Filter-Pillen mit Zähler, animiertes Raster, Detail-Dialog
 * mit Blättern. Deep-Link per ?projekt=<id> – teilbar, z. B. im Angebot oder per WhatsApp.
 *
 *  mode "full"    → alle Projekte + Filter (Seite /portfolio)
 *  mode "teaser"  → ausgewählte Projekte ohne Filter (Startseite, Landingpages)
 */
export function PortfolioExplorer({ mode = "full", ids }: { mode?: "full" | "teaser"; ids?: PortfolioId[] }) {
  const t = useTranslations("portfolio");
  const [filter, setFilter] = useState<PortfolioFilter>("alle");
  const [openId, setOpenId] = useState<PortfolioId | null>(null);

  const base = useMemo<PortfolioItem[]>(
    () => (ids ? ids.map((id) => portfolioItems.find((p) => p.id === id)!).filter(Boolean) : mode === "teaser" ? portfolioItems.filter((p) => p.featured) : portfolioItems),
    [ids, mode],
  );
  const items = useMemo(() => base.filter((p) => filter === "alle" || p.cats.includes(filter)), [base, filter]);
  const counts = useMemo(() => Object.fromEntries(portfolioFilters.map((f) => [f, base.filter((p) => f === "alle" || p.cats.includes(f)).length])), [base]);

  const index = openId ? items.findIndex((p) => p.id === openId) : -1;
  const current = index >= 0 ? items[index] : null;

  // Deep-Link lesen (nur auf der Portfolio-Seite)
  useEffect(() => {
    if (mode !== "full") return;
    const id = new URLSearchParams(window.location.search).get("projekt") as PortfolioId | null;
    if (id && portfolioItems.some((p) => p.id === id)) setOpenId(id);
  }, [mode]);

  const syncUrl = useCallback(
    (id: PortfolioId | null) => {
      if (mode !== "full") return;
      const url = new URL(window.location.href);
      if (id) url.searchParams.set("projekt", id);
      else url.searchParams.delete("projekt");
      window.history.replaceState(null, "", url);
    },
    [mode],
  );

  const open = (id: PortfolioId) => {
    setOpenId(id);
    syncUrl(id);
    track("portfolio_open", { projekt: id });
  };
  const close = useCallback(() => {
    setOpenId(null);
    syncUrl(null);
  }, [syncUrl]);
  const step = useCallback(
    (d: number) => {
      if (index < 0) return;
      const next = items[(index + d + items.length) % items.length];
      setOpenId(next.id);
      syncUrl(next.id);
    },
    [index, items, syncUrl],
  );
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);

  return (
    <>
      {mode === "full" && (
        <LayoutGroup>
          <div role="group" aria-label={t("filterAria")} className="mx-auto flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-[1.75rem] border border-line bg-white p-1.5 shadow-[var(--shadow-soft)] sm:rounded-full">
            {portfolioFilters.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn("relative inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors", filter === f ? "text-white" : "text-body hover:text-ink")}
              >
                {filter === f && <motion.span layoutId="pf-filter" className="absolute inset-0 rounded-full bg-brand-500 shadow-[var(--shadow-brand)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">{t(`filters.${f}`)}</span>
                <span className={cn("num relative rounded-full px-1.5 text-[11px]", filter === f ? "bg-white/20" : "bg-canvas text-muted")}>{counts[f]}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      )}

      <p className="sr-only" aria-live="polite">
        {t("countLive", { n: items.length })}
      </p>

      <motion.ul layout className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", mode === "full" && "mt-10")}>
        <AnimatePresence mode="popLayout">
          {items.map((p) => (
            <motion.li
              layout
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <PortfolioCard item={p} onOpen={() => open(p.id)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <PortfolioLightbox item={current} index={Math.max(index, 0)} total={items.length} onClose={close} onPrev={prev} onNext={next} />
    </>
  );
}
