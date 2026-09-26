import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductHero } from "@/components/product/ProductHero";
import { ProblemSection } from "@/components/product/ProblemSection";
import { FeatureGrid } from "@/components/product/FeatureGrid";
import { PricingSection } from "@/components/product/PricingSection";
import { FaqSection } from "@/components/product/FaqSection";
import { FunnelSection } from "@/components/product/FunnelSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeoPage, seoPages } from "@/config/seo-pages";
import { pipelinePricing } from "@/config/pipeline";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

/** Geo-SEO-Landingpages – statisch gebaut, unbekannte Slugs → 404 */
export const dynamicParams = false;
export function generateStaticParams() {
  return seoPages.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getSeoPage((await params).slug);
  if (!page) return {};
  return pageMetadata({
    title: page.city ? `${page.metaTitle} in ${page.city}` : page.metaTitle,
    description: page.metaDescription,
    path: `/leistungen/${page.slug}`,
    keywords: page.keywords,
  });
}

export default async function SeoLandingPage({ params }: Props) {
  const page = getSeoPage((await params).slug);
  if (!page) notFound();
  const path = `/leistungen/${page.slug}`;

  return (
    <>
      <ProductHero
        badge={page.hero.badge}
        titleStart={page.hero.titleStart}
        titleHighlight={page.hero.titleHighlight}
        text={page.hero.text}
        primary={{ label: "Kosten berechnen", href: "/preisrechner" }}
        secondary={{ label: "Projekt anfragen", href: "#anfrage" }}
      />
      <ProblemSection tag={page.keyword} title={page.problem.title} text={page.problem.text} points={page.problem.points} />
      <FeatureGrid tag="Leistungen" title="Was du bekommst." items={page.features.map((f, i) => ({ ...f, icon: ["camera", "clapperboard", "smartphone", "workflow", "message", "languages"][i] }))} />
      <PricingSection {...pipelinePricing} highlight={page.highlightPackage} />
      <FaqSection items={page.faq} />
      <FunnelSection
        title="Lass uns über"
        accent="dein Projekt sprechen."
        text="Vier kurze Fragen, dann melden wir uns innerhalb von 24 Stunden mit einem Vorschlag und Festpreis."
        source="branchen_seite"
        industry={page.industry}
        interests={page.interests}
      />
      <JsonLd data={serviceJsonLd({ name: page.keyword, serviceType: page.keyword, description: page.metaDescription, path, city: page.city })} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Start", path: "/" }, { name: page.navLabel, path }])} />
    </>
  );
}
