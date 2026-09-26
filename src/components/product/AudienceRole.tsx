import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** asap #gewerke: Branchen-Chips */
export function AudienceSection({ tag, title, accent, text, chips }: { tag: string; title: string; accent: string; text: string; chips: string[] }) {
  return (
    <section className="py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading tag={tag} title={title} accent={accent} text={text} />
        </Reveal>
        <Reveal delay={0.1} className="mt-9 flex flex-wrap gap-2.5">
          {chips.map((c) => (
            <span key={c} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal-deep">
              {c}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/** asap #rolle: "Du bekommst keinen Zugang – du bekommst einen fertigen Assistenten." */
export function RoleSection({ tag, title, accent, text, items }: { tag: string; title: string; accent: string; text: string; items: { title: string; text: string }[] }) {
  return (
    <section className="bg-fog py-24 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <SectionHeading tag={tag} title={title} accent={accent} text={text} />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={0.1 * i} className="rounded-2xl border border-line bg-white p-6">
              <span className="grid size-9 place-items-center rounded-full bg-teal text-ink-950">
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <h3 className="mt-4 font-bold text-ink">{it.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
