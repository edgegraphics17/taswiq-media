import type { Metadata } from "next";
import { Mail, Plus, Trash2, Video } from "lucide-react";
import { createMeeting, deleteMeeting, inviteToMeeting } from "@/app/admin/actions";
import { CopyLink } from "@/components/admin/CopyLink";
import { site } from "@/config/site";
import { listMeetRooms } from "@/lib/db";
import { isBackendConfigured } from "@/lib/env";
import { MEET_CODE, type MeetRoom } from "@/lib/meet";

export const metadata: Metadata = { title: "Meetings" };

const field = "mt-1.5 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink";
const SAVED = (flag: string, n: string) =>
  ({ eingeladen: `Einladung verschickt${Number(n) > 1 ? ` an ${n} Adressen` : ""}.`, geloescht: "Meeting gelöscht – der Link funktioniert nicht mehr." })[flag];
const ERRORS = (flag: string, n: string) =>
  ({
    backend: "Das hat gerade nicht geklappt – das Backend war nicht erreichbar. Bitte noch einmal versuchen.",
    adressen: "Bitte gültige E-Mail-Adressen eintragen (höchstens 20, durch Komma getrennt).",
    versand: `${n || "Einige"} Einladung(en) konnten nicht verschickt werden. Bitte den Link direkt weitergeben.`,
  })[flag];
const when = (iso: string) => new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/**
 * Eigene Videocalls: Meeting anlegen, Link weitergeben oder per Mail einladen, beitreten.
 * Der Call selbst läuft unter /meet/<code> – Gäste brauchen kein Konto und kein Programm.
 */
export default async function MeetingsPage({ searchParams }: { searchParams: Promise<{ neu?: string; saved?: string; error?: string; n?: string }> }) {
  const flags = await searchParams;
  const rooms: MeetRoom[] | null = isBackendConfigured() ? await listMeetRooms().catch(() => null) : null;
  const fresh = flags.neu && MEET_CODE.test(flags.neu) ? rooms?.find((r) => r.code === flags.neu) : undefined;
  const link = (code: string) => `${site.url}/meet/${code}`;
  const saved = flags.saved && SAVED(flags.saved, flags.n ?? "");
  const error = flags.error && ERRORS(flags.error, flags.n ?? "");

  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="text-xs font-medium text-brand-600">Arbeit</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Meetings</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Videocalls über das eigene Tool: Meeting anlegen, Link verschicken, beitreten. Eingeladene öffnen den Link im Browser – ohne Konto und ohne Programm.</p>

      {saved && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{saved}</p>}
      {error && <p role="alert" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}
      {!rooms && <p role="alert" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Die Meetings sind gerade nicht erreichbar (Backend nicht verbunden oder noch auf altem Stand).</p>}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <form action={createMeeting} className="rounded-3xl bg-surface p-6 shadow-soft">
          <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Video className="size-5" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-bold text-ink">Neues Meeting</h2>
          <p className="mt-1 text-sm text-muted">Der Link ist sofort gültig und bleibt es, bis du das Meeting löschst.</p>
          <label htmlFor="meeting-title" className="mt-5 block text-sm font-medium text-ink">
            Titel <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="meeting-title" name="title" maxLength={80} placeholder="z. B. Team-Runde" className={`${field} h-11`} />
          <button type="submit" className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-bold text-white shadow-brand transition-colors hover:bg-brand-600">
            <Plus className="size-4" aria-hidden /> Meeting starten
          </button>
        </form>

        {fresh ? (
          <section aria-labelledby="fresh-title" className="rounded-3xl bg-night p-6 text-white shadow-float">
            <p className="text-xs font-semibold tracking-wider text-mint-400 uppercase">Bereit</p>
            <h2 id="fresh-title" className="mt-2 text-xl font-bold text-white">{fresh.title}</h2>
            <div className="mt-4">
              <CopyLink url={link(fresh.code)} />
            </div>
            <a href={`/meet/${fresh.code}`} target="_blank" rel="noopener" className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-bold shadow-brand transition-colors hover:bg-brand-400">
              <Video className="size-4" aria-hidden /> Jetzt beitreten
            </a>
            <form action={inviteToMeeting} className="mt-6 border-t border-night-line pt-5">
              <input type="hidden" name="code" value={fresh.code} />
              <label htmlFor="invite-emails" className="block text-sm font-medium">Per E-Mail einladen</label>
              <textarea id="invite-emails" name="emails" required rows={2} placeholder="anna@firma.de, ben@firma.de" className="mt-1.5 w-full rounded-lg border border-night-line bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30" />
              <label htmlFor="invite-note" className="mt-3 block text-sm font-medium">Nachricht <span className="font-normal text-night-muted">(optional)</span></label>
              <input id="invite-note" name="note" maxLength={600} placeholder="z. B. Wir starten um 14 Uhr." className="mt-1.5 h-11 w-full rounded-lg border border-night-line bg-white/5 px-3 text-sm text-white placeholder:text-white/30" />
              <button type="submit" className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-ink transition-colors hover:bg-brand-100">
                <Mail className="size-4" aria-hidden /> Einladung senden
              </button>
            </form>
          </section>
        ) : (
          <div className="grid place-items-center rounded-3xl border border-dashed border-line p-8 text-center">
            <p className="max-w-xs text-sm text-muted">Starte links ein Meeting – hier erscheinen dann der Link zum Weitergeben und die Einladung per Mail.</p>
          </div>
        )}
      </div>

      {rooms && rooms.length > 0 && (
        <section aria-labelledby="rooms-title" className="mt-10">
          <h2 id="rooms-title" className="text-lg font-bold text-ink">Deine Meetings</h2>
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-3xl bg-surface shadow-soft">
            {rooms.map((r) => (
              <li key={r.code} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    <span className="truncate">{r.title}</span>
                    {r.live > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        <span className="size-1.5 rounded-full bg-mint-500" aria-hidden /> {r.live} im Call
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">Angelegt am {when(r.created_at)} · {r.code}</p>
                </div>
                <CopyLink url={link(r.code)} compact />
                <a href={`/admin/meetings?neu=${r.code}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-300">
                  <Mail className="size-4" aria-hidden /> Einladen
                </a>
                <a href={`/meet/${r.code}`} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-night px-4 text-sm font-bold text-white transition-colors hover:bg-night-soft">
                  <Video className="size-4" aria-hidden /> Beitreten
                </a>
                <form action={deleteMeeting}>
                  <input type="hidden" name="code" value={r.code} />
                  <button type="submit" aria-label={`Meeting „${r.title}“ löschen`} title="Löschen – der Link funktioniert dann nicht mehr" className="grid size-11 cursor-pointer place-items-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-danger">
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
