import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSeoPageById } from "@/config/seo-pages";
import { site } from "@/config/site";
import { DemoShell } from "@/demos/kit/Shell";
import { demoPricing, demos, getDemo } from "@/demos/registry";
import { ORG_ID } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const def = getDemo(slug);
  if (!def) return {};
  const url = `${site.url}/demo/${def.slug}`;
  return {
    title: { absolute: def.metaTitle },
    description: def.metaDescription,
    alternates: { canonical: url },
    openGraph: { type: "website", locale: "de_DE", url, siteName: site.name, title: def.metaTitle, description: def.metaDescription, images: [{ url: `${site.url}${def.image}`, width: 1440, height: 848 }] },
    twitter: { card: "summary_large_image", title: def.metaTitle, description: def.metaDescription, images: [`${site.url}${def.image}`] },
  };
}

/** Eine Demo: Hülle (Leiste, Tour, Infos) + App der Musterfirma. */
export default async function DemoPage({ params }: Props) {
  const { slug } = await params;
  const def = getDemo(slug);
  if (!def) notFound();
  const tseo = await getTranslations({ locale: "de", namespace: "seoPages" });
  const industry = getSeoPageById(def.industry);

  return (
    <>
      <DemoShell def={def} pricing={demoPricing(def)} industryHref={`/leistungen/${industry.slugs.de}`} industryLabel={tseo(`${def.industry}.navLabel`)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${def.title} – Demo (${def.firm})`,
          description: def.metaDescription,
          url: `${site.url}/demo/${def.slug}`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "de-DE",
          isAccessibleForFree: true,
          featureList: def.features.map((f) => f.title),
          provider: { "@id": ORG_ID },
        }}
      />
    </>
  );
}
