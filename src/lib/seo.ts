import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { site, sameAs, hasAddress } from "@/config/site";
import { allPackages } from "@/config/packages";
import { getPathname } from "@/i18n/navigation";
import { routing, LOCALE_META, type Locale } from "@/i18n/routing";

/**
 * Metadata & JSON-LD (Phase 5 · Geo-SEO) – zweisprachig.
 * Schema-Strategie nach asap: ein @graph mit Organisation (ProfessionalService +
 * LocalBusiness), WebSite und OfferCatalog – Unterseiten ergänzen Service,
 * FAQPage, BreadcrumbList und WebApplication (Rechner).
 *
 * hreflang: Jede Seite verweist auf ALLE Sprachfassungen inkl. sich selbst
 * (de-DE, en, x-default → Deutsch). Canonical zeigt immer auf die eigene Sprache.
 */

/** Link-Ziel ohne Hash – so, wie getPathname() es für kanonische URLs braucht */
export type PathHref = Parameters<typeof getPathname>[0]["href"];

export const ORG_ID = `${site.url}/#organisation`;
export const WEBSITE_ID = `${site.url}/#website`;
export const PARTNER_ID = `${site.url}/#partner-winsym`;

/** Absolute URL einer internen Route in einer Sprache, z. B. ("/preisrechner", "en") → https://…/en/pricing-calculator */
export function absoluteUrl(href: PathHref, locale: Locale) {
  const path = getPathname({ href, locale });
  return path === "/" ? site.url : `${site.url}${path}`;
}

/**
 * `hrefFor` liefert je Sprache das Link-Ziel – nötig, weil SEO-Slugs pro Sprache verschieden sind.
 * Für normale Seiten reicht eine feste Route.
 */
export function languageAlternates(hrefFor: (l: Locale) => PathHref, locale: Locale): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[LOCALE_META[l].hreflang] = absoluteUrl(hrefFor(l), l);
  languages["x-default"] = absoluteUrl(hrefFor(routing.defaultLocale), routing.defaultLocale);
  return { canonical: absoluteUrl(hrefFor(locale), locale), languages };
}

/**
 * Google zeigt rund 60 Zeichen eines Titels. Lange Titel bekommen deshalb keinen Marken-Zusatz („| TasWiq Media.“),
 * damit das Suchwort vorn vollständig sichtbar bleibt; kurze Titel behalten ihn.
 */
export const BRAND_SUFFIX_MAX = 44;
export function seoTitle(title: string): Metadata["title"] {
  return title.length > BRAND_SUFFIX_MAX ? { absolute: title } : title;
}

/** Vorschaubild für geteilte Links (WhatsApp, LinkedIn, Slack) – das generierte OG-Bild der jeweiligen Sprache. */
export const defaultOgImage = (locale: Locale) => `${site.url}/${locale}/opengraph-image/default`;

export async function pageMetadata({
  locale,
  href,
  title,
  description,
  keywords = [],
  image,
  noindex,
}: {
  locale: Locale;
  href: PathHref | ((l: Locale) => PathHref);
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });
  const hrefFor = typeof href === "function" ? href : () => href;
  const alternates = languageAlternates(hrefFor, locale);
  const url = alternates.canonical as string;
  const ogImage = image ?? defaultOgImage(locale);
  return {
    title: seoTitle(title),
    description,
    keywords: [...keywords, ...(t.raw("keywords") as string[])].slice(0, 14),
    alternates,
    openGraph: {
      type: "website",
      locale: LOCALE_META[locale].og,
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => LOCALE_META[l].og),
      url,
      siteName: site.name,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export async function organizationJsonLd(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "schema" });
  const tp = await getTranslations({ locale, namespace: "packages" });
  const address = hasAddress()
    ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          postalCode: site.address.postalCode,
          addressLocality: site.address.city,
          addressRegion: site.address.region,
          addressCountry: site.address.country,
        },
      }
    : {};
  const geo = site.geo ? { geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng } } : {};
  const home = absoluteUrl("/", locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ProfessionalService", "LocalBusiness", "Organization"],
        "@id": ORG_ID,
        name: site.name,
        alternateName: site.legalName,
        url: home,
        logo: `${site.url}/icon.svg`,
        image: `${site.url}/${locale}/opengraph-image/default`,
        description: t("orgDescription"),
        slogan: t("slogan"),
        email: site.email,
        telephone: site.phone.replace(/\s/g, "-"),
        founder: { "@type": "Person", name: site.owner },
        priceRange: site.priceRange,
        areaServed: (t.raw("areaServed") as string[]).map((name) => ({ "@type": "Country", name })),
        knowsAbout: t.raw("knowsAbout") as string[],
        ...address,
        ...geo,
        ...(sameAs().length ? { sameAs: sameAs() } : {}),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: t("contactType"),
          email: site.email,
          telephone: site.phone.replace(/\s/g, "-"),
          availableLanguage: ["German", "English", "Arabic"],
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t("catalogName"),
          itemListElement: allPackages.map((p) => ({
            "@type": "Offer",
            priceCurrency: "EUR",
            priceSpecification: {
              "@type": "PriceSpecification",
              ...(p.from ? { minPrice: String(p.price) } : { price: String(p.price) }),
              priceCurrency: "EUR",
            },
            itemOffered: {
              "@type": "Service",
              name: tp(`${p.id}.name`),
              description: `${tp(`${p.id}.audience`)}. ${(tp.raw(`${p.id}.features`) as string[]).join(", ")}.`,
            },
          })),
        },
        // Technologie-Partner: winsym.ai (KI-Technologie, Kuala Lumpur)
        knowsLanguage: ["de", "en", "ar"],
        sponsor: { "@id": PARTNER_ID },
      },
      {
        "@type": "Organization",
        "@id": PARTNER_ID,
        name: site.partner.name,
        url: site.partner.url,
        description: t("partnerDescription"),
        address: { "@type": "PostalAddress", addressLocality: site.partner.city, addressCountry: "MY" },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: home,
        name: site.name,
        inLanguage: LOCALE_META[locale].hreflang,
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function faqJsonLd(items: { q: string; a: string }[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: LOCALE_META[locale].hreflang,
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function breadcrumbJsonLd(items: { name: string; href: PathHref }[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.href, locale) })),
  };
}

export async function serviceJsonLd({
  locale,
  name,
  description,
  href,
  serviceType,
  city,
}: {
  locale: Locale;
  name: string;
  description: string;
  href: PathHref;
  serviceType: string;
  city?: string;
}) {
  const t = await getTranslations({ locale, namespace: "schema" });
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType,
    description,
    inLanguage: LOCALE_META[locale].hreflang,
    url: absoluteUrl(href, locale),
    provider: { "@id": ORG_ID },
    areaServed: city ? { "@type": "City", name: city } : (t.raw("areaServed") as string[]).map((n) => ({ "@type": "Country", name: n })),
  };
}

export async function calculatorJsonLd(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "schema" });
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("calculatorName"),
    url: absoluteUrl("/preisrechner", locale),
    applicationCategory: "BusinessApplication",
    operatingSystem: t("operatingSystem"),
    inLanguage: LOCALE_META[locale].hreflang,
    description: t("calculatorDescription"),
    publisher: { "@id": ORG_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
}
