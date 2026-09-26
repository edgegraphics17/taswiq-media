import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";

/** asap #ablauf auf der Produktseite: drei Modi als dunkle Karten mit "Modus 01–03". */
export function ModesSection({
  tag,
  title,
  accent,
  text,
  modes,
  footnote,
}: {
  tag: string;
  title: string;
  accent: string;
  text: string;
  modes: { label: string; title: string; text: string; note: string }[];
  footnote: string;
}) {
  return (
    <section className="grain relative overflow-hidden bg-ink-900 py-24 sm:py-28">
      <div className="container-x relative">
        <Reveal className="max-w-2xl">
          <p className="tag-line text-teal-light">{tag}</p>
          <h2 className="mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-white">
            {title}
            <br />
            <span className="text-teal-light">{accent}</span>
          </h2>
          <p className="mt-5 text-[17px] text-mist">{text}</p>
        </Reveal>
        <InView className="stagger mt-12 grid gap-5 md:grid-cols-3">
          {modes.map((m, i) => (
            <article
              key={m.title}
              style={{ "--i": i } as React.CSSProperties}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all duration-400 hover:border-teal/40 hover:bg-teal/10"
            >
              <p className="num text-xs font-bold tracking-[0.2em] text-teal-light uppercase">{m.label}</p>
              <h3 className="mt-3 text-xl font-bold text-white">{m.title}</h3>
              <p className="mt-2.5 leading-relaxed text-mist">{m.text}</p>
              <p className="mt-5 inline-flex rounded-full border border-teal/30 px-3 py-1 text-xs font-semibold text-teal-light">{m.note}</p>
            </article>
          ))}
        </InView>
        <p className="mt-8 max-w-3xl text-sm text-haze">
          <b className="text-white">Gut zu wissen:</b> {footnote}
        </p>
      </div>
    </section>
  );
}
