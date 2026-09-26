"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ki } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { InView } from "@/components/ui/InView";
import { SlideDots } from "@/components/ui/SlideDots";
import { useActiveSlide } from "@/hooks/useActiveSlide";

/** asap #ki: Flaggschiff-Karte (→ Unterseite), 4 KI-Karten, Zweiweg-Split nach Branche. */
export function KiSection() {
  const cards = useActiveSlide<HTMLDivElement>(ki.cards.length);
  const ways = useActiveSlide<HTMLDivElement>(ki.split.length);
  return (
    <section id="ki" aria-labelledby="ki-title" className="overflow-hidden py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="tag-line text-teal-deep">{ki.tag}</p>
          <h2 id="ki-title" className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
            {ki.title}
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-body">{ki.text}</p>
        </Reveal>

        <Reveal className="glow-box mt-12 flex flex-col gap-8 rounded-3xl p-7 text-white shadow-[0_26px_70px_rgb(90_174_184/0.22)] sm:p-10 md:flex-row md:items-center md:gap-12">
          <div className="flex shrink-0 items-center gap-4 md:flex-col">
            <span className="grid size-20 place-items-center rounded-3xl border border-white/10 bg-white/5 md:size-28">
              <LogoMark className="h-12 md:h-16" />
            </span>
            <span className="rounded-full border border-teal/30 bg-teal/15 px-3 py-1 text-[11px] font-bold tracking-[0.1em] whitespace-nowrap text-teal-light uppercase">
              {ki.flagship.badge}
            </span>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-teal-light uppercase">{ki.flagship.label}</p>
            <h3 className="mt-2 text-[clamp(1.4rem,2.4vw,1.9rem)] leading-tight font-extrabold tracking-tight">{ki.flagship.title}</h3>
            <p className="mt-3 max-w-2xl leading-relaxed text-mist">{ki.flagship.text}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href={ki.flagship.primary.href}>
                {ki.flagship.primary.label} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <Link href={ki.flagship.secondary.href} className="inline-flex min-h-11 items-center gap-2 font-semibold text-teal-light transition-[gap] hover:gap-3.5">
                {ki.flagship.secondary.label} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </Reveal>

        <InView ref={cards.ref} className="stagger snap-slider mt-6 grid gap-5 min-[900px]:grid-cols-2 lg:grid-cols-4">
          {ki.cards.map((c, i) => (
            <article
              key={c.title}
              style={{ "--i": i } as React.CSSProperties}
              className="ki-card relative overflow-hidden rounded-[18px] border border-teal/20 bg-white p-6 transition-[transform,box-shadow] duration-350 ease-[var(--ease-wobble)] min-[900px]:hover:-translate-y-1.5 min-[900px]:hover:shadow-[0_30px_70px_rgb(90_174_184/0.18)]"
            >
              <span className="grid size-[46px] place-items-center rounded-[14px] border border-teal/25 bg-teal-wash text-teal-deep">
                <Icon name={c.icon} className="size-5" />
              </span>
              <h3 className="mt-5 font-bold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
            </article>
          ))}
        </InView>
        <SlideDots count={ki.cards.length} active={cards.active} onSelect={cards.scrollTo} label="KI-Leistungen" />

        <InView ref={ways.ref} className="stagger snap-slider mt-6 grid gap-5 min-[900px]:grid-cols-2">
          {ki.split.map((w, i) => (
            <article
              key={w.tag}
              style={{ "--i": i } as React.CSSProperties}
              className="flex flex-col rounded-3xl border border-line bg-fog p-7 sm:p-9"
            >
              <p className="eyebrow">{w.tag}</p>
              <h3 className="mt-3 text-xl font-extrabold tracking-tight text-ink">{w.title}</h3>
              <p className="mt-3 flex-1 leading-relaxed text-body">{w.text}</p>
              <ButtonLink href={w.cta.href} variant={i === 0 ? "ink" : "primary"} className="mt-6 self-start max-[899px]:self-stretch">
                {w.cta.label} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </article>
          ))}
        </InView>
        <SlideDots count={ki.split.length} active={ways.active} onSelect={ways.scrollTo} label="Einstiege nach Branche" />
      </div>
    </section>
  );
}
