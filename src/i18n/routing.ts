import { defineRouting } from "next-intl/routing";

/**
 * i18n-Routing (next-intl, App Router).
 *  - Deutsch ist Standard und bleibt OHNE Präfix → alle bestehenden URLs & Rankings bleiben erhalten.
 *  - Englisch liegt unter /en mit übersetzten Pfaden (/en/pricing-calculator statt /en/preisrechner).
 *  - Die Schlüssel links sind die internen Routen (= Ordner in src/app/[locale]/(site)).
 *  - Slugs der SEO-Seiten sind pro Sprache verschieden → src/config/seo-pages.ts.
 */
export const routing = defineRouting({
  locales: ["de", "en"],
  defaultLocale: "de",
  localePrefix: "as-needed",
  // Die URL ist die einzige Quelle der Wahrheit: keine Redirects nach Browsersprache/Cookie.
  // Google rät davon ab (Crawler ohne Accept-Language), und SEO-Slugs ließen sich nicht übersetzen.
  localeDetection: false,
  localeCookie: false,
  pathnames: {
    "/": "/",
    "/preisrechner": { de: "/preisrechner", en: "/pricing-calculator" },
    "/einstiegsangebot": { de: "/einstiegsangebot", en: "/starter-offer" },
    "/einstiegsangebot/kurzfassung": { de: "/einstiegsangebot/kurzfassung", en: "/starter-offer/summary" },
    "/portfolio": "/portfolio",
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/leistungen/[slug]": { de: "/leistungen/[slug]", en: "/services/[slug]" },
    "/impressum": { de: "/impressum", en: "/legal-notice" },
    "/datenschutz": { de: "/datenschutz", en: "/privacy" },
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;

/** BCP-47-Tags für hreflang, og:locale und Intl */
export const LOCALE_META: Record<Locale, { hreflang: string; og: string; intl: string }> = {
  de: { hreflang: "de-DE", og: "de_DE", intl: "de-DE" },
  en: { hreflang: "en", og: "en_US", intl: "en-GB" },
};
