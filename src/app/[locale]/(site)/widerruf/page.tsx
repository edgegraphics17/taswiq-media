import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/layout/LegalPage";
import { WiderrufContent } from "@/components/legal/WiderrufContent";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: Locale }> };

/** Widerrufsbelehrung – Entwurf, bewusst `noindex` bis zur juristischen Freigabe. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return pageMetadata({ locale, href: "/widerruf", title: t("widerruf.title"), noindex: true });
}

export default async function WiderrufPage({ params }: Props) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("legal.widerruf");
  const tLegal = await getTranslations("legal");
  return (
    <LegalPage title={t("title")}>
      <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{tLegal("draftNote")}</p>
      <p>{t("intro")}</p>
      <WiderrufContent />
    </LegalPage>
  );
}
