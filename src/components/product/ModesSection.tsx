import { getTranslations } from "next-intl/server";
import { Workflow } from "lucide-react";
import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/format";

/** Drei Modi: mittlere Karte schwarz hervorgehoben, Notiz als Pille. */
export async function ModesSection({ tag, title, accent, text, modes, footnote }: { tag: string; title: string; accent: string; text: string; modes: { label: string; title: string; text: string; note: string }[]; footnote: string }) {
  const t = await getTranslations("product");
  return (
    <section className="py-16 sm:py-20">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow={tag} icon={Workflow} title={title} accent={accent} text={text} />
        </Reveal>
        <InView className="stagger mt-12 grid gap-4 md:grid-cols-3">
          {modes.map((m, i) => {
            const dark = i === 1;
            return (
              <article
                key={m.title}
                style={{ "--i": i } as React.CSSProperties}
                className={cn("flex flex-col rounded-[2rem] p-7", dark ? "bg-night text-white shadow-[var(--shadow-float)]" : "border border-line bg-white shadow-[var(--shadow-soft)]")}
              >
                <p className={cn("num text-sm font-medium", dark ? "text-mint-400" : "text-brand-600")}>{m.label}</p>
                <h3 className={cn("mt-3 text-2xl font-medium", dark && "text-white")}>{m.title}</h3>
                <p className={cn("mt-2.5 flex-1 leading-relaxed", dark ? "text-night-muted" : "text-muted")}>{m.text}</p>
                <p className={cn("mt-6 self-start rounded-full px-3.5 py-1.5 text-xs font-medium", dark ? "bg-white/10 text-white" : "bg-brand-50 text-brand-600")}>{m.note}</p>
              </article>
            );
          })}
        </InView>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
          <b className="font-medium text-ink">{t("goodToKnow")}</b> {footnote}
        </p>
      </div>
    </section>
  );
}
