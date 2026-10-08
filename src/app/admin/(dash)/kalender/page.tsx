import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ExternalLink, Lock, Mail, Phone } from "lucide-react";
import { blockTime, cancelBooking, saveBookingSettings } from "@/app/admin/actions";
import { LiveRefresh } from "@/components/admin/LiveRefresh";
import { site } from "@/config/site";
import { getCalendar, upcomingBookings } from "@/lib/admin/data";
import { berlinTime, busyFor, formatBooking, generateSlots } from "@/lib/booking";
import { cn } from "@/lib/format";

export const metadata: Metadata = { title: "Kalender" };

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const SAVED: Record<string, string> = {
  frei: "Erledigt – der Zeitraum ist auf der Website wieder buchbar.",
  gesperrt: "Gesperrt – der Zeitraum wird auf der Website nicht mehr angeboten.",
  zeiten: "Zeiten gespeichert. Die Website zeigt ab sofort die neuen Termine.",
};
const ERRORS: Record<string, string> = {
  belegt: "In diesem Zeitraum liegt schon ein Termin oder eine Sperre. Bitte erst absagen bzw. freigeben.",
  zeiten: "Die Zeiten passen nicht zusammen: „von“ muss vor „bis“ liegen, die Pause braucht Anfang und Ende, und mindestens ein Wochentag muss gewählt sein.",
};
const field = "mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink";
const dayLabel = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("de-DE", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });

/**
 * Eigener Terminkalender: Was hier als frei steht, kann auf der Website gebucht werden (/termin und im Abschluss großer Anfragen).
 * Gebuchte und gesperrte Zeiten sind dort geschlossen.
 */
