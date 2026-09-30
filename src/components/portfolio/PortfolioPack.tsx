"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { PackClip, ComparePair } from "@/config/content";
import { cn } from "@/lib/format";

/**
 * Projekt-Paket: mehrere Videos und Fotos eines Kunden in einem Dialog.
 * Große Bühne oben, Vorschau-Leiste darunter. Pfeiltasten wechseln den Clip
 * (statt das Projekt) – solange das Paket offen ist.
 */
export function PackViewer({ clips, title }: { clips: PackClip[]; title: string }) {
  const t = useTranslations("portfolio");
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const clip = clips[index];

  const go = useCallback((d: number) => setIndex((i) => (i + d + clips.length) % clips.length), [clips.length]);

  useEffect(() => {
    if (clips.length < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.stopPropagation();
      go(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [clips.length, go]);

  // Aktive Vorschau ins Bild scrollen
  useEffect(() => {
    const el = thumbsRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  const nav = "absolute top-1/2 z-[1] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-soft)] backdrop-blur transition hover:bg-white";
  const videos = clips.filter((c) => c.kind === "video").length;

  return (
    <div className="flex min-h-0 flex-col bg-night">
      <div className="relative grid min-h-[46dvh] flex-1 place-items-center p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
        {clip.kind === "video" ? (
          <video
            key={clip.src}
            src={clip.src}
            poster={clip.poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            aria-label={t("pack.clipLabel", { title, n: index + 1, total: clips.length })}
            className={cn(clip.orientation === "v" ? "max-h-[54dvh] w-auto rounded-2xl lg:max-h-[62dvh]" : "aspect-video w-full rounded-2xl")}
          />
        ) : (
          <Image
            key={clip.src}
            src={clip.src}
            alt={t("pack.clipLabel", { title, n: index + 1, total: clips.length })}
            width={clip.width}
            height={clip.height}
            sizes="(min-width:1024px) 600px, 100vw"
            className="max-h-[54dvh] w-auto rounded-2xl object-contain lg:max-h-[62dvh]"
          />
        )}
        {clips.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={t("pack.prev")} className={cn(nav, "left-2 sm:left-4")}>
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t("pack.next")} className={cn(nav, "right-2 sm:right-4")}>
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>

      {clips.length > 1 && (
        <div className="px-3 pb-3 sm:px-5 sm:pb-5">
          <p className="num mb-2 text-xs text-white/60" aria-live="polite">
            {t("pack.counter", { n: index + 1, total: clips.length })} · {t("pack.videos", { n: videos })}
            {clips.length - videos > 0 && ` · ${t("pack.photos", { n: clips.length - videos })}`}
          </p>
          <div ref={thumbsRef} role="group" aria-label={t("pack.thumbsAria")} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {clips.map((c, i) => {
              const active = i === index;
              return (
                <button
                  key={c.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={active}
                  aria-label={c.kind === "video" ? t("pack.showVideo", { n: i + 1 }) : t("pack.showPhoto", { n: i + 1 })}
                  className={cn(
                    "relative aspect-[9/16] h-20 shrink-0 overflow-hidden rounded-xl bg-night-soft outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-brand-400",
                    active ? "ring-2 ring-brand-400" : "opacity-60 hover:opacity-100",
                  )}
                >
                  <Image src={c.kind === "video" ? c.poster : c.src} alt="" fill sizes="64px" className="object-cover" />
                  {c.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-night/25">
                      <Play className="size-4 fill-white text-white" aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
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
