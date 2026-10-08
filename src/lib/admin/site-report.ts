import "server-only";
import { headers } from "next/headers";
import { isDemoMode } from "@/lib/env";
import { getPathStats, listSiteScans, saveSiteScan } from "@/lib/db";
import { demoAnalytics } from "@/lib/admin/demo";
import { getLeads, getTasks } from "@/lib/admin/data";
import { buildReport, snapshotOf, type SiteReport } from "@/lib/admin/site-findings";
import { getSiteStructure, scanSite, type SiteStructure } from "@/lib/admin/site-structure";
import type { Locale } from "@/i18n/routing";
import type { PathStats } from "@/types/database";

/** Adresse, unter der das Dashboard gerade läuft – von dort wird die Website eingelesen. */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${h.get("x-forwarded-proto") ?? (/^(localhost|127\.|\[::1\])/.test(host) ? "http" : "https")}://${host}`;
}

/** Beispiel-Klickwege für den lokalen Demo-Modus (ohne Backend) */
function demoPaths(): PathStats {
  const a = demoAnalytics(30);
  return {
    days: 30,
    since: a.since,
    pages: a.pages.map((p, i) => ({ ...p, entries: Math.round(p.views * (i ? 0.3 : 0.8)), exits: Math.round(p.views * (i === 2 ? 0.85 : 0.4)), search: Math.round(p.visitors * 0.4), ai: Math.round(p.visitors * 0.07) })),
    transitions: [
      { from: "/", to: "/preisrechner", n: 96 },
      { from: "/", to: "/portfolio", n: 71 },
      { from: "/", to: "/blog", n: 38 },
      { from: "/portfolio", to: "/preisrechner", n: 22 },
      { from: "/blog", to: "/", n: 12 },
    ],
  };
}

/**
 * Alles, was die Seitenstruktur zeigt: eingelesene Website + Befunde mit Lösungsvorschlag, Besucherzahlen, Verlauf.
 * Fällt eine Quelle aus (Statistik, Aufgaben, Verlauf), bleibt der Rest nutzbar.
 * Speichert den Stand einmal je Tag fürs „Was hat sich geändert?“.
 */
export async function getSiteReport(origin: string, locale: Locale, fresh = false): Promise<{ site: SiteStructure; report: SiteReport }> {
  const demo = isDemoMode();
  const [site, paths, tasks, scans, leads] = await Promise.all([
    fresh ? scanSite(origin, locale) : getSiteStructure(origin, locale),
    demo ? demoPaths() : getPathStats(30).catch(() => null),
    getTasks().catch(() => []),
    demo ? [] : listSiteScans(locale).catch(() => []),
    getLeads().catch(() => []),
  ]);
  const report = buildReport(site, paths, tasks, scans, leads);
  if (!demo) {
    const data = snapshotOf(site, report);
    const today = scans.find((s) => s.day === site.scannedAt.slice(0, 10));
    if (!today || JSON.stringify(today.data) !== JSON.stringify(data)) await saveSiteScan(locale, data).catch((e) => console.error("[struktur] Stand nicht gespeichert", e));
  }
  return { site, report };
}
