import { Check, Users } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Für wen: Branchen als Pillen-Wolke (Muster "We create digital products" der Vorlage). */
export function AudienceSection({ tag, title, accent, text, chips }: { tag: string; title: string; accent: string; text: string; chips: string[] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal className="card p-8 sm:p-12">
          <SectionHeading eyebrow={tag} icon={Users} title={title} accent={accent} text={text} />
          <ul className="mx-auto mt-9 flex max-w-3xl flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <li key={c} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600">
                {c}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** Unsere Rolle: vier Soft-Karten mit Mint-Check. */
export function RoleSection({ tag, title, accent, text, items }: { tag: string; title: string; accent: string; text: string; items: { title: string; text: string }[] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow={tag} title={title} accent={accent} text={text} />
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={0.06 * i} className="card p-6">
              <span className="grid size-10 place-items-center rounded-full bg-mint-500 text-white">
                <Check className="size-5" strokeWidth={3} aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-medium">{it.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
