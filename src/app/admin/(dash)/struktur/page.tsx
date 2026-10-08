import type { Metadata } from "next";
import { SiteMap } from "@/components/admin/SiteMap";
import type { SiteReport } from "@/lib/admin/site-findings";
import { getSiteReport, requestOrigin } from "@/lib/admin/site-report";
import type { SiteStructure } from "@/lib/admin/site-structure";
import { routing, type Locale } from "@/i18n/routing";

export const metadata: Metadata = { title: "Seitenstruktur" };
// Das Einlesen ruft jede Seite der Website einmal ab.
export const maxDuration = 120;

/**
 * Tägliche Übersicht über die Website: Was ist auffällig, was hat sich geändert, welche Bereiche laufen –
 * dazu die Karte aller Seiten mit Links, Call-to-Actions und echten Klickwegen sowie die Suchbegriffe.
 */
export default async function StrukturPage({ searchParams }: { searchParams: Promise<{ sprache?: string }> }) {
  const requested = (await searchParams).sprache as Locale;
  const locale = routing.locales.includes(requested) ? requested : routing.defaultLocale;

  let data: { site: SiteStructure; report: SiteReport } | null = null;
  let error = "";
  try {
    data = await getSiteReport(await requestOrigin(), locale);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unbekannter Fehler";
  }

  return (
    <div className="mx-auto max-w-[1480px]">
      <SiteMap data={data?.site ?? null} report={data?.report ?? null} error={error} locale={locale} />
    </div>
  );
}
