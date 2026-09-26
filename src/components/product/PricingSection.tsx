import { Check, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/format";

type Pack = { name: string; audience: string; price: string; unit: string; meta: string; features: string[]; featured?: boolean };

/**
 * asap #preise: drei Stufen, mittlere "Meist gewählt".
 * Karten-Look aus Seite 2 der Rechnung (dünner Rahmen, Empfehlung mit Teal-Rahmen).
 */
export function PricingSection({
  tag,
  title,
  accent,
  text,
  packages,
  trust,
  highlight,
}: {
  tag: string;
  title: string;
  accent: string;
  text: string;
  packages: Pack[];
  trust: string[];
  highlight?: string;
}) {
  return (
    <section id="pakete" className="py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading tag={tag} title={title} accent={accent} text={text} align="center" />
        </Reveal>
        <InView className="stagger mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {packages.map((p, i) => {
            const featured = highlight ? p.name === highlight : p.featured;
            return (
              <article
                key={p.name}
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "relative flex flex-col rounded-3xl border bg-white p-7 sm:p-8",
                  featured ? "border-teal shadow-[0_30px_80px_rgb(90_174_184/0.22)] lg:-translate-y-3" : "border-line",
                )}
              >
                {featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-teal px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-ink-950 uppercase">
                    {highlight ? "Empfehlung" : "Meist gewählt"}
                  </span>
                )}
                <p className="eyebrow">{p.audience}</p>
                <h3 className="mt-3 text-xl font-extrabold tracking-tight text-ink">{p.name}</h3>
                <p className="mt-5 flex items-baseline gap-2 border-b border-line pb-5">
                  <span className="num text-4xl font-extrabold tracking-tight text-ink">{p.price}</span>
                  <span className="text-sm text-muted">{p.unit}</span>
                </p>
                <p className="mt-4 text-sm font-semibold text-teal-deep">{p.meta}</p>
                <ul className="mt-4 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[15px] text-body">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal-deep" strokeWidth={2.5} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="#anfrage" variant={featured ? "primary" : "ghost-light"} className="mt-7 w-full">
                  {p.name} anfragen
                </ButtonLink>
              </article>
            );
          })}
        </InView>
        <Reveal className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-body">
          {trust.map((t) => (
            <span key={t} className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-teal-deep" aria-hidden /> {t}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
