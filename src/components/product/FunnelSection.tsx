import { getTranslations } from "next-intl/server";
import { Phone, Send } from "lucide-react";
import { site } from "@/config/site";
import type { FunnelIndustry, InterestId, LeadSource } from "@/config/funnel";
import { LeadFunnel } from "@/components/funnel/LeadFunnel";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";

/** Abschluss der Unterseiten: Überschrift + schwarze Direktkontakt-Karte + vorbelegter Funnel. */
export async function FunnelSection({ title, accent, text, source, industry, interests }: { title: string; accent: string; text: string; source: LeadSource; industry?: FunnelIndustry; interests?: InterestId[] }) {
  const t = await getTranslations("product");
  const tBox = await getTranslations("contactBox");
  return (
    <section id="anfrage" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal className="lg:sticky lg:top-28">
          <Eyebrow icon={Send}>{t("requestTag")}</Eyebrow>
          <h2 className="mt-4 text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.04] font-medium">
            {title} <span className="text-brand-500">{accent}</span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{text}</p>
          <div className="card-night mt-8 p-6">
            <p className="font-medium">{tBox("title")}</p>
            <p className="mt-1 text-sm text-night-muted">{tBox("text")}</p>
            <a href={site.phoneHref} className="num mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-medium text-ink">
              <Phone className="size-4 text-brand-600" aria-hidden /> {site.phone}
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <LeadFunnel source={source} initialIndustry={industry} initialInterests={interests} idPrefix={`funnel-${source}`} />
        </Reveal>
      </div>
    </section>
  );
}
