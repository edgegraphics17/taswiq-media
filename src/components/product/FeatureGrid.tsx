import { Sparkles } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { InView } from "@/components/ui/InView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";

/** Funktionen als Bento: erste Karte schwarz & breit, Rest weiße Soft-Karten mit Nummern. */
export function FeatureGrid({ tag, title, accent, text, items }: { tag: string; title: string; accent?: string; text?: string; items: { icon?: string; title: string; text: string }[] }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow={tag} icon={Sparkles} title={title} accent={accent} text={text} />
        </Reveal>
        <InView className="stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => {
            const dark = i === 0;
            return (
              <article
                key={f.title}
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "flex flex-col rounded-[2rem] p-6 transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 sm:p-7",
                  dark ? "bg-night text-white sm:col-span-2 lg:col-span-1 lg:row-span-2" : "border border-line bg-white shadow-[var(--shadow-soft)]",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className={cn("grid size-12 place-items-center rounded-full", dark ? "bg-mint-500 text-white" : "bg-blush-100 text-blush-600")}>
                    <Icon name={f.icon ?? "sparkles"} className="size-5" />
                  </span>
                  <span className={cn("num text-4xl font-light", dark ? "text-white/25" : "text-ink/15")}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className={cn("mt-6 text-xl font-medium", dark && "text-2xl text-white")}>{f.title}</h3>
                <p className={cn("mt-2 text-[15px] leading-relaxed", dark ? "text-night-muted" : "text-muted")}>{f.text}</p>
              </article>
            );
          })}
        </InView>
      </div>
    </section>
  );
}
