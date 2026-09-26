"use client";

import { ArrowRight } from "lucide-react";
import { services } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { InView } from "@/components/ui/InView";
import { SlideDots } from "@/components/ui/SlideDots";
import { useActiveSlide } from "@/hooks/useActiveSlide";

/**
 * asap #services: 6 Karten. Desktop-Hover = Signature-Effekt (Karte wächst & kippt,
 * Nachbarn schrumpfen – siehe globals.css). Mobile = Scroll-Snap-Slider mit Punkten.
 */
export function Services() {
  const { ref, active, scrollTo } = useActiveSlide<HTMLDivElement>(services.items.length);
  return (
    <section id="services" aria-labelledby="services-title" className="overflow-hidden bg-fog py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="tag-line text-teal-deep">{services.tag}</p>
            <h2 id="services-title" className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
              {services.title}
            </h2>
            <p className="mt-4 text-[17px] text-body">{services.text}</p>
          </div>
          <ButtonLink href={services.cta.href} variant="ghost-light">
            {services.cta.label} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </Reveal>

        <InView ref={ref} className="services-grid stagger snap-slider mt-14 grid gap-6 min-[900px]:grid-cols-2 lg:grid-cols-3">
          {services.items.map((s, i) => (
            <article
              key={s.title}
              style={{ "--i": i } as React.CSSProperties}
              className="service-card relative flex flex-col rounded-[20px] border border-transparent bg-white p-8 max-[899px]:shadow-[var(--shadow-card)] min-[900px]:bg-white/70"
            >
              <span className="service-icon grid size-[52px] place-items-center rounded-2xl border border-teal/25 bg-teal-wash text-teal-deep transition-all duration-300">
                <Icon name={s.icon} className="size-6" />
              </span>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-body">{s.text}</p>
              <p className="mt-6 border-t border-line pt-4 text-[12px] font-semibold tracking-[0.14em] text-teal-deep uppercase">{s.tags}</p>
            </article>
          ))}
        </InView>
        <SlideDots count={services.items.length} active={active} onSelect={scrollTo} label="Services" />
      </div>
    </section>
  );
}
