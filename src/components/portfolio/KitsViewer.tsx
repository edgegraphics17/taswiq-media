"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { djKits } from "@/config/kits";
import { cn } from "@/lib/format";

/**
 * DJ-Presse-Kits: oben die Kit-Auswahl, darunter alle Seiten des Kits untereinander –
 * die nächste Seite schaut schon unten heraus, man scrollt einfach durch (wie ein PDF).
 * Schwebende Anzeige "Seite 2 von 8" mit Auf/Ab-Tasten, Pfeiltasten springen seitenweise.
 */
export function KitsViewer({ title }: { title: string }) {
  const t = useTranslations("portfolio");
  const [kitIndex, setKitIndex] = useState(0);
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chooserRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLLIElement | null)[]>([]);
  const kit = djKits[kitIndex];
  const nextKit = djKits[(kitIndex + 1) % djKits.length];
  const label = kit.year ? `${kit.name} · ${kit.year}` : kit.name;

  const goTo = useCallback(
    (i: number) => {
      const target = Math.min(kit.pages - 1, Math.max(0, i));
      pageRefs.current[target]?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [kit.pages],
  );

  const selectKit = useCallback((i: number) => {
    setKitIndex(i);
    setCurrent(0);
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Aktuelle Seite = die letzte, deren Oberkante im oberen Drittel des Sichtfensters liegt
  const syncCurrent = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const line = root.scrollTop + root.clientHeight * 0.35;
    const first = pageRefs.current[0]?.offsetTop ?? 0;
    let best = 0;
    for (let i = 0; i < kit.pages; i++) {
      const el = pageRefs.current[i];
      if (el && el.offsetTop - first <= line) best = i;
    }
    setCurrent(best);
  }, [kit.pages]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    root.addEventListener("scroll", syncCurrent, { passive: true });
    return () => root.removeEventListener("scroll", syncCurrent);
  }, [syncCurrent]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.stopPropagation();
      goTo(current + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [current, goTo]);

  useEffect(() => {
    chooserRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [kitIndex]);

  const step = "grid size-9 place-items-center rounded-full text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="relative flex h-[76dvh] min-h-0 min-w-0 flex-col bg-night lg:h-[92dvh]">
      <div className="shrink-0 px-3 pt-16 pb-3 sm:px-5 lg:pt-4">
        <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">{t("kits.chooseKit", { n: djKits.length })}</p>
        <div ref={chooserRef} role="group" aria-label={t("kits.chooserAria")} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {djKits.map((k, i) => (
            <button
              key={k.id}
              type="button"
              onClick={() => selectKit(i)}
              aria-current={i === kitIndex}
              aria-label={t("kits.openKit", { name: k.name })}
              className={cn("w-24 shrink-0 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-400", i === kitIndex ? "opacity-100" : "opacity-60 hover:opacity-100")}
            >
              <span className={cn("relative block aspect-video overflow-hidden rounded-lg bg-night-soft", i === kitIndex && "ring-2 ring-brand-400")}>
                <Image src={`/portfolio/kits/${k.id}/p1.webp`} alt="" fill sizes="96px" className="object-cover" />
              </span>
              <span className="mt-1 block truncate text-[11px] text-white/80">{k.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        role="region"
        tabIndex={0}
        aria-label={t("kits.scrollAria", { kit: label, title })}
        className="min-h-0 flex-1 overflow-y-auto scroll-smooth px-3 pb-24 [scrollbar-color:rgb(255_255_255/0.25)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-400 sm:px-5 motion-reduce:scroll-auto"
      >
        <ol className="space-y-3">
          {Array.from({ length: kit.pages }, (_, i) => (
            <li
              key={`${kit.id}-${i}`}
              data-page={i}
              ref={(el) => {
                pageRefs.current[i] = el;
              }}
              className="scroll-mt-1"
            >
              <Image
                src={`/portfolio/kits/${kit.id}/p${i + 1}.webp`}
                alt={t("kits.pageAlt", { kit: label, n: i + 1, total: kit.pages })}
                width={kit.w}
                height={kit.h}
                sizes="(min-width:1024px) 760px, 100vw"
                loading={i < 2 ? "eager" : "lazy"}
                unoptimized
                className="h-auto w-full rounded-xl bg-night-soft shadow-[0_8px_30px_rgb(0_0_0/0.35)]"
              />
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => selectKit((kitIndex + 1) % djKits.length)}
          className="group mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-left text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
        >
          <span>
            <span className="block text-[11px] font-semibold tracking-wide text-white/50 uppercase">{t("kits.endLabel")}</span>
            <span className="mt-0.5 block font-medium">{t("kits.nextKit", { name: nextKit.name })}</span>
          </span>
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </button>
      </div>

      {/* Schwebende Orientierung: Seitenzähler, Auf/Ab, Hinweis auf weitere Seiten */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-3">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-night-soft/90 p-1 pr-4 text-white shadow-[var(--shadow-float)] ring-1 ring-white/15 backdrop-blur">
          <button type="button" onClick={() => goTo(current - 1)} disabled={current === 0} aria-label={t("kits.prevPage")} className={step}>
            <ChevronUp className="size-5" aria-hidden />
          </button>
          <button type="button" onClick={() => goTo(current + 1)} disabled={current === kit.pages - 1} aria-label={t("kits.nextPage")} className={cn(step, current === 0 && "bg-brand-500 hover:bg-brand-600")}>
            <ChevronDown className={cn("size-5", current === 0 && "motion-safe:animate-bounce")} aria-hidden />
          </button>
          <p className="num ml-1.5 text-sm" aria-live="polite">
            {current === 0 ? t("kits.scrollHint", { total: kit.pages }) : t("kits.pageCounter", { n: current + 1, total: kit.pages })}
          </p>
        </div>
      </div>
    </div>
  );
}
