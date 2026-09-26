import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductHero } from "@/components/product/ProductHero";
import { ProblemSection } from "@/components/product/ProblemSection";
import { FeatureGrid } from "@/components/product/FeatureGrid";
import { PricingSection } from "@/components/product/PricingSection";
import { FaqSection } from "@/components/product/FaqSection";
import { FunnelSection } from "@/components/product/FunnelSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeoPageBySlug, seoFeatureIcons, seoPages, type SeoPage } from "@/config/seo-pages";
import { routing, type Locale } from "@/i18n/routing";
import { getPackages } from "@/lib/packages";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

/** Geo-SEO-Landingpages – statisch gebaut (je Sprache eigener Slug), unbekannte Slugs → 404 */
export const dynamicParams = false;
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => seoPages.map((p) => ({ locale, slug: p.slugs[locale] })));
}

type Props = { params: Promise<{ locale: Locale; slug: string }> };

const hrefOf = (page: SeoPage) => (l: Locale) => ({ pathname: "/leistungen/[slug]" as const, params: { slug: page.slugs[l] } });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getSeoPageBySlug(slug, locale);
  if (!page) return {};
  const t = await getTranslations({ locale, namespace: `seoPages.${page.id}` });
  return pageMetadata({
    locale,
    // hreflang verknüpft /leistungen/medienagentur-gastronomie ↔ /en/services/restaurant-media-agency
    href: hrefOf(page),
    title: page.city ? `${t("metaTitle")} – ${page.city}` : t("metaTitle"),
    description: t("metaDescription"),
    keywords: t.raw("keywords") as string[],
  });
}

export default async function SeoLandingPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = getSeoPageBySlug(slug, locale);
  if (!page) notFound();

  const t = await getTranslations(`seoPages.${page.id}`);
  const tp = await getTranslations("product");
  const tpr = await getTranslations("pipeline");
  const ts = await getTranslations("schema");
  const href = hrefOf(page)(locale);

  return (
    <>
      <ProductHero
        badge={t("hero.badge")}
        titleStart={t("hero.titleStart")}
        titleHighlight={t("hero.titleHighlight")}
        text={t("hero.text")}
        primary={{ label: tp("calculateCosts"), href: "/preisrechner" }}
        secondary={{ label: tp("requestProject"), href: "#anfrage" }}
      />
      <ProblemSection tag={t("keyword")} title={t("problem.title")} text={t("problem.text")} points={t.raw("problem.points") as string[]} />
      <FeatureGrid
        tag={tp("featuresTag")}
        title={tp("featuresTitle")}
        items={(t.raw("features") as { title: string; text: string }[]).map((f, i) => ({ ...f, icon: seoFeatureIcons[i] }))}
      />
      <PricingSection
        tag={tpr("pricing.tag")}
        title={tpr("pricing.title")}
        accent={tpr("pricing.accent")}
        text={tpr("pricing.text")}
        packages={await getPackages(locale)}
        trust={tpr.raw("pricing.trust") as string[]}
        highlight={page.highlightPackage}
      />
      <FaqSection items={t.raw("faq") as { q: string; a: string }[]} />
      <FunnelSection
        title={tp("seoFunnel.title")}
        accent={tp("seoFunnel.accent")}
        text={tp("seoFunnel.text")}
        source="branchen_seite"
        industry={page.industry}
        interests={page.interests}
      />
      <JsonLd data={await serviceJsonLd({ locale, name: t("keyword"), serviceType: t("keyword"), description: t("metaDescription"), href, city: page.city })} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: ts("breadcrumbHome"), href: "/" },
            { name: t("navLabel"), href },
          ],
          locale,
        )}
      />
    </>
  );
}
