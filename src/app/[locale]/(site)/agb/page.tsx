import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/layout/LegalPage";
import { AgbContent } from "@/components/legal/AgbContent";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

/**
 * AGB – Entwurf. Bewusst `noindex`: erst nach juristischer Prüfung indexierbar schalten,
 * sonst stehen ungeprüfte Vertragsbedingungen in den Suchergebnissen.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return pageMetadata({ locale, href: "/agb", title: t("agb.title"), noindex: true });
}

export default async function AgbPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("legal.agb");
  const tLegal = await getTranslations("legal");
  return (
    <LegalPage title={t("title")}>
      <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{tLegal("draftNote")}</p>
      <p>{t("intro")}</p>
      <AgbContent />
    </LegalPage>
  );
}
