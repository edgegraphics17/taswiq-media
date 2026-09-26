import type { Metadata } from "next";
import { site, sameAs, hasAddress } from "@/config/site";
import { pipelinePricing } from "@/config/pipeline";

/**
 * Metadata & JSON-LD (Phase 5 · Geo-SEO).
 * Schema-Strategie nach asap: ein @graph mit Organisation (ProfessionalService +
 * LocalBusiness), WebSite und OfferCatalog – Unterseiten ergänzen Service,
 * FAQPage, BreadcrumbList und WebApplication (Rechner).
 */

export const ORG_ID = `${site.url}/#organisation`;
export const WEBSITE_ID = `${site.url}/#website`;

export const baseKeywords = [
  "Medienagentur Gastronomie",
  "Festival Videograf",
  "KI Marketing Agentur",
  "Aftermovie erstellen lassen",
  "Food Fotograf",
  "Restaurant Social Media Agentur",
  "Eventvideograf",
  "KI Content Produktion",
  "KI Voiceover",
  "Content Agentur Gastronomie",
];

export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  const url = `${site.url}${path}`;
  return {
    title,
    description,
    keywords: [...keywords, ...baseKeywords].slice(0, 14),
    alternates: { canonical: url, languages: { "de-DE": url } },
    openGraph: {
      type: "website",
      locale: site.locale,
      url,
      siteName: site.name,
      title,
      description,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function organizationJsonLd() {
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

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ProfessionalService", "LocalBusiness", "Organization"],
        "@id": ORG_ID,
        name: site.name,
        alternateName: site.legalName,
        url: site.url,
        logo: `${site.url}/icon.svg`,
        image: `${site.url}/opengraph-image`,
        description:
          "Medienagentur für Gastronomie, Festivals und Musik: Premium-Videografie und Fotografie, skaliert mit KI-Workflows – Content-Pipelines, KI-Voiceover, Websites und Automatisierung.",
        slogan: "Ein Drehtag. Content für ein ganzes Quartal.",
        email: site.email,
        telephone: site.phone.replace(/\s/g, "-"),
        founder: { "@type": "Person", name: site.owner },
        priceRange: site.priceRange,
        areaServed: site.areaServed.map((name) => ({ "@type": "Country", name })),
        knowsLanguage: ["de", "en", "ar"],
        knowsAbout: [
          "Videoproduktion",
          "Eventfotografie",
          "Food-Fotografie",
          "Aftermovies",
          "Social-Media-Marketing",
          "Generative KI",
          "KI-Voiceover",
          "Marketing-Automatisierung mit n8n",
        ],
        ...address,
        ...geo,
        ...(sameAs().length ? { sameAs: sameAs() } : {}),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "Vertrieb und Beratung",
          email: site.email,
          telephone: site.phone.replace(/\s/g, "-"),
          availableLanguage: ["German", "English", "Arabic"],
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Pakete",
          itemListElement: pipelinePricing.packages.map((p) => ({
            "@type": "Offer",
            price: p.price.replace(/[^\d]/g, ""),
            priceCurrency: "EUR",
            ...(p.unit === "pro Monat"
              ? { priceSpecification: { "@type": "UnitPriceSpecification", price: p.price.replace(/[^\d]/g, ""), priceCurrency: "EUR", unitText: "Monat" } }
              : {}),
            itemOffered: { "@type": "Service", name: p.name, description: `${p.audience}. ${p.features.join(", ")}.` },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: site.url,
        name: site.name,
        inLanguage: "de-DE",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}

export function serviceJsonLd({ name, description, path, serviceType, city }: { name: string; description: string; path: string; serviceType: string; city?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType,
    description,
    url: `${site.url}${path}`,
    provider: { "@id": ORG_ID },
    areaServed: city ? { "@type": "City", name: city } : site.areaServed.map((name) => ({ "@type": "Country", name })),
  };
}

export function calculatorJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Preisrechner von TasWiq Media.",
    url: `${site.url}/preisrechner`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Alle, im Browser",
    inLanguage: "de-DE",
    description: "Video, Foto, Website oder KI-Workflows zusammenstellen und einen unverbindlichen Kostenrahmen erhalten. Richtwert, kein Angebot.",
    publisher: { "@id": ORG_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
}
