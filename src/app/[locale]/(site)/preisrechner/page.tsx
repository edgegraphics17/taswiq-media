import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Calculator } from "@/components/calculator/Calculator";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { getPricingData } from "@/lib/pricing-source";
import { breadcrumbJsonLd, calculatorJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 300; // Preise aus Supabase max. 5 Min. alt

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  // → /preisrechner (de) · /en/pricing-calculator (en), beide per hreflang verknüpft
  return pageMetadata({ locale, href: "/preisrechner", title: t("calculator.title"), description: t("calculator.description"), keywords: t.raw("calculator.keywords") as string[] });
}

export default async function PreisrechnerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ts = await getTranslations("schema");
  const data = await getPricingData();
  return (
    <div className="relative">
      <Calculator data={data} />
      <JsonLd data={await calculatorJsonLd(locale)} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: ts("breadcrumbHome"), href: "/" },
            { name: ts("breadcrumbCalculator"), href: "/preisrechner" },
          ],
          locale,
        )}
      />
    </div>
  );
}
