import { site } from "@/config/site";
import { seoPages } from "@/config/seo-pages";
import { pipelinePricing } from "@/config/pipeline";
import { portfolio } from "@/config/content";

/**
 * /llms.txt – Kurzprofil für KI-Systeme (GEO), wie bei asapmarketing.de.
 * Wird aus denselben Configs erzeugt wie die Website → nie veraltet.
 */
export const dynamic = "force-static";

export function GET() {
  const cases = portfolio.items.filter((p) => p.kind === "case" && p.location);
  const body = `# ${site.name}

> Medienagentur für Gastronomie, Festivals und Musik. Premium-Videografie und Fotografie vor Ort,
> skaliert mit KI-Workflows: aus einem Drehtag werden 12–30 Clips in allen Formaten, Längen und Sprachen.
> Inhaber: ${site.owner}. Einsatzgebiet: ${site.areaServed.join(", ")}.

## Leistungen

- Video & Aftermovies: Imagefilme, Restaurant-Filme, Festival-Aftermovies, Reels in 4K
- Fotografie: Food, Location, Event, Artist
- Social-Media-Content: Reels, Stories, Posts, Planung und Posting
- KI-Audio & Voiceover: Sprachfassungen in DE, EN, AR, TR
- KI-Video & Visuals: generierte Szenen, Visualizer, Ad-Varianten
- Web & Automatisierung: Websites, digitale Speisekarten, n8n-Workflows

## Pakete (Endpreise, § 19 UStG)

${pipelinePricing.packages.map((p) => `- ${p.name}: ${p.price} ${p.unit} – ${p.audience}`).join("\n")}

## Referenzprojekte

${cases.map((c) => `- ${c.title} (${c.location})${c.youtube ? ` – ${c.youtube}` : ""}`).join("\n")}

## Seiten

- Startseite: ${site.url}/
- Content-Pipeline: ${site.url}/content-pipeline
- Preisrechner: ${site.url}/preisrechner
${seoPages.map((p) => `- ${p.navLabel}: ${site.url}/leistungen/${p.slug}`).join("\n")}

## Kontakt

- E-Mail: ${site.email}
- Telefon: ${site.phone}
- Antwort innerhalb von 24 Stunden
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
