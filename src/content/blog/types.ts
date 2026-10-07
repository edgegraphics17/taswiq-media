import type { SeoPageId } from "@/config/seo-pages";

/**
 * Ratgeber-Artikel (Blog). Inhalte liegen als typisierte Daten vor – kein CMS nötig,
 * statisch gebaut, voll crawlbar. Sprache: Deutsch (Zielmarkt DACH).
 *
 * Inline-Auszeichnung in Texten:
 *   **fett**              → <strong>
 *   [Linktext](/pfad)     → interner Link (next/link), externe URLs öffnen im neuen Tab
 */

export type BlogCategory = "branchen" | "software" | "ki" | "ratgeber" | "media";

export type BlogBlock =
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { table: { head: string[]; rows: string[][]; caption?: string } }
  | { tip: string };

export interface BlogSection {
  h2: string;
  blocks: BlogBlock[];
}

export interface BlogPost {
  slug: string;
  category: BlogCategory;
  title: string;
  /** Titel für Google (≤ 60 Zeichen, Suchwort vorn). Fehlt er, wird `title` genutzt. */
  seoTitle?: string;
  /** Meta-Description (≤ 160 Zeichen) */
  description: string;
  /** Primäres Keyword + Varianten */
  keywords: string[];
  /** ISO-Datum */
  date: string;
  updated?: string;
  /** Passende Landingpage (CTA-Box + interne Verlinkung) */
  page: SeoPageId;
  intro: string;
  /** Kurzfassung ganz oben – wird auch von KI-Suchen gern zitiert */
  takeaways: string[];
  sections: BlogSection[];
  faq: { q: string; a: string }[];
}
