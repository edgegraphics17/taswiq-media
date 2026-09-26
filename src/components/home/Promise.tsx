import { Check, Layers } from "lucide-react";
import { promise } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

/** asap #about: links Versprechen-Karte mit Checkliste + schwebendem Badge, rechts "Warum". */
export function PromiseSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-24 sm:py-32">
      <div className="container-x grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="rounded-[28px] border border-line bg-white p-8 shadow-[var(--shadow-card)] sm:p-10">
            <p className="eyebrow">{promise.cardTag}</p>
            <p className="mt-4 text-2xl leading-snug font-extrabold tracking-tight text-ink sm:text-[1.7rem]">{promise.cardTitle}</p>
            <ul className="mt-7 space-y-3.5">
              {promise.checks.map((c) => (
                <li key={c} className="flex items-start gap-3 text-[15px] text-body">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal-wash text-teal-deep">
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
          {/* Schwebendes Badge – wie der dunkle "Gesamtbetrag"-Block der Rechnung */}
          <div className="absolute -right-2 -bottom-8 flex animate-orb items-center gap-3 rounded-2xl bg-ink-800 px-5 py-4 text-white shadow-[0_24px_60px_rgb(15_23_32/0.35)] [animation-duration:7s] sm:-right-8">
            <span className="grid size-11 place-items-center rounded-xl bg-teal text-ink-950">
              <Layers className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-[11px] font-semibold tracking-[0.2em] text-teal-light uppercase">{promise.badge.title}</span>
              <span className="block text-sm font-semibold">{promise.badge.text}</span>
            </span>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="tag-line text-teal-deep">{promise.tag}</p>
            <h2 id="about-title" className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
              {promise.title}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-body">{promise.text}</p>
          </Reveal>
          <div className="mt-9 space-y-5" role="list">
            {promise.features.map((f, i) => (
              <Reveal key={f.title} delay={0.15 * (i + 1)} role="listitem" className="flex gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-teal/25 bg-teal-wash text-teal-deep">
                    <Icon name={f.icon} className="size-5" />
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{f.title}</span>
                    <span className="mt-0.5 block text-[15px] text-muted">{f.text}</span>
                  </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
