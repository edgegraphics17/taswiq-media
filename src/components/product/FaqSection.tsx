import { Plus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";

/** FAQ als natives Akkordeon (tastatur- & screenreader-freundlich) + FAQPage-Schema für Google & KI-Suchen. */
export function FaqSection({ items, title = "Gute Fragen.", accent = "Klare Antworten." }: { items: { q: string; a: string }[]; title?: string; accent?: string }) {
  return (
    <section className="bg-fog py-24 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionHeading tag="FAQ" title={title} accent={accent} />
        </Reveal>
        <Reveal delay={0.1} className="divide-y divide-line rounded-3xl border border-line bg-white">
          {items.map((f) => (
            <details key={f.q} className="group px-6">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-5 shrink-0 text-teal-deep transition-transform duration-300 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="pb-5 leading-relaxed text-body">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
