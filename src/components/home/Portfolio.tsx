"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUpRight, Clapperboard, MapPin } from "lucide-react";
import { portfolioFilters, portfolioItems } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PortfolioMock } from "@/components/home/PortfolioMock";
import { CaseVideo } from "@/components/home/CaseVideo";
import { cn } from "@/lib/format";

/**
 * Arbeiten: Segment-Pillen als Filter (wie "Pay Monthly / Pay Yearly"), Karten mit
 * abgerundetem Medium, Meta-Pillen oben und schwebendem Standort-Badge unten
 * (Muster "Kalsey Hand · Sr Product manager" der Vorlage).
 * Die Referenz-Laufbänder (Server Component) kommen als `references`-Slot herein.
 */
export function Portfolio({ references }: { references?: React.ReactNode }) {
  const t = useTranslations("home.portfolio");
  const [filter, setFilter] = useState<(typeof portfolioFilters)[number]>("alle");
  const items = portfolioItems.filter((p) => filter === "alle" || p.cat === filter);

  return (
    <section id="arbeiten" aria-labelledby="arbeiten-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="arbeiten-title" eyebrow={t("tag")} icon={Clapperboard} title={t("title")} text={t("text")} />
          <LayoutGroup>
            <div role="group" aria-label={t("filterAria")} className="mx-auto mt-8 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-full border border-line bg-white p-1.5 shadow-[var(--shadow-soft)]">
              {portfolioFilters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn("relative min-h-10 rounded-full px-4 text-sm font-medium transition-colors", filter === f ? "text-white" : "text-body hover:text-ink")}
                >
                  {filter === f && <motion.span layoutId="pf-pill" className="absolute inset-0 rounded-full bg-brand-500 shadow-[var(--shadow-brand)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{t(`filters.${f}`)}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </Reveal>

        <motion.div layout className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((p) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="card group flex flex-col p-2.5"
              >
                <div className="relative">
                  <div className={cn("relative aspect-[4/3] overflow-hidden rounded-[1.6rem]", !p.video && "bg-night")}>
                    <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-soft)] group-focus-within:scale-105 group-hover:scale-105">
                      {p.video && p.poster ? <CaseVideo src={p.video} poster={p.poster} alt={t("posterAlt", { title: t(`items.${p.id}.title`) })} /> : p.mock && <PortfolioMock type={p.mock} />}
                    </div>
                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur">{t(`items.${p.id}.tag`)}</span>
                      <span className={cn("rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur", p.kind === "case" ? "bg-brand-500 text-white" : "bg-white/70 text-ink")}>
                        {t(`kind.${p.kind}`)}
                      </span>
                    </div>
                  </div>
                  {p.location && (
                    <div className="absolute right-3 -bottom-5 flex max-w-[85%] items-center gap-2 rounded-full border border-line bg-white py-1.5 pr-3.5 pl-1.5 shadow-[var(--shadow-float)]">
                      <span className="relative size-8 shrink-0 overflow-hidden rounded-full">
                        {p.poster && <Image src={p.poster} alt="" fill sizes="32px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 text-left leading-tight">
                        <span className="block truncate text-xs font-medium text-ink">{p.location.split(" · ")[0]}</span>
                        <span className="flex items-center gap-1 truncate text-[10.5px] text-muted">
                          <MapPin className="size-3 shrink-0" aria-hidden />
                          {p.location.split(" · ")[1]}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                <div className={cn("flex flex-1 flex-col px-3.5 pb-3.5", p.location ? "pt-9" : "pt-5")}>
                  <h3 className="text-lg font-medium">{t(`items.${p.id}.title`)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`items.${p.id}.text`)}</p>
                  {p.youtube && (
                    <a
                      href={p.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex min-h-10 items-center gap-1.5 self-start rounded-full bg-canvas px-4 text-sm font-medium text-ink transition hover:bg-brand-50 hover:text-brand-600"
                    >
                      {t("watchFilm")} <ArrowUpRight className="size-4" aria-hidden />
                      <span className="sr-only">{t("opensYoutube")}</span>
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      {references}
    </section>
  );
}
