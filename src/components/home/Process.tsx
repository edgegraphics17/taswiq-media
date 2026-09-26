"use client";

import { process } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { InView } from "@/components/ui/InView";
import { SlideDots } from "@/components/ui/SlideDots";
import { useActiveSlide } from "@/hooks/useActiveSlide";
import { cn } from "@/lib/format";

/** asap #process: 4 Schritte auf Verbindungslinie, Kreis füllt sich Teal mit Glow (Hover/aktiv). */
export function Process() {
  const { ref, active, scrollTo } = useActiveSlide<HTMLDivElement>(process.steps.length);
  return (
    <section id="ablauf" aria-labelledby="ablauf-title" className="grain relative overflow-hidden bg-ink-900 py-24 sm:py-32">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(90_174_184/0.12)_0%,transparent_65%)]" aria-hidden />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="tag-line text-teal-light">{process.tag}</p>
          <h2 id="ablauf-title" className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-white">
            {process.title}
            <br />
            <span className="text-teal-light">{process.accent}</span>
          </h2>
          <p className="mt-5 text-[17px] text-mist">{process.text}</p>
        </Reveal>

        <InView
            ref={ref}
            role="list"
            className="stagger snap-slider relative mt-16 grid gap-10 min-[900px]:grid-cols-4 min-[900px]:before:absolute min-[900px]:before:top-[30px] min-[900px]:before:right-[12%] min-[900px]:before:left-[12%] min-[900px]:before:h-px min-[900px]:before:bg-[linear-gradient(90deg,transparent,rgb(90_174_184/0.35),rgb(90_174_184/0.35),transparent)]"
          >
            {process.steps.map((s, i) => (
              <div
                role="listitem"
                key={s.title}
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "group relative text-center max-[899px]:rounded-3xl max-[899px]:border max-[899px]:border-white/5 max-[899px]:bg-white/[0.03] max-[899px]:px-5 max-[899px]:py-8 max-[899px]:[&.is-active]:border-teal/25 max-[899px]:[&.is-active]:bg-teal/10",
                )}
              >
                <span className="num relative z-10 mx-auto grid size-[60px] place-items-center rounded-full border border-teal/30 bg-ink-800 text-lg font-extrabold text-teal-light transition-all duration-400 group-hover:scale-110 group-hover:bg-teal group-hover:text-ink-950 group-hover:shadow-[0_0_30px_rgb(90_174_184/0.45)] group-[.is-active]:scale-110 group-[.is-active]:bg-teal group-[.is-active]:text-ink-950">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-lg font-bold text-white">{s.title}</h3>
                <p className="mx-auto mt-2.5 max-w-[260px] text-[15px] leading-relaxed text-mist">{s.text}</p>
              </div>
            ))}
        </InView>
        <SlideDots count={process.steps.length} active={active} onSelect={scrollTo} tone="dark" label="Ablauf-Schritte" />
      </div>
    </section>
  );
}
