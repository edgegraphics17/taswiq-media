import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut, UserRound } from "lucide-react";
import { getLeads, getTasks, requireAdmin } from "@/lib/admin/data";
import { signOut } from "@/app/admin/actions";
import { LogoMark } from "@/components/ui/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const quiet = "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-night-muted hover:bg-white/5 hover:text-white";

/** Geschützte Dashboard-Hülle: Middleware + requireAdmin (doppelt gesichert). */
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  // Zähler für die Navigation – fällt das Backend aus, bleibt die Hülle trotzdem bedienbar.
  const [leads, tasks] = await Promise.all([getLeads().catch(() => []), getTasks().catch(() => [])]);
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="flex items-center gap-2 bg-night px-3 py-2 text-white lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-y-auto lg:px-4 lg:py-6">
        <Link href="/admin" className="flex shrink-0 items-center gap-2.5 px-2">
          <LogoMark className="h-7" />
          <span className="font-bold tracking-tight max-lg:sr-only">TasWiq Admin</span>
        </Link>
        <AdminNav newLeads={leads.filter((l) => l.status === "neu").length} openTasks={tasks.filter((t) => t.status !== "erledigt").length} />
        <div className="flex shrink-0 lg:flex-col lg:border-t lg:border-night-line lg:pt-4">
          <Link href="/" className={`${quiet} max-lg:hidden`}>
            <ExternalLink className="size-4" aria-hidden /> Website ansehen
          </Link>
          <Link href="/admin/konto" className={quiet} title={admin.email}>
            <UserRound className="size-4" aria-hidden /> <span className="max-lg:sr-only">Konto</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className={`${quiet} w-full`}>
              <LogOut className="size-4" aria-hidden /> <span className="max-lg:sr-only">Abmelden</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">
        {admin.demo && (
          <p className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <b>Demo-Modus:</b> Das Backend ist nicht verbunden – du siehst Beispieldaten, Änderungen werden nicht gespeichert.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
