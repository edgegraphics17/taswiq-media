import { Phone } from "lucide-react";
import { site } from "@/config/site";
import { contactBox } from "@/config/content";
import type { FunnelIndustry, InterestId, LeadSource } from "@/config/funnel";
import { LeadFunnel } from "@/components/funnel/LeadFunnel";
import { Reveal } from "@/components/ui/Reveal";

/** Abschluss der Unterseiten: Überschrift + Funnel (vorbelegt) + gestrichelte Direktkontakt-Box aus der Rechnung. */
export function FunnelSection({
  title,
  accent,
  text,
  source,
  industry,
  interests,
}: {
  title: string;
  accent: string;
  text: string;
  source: LeadSource;
  industry?: FunnelIndustry;
  interests?: InterestId[];
}) {
  return (
    <section id="anfrage" className="scroll-mt-20 py-24 sm:py-28">
      <div className="container-x grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal className="lg:sticky lg:top-28">
          <p className="tag-line text-teal-deep">Anfrage</p>
          <h2 className="mt-4 text-[clamp(2rem,3.5vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
            {title}
            <br />
            <span className="text-teal-deep">{accent}</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-body">{text}</p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-teal/60 p-6">
            <div>
              <p className="font-bold text-ink">{contactBox.title}</p>
              <p className="mt-1 text-sm text-muted">{contactBox.text}</p>
            </div>
            <a href={site.phoneHref} className="num inline-flex min-h-11 items-center gap-2 text-lg font-extrabold text-ink hover:text-teal-deep">
              <Phone className="size-4 text-teal-deep" aria-hidden /> {site.phone}
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <LeadFunnel source={source} initialIndustry={industry} initialInterests={interests} idPrefix={`funnel-${source}`} />
        </Reveal>
      </div>
    </section>
  );
}
