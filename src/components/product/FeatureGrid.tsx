import { Icon } from "@/components/ui/Icon";
import { InView } from "@/components/ui/InView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/** asap #funktionen: 9 (oder 6) Funktions-Karten mit Icon, Teal-Linie beim Hover. */
export function FeatureGrid({
  tag,
  title,
  accent,
  text,
  items,
}: {
  tag: string;
  title: string;
  accent?: string;
  text?: string;
  items: { icon?: string; title: string; text: string }[];
}) {
  return (
    <section className="bg-fog py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading tag={tag} title={title} accent={accent} text={text} />
        </Reveal>
        <InView className="stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <article
              key={f.title}
              style={{ "--i": i } as React.CSSProperties}
              className="ki-card relative overflow-hidden rounded-[18px] border border-teal/15 bg-white p-6 transition-[transform,box-shadow] duration-350 ease-[var(--ease-wobble)] hover:-translate-y-1.5 hover:shadow-[0_30px_70px_rgb(90_174_184/0.16)]"
            >
              <span className="grid size-[46px] place-items-center rounded-[14px] border border-teal/25 bg-teal-wash text-teal-deep">
                <Icon name={f.icon ?? "sparkles"} className="size-5" />
              </span>
              <h3 className="mt-5 font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </article>
          ))}
        </InView>
      </div>
    </section>
  );
}
