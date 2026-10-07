"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, BellRing } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { AppHref } from "@/config/site";
import { cn } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { Eyebrow } from "@/components/ui/SectionHeading";

export interface HeroScene {
  id: string;
  icon: string;
  /** Kurzlabel im Branchen-Wähler */
  pill: string;
  /** Wechselndes Wort der Headline ("Bestellsystem.") */
  word: string;
  /** Voller Branchenname + Link zur Branchenseite */
  title: string;
  href: AppHref;
  linkLabel: string;
  image: StaticImageData;
  alt: string;
  /** object-position des Fotos (Motiv bleibt im Hochformat-Ausschnitt sichtbar) */
  position: string;
  app: string;
  rows: { lead: string; title: string; meta: string; status: string }[];
  toastLabel: string;
  toastValue: string;
  win: string;
}

const INTERVAL = 5200;
const ease = [0.22, 1, 0.36, 1] as const;
const statusStyles = ["bg-brand-500 text-white", "border border-line bg-white text-ink", "bg-mint-500/12 text-[#12733b]"];

/**
 * Interaktiver Hero: Die Seite fragt nach dem Betrieb – Headline, Foto und Beispiel-System
 * antworten gemeinsam. Läuft von selbst durch, bis jemand eine Branche wählt
 * (pausiert bei Hover/Fokus, steht still bei "Bewegung reduzieren").
 * Die System-Ansicht ist gebaut statt fotografiert: gestochen scharf, übersetzbar, ohne Kundendaten.
 */
