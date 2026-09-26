import { Check, Info, Lightbulb } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";

/** Problem: weiße Karte mit Argument + Checkliste, daneben schwarze Szene-Karte mit Mint-Akzent. */
export function ProblemSection({ tag, title, text, points, story, note }: { tag: string; title: string; text: string; points: string[]; story?: { label: string; quote: string; text: string }; note?: string }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="card p-7 sm:p-10">
          <Eyebrow icon={Lightbulb}>{tag}</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.08] font-medium">{title}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{text}</p>
          <ul className="mt-7 grid gap-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-full bg-canvas p-1.5 pr-5 text-[14.5px] text-body">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        {story ? (
          <Reveal delay={0.1} className="card-night flex flex-col p-7 sm:p-10">
            <Eyebrow tone="dark">{story.label}</Eyebrow>
            <blockquote className="mt-5 text-[clamp(1.4rem,2.4vw,1.9rem)] leading-snug font-medium">{story.quote}</blockquote>
            <p className="mt-5 leading-relaxed text-night-muted">{story.text}</p>
            {note && (
              <p className="mt-auto flex gap-3 rounded-3xl bg-white/[0.06] p-4 pt-4 text-sm leading-relaxed text-night-muted">
                <Info className="mt-0.5 size-4 shrink-0 text-mint-400" aria-hidden />
                {note}
              </p>
            )}
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
