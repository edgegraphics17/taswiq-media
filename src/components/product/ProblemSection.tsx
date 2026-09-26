import { Check, Info } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/** asap #problem: Argument + Liste links, Beispiel-Szene als Karte rechts, Hinweis darunter. */
export function ProblemSection({
  tag,
  title,
  text,
  points,
  story,
  note,
}: {
  tag: string;
  title: string;
  text: string;
  points: string[];
  story?: { label: string; quote: string; text: string };
  note?: string;
}) {
  return (
    <section className="py-24 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal>
          <p className="tag-line text-teal-deep">{tag}</p>
          <h2 className="mt-4 text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.15] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-body">{text}</p>
          <ul className="mt-7 space-y-3.5">
            {points.map((p) => (
              <li key={p} className="flex gap-3 text-[15.5px] text-body">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal-wash text-teal-deep">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        {story && (
          <Reveal delay={0.15} className="self-center">
            <figure className="glow-box rounded-3xl p-8 text-white shadow-[0_26px_70px_rgb(90_174_184/0.2)]">
              <p className="text-xs font-bold tracking-[0.14em] text-teal-light uppercase">{story.label}</p>
              <blockquote className="mt-4 text-xl leading-snug font-bold">{story.quote}</blockquote>
              <figcaption className="mt-4 leading-relaxed text-mist">{story.text}</figcaption>
            </figure>
            {note && (
              <p className="mt-5 flex gap-3 rounded-2xl border border-line bg-fog p-4 text-sm leading-relaxed text-body">
                <Info className="mt-0.5 size-4 shrink-0 text-teal-deep" aria-hidden />
                {note}
              </p>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
