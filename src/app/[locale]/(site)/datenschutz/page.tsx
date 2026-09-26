import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/layout/LegalPage";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return pageMetadata({ locale, href: "/datenschutz", title: t("privacy.title"), noindex: true });
}

/** Gliederung der tatsächlichen Datenflüsse dieser Website – Text vor Livegang juristisch prüfen lassen. */
export default async function DatenschutzPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("legal.privacy");
  return (
    <LegalPage title={t("title")}>
      <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{t("draft")}</p>
      <h2>{t("controller")}</h2>
      <p>
        {site.legalName} · <a href={`mailto:${site.email}`}>{site.email}</a> · {site.phone}
      </p>
      <h2>{t("formsTitle")}</h2>
      <p>{t("formsText")}</p>
      <h2>{t("calendlyTitle")}</h2>
      <p>{t("calendlyText")}</p>
      <h2>{t("videosTitle")}</h2>
      <p>{t("videosText")}</p>
      <h2>{t("rightsTitle")}</h2>
      <p>{t("rightsText")}</p>
    </LegalPage>
  );
}
