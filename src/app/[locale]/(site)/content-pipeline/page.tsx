import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductHero } from "@/components/product/ProductHero";
import { ProblemSection } from "@/components/product/ProblemSection";
import { FeatureGrid } from "@/components/product/FeatureGrid";
import { ModesSection } from "@/components/product/ModesSection";
import { AudienceSection, RoleSection } from "@/components/product/AudienceRole";
import { PricingSection } from "@/components/product/PricingSection";
import { FaqSection } from "@/components/product/FaqSection";
import { FunnelSection } from "@/components/product/FunnelSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { pipelineFeatureIcons } from "@/config/pipeline";
import type { Locale } from "@/i18n/routing";
import { getPackages } from "@/lib/packages";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };
type Card = { title: string; text: string };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return pageMetadata({ locale, href: "/content-pipeline", title: t("pipeline.title"), description: t("pipeline.description"), keywords: t.raw("pipeline.keywords") as string[] });
}

/** Flaggschiff-Unterseite – Aufbau wie asapmarketing.de/ki-telefonassistent.html */
export default async function ContentPipelinePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pipeline");
  const tp = await getTranslations("product");
  const ts = await getTranslations("schema");

  return (
    <>
      <ProductHero
        badge={t("hero.badge")}
        titleStart={t("hero.titleStart")}
        titleHighlight={t("hero.titleHighlight")}
        text={t("hero.text")}
        primary={{ label: tp("calculateCosts"), href: "/preisrechner" }}
        secondary={{ label: tp("requestConsultation"), href: "#anfrage" }}
        stats={t.raw("hero.stats") as { value: string; label: string }[]}
      />
      <ProblemSection
        tag={t("problem.tag")}
        title={t("problem.title")}
        text={t("problem.text")}
        points={t.raw("problem.points") as string[]}
        story={{ label: t("problem.story.label"), quote: t("problem.story.quote"), text: t("problem.story.text") }}
        note={t("problem.note")}
      />
      <FeatureGrid
        tag={t("features.tag")}
        title={t("features.title")}
        accent={t("features.accent")}
        text={t("features.text")}
        items={(t.raw("features.items") as Card[]).map((f, i) => ({ ...f, icon: pipelineFeatureIcons[i] }))}
      />
      <ModesSection
        tag={t("modes.tag")}
        title={t("modes.title")}
        accent={t("modes.accent")}
        text={t("modes.text")}
        modes={t.raw("modes.modes") as { label: string; title: string; text: string; note: string }[]}
        footnote={t("modes.footnote")}
      />
      <AudienceSection tag={t("audience.tag")} title={t("audience.title")} accent={t("audience.accent")} text={t("audience.text")} chips={t.raw("audience.chips") as string[]} />
      <RoleSection tag={t("role.tag")} title={t("role.title")} accent={t("role.accent")} text={t("role.text")} items={t.raw("role.items") as Card[]} />
      <PricingSection
        tag={t("pricing.tag")}
        title={t("pricing.title")}
        accent={t("pricing.accent")}
        text={t("pricing.text")}
        packages={await getPackages(locale)}
        trust={t.raw("pricing.trust") as string[]}
      />
      <FaqSection items={t.raw("faq") as { q: string; a: string }[]} />
      <FunnelSection title={t("funnel.title")} accent={t("funnel.accent")} text={t("funnel.text")} source="ki_seite" interests={["ki_content", "social"]} />
      <JsonLd
        data={await serviceJsonLd({ locale, name: t("schemaName"), serviceType: t("schemaServiceType"), description: t("hero.text"), href: "/content-pipeline" })}
      />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: ts("breadcrumbHome"), href: "/" },
            { name: t("breadcrumb"), href: "/content-pipeline" },
          ],
          locale,
        )}
      />
    </>
  );
}
