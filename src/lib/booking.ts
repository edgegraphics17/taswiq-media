import { z } from "zod";
import { contactFields } from "@/lib/validation";

/**
 * Eigene Terminbuchung (ersetzt Calendly): Aus den Einstellungen im Dashboard entstehen feste Slots in deutscher Zeit.
 * Belegt ist, was im Backend als Termin gebucht oder von Hand gesperrt wurde (Tabelle `bookings`) – alles andere ist frei.
 * Diese Datei rechnet nur; sie läuft auf dem Server (API, Dashboard) und im Browser (Typen, Formate).
 */

export const BOOKING_TZ = "Europe/Berlin";

export interface BookingSettings {
  /** Wochentage, an denen Gespräche möglich sind: 1 = Montag … 7 = Sonntag */
  weekdays: number[];
  /** Erster Slot beginnt um … (HH:MM, deutsche Zeit) */
  from: string;
  /** Letzter Slot endet spätestens um … */
  to: string;
  /** Pause ohne Termine; leer = keine */
  breakFrom: string;
  breakTo: string;
  slotMinutes: number;
  /** So viele Stunden im Voraus muss gebucht werden */
  noticeHours: number;
  /** So viele Tage im Voraus ist der Kalender offen */
  horizonDays: number;
}

export const BOOKING_DEFAULTS: BookingSettings = {
  weekdays: [1, 2, 3, 4, 5],
  from: "09:00",
  to: "18:00",
  breakFrom: "12:30",
  breakTo: "13:30",
  slotMinutes: 30,
  noticeHours: 12,
  horizonDays: 21,
};

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const bookingSettingsSchema = z
  .object({
    weekdays: z.array(z.number().int().min(1).max(7)).min(1).max(7),
    from: hhmm,
    to: hhmm,
    breakFrom: hhmm.or(z.literal("")),
    breakTo: hhmm.or(z.literal("")),
    slotMinutes: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]),
    noticeHours: z.number().int().min(0).max(168),
    horizonDays: z.number().int().min(1).max(60),
  })
  .refine((s) => s.from < s.to)
  .refine((s) => (!s.breakFrom && !s.breakTo) || (Boolean(s.breakFrom) && Boolean(s.breakTo) && s.breakFrom < s.breakTo));

/** Gespeicherte Einstellungen lesen – fehlt etwas oder ist es ungültig, gelten die Standardwerte. */
export function readBookingSettings(value: unknown): BookingSettings {
  const parsed = bookingSettingsSchema.safeParse({ ...BOOKING_DEFAULTS, ...(value && typeof value === "object" ? value : {}) });
  return parsed.success ? parsed.data : BOOKING_DEFAULTS;
}

export interface BookingRow {
  id: string;
  created_at: string;
  start_at: string;
  end_at: string;
  kind: "termin" | "gesperrt";
  status: "gebucht" | "abgesagt";
  lead_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  note: string | null;
  locale: "de" | "en";
}

export interface Slot {
  /** Beginn und Ende als UTC-Zeitpunkt (ISO) */
  start: string;
  end: string;
  /** Tag und Uhrzeit in deutscher Zeit */
  date: string;
  time: string;
}

export interface SlotDay {
  date: string;
  slots: Slot[];
}

const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const clock = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

