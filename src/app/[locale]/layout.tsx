import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { fontVars } from "@/app/fonts";
import { routing, LOCALE_META } from "@/i18n/routing";
import { languageAlternates, organizationJsonLd } from "@/lib/seo";
import { site } from "@/config/site";
import "../globals.css";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

/** Beide Sprachen werden statisch vorgerendert (SSG) */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("siteTitle"), template: t("titleTemplate") },
    description: t("description"),
    keywords: t.raw("keywords") as string[],
    applicationName: site.name,
    authors: [{ name: site.owner }],
    creator: site.owner,
    // Canonical + hreflang (de-DE, en, x-default) – Unterseiten überschreiben mit ihrer eigenen Route
    alternates: languageAlternates(() => "/", locale),
    openGraph: {
      type: "website",
      locale: LOCALE_META[locale].og,
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      siteName: site.name,
      title: t("ogTitle"),
      description: t("ogDescription"),
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 } },
    formatDetection: { telephone: false },
    category: t("category"),
  };
}

/** Nur diese Namespaces brauchen Client Components – der Rest bleibt auf dem Server (kleineres RSC-Payload). */
const CLIENT_NAMESPACES = ["common", "nav", "languageSwitcher", "funnel", "contactForm", "leadResult", "calculator", "portfolio", "site"] as const;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <html lang={locale} className={fontVars}>
      <body>
        <NextIntlClientProvider locale={locale} messages={clientMessages}>
          <MotionProvider>{children}</MotionProvider>
        </NextIntlClientProvider>
        <JsonLd data={await organizationJsonLd(locale)} />
        <SpeedInsights />
      </body>
    </html>
  );
}
