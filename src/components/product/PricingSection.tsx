import { ArrowRight, BadgePercent, Clapperboard, Megaphone, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/format";

type Pack = { name: string; audience: string; price: string; unit: string; meta: string; features: string[]; featured?: boolean };
const ICONS: LucideIcon[] = [Clapperboard, Sparkles, Megaphone];

/**
 * Pakete im Muster der Pricing-Karten der Vorlage ("Starter · $29 · Facility you will get"):
 * großer Preis, Leistungen als graue Pillen-Zeilen, Empfehlung als schwarze Karte.
 */
export function PricingSection({ tag, title, accent, text, packages, trust, highlight }: { tag: string; title: string; accent: string; text: string; packages: Pack[]; trust: string[]; highlight?: string }) {
  return (
    <section id="pakete" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow={tag} icon={BadgePercent} title={title} accent={accent} text={text} />
        </Reveal>
        <InView className="stagger mt-12 grid items-stretch gap-4 lg:grid-cols-3">
          {packages.map((p, i) => {
            const featured = highlight ? p.name === highlight : p.featured;
            const Ico = ICONS[i] ?? Sparkles;
            return (
              <article
                key={p.name}
                style={{ "--i": i } as React.CSSProperties}
                className={cn("relative flex flex-col rounded-[2rem] p-7 sm:p-8", featured ? "bg-night text-white shadow-[var(--shadow-float)]" : "border border-line bg-white shadow-[var(--shadow-soft)]")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={cn("text-xl font-medium", featured && "text-white")}>{p.name}</h3>
                    <p className={cn("mt-1 text-sm", featured ? "text-night-muted" : "text-muted")}>{p.audience}</p>
                  </div>
                  <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", featured ? "bg-mint-500 text-white" : "bg-night text-white")}>
                    <Ico className="size-5" aria-hidden />
                  </span>
                </div>
                {featured && <span className="mt-4 self-start rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">{highlight ? "Empfehlung" : "Meist gewählt"}</span>}
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="num text-5xl font-medium tracking-tight">{p.price.replace(" €", "")}</span>
                  <span className={cn("text-lg", featured ? "text-night-muted" : "text-muted")}>€</span>
                  <span className={cn("text-sm", featured ? "text-night-muted" : "text-muted")}>{p.unit}</span>
                </p>
                <p className={cn("mt-2 text-sm", featured ? "text-night-muted" : "text-muted")}>{p.meta}</p>
                <p className={cn("mt-7 text-sm font-medium", featured ? "text-white" : "text-ink")}>Das bekommst du</p>
                <ul className="mt-3 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className={cn("flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm", featured ? "bg-white/[0.07] text-white" : "bg-canvas text-body")}>
                      <span className={cn("size-1.5 shrink-0 rounded-full", featured ? "bg-mint-400" : "bg-brand-500")} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="#anfrage" variant={featured ? "primary" : "white"} className="mt-7 w-full">
                  {p.name} anfragen <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </article>
            );
          })}
        </InView>
        <Reveal className="mt-8 flex flex-wrap justify-center gap-2">
          {trust.map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-body">
              <ShieldCheck className="size-4 text-mint-500" aria-hidden /> {t}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
