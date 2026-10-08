import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/layout/LegalPage";
import { site, hasAddress } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return pageMetadata({ locale, href: "/impressum", title: t("legalNotice.title"), noindex: true });
}

export default async function ImpressumPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("legal.impressum");
  const tSite = await getTranslations("site");
  return (
    <LegalPage title={t("title")}>
      <h2>{t("provider")}</h2>
      <p>
        {site.legalName}
        <br />
        {hasAddress() ? (
          <>
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </>
        ) : (
          t("addressPlaceholder")
        )}
      </p>
      <h2>{t("contact")}</h2>
      <p>
        {t("phone")}: <a href={site.phoneHref}>{site.phone}</a>
        <br />
        {t("email")}: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <h2>{t("vat")}</h2>
      <p>{tSite("vatNote")}</p>
      <h2>{t("responsible")}</h2>
      <p>{t("responsibleText", { owner: site.owner })}</p>
    </LegalPage>
  );
}
