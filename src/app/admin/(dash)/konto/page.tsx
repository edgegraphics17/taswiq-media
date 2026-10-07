import type { Metadata } from "next";
import { changePassword } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Konto" };

const ERRORS: Record<string, string> = {
  weak: "Das neue Passwort braucht mindestens 10 Zeichen.",
  mismatch: "Die beiden neuen Passwörter stimmen nicht überein.",
  current: "Das aktuelle Passwort stimmt nicht.",
  error: "Speichern hat nicht geklappt. Bitte versuch es erneut.",
};
const field = "mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-4 text-[16px] text-ink outline-none focus:border-brand-500";

export default async function KontoPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const [{ error, saved }, admin] = await Promise.all([searchParams, requireAdmin()]);
  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-medium text-brand-600">Konto</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Passwort ändern</h1>
      <p className="mt-2 text-sm text-muted">Angemeldet als {admin.email}</p>

      <form action={changePassword} className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-6">
        <input type="text" name="username" autoComplete="username" defaultValue={admin.email} readOnly hidden />
        <label className="block text-sm font-semibold text-ink">
          Aktuelles Passwort
          <input name="current" type="password" required autoComplete="current-password" className={field} />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Neues Passwort
          <input name="password" type="password" required minLength={10} autoComplete="new-password" aria-describedby="pw-hint" className={field} />
          <span id="pw-hint" className="mt-1.5 block text-xs font-normal text-muted">
            Mindestens 10 Zeichen. Am besten vom Passwort-Manager erzeugen lassen.
          </span>
        </label>
        <label className="block text-sm font-semibold text-ink">
          Neues Passwort wiederholen
          <input name="repeat" type="password" required minLength={10} autoComplete="new-password" className={field} />
        </label>
        {error && (
          <p role="alert" className="rounded-xl bg-danger/5 px-4 py-3 text-sm text-danger">
            {ERRORS[error] ?? ERRORS.error}
          </p>
        )}
        {saved && (
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Passwort gespeichert. Es gilt ab dem nächsten Login.
          </p>
        )}
        <button type="submit" className="inline-flex min-h-12 items-center rounded-full bg-night px-6 text-sm font-semibold text-white hover:bg-night-soft">
          Passwort speichern
        </button>
      </form>
    </div>
  );
}
