import { NextResponse, type NextRequest } from "next/server";
import { bookingSchema, formatBooking } from "@/lib/booking";
import { getOpenSlots } from "@/lib/booking.server";
import { createBooking, getLeadWithEvents } from "@/lib/db";
import { isBackendConfigured } from "@/lib/env";
import { sendBookingMails } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** So lange nach der Anfrage darf der Termin ohne erneute Kontaktdaten gebucht werden */
const LEAD_WINDOW_MS = 24 * 60 * 60_000;

/**
 * POST /api/booking – bucht einen freien Slot.
 *  1. Rate-Limit + Honeypot
 *  2. Kontakt: vom gerade angelegten Lead (leadId) oder aus dem Formular der Terminseite (mit Einwilligung)
 *  3. Der Slot muss jetzt noch frei sein – geprüft gegen die Einstellungen und, endgültig, im Backend (409 = vergeben)
 *  4. Hinweis an uns, Bestätigung an die Person
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`booking:${clientIp(req.headers)}`, 5, 10 * 60_000)) return NextResponse.json({ ok: false, error: "rateLimit" }, { status: 429 });
  const parsed = bookingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  const data = parsed.data;
  // Bot hat das unsichtbare Feld ausgefüllt → Erfolg vortäuschen, nichts speichern.
  if (data.website) return NextResponse.json({ ok: true, start: data.start, end: data.start });
  if (!isBackendConfigured()) return NextResponse.json({ ok: false, error: "saveFailed" }, { status: 503 });

  try {
    let contact: { name: string; email: string; phone: string | null };
    if (data.leadId) {
      const found = await getLeadWithEvents(data.leadId);
      if (!found || Date.now() - Date.parse(found.lead.created_at) > LEAD_WINDOW_MS) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
      contact = { name: found.lead.name, email: found.lead.email, phone: found.lead.phone };
    } else {
      if (!data.name || !data.email || data.consent !== true) return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
      contact = { name: data.name, email: data.email, phone: data.phone || null };
    }

    const { days } = await getOpenSlots();
    const start = new Date(data.start).toISOString();
    const slot = days.flatMap((d) => d.slots).find((s) => s.start === start);
    if (!slot) return NextResponse.json({ ok: false, error: "taken" }, { status: 409 });

    const whenDe = formatBooking(slot.start, slot.end, "de");
    const booking = await createBooking({
      start_at: slot.start,
      end_at: slot.end,
      lead_id: data.leadId ?? null,
      ...contact,
      note: data.message || null,
      locale: data.locale,
      event_text: `Gesprächstermin gebucht: ${whenDe}`,
    });
    if (!booking) return NextResponse.json({ ok: false, error: "taken" }, { status: 409 });

    await sendBookingMails({ ...contact, note: data.message || null, when: formatBooking(slot.start, slot.end, data.locale), whenDe, locale: data.locale, leadId: data.leadId ?? null });
    return NextResponse.json({ ok: true, start: slot.start, end: slot.end });
  } catch (error) {
    console.error("[booking] Termin nicht gespeichert", error);
    return NextResponse.json({ ok: false, error: "saveFailed" }, { status: 500 });
  }
}
