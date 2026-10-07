import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Camera, Clapperboard, Music } from "lucide-react";
import { ProductHero } from "@/components/product/ProductHero";
import { ProblemSection } from "@/components/product/ProblemSection";
import { FeatureGrid } from "@/components/product/FeatureGrid";
import { PricingSection } from "@/components/product/PricingSection";
import { FaqSection } from "@/components/product/FaqSection";
import { FunnelSection } from "@/components/product/FunnelSection";
import { PortfolioTeaser } from "@/components/home/PortfolioTeaser";
import { Process } from "@/components/home/Process";
import { BlogTeaser } from "@/components/home/BlogTeaser";
import { References } from "@/components/home/References";
import { IndustryPage } from "@/components/industry/IndustryPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeoPageBySlug, seoPages, type SeoPage } from "@/config/seo-pages";
import { routing, type Locale } from "@/i18n/routing";
import { getPackages } from "@/lib/packages";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

/**
 * SEO-Landingpages (Branchen, Leistungen, Premium-Media) – statisch gebaut, je Sprache eigener Slug.
 * Aufbau: Hero → Problem → Funktionen → Projekte → Ablauf → Pakete → Ratgeber → FAQ → Funnel.
 * Branchenseiten haben einen eigenen, branchenspezifischen Aufbau (IndustryPage).
 */
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
    // hreflang verknüpft /leistungen/software-gastronomie ↔ /en/services/restaurant-software
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
  const tpk = await getTranslations("packages");
  const ts = await getTranslations("schema");
  const href = hrefOf(page)(locale);
  const media = page.packages === "media";
  const section = media ? "mediaSection" : "softwareSection";

  const schema = (
    <>
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

  if (page.kind === "branche") {
    return (
      <>
        <IndustryPage page={page} locale={locale} />
        {schema}
      </>
    );
  }

  return (
    <>
      <ProductHero
        badge={t("hero.badge")}
        titleStart={t("hero.titleStart")}
        titleHighlight={t("hero.titleHighlight")}
        text={t("hero.text")}
        primary={{ label: media ? tp("requestProject") : tp("requestConsultation"), href: "#anfrage" }}
        secondary={{ label: tp("calculateCosts"), href: "/preisrechner" }}
        stats={t.raw("hero.stats") as { value: string; label: string }[]}
        image={page.hero.image}
        imageAlt={t("hero.imageAlt")}
        frame={page.hero.frame === "photo" ? "photo" : "browser"}
        url={page.hero.url}
      />
      {media && <References className="pb-6" />}
      <ProblemSection tag={t("keyword")} title={t("problem.title")} text={t("problem.text")} points={t.raw("problem.points") as string[]} story={t.has("problem.story") ? (t.raw("problem.story") as { label: string; quote: string; text: string }) : undefined} />
      <FeatureGrid
        tag={tp("featuresTag")}
        title={t("featuresTitle")}
        items={(t.raw("features") as { title: string; text: string }[]).map((f, i) => ({ ...f, icon: page.featureIcons[i] }))}
      />
      <PortfolioTeaser id="projekte" ids={page.portfolio} title={tp("portfolioTitle")} text={tp("portfolioText")} />
      {!media && <Process />}
      <PricingSection
        tag={tpk(`${section}.tag`)}
        title={tpk(`${section}.title`)}
        accent={tpk(`${section}.accent`)}
        text={tpk(`${section}.text`)}
        packages={await getPackages(locale, page.packages)}
        trust={tpk.raw(`${section}.trust`) as string[]}
        highlight={page.highlightPackage}
        icons={media ? [Camera, Music, Clapperboard] : undefined}
      />
      <BlogTeaser slugs={page.blog} title={tp("guidesTitle")} />
      <FaqSection items={t.raw("faq") as { q: string; a: string }[]} />
      <FunnelSection
        title={tp("seoFunnel.title")}
        accent={tp("seoFunnel.accent")}
        text={tp("seoFunnel.text")}
        source="ki_seite"
        industry={page.industry}
        interests={page.interests}
      />
      {schema}
    </>
  );
}
