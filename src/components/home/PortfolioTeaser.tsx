import { getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase } from "lucide-react";
import type { PortfolioId } from "@/config/content";
import { PortfolioExplorer } from "@/components/portfolio/PortfolioExplorer";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Ausgewählte Projekte (Startseite & Landingpages) – öffnen dieselbe Detailansicht
 * wie die Portfolio-Seite. `ids` legt Auswahl & Reihenfolge fest, sonst "featured".
 */
export async function PortfolioTeaser({ ids, id = "arbeiten", title, text }: { ids?: PortfolioId[]; id?: string; title?: string; text?: string }) {
  const t = await getTranslations("portfolio");
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id={`${id}-title`} eyebrow={t("teaser.tag")} icon={Briefcase} title={title ?? t("teaser.title")} text={text ?? t("teaser.text")} />
        </Reveal>
        <div className="mt-12">
          <PortfolioExplorer mode="teaser" ids={ids} />
        </div>
        <Reveal className="mt-10 flex justify-center">
          <ButtonLink href="/portfolio" variant="white">
            {t("teaser.cta")} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
