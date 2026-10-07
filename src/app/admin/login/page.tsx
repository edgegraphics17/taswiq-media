import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import { signIn } from "@/app/admin/actions";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Admin-Login", robots: { index: false, follow: false } };

const MESSAGES: Record<string, string> = {
  credentials: "E-Mail oder Passwort stimmt nicht.",
  locked: "Zu viele Fehlversuche. Bitte warte 15 Minuten und versuch es dann erneut.",
  forbidden: "Dieses Konto hat keinen Zugriff aufs Dashboard.",
  link: "Der Login-Link ist abgelaufen oder wurde schon benutzt.",
  backend: "Das Backend antwortet gerade nicht. Bitte in einer Minute erneut versuchen.",
  config: "Backend ist nicht konfiguriert – trage TASWIQ_API_URL, TASWIQ_API_TOKEN und SESSION_SECRET ein (siehe .env.example).",
};

const field = "h-12 w-full rounded-xl border border-line px-4 text-[16px] text-ink outline-none focus:border-brand-500";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-night px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <Logo tone="dark" className="h-12" />
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Dashboard-Login</h1>
          <form action={signIn} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next ?? ""} />
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink">
                E-Mail
              </label>
              <input id="email" name="email" type="email" required autoComplete="username" className={`mt-1.5 ${field}`} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink">
                Passwort
              </label>
              <input id="password" name="password" type="password" required autoComplete="current-password" className={`mt-1.5 ${field}`} />
            </div>
            {error && (
              <p role="alert" className="rounded-xl bg-danger/5 px-4 py-3 text-sm text-danger">
                {MESSAGES[error] ?? "Das hat nicht geklappt. Bitte versuch es erneut."}
              </p>
            )}
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-500 font-semibold text-white transition-colors hover:bg-brand-600">
              <LogIn className="size-4" aria-hidden /> Anmelden
            </button>
          </form>
        </div>
        <Link href="/" className="mt-5 inline-flex min-h-11 items-center gap-2 px-2 text-sm text-night-muted hover:text-white">
          <ArrowLeft className="size-4" aria-hidden /> Zurück zur Website
        </Link>
      </div>
    </main>
  );
}
