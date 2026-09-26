"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, MapPin, Play } from "lucide-react";
import { portfolio } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { PortfolioMock } from "@/components/home/PortfolioMock";
import { CaseVideo } from "@/components/home/CaseVideo";
import { References } from "@/components/home/References";
import { cn } from "@/lib/format";

/**
 * asap #portfolio: Filter-Buttons + Karten mit Overlay. Echte Projekte spielen
 * beim Hover einen Clip aus dem Film ab und verlinken auf den vollen Film.
 * Darunter die Referenz-Laufbänder (Marken, Events, Artists).
 */
export function Portfolio() {
  const [filter, setFilter] = useState("alle");
  const items = portfolio.items.filter((p) => filter === "alle" || p.cat === filter);

  return (
    <section id="arbeiten" aria-labelledby="arbeiten-title" className="relative overflow-hidden bg-ink-950 py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="tag-line text-teal-light">{portfolio.tag}</p>
            <h2 id="arbeiten-title" className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-white">
              {portfolio.title}
            </h2>
            <p className="mt-4 text-[17px] text-mist">{portfolio.text}</p>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Arbeiten filtern">
            {portfolio.filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "min-h-11 rounded-full border px-5 text-sm font-semibold transition-all duration-300",
                  filter === f.id ? "border-teal bg-teal text-ink-950" : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>

        <motion.div layout className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((p) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="group relative aspect-[4/5] overflow-hidden sm:aspect-[1/0.95] rounded-[20px] border border-white/[0.07] bg-white/[0.04]"
              >
                <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-smooth)] group-focus-within:scale-[1.06] group-hover:scale-[1.06]">
                  {p.video && p.poster ? <CaseVideo src={p.video} poster={p.poster} alt={`${p.title} – Standbild aus dem Film`} /> : p.mock && <PortfolioMock type={p.mock} />}
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(8_12_16/0.96)_0%,rgb(8_12_16/0.6)_42%,rgb(8_12_16/0.05)_78%)]" />

                <span
                  className={cn(
                    "absolute top-4 left-4 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase",
                    p.kind === "case" ? "bg-teal text-ink-950" : "border border-white/20 bg-ink-950/50 text-white/80 backdrop-blur",
                  )}
                >
                  {p.kind === "case" ? "Projekt" : "Format"}
                </span>
                {p.video && (
                  <span className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-white/25 bg-ink-950/40 text-white backdrop-blur transition-opacity group-hover:opacity-0" aria-hidden>
                    <Play className="size-4 translate-x-px fill-current" />
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-bold tracking-[0.14em] text-teal-light uppercase">{p.tag}</p>
                  <h3 className="mt-1.5 text-lg leading-snug font-bold text-white">{p.title}</h3>
                  {p.location && (
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-haze">
                      <MapPin className="size-3.5 shrink-0" aria-hidden /> {p.location}
                    </p>
                  )}
                  <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-500 group-focus-within:mt-2.5 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 group-hover:mt-2.5 group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:mt-2.5 max-md:grid-rows-[1fr] max-md:opacity-100">
                    <div className="overflow-hidden">
                      <p className="text-sm leading-relaxed text-mist">{p.text}</p>
                      {p.youtube && (
                        <a
                          href={p.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal-light hover:text-white"
                        >
                          Ganzen Film ansehen <ArrowUpRight className="size-4" aria-hidden />
                          <span className="sr-only">(öffnet YouTube)</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <References />
    </section>
  );
}