export function HeroShowcase({
  scenes,
  eyebrow,
  titleStart,
  sub,
  question,
  questionHint,
  pickerLabel,
  live,
  actions,
  proof,
}: {
  scenes: HeroScene[];
  eyebrow: string;
  titleStart: string;
  sub: string;
  question: string;
  questionHint: string;
  pickerLabel: string;
  live: string;
  actions: React.ReactNode;
  proof: React.ReactNode;
}) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState<number[]>([0]);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const running = auto && !paused && !reduced && visible;
  const scene = scenes[i];

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setI((n) => (n + 1) % scenes.length), INTERVAL);
    return () => clearTimeout(id);
  }, [i, running, scenes.length]);

  // Im Hintergrund-Tab nicht weiterlaufen (Animationen stehen dort still)
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Fotos erst laden, wenn sie dran sind (aktuelle + nächste Szene)
  useEffect(() => {
    const next = (i + 1) % scenes.length;
    setSeen((s) => (s.includes(i) && s.includes(next) ? s : [...new Set([...s, i, next])]));
  }, [i, scenes.length]);

  const pause = { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false), onFocus: () => setPaused(true), onBlur: () => setPaused(false) };

  return (
    <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-y-9">
      {/* Versprechen */}
      <div className="lg:col-start-1 lg:row-start-1">
        <div className="animate-rise">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1 className="mt-5 animate-rise text-[clamp(2.3rem,5.4vw,4.1rem)] leading-[1.04] font-medium [animation-delay:0.08s]">
          <span aria-hidden>
            <span className="block">{titleStart}</span>
            <span className="relative -mb-[0.14em] block overflow-hidden pb-[0.14em] text-brand-500">
              <span className="invisible">&nbsp;</span>
              <AnimatePresence initial={false}>
                <motion.span
                  key={scene.id}
                  className="absolute top-0 left-0 whitespace-nowrap"
                  initial={{ y: "120%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-120%", opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.6, ease }}
                >
                  {scene.word}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <span className="sr-only">
            {titleStart} {scenes.map((s) => s.word.replace(/\.$/, "")).join(", ")}.
          </span>
        </h1>
        <p className="mt-6 max-w-xl animate-rise text-[16px] leading-relaxed text-muted [animation-delay:0.16s]">{sub}</p>
        <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:0.24s]">{actions}</div>
      </div>

      {/* Branchen-Wähler */}
      <div className="animate-rise [animation-delay:0.3s] lg:col-start-1 lg:row-start-2" {...pause}>
        <p className="text-[15px] font-medium text-ink">{question}</p>
        <p className="mt-0.5 text-[13px] text-muted">{questionHint}</p>
        <div role="group" aria-label={pickerLabel} className="mt-3.5 flex flex-wrap gap-2">
          {scenes.map((s, n) => {
            const active = n === i;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setI(n);
                  setAuto(false);
                }}
                className={cn(
                  "relative inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-full border px-4 text-sm font-medium transition-colors duration-300 active:scale-[0.97]",
                  active ? "border-night bg-night text-white" : "border-line bg-white text-ink hover:border-brand-300 hover:text-brand-600",
                )}
              >
                <Icon name={s.icon} className={cn("size-4", active ? "text-mint-400" : "text-muted")} />
                {s.pill}
                {active && running && (
                  <span key={`${s.id}-bar`} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-brand-400" style={{ animation: `hero-progress ${INTERVAL}ms linear both` }} aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bühne: Betrieb (Foto) + sein System (gebaute Ansicht) */}
      <div className="relative mx-auto w-full max-w-[560px] animate-rise [animation-delay:0.2s] lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:max-w-none" {...pause}>
        <div className="relative mr-[5%] aspect-[5/4] overflow-hidden rounded-[2rem] bg-night shadow-[var(--shadow-float)] sm:aspect-[3/2] lg:aspect-[8/7]">
          {scenes.map((s, n) =>
            seen.includes(n) ? (
              <Image
                key={s.id}
                src={s.image}
                alt={n === i ? s.alt : ""}
                fill
                priority={n === 0}
                placeholder="blur"
                sizes="(min-width:1024px) 540px, (min-width:640px) 530px, 92vw"
                className={cn("object-cover transition-opacity duration-700 ease-[var(--ease-soft)]", n === i ? "opacity-100" : "opacity-0")}
                style={{ objectPosition: s.position }}
              />
            ) : null,
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/25" aria-hidden />
          <Link
            href={scene.href}
            aria-label={scene.linkLabel}
            className="group absolute top-3 left-3 inline-flex min-h-11 max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-white/92 py-1.5 pr-3.5 pl-1.5 text-[13px] font-medium text-ink shadow-[var(--shadow-soft)] backdrop-blur transition-colors hover:bg-white sm:top-4 sm:left-4"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
              <Icon name={scene.icon} className="size-4" />
            </span>
            <span className="truncate">{scene.title}</span>
            <ArrowUpRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" aria-hidden />
          </Link>
        </div>

        {/* Benachrichtigung: das Ereignis, das im System ankommt */}
        <motion.div
          key={`${scene.id}-toast`}
          aria-hidden
          className="absolute top-[4.25rem] right-0 z-20 sm:top-8 lg:-right-5"
          initial={reduced ? false : { opacity: 0, scale: 0.86, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease }}
        >
          <div className="animate-float rounded-3xl bg-night px-4 py-3 text-white shadow-[var(--shadow-float)]">
            <p className="flex items-center gap-1.5 text-[11px] whitespace-nowrap text-night-muted">
              <BellRing className="size-3.5 text-mint-400" /> {scene.toastLabel}
            </p>
            <p className="num mt-0.5 text-xl font-medium tracking-tight whitespace-nowrap sm:text-2xl">{scene.toastValue}</p>
          </div>
        </motion.div>

        {/* System-Ansicht */}
        <div aria-hidden className="relative z-10 -mt-20 ml-auto w-[92%] rounded-[1.75rem] border border-line bg-white p-3.5 shadow-[var(--shadow-float)] sm:-mt-32 sm:w-[66%] sm:p-4 lg:-mt-36 lg:w-[74%]">
          <div className="flex items-center gap-2.5 px-1">
            <span className="grid size-8 place-items-center rounded-full bg-night text-white">
              <Icon name={scene.icon} className="size-4" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{scene.app}</p>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-mint-400 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-mint-500" />
              </span>
              {live}
            </span>
          </div>
          <ul key={scene.id} className="mt-3 space-y-1">
            {scene.rows.map((r, n) => (
              <motion.li
                key={r.lead}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 + n * 0.09, ease }}
                className={cn("flex items-center gap-3 rounded-2xl px-2 py-2", n === 0 && "bg-brand-50", n === 2 && "max-sm:hidden")}
              >
                <span className={cn("num grid h-9 w-12 shrink-0 place-items-center rounded-xl text-[11px] font-semibold text-ink", n === 0 ? "bg-white" : "bg-canvas")}>{r.lead}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">{r.title}</span>
                  <span className="block truncate text-xs text-muted">{r.meta}</span>
                </span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", statusStyles[n])}>{r.status}</span>
              </motion.li>
            ))}
          </ul>
          <p className="mt-2.5 flex min-h-[3.25rem] items-center gap-2.5 border-t border-line px-1 pt-2.5 text-[13px] leading-snug font-medium text-ink">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
              <BadgeCheck className="size-4" />
            </span>
            {scene.win}
          </p>
        </div>
      </div>

      {/* Social Proof */}
      <div className="animate-rise [animation-delay:0.36s] lg:col-start-1 lg:row-start-3">{proof}</div>
    </div>
  );
}
