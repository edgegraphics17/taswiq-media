import { NextResponse, type NextRequest } from "next/server";
import { calculatorSchema } from "@/lib/validation";
import { isIndustry } from "@/config/pricing";
import { computeEstimate, sanitizeState, summaryRows } from "@/lib/pricing-engine";
import { getPricingData } from "@/lib/pricing-source";
import { localizeOptions } from "@/lib/pricing-i18n";
import { getCalcI18n } from "@/lib/pricing-i18n.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/calculator – speichert eine abgeschlossene Kalkulation (Ergebnis-Schritt).
 * Preis wird hier NEU berechnet (nie vom Client übernommen) und mit der
 * Preislisten-Version gespeichert. Die ID wird bei einer Anfrage mitgeschickt →
 * Lead und Kalkulation sind in Supabase verknüpft.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`calc:${clientIp(req.headers)}`, 20, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "rateLimit" }, { status: 429 });
  }
  const parsed = calculatorSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });

  const data = await getPricingData();
  const state = sanitizeState(parsed.data.state, data);
  // Gespeicherte Kalkulationen sind für das (deutsche) Dashboard – Labels daher immer DE
  const de = await getCalcI18n("de");
  const estimate = computeEstimate(state, Number.POSITIVE_INFINITY, data, de);
  const services = (state.leistungen as string[]) ?? [];
  if (!services.length) return NextResponse.json({ ok: false, error: "noService" }, { status: 422 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, id: null, estimate });

  const { data: row, error } = await supabase
    .from("calculator_requests")
    .insert({
      session_id: parsed.data.sessionId ?? null,
      industry: isIndustry(state.branche) ? state.branche : "andere",
      service_ids: services,
      state: JSON.parse(JSON.stringify(state)),
      summary: summaryRows(state, localizeOptions(data, de), de),
      line_items: JSON.parse(JSON.stringify({ einmalig: estimate.einmalig, monatlich: estimate.monatlich })),
      estimate_min: estimate.von,
      estimate_max: estimate.bis,
      monthly_total: estimate.summeMtl,
      pricing_version: data.konfig.version,
      utm: parsed.data.attribution ?? {},
      referrer: parsed.data.attribution?.referrer ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[calculator] Insert fehlgeschlagen", error);
    return NextResponse.json({ ok: true, id: null, estimate });
  }
  return NextResponse.json({ ok: true, id: row.id, estimate });
}
