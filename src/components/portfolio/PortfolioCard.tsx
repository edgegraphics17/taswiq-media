"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Globe, GripVertical, MapPin, Maximize2, Play } from "lucide-react";
import type { PortfolioItem } from "@/config/content";
import { djKits } from "@/config/kits";
import { CaseVideo } from "@/components/portfolio/CaseVideo";
import { PortfolioMock } from "@/components/portfolio/PortfolioMock";
import { cn } from "@/lib/format";

/** Host einer URL ohne "www." – für die Adresszeile im Browser-Rahmen */
export const hostOf = (url: string) => new URL(url).host.replace(/^www\./, "");

/**
 * Medium eines Projekts:
 *  - Website/Web-App → Browser-Rahmen mit Screenshot
 *  - Film/Reel → Standbild, stummer Vorschau-Loop bei Hover/Sichtbarkeit
 *  - ohne Material → kleine Komposition (PortfolioMock)
 */
export function PortfolioVisual({ item, alt, sizes }: { item: PortfolioItem; alt: string; sizes?: string }) {
  const m = item.media;
  if (m.type === "site") {
    return (
      <div className="absolute inset-0 flex flex-col bg-[linear-gradient(160deg,var(--color-brand-100),var(--color-blush-100))] px-4 pt-12 sm:px-5 sm:pt-13">
        <div className="flex flex-1 flex-col overflow-hidden rounded-t-xl bg-white shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
            {["bg-blush-500/70", "bg-amber-400/80", "bg-mint-500/70"].map((c) => (
              <span key={c} className={cn("size-2 rounded-full", c)} aria-hidden />
            ))}
            <span className="ml-2 flex min-w-0 items-center gap-1 truncate rounded-full bg-canvas px-2.5 py-0.5 text-[10px] text-muted">
              <Globe className="size-2.5 shrink-0" aria-hidden /> {hostOf(m.url)}
            </span>
          </div>
          <div className="relative flex-1">
            <Image src={m.image} alt={alt} fill sizes={sizes ?? "(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"} className="object-cover object-top" />
          </div>
        </div>
      </div>
    );
  }
  if (m.type === "video" || m.type === "pack") {
    return <CaseVideo src={m.preview} poster={m.poster} alt={alt} />;
  }
  if (m.type === "compare" || m.type === "kits") {
    return <Image src={m.poster} alt={alt} fill sizes={sizes ?? "(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"} className="object-cover object-top" />;
  }
  return (
    <div className="absolute inset-0 bg-night">
      <PortfolioMock type={m.mock} />
    </div>
  );
}

/** Portfolio-Karte: ganzer Kartenbereich öffnet die Detailansicht (echter Button, tastaturbedienbar). */
export function PortfolioCard({ item, onOpen }: { item: PortfolioItem; onOpen: () => void }) {
  const t = useTranslations("portfolio");
  const title = t(`items.${item.id}.title`);
  const m = item.media;
  const isVideo = m.type === "video" || (m.type === "pack" && m.clips[0]?.kind === "video");
  const packVideos = m.type === "pack" ? m.clips.filter((c) => c.kind === "video").length : 0;
  const packPhotos = m.type === "pack" ? m.clips.length - packVideos : 0;
  return (
    <article className="card group relative flex h-full flex-col p-2.5 transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-night">
        <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-soft)] group-focus-within:scale-[1.03] group-hover:scale-[1.03]">
          <PortfolioVisual item={item} alt={t("posterAlt", { title })} />
        </div>
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap items-start gap-1.5">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur">{t(`items.${item.id}.tag`)}</span>
          <span className={cn("rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur", item.kind === "live" ? "bg-mint-500 text-white" : item.kind === "demo" ? "bg-amber-400 text-ink" : "bg-brand-500 text-white")}>
            {t(`kind.${item.kind}`)}
          </span>
        </div>
        {m.type === "pack" && (
          <span className="num pointer-events-none absolute bottom-3 left-3 rounded-full bg-night/75 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            {[packVideos > 0 && t("pack.videos", { n: packVideos }), packPhotos > 0 && t("pack.photos", { n: packPhotos })].filter(Boolean).join(" · ")}
          </span>
        )}
        {m.type === "kits" && (
          <span className="num pointer-events-none absolute bottom-3 left-3 rounded-full bg-night/75 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">{t("kits.chooseKit", { n: djKits.length }).split(" – ")[0]}</span>
        )}
        {m.type === "compare" && (
          <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-night/75 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            <GripVertical className="size-3" aria-hidden /> {t("compare.before")} / {t("compare.after")}
          </span>
        )}
        <span className="pointer-events-none absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-[var(--shadow-soft)] backdrop-blur transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
          {isVideo ? <Play className="size-4 translate-x-px fill-current" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3.5 pt-4 pb-3.5">
        {item.location && (
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3 shrink-0" aria-hidden /> {item.location}
          </p>
        )}
        <h3 className="mt-1 text-lg leading-snug font-medium">
          <button
            type="button"
            onClick={onOpen}
            aria-haspopup="dialog"
            className="text-left after:absolute after:inset-0 after:rounded-[2rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-500"
          >
            {title}
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{t(`items.${item.id}.text`)}</p>
      </div>
    </article>
  );
}
