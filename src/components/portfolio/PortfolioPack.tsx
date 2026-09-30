"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import type { PackClip, ComparePair } from "@/config/content";
import { cn } from "@/lib/format";

/**
 * Projekt-Paket: alle Videos und Fotos eines Kunden untereinander in voller Spaltenbreite –
 * man scrollt einfach durch (wie bei den Presse-Kits), ohne Vorschau-Leiste und dunkle Ränder.
 * Ab Desktop scrollt nur die Medien-Spalte, der Text rechts bleibt stehen; am Handy scrollt der
 * ganze Dialog. Pfeil hoch/runter bzw. die schwebende Anzeige springen zum vorherigen/nächsten Beitrag.
 */
export function PackViewer({ clips, title }: { clips: PackClip[]; title: string }) {
  const t = useTranslations("portfolio");
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const videos = clips.filter((c) => c.kind === "video").length;

  const goTo = useCallback(
    (i: number) => itemRefs.current[Math.min(clips.length - 1, Math.max(0, i))]?.scrollIntoView({ behavior: "smooth", block: "start" }),
    [clips.length],
  );

  // Aktueller Beitrag = der letzte, dessen Oberkante im oberen Drittel des Sichtfensters liegt
  const syncCurrent = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const line = root.getBoundingClientRect().top + root.clientHeight * 0.35;
    let best = 0;
    itemRefs.current.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= line) best = i;
    });
    setCurrent(best);
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    root.addEventListener("scroll", syncCurrent, { passive: true });
    return () => root.removeEventListener("scroll", syncCurrent);
  }, [syncCurrent]);

  useEffect(() => {
    if (clips.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      e.stopPropagation();
      goTo(current + (e.key === "ArrowDown" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [clips.length, current, goTo]);

  const step = "grid size-9 place-items-center rounded-full text-white transition hover:bg-white/15 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="relative min-h-0 min-w-0 bg-night lg:h-[92dvh]">
      <div
        ref={scrollRef}
        role="region"
        tabIndex={0}
        aria-label={t("pack.scrollAria", { title, total: clips.length })}
        className="px-3 pt-16 pb-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-400 sm:px-4 lg:h-full lg:overflow-y-auto lg:scroll-smooth lg:pt-4 lg:pb-24 lg:[scrollbar-color:rgb(255_255_255/0.25)_transparent] lg:[scrollbar-width:thin] motion-reduce:scroll-auto"
      >
        <ol className="space-y-3">
          {clips.map((c, i) => {
            const label = t("pack.clipLabel", { title, n: i + 1, total: clips.length });
            return (
              <li
                key={c.src}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="scroll-mt-3"
              >
                {c.kind === "video" ? (
                  <video
                    src={c.src}
                    poster={c.poster}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={label}
                    className={cn(
                      "rounded-xl bg-night-soft",
                      c.orientation === "v" ? "mx-auto max-h-[80dvh] w-auto max-w-full" : "aspect-video w-full",
                    )}
                  />
                ) : (
                  <Image
                    src={c.src}
                    alt={label}
                    width={c.width}
                    height={c.height}
                    sizes="(min-width:1024px) 640px, 100vw"
                    loading={i < 2 ? "eager" : "lazy"}
                    className="h-auto w-full rounded-xl bg-night-soft"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Schwebende Orientierung (Desktop): Zähler, Auf/Ab */}
      {clips.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center px-3 lg:flex">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-night-soft/90 p-1 pr-4 text-white shadow-[var(--shadow-float)] ring-1 ring-white/15 backdrop-blur">
            <button type="button" onClick={() => goTo(current - 1)} disabled={current === 0} aria-label={t("pack.prev")} className={step}>
              <ChevronUp className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              disabled={current === clips.length - 1}
              aria-label={t("pack.next")}
              className={cn(step, current === 0 && "bg-brand-500 hover:bg-brand-600")}
            >
              <ChevronDown className={cn("size-5", current === 0 && "motion-safe:animate-bounce")} aria-hidden />
            </button>
            <p className="num ml-1.5 text-sm" aria-live="polite">
              {current === 0
                ? [videos > 0 && t("pack.videos", { n: videos }), clips.length > videos && t("pack.photos", { n: clips.length - videos })].filter(Boolean).join(" · ")
                : t("pack.counter", { n: current + 1, total: clips.length })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Vorher/Nachher-Regler: Ziehen per Maus/Touch, Tastatur über das Range-Feld.
 * Mehrere Beispiele über die Leiste darunter.
 */
export function CompareViewer({ pairs, title }: { pairs: ComparePair[]; title: string }) {
  const t = useTranslations("portfolio");
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const pair = pairs[index];

  const setFromPointer = (clientX: number) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  useEffect(() => {
    if (pairs.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      // Range-Feld nutzt die Pfeiltasten selbst
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.stopPropagation();
      setIndex((i) => (i + (e.key === "ArrowRight" ? 1 : -1) + pairs.length) % pairs.length);
      setPos(50);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [pairs.length]);

  const chip = "pointer-events-none absolute top-3 z-[2] rounded-full bg-night/70 px-3 py-1 text-xs font-medium text-white backdrop-blur";

  return (
    <div className="flex min-h-0 flex-col bg-night">
      <div className="grid flex-1 place-items-center p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
        <div
          ref={boxRef}
          className="relative aspect-[4/5] max-h-[58dvh] w-auto max-w-full touch-pan-y overflow-hidden rounded-2xl bg-night-soft select-none lg:max-h-[64dvh]"
          style={{ height: "min(58dvh, 640px)" }}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromPointer(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && setFromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <Image key={pair.after} src={pair.after} alt={t("compare.afterAlt", { title, n: index + 1 })} fill sizes="(min-width:1024px) 520px, 100vw" className="pointer-events-none object-cover" draggable={false} />
          <div className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Image key={pair.before} src={pair.before} alt={t("compare.beforeAlt", { title, n: index + 1 })} fill sizes="(min-width:1024px) 520px, 100vw" className="object-cover" draggable={false} />
          </div>
          <span className={cn(chip, "left-3")}>{t("compare.before")}</span>
          <span className={cn(chip, "right-3")}>{t("compare.after")}</span>
          <div className="pointer-events-none absolute inset-y-0 z-[1] w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" style={{ left: `${pos}%` }}>
            <span className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-float)]">
              <ChevronLeft className="-mr-1 size-4" aria-hidden />
              <ChevronRight className="-ml-1 size-4" aria-hidden />
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(pos)}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label={t("compare.slider")}
            className="absolute inset-0 z-[3] size-full cursor-ew-resize opacity-0"
          />
        </div>
      </div>

      {pairs.length > 1 && (
        <div className="px-3 pb-3 sm:px-5 sm:pb-5">
          <p className="num mb-2 text-xs text-white/60" aria-live="polite">
            {t("compare.counter", { n: index + 1, total: pairs.length })}
          </p>
          <div role="group" aria-label={t("compare.thumbsAria")} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pairs.map((p, i) => (
              <button
                key={p.after}
                type="button"
                onClick={() => {
                  setIndex(i);
                  setPos(50);
                }}
                aria-current={i === index}
                aria-label={t("compare.showPair", { n: i + 1 })}
                className={cn(
                  "relative aspect-[4/5] h-20 shrink-0 overflow-hidden rounded-xl bg-night-soft outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-brand-400",
                  i === index ? "ring-2 ring-brand-400" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={p.after} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