export default async function KalenderPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string; demo?: string }> }) {
  const [flags, calendar] = await Promise.all([searchParams, getCalendar().catch(() => null)]);
  // Backend noch auf altem Stand (Dienst nicht neu gestartet) oder nicht erreichbar
  if (!calendar) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Kalender</h1>
        <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Der Kalender ist gerade nicht erreichbar. Auf der Website werden so lange keine Termine angeboten – Besucher sehen stattdessen Telefon, WhatsApp bzw. das Feld für Wunschtermine.
        </p>
      </div>
    );
  }
  const { settings, bookings } = calendar;
  const now = Date.now();
  const upcoming = upcomingBookings(bookings, now);
  const days = generateSlots(settings, now, { notice: false });
  const bookableFrom = now + settings.noticeHours * 3_600_000;
  const free = days.reduce((n, d) => n + d.slots.filter((s) => !busyFor(s, bookings) && Date.parse(s.start) >= bookableFrom).length, 0);

  return (
    <div className="mx-auto max-w-[1100px]">
      <LiveRefresh />
      <p className="text-xs font-medium text-brand-600">Kunden & Website</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Kalender</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Gesprächstermine, die über die Website gebucht wurden. Freie Zeiten stehen dort zur Auswahl, gebuchte und gesperrte sind geschlossen.
          </p>
        </div>
        <a href={`${site.url}/termin`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink">
          <ExternalLink className="size-4" aria-hidden /> Buchungsseite öffnen
        </a>
      </div>

      {flags.saved && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{SAVED[flags.saved] ?? "Gespeichert."}</p>}
      {flags.demo && <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Demo-Modus – nichts gespeichert.</p>}
      {flags.error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{ERRORS[flags.error] ?? "Das hat nicht geklappt. Bitte versuch es erneut."}</p>}

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Anstehende Gespräche", upcoming.length],
          ["Freie Termine auf der Website", free],
          ["Link zum Verschicken", `${site.url.replace(/^https?:\/\//, "")}/termin`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5">
            <dt className="text-xs font-semibold text-muted">{label}</dt>
            <dd className={cn("num mt-1 font-extrabold text-ink", typeof value === "number" ? "text-3xl" : "text-sm break-all")}>{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold text-ink">Anstehende Gespräche</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Noch kein Termin gebucht. Verschick den Link zur Buchungsseite – jede Buchung erscheint sofort hier.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {upcoming.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="num text-sm font-bold text-ink">{formatBooking(b.start_at, b.end_at)}</p>
                  <p className="mt-0.5 text-sm text-body">
                    {b.lead_id ? (
                      <Link href={`/admin/leads/${b.lead_id}`} className="font-semibold text-brand-600">{b.name}</Link>
                    ) : (
                      <span className="font-semibold text-ink">{b.name}</span>
                    )}
                    {b.locale === "en" && <span className="text-muted"> · Englisch</span>}
                  </p>
                  {b.note && <p className="mt-1 max-w-xl text-xs whitespace-pre-line text-muted">{b.note}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {b.email && (
                    <a href={`mailto:${b.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink">
                      <Mail className="size-4" aria-hidden /> E-Mail
                    </a>
                  )}
                  {b.phone && (
                    <a href={`tel:${b.phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink">
                      <Phone className="size-4" aria-hidden /> Anrufen
                    </a>
                  )}
                  <form action={cancelBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <button type="submit" className="min-h-11 cursor-pointer rounded-lg border border-line bg-white px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50">Absagen</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        {upcoming.length > 0 && <p className="mt-3 text-xs text-muted">Absagen gibt den Termin auf der Website wieder frei. Die Person wird nicht automatisch benachrichtigt – bitte kurz selbst Bescheid geben.</p>}
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold text-ink">Zeiten der nächsten {settings.horizonDays} Tage</h2>
        <p className="mt-1 text-xs text-muted">Freie Zeit anklicken sperrt sie, gesperrte Zeit anklicken gibt sie wieder frei.</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-body">
          <li className="flex items-center gap-1.5"><span className="size-3 rounded-full border border-line bg-white" aria-hidden /> frei</li>
          <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-brand-500" aria-hidden /> gebucht</li>
          <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-night" aria-hidden /> gesperrt</li>
          <li className="flex items-center gap-1.5"><span className="size-3 rounded-full border border-dashed border-muted bg-canvas" aria-hidden /> frei, aber zu kurzfristig für die Website ({settings.noticeHours} Std. Vorlauf)</li>
        </ul>
        {days.length === 0 && <p className="mt-4 text-sm text-muted">In diesem Zeitraum gibt es keine Zeiten. Prüf die Einstellungen unten.</p>}
        <div className="mt-4 divide-y divide-line">
          {days.map((d) => {
            const cells = d.slots.map((s) => ({ slot: s, busy: busyFor(s, bookings) }));
            const allFree = cells.every((c) => !c.busy);
            return (
              <div key={d.date} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-ink">{dayLabel(d.date)}</h3>
                  {allFree && (
                    <form action={blockTime}>
                      <input type="hidden" name="start" value={d.slots[0].start} />
                      <input type="hidden" name="end" value={d.slots[d.slots.length - 1].end} />
                      <input type="hidden" name="note" value="Ganzer Tag gesperrt" />
                      <button type="submit" className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted hover:bg-canvas hover:text-ink">
                        <Lock className="size-3.5" aria-hidden /> Ganzen Tag sperren
                      </button>
                    </form>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {cells.map(({ slot, busy }) =>
                    busy?.kind === "termin" ? (
                      <span key={slot.start} title={`${busy.name ?? "Termin"} · ${berlinTime(busy.start_at)}–${berlinTime(busy.end_at)}`} className="num inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-500 px-3 text-xs font-semibold text-white">
                        <CalendarCheck className="size-3.5" aria-hidden /> {slot.time} · {busy.name?.split(" ")[0] ?? "Termin"}
                      </span>
                    ) : busy ? (
                      <form key={slot.start} action={cancelBooking}>
                        <input type="hidden" name="id" value={busy.id} />
                        <button type="submit" title={`${busy.note ?? "Gesperrt"} – anklicken gibt den Zeitraum wieder frei`} className="num min-h-10 cursor-pointer rounded-full bg-night px-3 text-xs font-semibold text-white hover:bg-night-soft">
                          {slot.time}
                        </button>
                      </form>
                    ) : (
                      <form key={slot.start} action={blockTime}>
                        <input type="hidden" name="start" value={slot.start} />
                        <input type="hidden" name="end" value={slot.end} />
                        <button
                          type="submit"
                          title="Frei – anklicken sperrt diese Zeit"
                          className={cn(
                            "num min-h-10 cursor-pointer rounded-full border px-3 text-xs font-semibold hover:border-night hover:text-ink",
                            Date.parse(slot.start) >= bookableFrom ? "border-line bg-white text-ink" : "border-dashed border-muted bg-canvas text-muted",
                          )}
                        >
                          {slot.time}
                        </button>
                      </form>
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <form id="zeiten" action={saveBookingSettings} className="mt-6 scroll-mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-bold text-ink">Wann bist du für Gespräche erreichbar?</h2>
        <p className="mt-1 text-xs text-muted">Daraus entstehen die Termine auf der Website. Alle Uhrzeiten in deutscher Zeit.</p>
        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-muted">Wochentage</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {WEEKDAYS.map((w, i) => (
              <label key={w} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-ink has-checked:border-brand-500 has-checked:bg-brand-50">
                <input type="checkbox" name="weekdays" value={i + 1} defaultChecked={settings.weekdays.includes(i + 1)} className="size-4 accent-[var(--color-brand-500)]" /> {w}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold text-muted">Von<input name="from" type="time" required defaultValue={settings.from} className={field} /></label>
          <label className="text-xs font-semibold text-muted">Bis<input name="to" type="time" required defaultValue={settings.to} className={field} /></label>
          <label className="text-xs font-semibold text-muted">Pause von (leer = keine)<input name="breakFrom" type="time" defaultValue={settings.breakFrom} className={field} /></label>
          <label className="text-xs font-semibold text-muted">Pause bis<input name="breakTo" type="time" defaultValue={settings.breakTo} className={field} /></label>
          <label className="text-xs font-semibold text-muted">
            Länge eines Gesprächs
            <select name="slotMinutes" defaultValue={settings.slotMinutes} className={field}>
              {[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m} Minuten</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted">Vorlauf in Stunden<input name="noticeHours" type="number" min={0} max={168} required defaultValue={settings.noticeHours} className={cn(field, "num")} /></label>
          <label className="text-xs font-semibold text-muted">Buchbar für die nächsten … Tage<input name="horizonDays" type="number" min={1} max={60} required defaultValue={settings.horizonDays} className={cn(field, "num")} /></label>
        </div>
        <button type="submit" className="mt-5 h-11 cursor-pointer rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600">Zeiten speichern</button>
      </form>
    </div>
  );
}
