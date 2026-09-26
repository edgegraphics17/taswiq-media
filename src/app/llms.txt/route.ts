import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { seoPages } from "@/config/seo-pages";
import { portfolioItems } from "@/config/content";
import { pipelinePackages } from "@/config/pipeline";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { formatEUR } from "@/lib/format";

/**
 * /llms.txt – Kurzprofil für KI-Systeme (GEO), wie bei asapmarketing.de.
 * Wird aus denselben Configs & Übersetzungen erzeugt wie die Website → nie veraltet.
 * Profil auf Deutsch, Seitenliste für beide Sprachen.
 */
export const dynamic = "force-static";

export async function GET() {
  const t = await getTranslations({ locale: "de", namespace: "pipeline" });
  const ts = await getTranslations({ locale: "de", namespace: "schema" });
  const tp = await getTranslations({ locale: "de", namespace: "home.portfolio.items" });
  const cases = portfolioItems.filter((p) => p.kind === "case" && p.location);

  const pages = await Promise.all(
    routing.locales.map(async (locale) => {
      const tn = await getTranslations({ locale, namespace: "nav" });
      const tseo = await getTranslations({ locale, namespace: "seoPages" });
      return [
        `### ${locale.toUpperCase()}`,
        `- ${tn("home")}: ${absoluteUrl("/", locale)}`,
        `- ${tn("pipeline")}: ${absoluteUrl("/content-pipeline", locale)}`,
        `- ${tn("calculator")}: ${absoluteUrl("/preisrechner", locale)}`,
        ...seoPages.map((p) => `- ${tseo(`${p.id}.navLabel`)}: ${absoluteUrl({ pathname: "/leistungen/[slug]", params: { slug: p.slugs[locale] } }, locale)}`),
      ].join("\n");
    }),
  );

  const body = `# ${site.name}

> ${ts("orgDescription")}
> Inhaber: ${site.owner}. Einsatzgebiet: ${(ts.raw("areaServed") as string[]).join(", ")}. Sprachen: Deutsch, English.

## Leistungen

- Video & Aftermovies: Imagefilme, Restaurant-Filme, Festival-Aftermovies, Reels in 4K
- Fotografie: Food, Location, Event, Artist
- Social-Media-Content: Reels, Stories, Posts, Planung und Posting
- KI-Audio & Voiceover: Sprachfassungen in DE, EN, AR, TR
- KI-Video & Visuals: generierte Szenen, Visualizer, Ad-Varianten
- Web & Automatisierung: Websites, digitale Speisekarten, n8n-Workflows

## Pakete (Endpreise, § 19 UStG)

${pipelinePackages.map((p) => `- ${t(`pricing.packages.${p.id}.name`)}: ${formatEUR(p.price)} ${t(`pricing.units.${p.billing}`)} – ${t(`pricing.packages.${p.id}.audience`)}`).join("\n")}

## Referenzprojekte

${cases.map((c) => `- ${tp(`${c.id}.title`)} (${c.location})${c.youtube ? ` – ${c.youtube}` : ""}`).join("\n")}

## Seiten

${pages.join("\n\n")}

## Kontakt

- E-Mail: ${site.email}
- Telefon: ${site.phone}
- Antwort innerhalb von 24 Stunden
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
