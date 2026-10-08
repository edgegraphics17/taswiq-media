import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { StarterOfferPage } from "@/components/offer/StarterOfferPage";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/routing";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

/** Einstiegsangebot: Bestellsystem Start mit festem Umfang → /einstiegsangebot (de) · /en/starter-offer (en) */
type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "starterOffer" });
  return pageMetadata({ locale, href: "/einstiegsangebot", title: t("metaTitle"), description: t("metaDescription"), keywords: t.raw("keywords") as string[] });
}

export default async function EinstiegsangebotPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("starterOffer");
  const ts = await getTranslations("schema");
  return (
    <>
      <StarterOfferPage locale={locale} />
      <JsonLd data={await serviceJsonLd({ locale, name: t("metaTitle"), serviceType: t("breadcrumb"), description: t("metaDescription"), href: "/einstiegsangebot" })} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: ts("breadcrumbHome"), href: "/" },
            { name: t("breadcrumb"), href: "/einstiegsangebot" },
          ],
          locale,
        )}
      />
    </>
  );
}
