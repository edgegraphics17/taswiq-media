import { ProductHero } from "@/components/product/ProductHero";
import { ProblemSection } from "@/components/product/ProblemSection";
import { FeatureGrid } from "@/components/product/FeatureGrid";
import { ModesSection } from "@/components/product/ModesSection";
import { AudienceSection, RoleSection } from "@/components/product/AudienceRole";
import { PricingSection } from "@/components/product/PricingSection";
import { FaqSection } from "@/components/product/FaqSection";
import { FunnelSection } from "@/components/product/FunnelSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  pipelineAudience,
  pipelineFaq,
  pipelineFeatures,
  pipelineHero,
  pipelineModes,
  pipelinePricing,
  pipelineProblem,
  pipelineRole,
} from "@/config/pipeline";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Content-Pipeline – Ein Drehtag, Content für ein Quartal",
  description:
    "Unsere KI-Content-Pipeline macht aus einem Drehtag 12 bis 30 Clips in allen Formaten, Längen und Sprachen. Für Restaurants, Bars und Festivals – mit Festpreis.",
  path: "/content-pipeline",
  keywords: ["KI Content Pipeline", "Social Media Content Gastronomie", "Reels produzieren lassen", "KI Video Produktion"],
});

/** Flaggschiff-Unterseite – Aufbau wie asapmarketing.de/ki-telefonassistent.html */
export default function ContentPipelinePage() {
  return (
    <>
      <ProductHero {...pipelineHero} />
      <ProblemSection {...pipelineProblem} />
      <FeatureGrid {...pipelineFeatures} />
      <ModesSection {...pipelineModes} />
      <AudienceSection {...pipelineAudience} />
      <RoleSection {...pipelineRole} />
      <PricingSection {...pipelinePricing} />
      <FaqSection items={pipelineFaq} />
      <FunnelSection
        title="Hör auf zu filmen."
        accent="Fang an zu posten."
        text="Erzähl uns kurz von deinem Lokal oder Event – wir melden uns mit einem Plan und Festpreis innerhalb von 24 Stunden."
        source="ki_seite"
        interests={["ki_content", "social"]}
      />
      <JsonLd
        data={serviceJsonLd({
          name: "KI-Content-Pipeline",
          serviceType: "Videoproduktion mit KI-Postproduktion",
          description: pipelineHero.text,
          path: "/content-pipeline",
        })}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Start", path: "/" }, { name: "Content-Pipeline", path: "/content-pipeline" }])} />
    </>
  );
}
