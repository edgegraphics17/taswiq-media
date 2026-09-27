import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { industryPages, mediaPage, servicePages, type SeoPage } from "@/config/seo-pages";
import { portfolioItems } from "@/config/content";
import { allPackages } from "@/config/packages";
import { posts } from "@/content/blog";
import { routing, type Locale } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { formatEUR } from "@/lib/format";

/**
 * /llms.txt – Kurzprofil für KI-Systeme (GEO), wie bei asapmarketing.de.
 * Wird aus denselben Configs & Übersetzungen erzeugt wie die Website → nie veraltet.
 * Profil auf Deutsch, Seitenliste für beide Sprachen.
 */
export const dynamic = "force-static";

export async function GET() {
  const ts = await getTranslations({ locale: "de", namespace: "schema" });
  const tpk = await getTranslations({ locale: "de", namespace: "packages" });
  const tpo = await getTranslations({ locale: "de", namespace: "portfolio" });
  const tpf = (key: `${string}.title`) => tpo(`items.${key}` as Parameters<typeof tpo>[0]);
  const tseoDe = await getTranslations({ locale: "de", namespace: "seoPages" });

  const pageUrl = (p: SeoPage, l: Locale) => absoluteUrl({ pathname: "/leistungen/[slug]", params: { slug: p.slugs[l] } }, l);

  const pages = await Promise.all(
    routing.locales.map(async (locale) => {
      const tn = await getTranslations({ locale, namespace: "nav" });
      const tseo = await getTranslations({ locale, namespace: "seoPages" });
      return [
        `### ${locale.toUpperCase()}`,
        `- Home: ${absoluteUrl("/", locale)}`,
        `- ${tn("portfolio")}: ${absoluteUrl("/portfolio", locale)}`,
        `- ${tn("calculator")}: ${absoluteUrl("/preisrechner", locale)}`,
        ...[...servicePages, ...industryPages, mediaPage].map((p) => `- ${tseo(`${p.id}.navLabel`)}: ${pageUrl(p, locale)}`),
      ].join("\n");
    }),
  );

  const cases = portfolioItems.filter((p) => p.kind === "live" || p.kind === "demo" || p.kind === "internal");
  const media = portfolioItems.filter((p) => p.kind === "film" || p.kind === "reel" || p.kind === "case");

  const body = `# ${site.name}

> ${ts("orgDescription")}
> Inhaber: ${site.owner}. Einsatzgebiet: ${(ts.raw("areaServed") as string[]).join(", ")}. Sprachen: Deutsch, English, Arabisch.
> Technologie-Partner: ${site.partner.name} (${site.partner.city}) – KI-Technologie & Methodik. Beratung, Design und Entwicklung: TasWiq Media in Deutschland.

## Schwerpunkt

Individuelle Software und Systeme für kleine und mittlere Unternehmen – gebaut mit KI-gestützter Entwicklung, deshalb in Wochen statt Monaten:
${servicePages.map((p) => `- ${tseoDe(`${p.id}.navLabel`)}: ${tseoDe(`${p.id}.metaDescription`)}`).join("\n")}

## Branchen

${industryPages.map((p) => `- ${tseoDe(`${p.id}.navLabel`)}: ${pageUrl(p, "de")}`).join("\n")}

## Premium-Media (ausgewählte Projekte)

Video- und Content-Produktion für Events, Festivals, Artists und Marken – Referenzen u. a. Hyatt Centric, One World Hotel, Tomorrowland, Afro Nation, Audi, Lufthansa, adidas.
- ${tseoDe("media.navLabel")}: ${pageUrl(mediaPage, "de")}

## Pakete (Einstiegspreise, Endpreise nach § 19 UStG)

${allPackages.map((p) => `- ${tpk(`${p.id}.name`)}: ${p.from ? "ab " : ""}${formatEUR(p.price)} ${tpk(`units.${p.billing}`)} – ${tpk(`${p.id}.audience`)}`).join("\n")}

## Software-Projekte

${cases.map((c) => `- ${tpf(`${c.id}.title`)}${c.location ? ` (${c.location})` : ""}${c.media.type === "site" ? ` – ${c.media.url}` : ""}`).join("\n")}

## Media-Referenzen

${media.map((c) => `- ${tpf(`${c.id}.title`)}${c.location ? ` (${c.location})` : ""}${c.media.type === "video" && c.media.youtube ? ` – ${c.media.youtube}` : ""}`).join("\n")}

## Ratgeber (Deutsch)

${posts.map((p) => `- ${p.title}: ${absoluteUrl({ pathname: "/blog/[slug]", params: { slug: p.slug } }, "de")}`).join("\n")}

## Seiten

${pages.join("\n\n")}

## Kontakt

- E-Mail: ${site.email}
- Telefon: ${site.phone}
- Antwort innerhalb von 24 Stunden
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
