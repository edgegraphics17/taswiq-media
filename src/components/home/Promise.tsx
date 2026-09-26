import Image from "next/image";
import { Check, Target } from "lucide-react";
import { promise, portfolio } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard, MiniCurve } from "@/components/ui/FloatCard";

const STATS = [
  { value: "450+", label: "Projekte in Gastro, Events & Musik" },
  { value: "72 h", label: "bis zu den ersten Clips" },
  { value: "4", label: "Sprachen per KI-Voiceover" },
];

/**
 * "What We Offer"-Muster der Vorlage: links weiße Karte mit Kennzahlen-Zeilen
 * und Referenz-Avataren, rechts schwarze Kontrast-Karte mit Bild, schwebender
 * Stat-Karte und Mint-Checkmarks.
 */
export function PromiseSection() {
  const thumbs = portfolio.items.filter((p) => p.poster);

  return (
    <section id="about" aria-labelledby="about-title" className="py-16 sm:py-24">
      <div className="container-x grid gap-4 lg:grid-cols-2">
        <Reveal className="card flex flex-col p-7 sm:p-10">
          <Eyebrow icon={Target}>{promise.tag}</Eyebrow>
          <h2 id="about-title" className="mt-4 text-[clamp(2rem,3.6vw,3rem)] leading-[1.05] font-medium">
            {promise.title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{promise.text}</p>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-6 py-4">
                <dt className="order-2 max-w-[11rem] text-right text-[13px] leading-snug text-muted">{s.label}</dt>
                <dd className="num text-[2.2rem] leading-none font-medium tracking-tight text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto pt-8">
            <p className="text-lg font-medium text-ink">Referenzen, die man schmeckt</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {thumbs.map((t) => (
                  <span key={t.id} className="relative size-10 overflow-hidden rounded-full ring-2 ring-white">
                    <Image src={t.poster!} alt="" fill sizes="40px" className="object-cover" />
                  </span>
                ))}
              </div>
              <p className="text-[13px] leading-tight text-muted">
                Hyatt Centric · One World Hotel
                <br />
                Kuala Lumpur & Petaling Jaya
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="card-night flex flex-col p-4 sm:p-5">
          <div className="relative aspect-[16/11] overflow-visible">
            <div className="relative size-full overflow-hidden rounded-[1.6rem]">
              <Image src="/images/cases/cinnamon-sushi.jpg" alt="Sushi-Station im Cinnamon Coffee House, One World Hotel" fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover" />
            </div>
            <FloatCard className="right-3 -bottom-6 w-48 sm:-right-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">Clips pro Dreh</p>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">+KI</span>
              </div>
              <p className="num mt-1 text-xl font-medium">12 – 30</p>
              <MiniCurve className="mt-1" />
            </FloatCard>
          </div>
          <div className="p-4 pt-10 sm:p-6 sm:pt-12">
            <Eyebrow tone="dark">{promise.cardTag}</Eyebrow>
            <p className="mt-4 text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.08] font-medium tracking-tight">{promise.cardTitle}</p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {promise.checks.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-night-muted">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint-500/15 text-mint-400">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
