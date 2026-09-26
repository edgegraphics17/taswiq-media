import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { signIn } from "@/app/admin/actions";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Admin-Login", robots: { index: false, follow: false } };

const MESSAGES: Record<string, string> = {
  email: "Bitte gib eine gültige E-Mail-Adresse ein.",
  forbidden: "Dieses Konto hat keinen Zugriff aufs Dashboard.",
  link: "Der Login-Link ist abgelaufen oder wurde schon benutzt. Fordere einen neuen an.",
  config: "Supabase ist nicht konfiguriert – trage die Umgebungsvariablen ein (siehe .env.example).",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const { error, sent } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-ink-900 px-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Logo tone="dark" className="h-12" />
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">Dashboard-Login</h1>
        {sent ? (
          <p role="status" className="mt-4 rounded-xl bg-teal-wash p-4 text-sm text-teal-deep">
            Wenn die Adresse als Admin hinterlegt ist, kommt gleich ein Login-Link per E-Mail.
          </p>
        ) : (
          <form action={signIn} className="mt-6 space-y-4">
            <label htmlFor="email" className="block text-sm font-semibold text-ink">
              E-Mail
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" className="h-12 w-full rounded-xl border border-line px-4 text-[16px] outline-none focus:border-teal" />
            {error && (
              <p role="alert" className="text-sm text-danger">
                {MESSAGES[error] ?? "Das hat nicht geklappt. Bitte versuch es erneut."}
              </p>
            )}
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-teal font-semibold text-ink-950">
              <Mail className="size-4" aria-hidden /> Login-Link senden
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
