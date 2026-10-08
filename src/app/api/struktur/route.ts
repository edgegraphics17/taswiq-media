import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { env, isBackendConfigured } from "@/lib/env";
import { getSiteReport } from "@/lib/admin/site-report";
import { STRUCTURE_TAG } from "@/lib/admin/site-structure";
import { routing, type Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Bericht der Seitenstruktur als JSON – für das Agenten-Team (`team/bin/team struktur`) und Claude-Sitzungen:
 * Befunde mit Begründung, betroffenen Seiten, Lösungsschritten und dem Stand der zugehörigen Aufgabe.
 * Zugang nur mit dem Backend-Token (Header `x-taswiq-token`). `?neu=1` liest die Website frisch ein, `?sprache=en` die englische.
 */
export async function GET(req: NextRequest) {
  const given = Buffer.from(req.headers.get("x-taswiq-token") ?? "");
  const expected = Buffer.from(env.backendToken);
  if (!isBackendConfigured() || given.length !== expected.length || !timingSafeEqual(given, expected)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requested = req.nextUrl.searchParams.get("sprache") as Locale;
  const locale = routing.locales.includes(requested) ? requested : routing.defaultLocale;
  const fresh = Boolean(req.nextUrl.searchParams.get("neu"));
  try {
    // Frisch eingelesen wird direkt; der gemerkte Stand des Dashboards wird zusätzlich verworfen, damit beide dasselbe zeigen.
    if (fresh) revalidateTag(STRUCTURE_TAG);
    const { site, report } = await getSiteReport(req.nextUrl.origin, locale, fresh);
    return NextResponse.json({
      eingelesen: site.scannedAt,
      sprache: locale,
      ueberblick: report.summary,
      veraenderung: report.diff,
      befunde: report.findings.map((f) => ({ id: f.id, stufe: f.level, thema: f.topic, titel: f.title, warum: f.why, betroffen: f.items, loesung: f.steps, aufgabe: f.task ? { status: f.task.status, uebergabe: f.task.run_state } : null, aufgaben_key: f.key, kategorie: f.category, aufwand: f.effort })),
      bereiche: report.areas,
      suchbegriffe: site.keywords,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "scan" }, { status: 502 });
  }
}
