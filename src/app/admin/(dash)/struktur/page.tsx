import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteMap } from "@/components/admin/SiteMap";
import { getAnalyticsData } from "@/lib/admin/data";
import { getSiteStructure, type SiteStructure } from "@/lib/admin/site-structure";
import { routing, type Locale } from "@/i18n/routing";

export const metadata: Metadata = { title: "Seitenstruktur" };
// Das Einlesen ruft jede Seite der Website einmal ab.
export const maxDuration = 120;

/** Alle Seiten der Website als Karte: wie sie verlinkt sind, wo die Call-to-Actions stehen, wo ein Weg zum Angebot fehlt. */
export default async function StrukturPage({ searchParams }: { searchParams: Promise<{ sprache?: string }> }) {
  const requested = (await searchParams).sprache as Locale;
  const locale = routing.locales.includes(requested) ? requested : routing.defaultLocale;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const origin = `${h.get("x-forwarded-proto") ?? (/^(localhost|127\.|\[::1\])/.test(host) ? "http" : "https")}://${host}`;

  let data: SiteStructure | null = null;
  let error = "";
  try {
    data = await getSiteStructure(origin, locale);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unbekannter Fehler";
  }
  // Aufrufe der letzten 30 Tage je Seite – fällt die Statistik aus, bleibt die Karte trotzdem nutzbar.
  const views = await getAnalyticsData(30)
    .then((a) => Object.fromEntries(a.pages.map((p) => [p.path.replace(/\/+$/, "") || "/", p.views])))
    .catch(() => ({}) as Record<string, number>);

  return (
    <div className="mx-auto max-w-[1480px]">
      <SiteMap data={data} error={error} views={views} locale={locale} />
    </div>
  );
}
