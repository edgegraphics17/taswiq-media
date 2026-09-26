import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * Wie bei asap: Suchmaschinen UND KI-Crawler ausdrücklich willkommen (GEO –
 * wer uns liest, kann uns in ChatGPT, Perplexity & Co. empfehlen).
 * Admin & API bleiben gesperrt.
 */
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot"];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }, ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow }))],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
