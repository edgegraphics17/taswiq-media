import "server-only";
import { generateSlots, openSlots, type BookingRow, type BookingSettings, type SlotDay } from "@/lib/booking";
import { getBookingSettings, listBookings } from "@/lib/db";

/** Einstellungen und alle Einträge im offenen Zeitraum – Grundlage für Website (freie Slots) und Dashboard (Kalender). */
export async function loadCalendar(nowMs = Date.now()): Promise<{ settings: BookingSettings; bookings: BookingRow[] }> {
  const settings = await getBookingSettings();
  const from = new Date(nowMs - 86_400_000).toISOString();
  const to = new Date(nowMs + (settings.horizonDays + 2) * 86_400_000).toISOString();
  return { settings, bookings: await listBookings(from, to) };
}

/** Was ein Besucher jetzt noch buchen kann. */
export async function getOpenSlots(nowMs = Date.now()): Promise<{ days: SlotDay[]; settings: BookingSettings }> {
  const { settings, bookings } = await loadCalendar(nowMs);
  return { days: openSlots(generateSlots(settings, nowMs), bookings), settings };
}
