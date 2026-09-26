import { CircleHelp, Plus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";

/** FAQ als einzelne weiche Akkordeon-Karten + FAQPage-Schema für Google & KI-Suchen. */
export function FaqSection({ items, title = "Gute Fragen.", accent = "Klare Antworten." }: { items: { q: string; a: string }[]; title?: string; accent?: string }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow="FAQ" icon={CircleHelp} title={title} accent={accent} />
        </Reveal>
        <Reveal delay={0.08} className="mx-auto mt-10 grid max-w-3xl gap-2.5">
          {items.map((f) => (
            <details key={f.q} className="group rounded-3xl border border-line bg-white px-6 shadow-[var(--shadow-soft)] open:ring-2 open:ring-brand-500/60">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas text-brand-600 transition-transform duration-300 group-open:rotate-45 group-open:bg-brand-500 group-open:text-white">
                  <Plus className="size-4" aria-hidden />
                </span>
              </summary>
              <p className="pb-6 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
