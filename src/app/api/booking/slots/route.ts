import { NextResponse, type NextRequest } from "next/server";
import { getOpenSlots } from "@/lib/booking.server";
import { isBackendConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/booking/slots – die noch freien Gesprächstermine. Gebuchte und gesperrte Zeiten tauchen hier nicht auf. */
export async function GET(req: NextRequest) {
  const headers = { "cache-control": "no-store" };
  if (!isBackendConfigured() || !rateLimit(`slots:${clientIp(req.headers)}`, 60, 10 * 60_000)) return NextResponse.json({ ok: true, days: [], slotMinutes: 30 }, { headers });
  try {
    const { days, settings } = await getOpenSlots();
    return NextResponse.json({ ok: true, days: days.map((d) => ({ date: d.date, slots: d.slots.map((s) => ({ start: s.start, time: s.time })) })), slotMinutes: settings.slotMinutes }, { headers });
  } catch (error) {
    console.error("[booking] Slots nicht geladen", error);
    return NextResponse.json({ ok: false, days: [], slotMinutes: 30 }, { status: 503, headers });
  }
}
