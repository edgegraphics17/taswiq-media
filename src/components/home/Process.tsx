import { getTranslations } from "next-intl/server";
import { Frame, Handshake, Rocket, Search, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { InView } from "@/components/ui/InView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/format";

const ICONS: LucideIcon[] = [Search, Frame, Rocket, Handshake];

/**
 * Ablauf als Bento-Karten: Workshop → Prototyp in 7 Tagen → Umsetzung in Etappen → Betrieb.
 * Titel, Text, rosé Icon-Kreis unten links, große blasse Nummer unten rechts –
 * Schritt 2 (Prototyp) als schwarze Kontrast-Karte mit Mint-Icon.
 */
export type ProcessContent = { tag: string; title: string; accent: string; text: string; steps: { title: string; text: string }[] };

/** Ohne `content` der allgemeine Ablauf der Startseite, mit `content` die Fassung einer Branchenseite. */
export async function Process({ content }: { content?: ProcessContent }) {
  const t = await getTranslations("home.process");
  const c = content ?? { tag: t("tag"), title: t("title"), accent: t("accent"), text: t("text"), steps: t.raw("steps") as ProcessContent["steps"] };
  const steps = c.steps;
  return (
    <section id="ablauf" aria-labelledby="ablauf-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="ablauf-title" eyebrow={c.tag} icon={Rocket} title={c.title} accent={c.accent} text={c.text} />
        </Reveal>
        <InView role="list" className="stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const dark = i === 1;
            const Ico = ICONS[i];
            return (
              <div
                role="listitem"
                key={s.title}
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "flex min-h-72 flex-col rounded-[2rem] p-7 transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-1",
                  dark ? "bg-night text-white shadow-[var(--shadow-float)]" : "border border-line bg-white shadow-[var(--shadow-soft)]",
                )}
              >
                <h3 className={cn("text-2xl font-medium", dark && "text-white")}>{s.title}</h3>
                <p className={cn("mt-3 text-[15px] leading-relaxed", dark ? "text-night-muted" : "text-muted")}>{s.text}</p>
                <div className="mt-auto flex items-end justify-between pt-8">
                  <span className={cn("grid size-12 place-items-center rounded-full", dark ? "bg-mint-500 text-white" : "bg-blush-100 text-blush-600")}>
                    <Ico className="size-5" aria-hidden />
                  </span>
                  <span className={cn("num text-5xl leading-none font-light", dark ? "text-white/30" : "text-ink/15")}>{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>
            );
          })}
        </InView>
      </div>
    </section>
  );
}
