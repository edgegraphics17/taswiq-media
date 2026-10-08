import { NextResponse, type NextRequest } from "next/server";
import { appointmentSchema, formatSlot, type Appointment } from "@/lib/appointment";
import { getLeadWithEvents, setLeadAppointment } from "@/lib/db";
import { isBackendConfigured } from "@/lib/env";
import { sendInternalNotice } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** So lange nach der Anfrage darf der Terminwunsch nachgereicht werden */
const WINDOW_MS = 24 * 60 * 60_000;

/**
 * POST /api/leads/appointment – Terminwunsch zu einer gerade gestellten Premium-Anfrage.
 * Die Lead-ID kennt nur der Browser, der die Anfrage abgeschickt hat; zusätzlich gilt: nur Premium, nur am selben Tag.
 * Gespeichert wird am Lead (automation.appointment) plus ein Eintrag im Verlauf.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`appointment:${clientIp(req.headers)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "rateLimit" }, { status: 429 });
  }
  const parsed = appointmentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  if (!isBackendConfigured()) return NextResponse.json({ ok: false, error: "saveFailed" }, { status: 503 });

  const { leadId, slots } = parsed.data;
  try {
    const found = await getLeadWithEvents(leadId);
    if (!found || found.lead.tier !== "premium" || Date.now() - Date.parse(found.lead.created_at) > WINDOW_MS) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
    }
    const appointment: Appointment = { slots, requestedAt: new Date().toISOString() };
    const text = slots.map(formatSlot).join(" oder ");
    await setLeadAppointment(leadId, appointment, `Terminwunsch: ${text}`);
    await sendInternalNotice(
      `Terminwunsch von ${found.lead.name}`,
      `${found.lead.name}${found.lead.company ? ` (${found.lead.company})` : ""} möchte ein Gespräch: ${text}.\n\nBitte einen der Termine bestätigen.`,
      leadId,
    );
  } catch (error) {
    console.error("[leads] Terminwunsch nicht gespeichert", error);
    return NextResponse.json({ ok: false, error: "saveFailed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
