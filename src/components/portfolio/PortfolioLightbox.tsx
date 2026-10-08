"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Calculator, Check, MapPin, MousePointerClick, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { PortfolioItem } from "@/config/content";
import { contactHref } from "@/config/site";
import { demoHost, hostOf, PortfolioVisual } from "@/components/portfolio/PortfolioCard";
import { DemoLink } from "@/components/ui/DemoLink";
import { CompareViewer, PackViewer } from "@/components/portfolio/PortfolioPack";
import { KitsViewer } from "@/components/portfolio/KitsViewer";
import { cn } from "@/lib/format";

/**
 * Detailansicht eines Projekts als modaler Dialog.
 *  - Website → großer Screenshot + "Live ansehen"
 *  - Film/Reel → Player mit Ton (Reels hochkant), YouTube-Link bei Hotel-Filmen
 *  - Pfeiltasten blättern, Escape schließt, Fokus bleibt im Dialog und kehrt danach zurück
 */
export function PortfolioLightbox({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: PortfolioItem | null;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("portfolio");
  const reduced = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!item) return;
    lastFocus.current ??= document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => closeRef.current?.focus(), 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "Tab" && dialogRef.current) {
        // Fokusfalle: Tab bleibt im Dialog
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose, onNext, onPrev]);

  // Fokus zurück auf die Karte, wenn der Dialog schließt
  useEffect(() => {
    if (item) return;
    lastFocus.current?.focus?.();
    lastFocus.current = null;
  }, [item]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {item && (
        <motion.div
          key="pf-overlay"
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pf-dialog-title"
            key={item.id}
            initial={{ opacity: 0, y: reduced ? 0 : 32, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : 16, transition: { duration: 0.18 } }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative grid max-h-[92dvh] w-full max-w-6xl overflow-y-auto rounded-t-[2rem] bg-white shadow-[var(--shadow-float)] sm:rounded-[2rem] lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,1fr)] lg:overflow-hidden"
          >
            <Media item={item} />
            <Details item={item} onClose={onClose} />

            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              <span className="num hidden rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur sm:inline">
                {index + 1} / {total}
              </span>
              <button type="button" onClick={onPrev} aria-label={t("prev")} className="grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-soft)] backdrop-blur transition hover:bg-white">
                <ArrowLeft className="size-4" aria-hidden />
              </button>
              <button type="button" onClick={onNext} aria-label={t("next")} className="grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-soft)] backdrop-blur transition hover:bg-white">
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <button ref={closeRef} type="button" onClick={onClose} aria-label={t("close")} className="grid size-11 place-items-center rounded-full bg-night text-white shadow-[var(--shadow-soft)] transition hover:bg-night-soft">
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Media({ item }: { item: PortfolioItem }) {
  const t = useTranslations("portfolio");
  const title = t(`items.${item.id}.title`);
  const m = item.media;

  if (m.type === "pack") return <PackViewer key={item.id} clips={m.clips} title={title} />;
  if (m.type === "kits") return <KitsViewer key={item.id} title={title} />;
  if (m.type === "compare") return <CompareViewer key={item.id} pairs={m.pairs} title={title} />;
  if (m.type === "video" && m.full) {
    const vertical = m.orientation === "v";
    return (
      <div className={cn("relative grid place-items-center bg-night", vertical ? "p-4 sm:p-6" : "")}>
        <video
          key={m.full}
          src={m.full}
          poster={m.poster}
          controls
          autoPlay
          playsInline
          preload="metadata"
          aria-label={title}
          className={cn(vertical ? "max-h-[70dvh] w-auto rounded-2xl lg:max-h-[80dvh]" : "aspect-video w-full lg:h-full lg:object-contain")}
        />
      </div>
    );
  }
  // Hotel-Filme liegen nur auf YouTube → direkt im Dialog abspielen (datensparsame nocookie-Domain)
  const yt = m.type === "video" && m.youtube ? youtubeId(m.youtube) : null;
  if (yt) {
    return (
      <div className="relative grid place-items-center bg-night pt-16 lg:pt-0">
        <iframe
          key={yt}
          src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          className="aspect-video w-full border-0"
        />
      </div>
    );
  }
  if (m.type === "site" || m.type === "demo") {
    return (
      <div className="relative bg-[linear-gradient(160deg,var(--color-brand-100),var(--color-blush-100))] p-4 pt-16 sm:p-8 sm:pt-16">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
            {["bg-blush-500/70", "bg-amber-400/80", "bg-mint-500/70"].map((c) => (
              <span key={c} className={cn("size-2.5 rounded-full", c)} aria-hidden />
            ))}
            <span className="ml-2 truncate rounded-full bg-canvas px-3 py-0.5 text-xs text-muted">{m.type === "demo" ? demoHost(m.slug) : hostOf(m.url)}</span>
          </div>
          <div className="relative aspect-[16/10]">
            <Image src={m.image} alt={t("posterAlt", { title })} fill sizes="(min-width:1024px) 640px, 100vw" className="object-cover object-top" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative min-h-72 overflow-hidden bg-night lg:min-h-full">
      <PortfolioVisual item={item} alt={t("posterAlt", { title })} sizes="(min-width:1024px) 640px, 100vw" />
    </div>
  );
}

/** "https://www.youtube.com/watch?v=ID" oder "https://youtu.be/ID" → "ID" */
function youtubeId(url: string): string | null {
  const u = new URL(url);
  return u.hostname === "youtu.be" ? u.pathname.slice(1) || null : u.searchParams.get("v");
}

function Details({ item, onClose }: { item: PortfolioItem; onClose: () => void }) {
  const t = useTranslations("portfolio");
  const services = t.raw(`items.${item.id}.services`) as string[];
  const m = item.media;
  const software = item.cats.includes("software") || item.cats.includes("web");
  return (
    <div className="flex flex-col p-6 sm:p-8 lg:max-h-[92dvh] lg:overflow-y-auto lg:pt-20">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-ink">{t(`items.${item.id}.tag`)}</span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">{t(`kind.${item.kind}`)}</span>
      </div>
      <h2 id="pf-dialog-title" className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight font-medium text-balance">
        {t(`items.${item.id}.title`)}
      </h2>
      {item.location && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4 shrink-0" aria-hidden /> {item.location}
        </p>
      )}
      <p className="mt-4 leading-relaxed text-body">{t(`items.${item.id}.text`)}</p>

      <div className="mt-5 rounded-3xl bg-canvas p-5">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{t(m.type === "demo" ? "fitsLabel" : "resultLabel")}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{t(`items.${item.id}.result`)}</p>
      </div>

      <p className="mt-5 text-sm font-medium text-ink">{t("servicesLabel")}</p>
      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {services.map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[13px] text-body">
            <Check className="size-3.5 text-mint-500" strokeWidth={3} aria-hidden /> {s}
          </li>
        ))}
      </ul>

      {m.type === "demo" && <p className="mt-4 text-[13px] leading-relaxed text-muted">{t("demoNote")}</p>}

      <div className="mt-auto flex flex-wrap gap-2 pt-8">
        {m.type === "demo" && (
          <DemoLink slug={m.slug} variant="primary" className="hover:translate-y-0">
            <MousePointerClick className="size-4" aria-hidden /> {t("tryDemo")}
          </DemoLink>
        )}
        {m.type === "site" && (
          <a href={m.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-6 font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600">
            {t("visitLive")} <ArrowUpRight className="size-4" aria-hidden />
            <span className="sr-only">{t("opensNewTab")}</span>
          </a>
        )}
        {item.internal && (
          <Link href={item.internal} onClick={onClose} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-6 font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600">
            {t("tryLive")} <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        {m.type === "video" && m.youtube && (
          <a href={m.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-6 font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600">
            {t("watchFilm")} <ArrowUpRight className="size-4" aria-hidden />
            <span className="sr-only">{t("opensYoutube")}</span>
          </a>
        )}
        <Link href={contactHref} onClick={onClose} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-6 font-medium text-ink transition hover:border-brand-200">
          {t("requestSimilar")}
        </Link>
        {software && (
          <Link href="/preisrechner" onClick={onClose} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-canvas px-5 font-medium text-ink transition hover:bg-brand-50 hover:text-brand-600">
            <Calculator className="size-4" aria-hidden /> {t("calculate")}
          </Link>
        )}
      </div>
    </div>
  );
}
