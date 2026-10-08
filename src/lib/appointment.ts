import { z } from "zod";

/**
 * Terminwunsch nach einer Premium-Anfrage: bis zu zwei Wunschtermine (Tag + Tageszeit).
 * Ersetzt die eingebettete Terminbuchung eines Drittanbieters – die Angaben bleiben im eigenen Backend
 * (leads.automation.appointment) und stehen im Dashboard am Lead.
 */

export const DAYPARTS = ["vormittag", "nachmittag", "abend"] as const;
export type Daypart = (typeof DAYPARTS)[number];

/** Wie weit im Voraus ein Wunschtermin liegen darf */
export const APPOINTMENT_MAX_DAYS = 60;

export interface AppointmentSlot {
  date: string;
  part: Daypart;
}

export interface Appointment {
  slots: AppointmentSlot[];
  requestedAt: string;
}

/** Lokales Datum als YYYY-MM-DD (für min/max des Datumsfelds) */
export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DAY_MS = 86_400_000;

const slotSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((v) => {
      const t = Date.parse(`${v}T12:00:00Z`);
      // Einen Tag Spielraum in beide Richtungen: Der Besucher kann in einer anderen Zeitzone sitzen als der Server.
      return Number.isFinite(t) && t > Date.now() - 2 * DAY_MS && t < Date.now() + (APPOINTMENT_MAX_DAYS + 2) * DAY_MS;
    }),
  part: z.enum(DAYPARTS),
});

export const appointmentSchema = z.object({
  leadId: z.string().uuid(),
  slots: z.array(slotSchema).min(1).max(2),
});

export type AppointmentPayload = z.input<typeof appointmentSchema>;

const PART_LABEL: Record<Daypart, string> = {
  vormittag: "vormittags (9–12 Uhr)",
  nachmittag: "nachmittags (12–16 Uhr)",
  abend: "am späten Nachmittag (16–19 Uhr)",
};

/** Deutsche Klartext-Fassung für Dashboard, Verlauf und Hinweis-Mail, z. B. „Di., 13.10.2026 vormittags (9–12 Uhr)“ */
export function formatSlot(slot: AppointmentSlot) {
  const day = new Date(`${slot.date}T12:00:00Z`).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  return `${day} ${PART_LABEL[slot.part]}`;
}

/** Terminwunsch aus lead.automation lesen – strikt geprüft, weil das JSON von außen befüllt wird. */
export function readAppointment(automation: unknown): Appointment | null {
  const a = (automation as { appointment?: { slots?: unknown; requestedAt?: unknown } } | null)?.appointment;
  if (!a || !Array.isArray(a.slots) || typeof a.requestedAt !== "string") return null;
  const slots = a.slots.filter(
    (s): s is AppointmentSlot => Boolean(s) && typeof s.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && DAYPARTS.includes(s.part),
  );
  return slots.length ? { slots, requestedAt: a.requestedAt } : null;
}
