"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CaseVideo } from "@/components/portfolio/CaseVideo";
import { gallerySeries, type GalleryFlyer, type GalleryMotion, type GallerySeries } from "@/config/gallery";
import type { GalleryBrand } from "@/config/gallery-brands";
import { cn } from "@/lib/format";

/**
 * Horizontaler Slider (native CSS-Scroll-Snap): Touch, Trackpad, Tastatur (Region ist fokussierbar,
 * Pfeiltasten scrollen) und Pfeil-Buttons ab Tablet. Kein Slider-Framework nötig.
 */
function Rail({ label, children, itemCount }: { label: string; children: ReactNode; itemCount: number }) {
  const t = useTranslations("portfolio");
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, itemCount]);

  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="flex snap-x snap-proximity gap-3 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {(["start", "end"] as const).map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => scroll(side === "start" ? -1 : 1)}
          disabled={edge[side]}
          aria-label={side === "start" ? t("gallery.prev") : t("gallery.next")}
          className={cn(
            "absolute top-[calc(50%-1rem)] hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-float)] transition-opacity hover:bg-canvas disabled:pointer-events-none disabled:opacity-0 md:grid",
            side === "start" ? "-left-3" : "-right-3",
          )}
        >
          {side === "start" ? <ChevronLeft className="size-5" aria-hidden /> : <ChevronRight className="size-5" aria-hidden />}
        </button>
      ))}
    </div>
  );
}

/** Reihen-Filter als Chips – zeigt nur Reihen, die in der Liste vorkommen. */
function SeriesChips({ series, value, onChange, label }: { series: GallerySeries[]; value: GallerySeries | "all"; onChange: (s: GallerySeries | "all") => void; label: string }) {
  const t = useTranslations("portfolio");
  const names = gallerySeries.filter((s) => series.includes(s.id));
  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
      active ? "bg-ink text-white" : "bg-white text-muted shadow-[var(--shadow-soft)] hover:text-ink",
    );
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button type="button" aria-pressed={value === "all"} onClick={() => onChange("all")} className={chip(value === "all")}>
        {t("gallery.all")}
      </button>
      {names.map((s) => (
        <button key={s.id} type="button" aria-pressed={value === s.id} onClick={() => onChange(s.id)} className={chip(value === s.id)}>
          {s.name}
        </button>
      ))}
    </div>
  );
}

/** Vollansicht eines Flyers: Pfeiltasten wechseln, Esc/Klick daneben schließt, Fokus kehrt zurück. */
function FlyerLightbox({ items, index, onClose, onIndex }: { items: GalleryFlyer[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const t = useTranslations("portfolio");
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onIndex]);

  if (!item) return null;
  const nav = "absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-float)] backdrop-blur hover:bg-white";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={item.title} className="fixed inset-0 z-[100] grid place-items-center bg-night/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <Image
          key={item.id}
          src={item.src}
          alt={t("gallery.flyerAlt", { title: item.title })}
          width={item.width}
          height={item.height}
          sizes="(min-width:768px) 520px, 92vw"
          placeholder="blur"
          blurDataURL={item.blur}
          className="max-h-[82vh] w-auto rounded-2xl object-contain shadow-[var(--shadow-float)]"
          priority
        />
        <p className="mt-3 text-center text-sm text-white/85">
          {item.title} <span className="num text-white/50">· {index + 1}/{items.length}</span>
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t("gallery.close")} className="absolute -top-3 -right-3 grid size-10 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-float)]">
          <X className="size-4" aria-hidden />
        </button>
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label={t("gallery.prev")} className={cn(nav, "-left-6 max-md:left-1")}>
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" onClick={() => onIndex((index + 1) % items.length)} aria-label={t("gallery.next")} className={cn(nav, "-right-6 max-md:right-1")}>
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Flyer-Slider mit Reihen-Filter und Lightbox. `dense` = kleinere Karten für kompakte Streifen. */
export function FlyerRail({ items, dense = false, filter = true }: { items: GalleryFlyer[]; dense?: boolean; filter?: boolean }) {
  const t = useTranslations("portfolio");
  const [series, setSeries] = useState<GallerySeries | "all">("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = series === "all" ? items : items.filter((i) => i.series === series);
  const present = [...new Set(items.map((i) => i.series))];

  return (
    <div>
      {filter && present.length > 1 && <SeriesChips series={present} value={series} onChange={setSeries} label={t("gallery.filterAria")} />}
      <Rail label={t("gallery.flyerAria")} itemCount={shown.length}>
        {shown.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-haspopup="dialog"
            aria-label={t("gallery.open", { title: f.title })}
            className={cn(
              "group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-night shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
              dense ? "aspect-[9/16] h-60 sm:h-64" : "aspect-[9/16] h-72 sm:h-80",
            )}
          >
            <Image
              src={f.src}
              alt={t("gallery.flyerAlt", { title: f.title })}
              fill
              sizes={dense ? "150px" : "180px"}
              placeholder="blur"
              blurDataURL={f.blur}
              className="object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.04]"
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent px-3 pt-8 pb-2.5 text-left text-[11px] leading-tight font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-md:opacity-100">
              {f.title}
            </span>
          </button>
        ))}
      </Rail>
      {open !== null && <FlyerLightbox items={shown} index={Math.min(open, shown.length - 1)} onClose={() => setOpen(null)} onIndex={setOpen} />}
    </div>
  );
}

/** Flyer-Animationen: stumme Loops, spielen bei Hover/Sichtbarkeit (CaseVideo), sonst nur Standbild. */
export function MotionRail({ items, dense = false }: { items: GalleryMotion[]; dense?: boolean }) {
  const t = useTranslations("portfolio");
  return (
    <Rail label={t("gallery.motionAria")} itemCount={items.length}>
      {items.map((m) => (
        <article
          key={m.id}
          className={cn(
            "group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-night shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)]",
            dense ? "aspect-[9/16] h-60 sm:h-64" : "aspect-[9/16] h-72 sm:h-80",
          )}
        >
          <CaseVideo src={m.video} poster={m.poster} alt={t("gallery.motionAlt", { title: m.title })} />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent px-3 pt-8 pb-2.5 text-[11px] leading-tight font-medium text-white">{m.title}</span>
        </article>
      ))}
    </Rail>
  );
}

/** Logo-Wand: Marken, die wir gestaltet haben – helle und dunkle Kacheln, damit jedes Logo lesbar bleibt. */
export function BrandRail({ items }: { items: GalleryBrand[] }) {
  const t = useTranslations("portfolio");
  return (
    <Rail label={t("gallery.brandAria")} itemCount={items.length}>
      {items.map((b) => (
        <figure
          key={b.id}
          className={cn(
            "relative grid h-36 w-52 shrink-0 snap-start place-items-center overflow-hidden rounded-2xl p-6 shadow-[var(--shadow-soft)] sm:h-40 sm:w-60",
            b.tone === "light" ? "bg-white ring-1 ring-line" : "bg-night",
          )}
        >
          <Image
            src={b.src}
            alt={t("gallery.brandAlt", { name: b.name })}
            width={b.width}
            height={b.height}
            sizes="240px"
            className="max-h-full w-auto max-w-full object-contain"
          />
          <figcaption className="sr-only">{b.name}</figcaption>
        </figure>
      ))}
    </Rail>
  );
}