const partsFormat = new Intl.DateTimeFormat("en-US", { timeZone: BOOKING_TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Abstand der deutschen Zeit zu UTC in Minuten – zu genau diesem Zeitpunkt (Sommer-/Winterzeit). */
function offsetMinutes(utcMs: number) {
  const p = Object.fromEntries(partsFormat.formatToParts(new Date(utcMs)).map((x) => [x.type, Number(x.value)]));
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(utcMs / 60_000) * 60_000) / 60_000;
}

/** „13.10. um 09:30 Uhr in Deutschland“ → UTC-Zeitpunkt */
export function berlinToUtc(date: string, minuteOfDay: number) {
  const naive = Date.parse(`${date}T00:00:00Z`) + minuteOfDay * 60_000;
  const guess = naive - offsetMinutes(naive) * 60_000;
  return naive - offsetMinutes(guess) * 60_000;
}

/** Kalendertag in deutscher Zeit (YYYY-MM-DD) */
export const berlinDay = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: BOOKING_TZ }).format(new Date(ms));
/** Uhrzeit in deutscher Zeit (HH:MM) */
export const berlinTime = (iso: string) => new Intl.DateTimeFormat("de-DE", { timeZone: BOOKING_TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
/** 1 = Montag … 7 = Sonntag */
const weekday = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay() || 7;

/** Alle Slots laut Einstellungen ab heute – ohne Rücksicht auf Buchungen. `notice: false` zeigt auch die, die zu kurzfristig wären (Dashboard). */
export function generateSlots(s: BookingSettings, nowMs: number, { notice = true }: { notice?: boolean } = {}): SlotDay[] {
  const earliest = nowMs + (notice ? s.noticeHours * 3_600_000 : 0);
  const today = berlinDay(nowMs);
  const [from, to] = [minutes(s.from), minutes(s.to)];
  const pause = s.breakFrom && s.breakTo ? ([minutes(s.breakFrom), minutes(s.breakTo)] as const) : null;
  const days: SlotDay[] = [];
  for (let d = 0; d <= s.horizonDays; d++) {
    const date = addDays(today, d);
    if (!s.weekdays.includes(weekday(date))) continue;
    const slots: Slot[] = [];
    for (let m = from; m + s.slotMinutes <= to; m += s.slotMinutes) {
      if (pause && m < pause[1] && m + s.slotMinutes > pause[0]) continue;
      const start = berlinToUtc(date, m);
      if (start < earliest) continue;
      slots.push({ start: new Date(start).toISOString(), end: new Date(start + s.slotMinutes * 60_000).toISOString(), date, time: clock(m) });
    }
    if (slots.length) days.push({ date, slots });
  }
  return days;
}

/** Aktive Einträge (gebucht oder gesperrt), die sich mit dem Slot überschneiden */
export const busyFor = (slot: Pick<Slot, "start" | "end">, bookings: BookingRow[]) => bookings.find((b) => b.status === "gebucht" && b.start_at < slot.end && b.end_at > slot.start);

/** Nur die freien Slots; Tage ohne freien Slot fallen weg. */
export function openSlots(days: SlotDay[], bookings: BookingRow[]): SlotDay[] {
  return days.map((d) => ({ date: d.date, slots: d.slots.filter((s) => !busyFor(s, bookings)) })).filter((d) => d.slots.length);
}

/** „Dienstag, 13. Oktober 2026, 09:30–10:00 Uhr“ (deutsche Zeit) */
export function formatBooking(startIso: string, endIso: string, locale: "de" | "en" = "de") {
  const day = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "de-DE", { timeZone: BOOKING_TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(startIso));
  return locale === "en" ? `${day}, ${berlinTime(startIso)}–${berlinTime(endIso)} (German time)` : `${day}, ${berlinTime(startIso)}–${berlinTime(endIso)} Uhr`;
}

/**
 * Buchung von der Website: entweder zu einer gerade gestellten Anfrage (leadId – Name und E-Mail kommen dann vom Lead)
 * oder mit eigenen Kontaktdaten von der Terminseite.
 */
export const bookingSchema = z.object({
  start: z.string().datetime(),
  leadId: z.string().uuid().optional(),
  name: contactFields.name.optional(),
  email: contactFields.email.optional(),
  phone: contactFields.phone,
  message: contactFields.message,
  consent: z.boolean().optional(),
  /** Honeypot */
  website: z.string().max(500).optional(),
  locale: z.enum(["de", "en"]).default("de"),
});

export type BookingPayload = z.input<typeof bookingSchema>;
