"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { djKits } from "@/config/kits";
import { cn } from "@/lib/format";

/**
 * DJ-Presse-Kits: links/oben die Kit-Auswahl, darunter die Seiten des gewählten Kits in voller Größe.
 * Pfeiltasten blättern die Seiten (solange der Dialog offen ist), Klick auf ein Kit wechselt das Kit.
 */
export function KitsViewer({ title }: { title: string }) {
  const t = useTranslations("portfolio");
  const [kitIndex, setKitIndex] = useState(0);
  const [page, setPage] = useState(0);
  const chooserRef = useRef<HTMLDivElement>(null);
  const kit = djKits[kitIndex];

  const turn = useCallback((d: number) => setPage((p) => Math.min(kit.pages - 1, Math.max(0, p + d))), [kit.pages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.stopPropagation();
      turn(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [turn]);

  useEffect(() => {
    chooserRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [kitIndex]);

  const label = kit.year ? `${kit.name} · ${kit.year}` : kit.name;
  const nav = "absolute top-1/2 z-[1] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-soft)] backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className="flex min-h-0 min-w-0 flex-col bg-night">
      <div className="relative min-w-0 p-3 pt-16 sm:p-5 sm:pt-16 lg:pt-5">
        <div className="relative h-[44dvh] w-full lg:h-[56dvh]">
          <Image
            key={`${kit.id}-${page}`}
            src={`/portfolio/kits/${kit.id}/p${page + 1}.webp`}
            alt={t("kits.pageAlt", { kit: label, n: page + 1, total: kit.pages })}
            fill
            sizes="(min-width:1024px) 760px, 100vw"
            priority
            unoptimized
            className="rounded-xl object-contain"
          />
        </div>
        <button type="button" onClick={() => turn(-1)} disabled={page === 0} aria-label={t("kits.prevPage")} className={cn(nav, "left-4 sm:left-7")}>
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button type="button" onClick={() => turn(1)} disabled={page === kit.pages - 1} aria-label={t("kits.nextPage")} className={cn(nav, "right-4 sm:right-7")}>
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div className="px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs text-white/70">
          <p className="num" aria-live="polite">
            {label} · {t("kits.pageCounter", { n: page + 1, total: kit.pages })}
          </p>
          <div className="flex items-center gap-1" role="group" aria-label={t("kits.pagesAria")}>
            {Array.from({ length: kit.pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-label={t("kits.goToPage", { n: i + 1 })}
                aria-current={i === page}
                className="grid size-6 place-items-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-400"
              >
                <span className={cn("block rounded-full transition-all", i === page ? "h-2 w-5 bg-brand-400" : "size-2 bg-white/30 hover:bg-white/60")} />
              </button>
            ))}
          </div>
        </div>

        <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">{t("kits.chooseKit", { n: djKits.length, title })}</p>
        <div ref={chooserRef} role="group" aria-label={t("kits.chooserAria")} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {djKits.map((k, i) => (
            <button
              key={k.id}
              type="button"
              onClick={() => {
                setKitIndex(i);
                setPage(0);
              }}
              aria-current={i === kitIndex}
              aria-label={t("kits.openKit", { name: k.name })}
              className={cn("group w-28 shrink-0 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-brand-400", i === kitIndex ? "opacity-100" : "opacity-65 hover:opacity-100")}
            >
              <span className={cn("relative block aspect-video overflow-hidden rounded-lg bg-night-soft", i === kitIndex && "ring-2 ring-brand-400")}>
                <Image src={`/portfolio/kits/${k.id}/p1.webp`} alt="" fill sizes="112px" className="object-cover" />
              </span>
              <span className="mt-1 block truncate text-[11px] text-white/80">{k.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
