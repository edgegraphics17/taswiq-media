import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ExternalLink, Inbox, LogOut, Tags } from "lucide-react";
import { requireAdmin } from "@/lib/admin/data";
import { signOut } from "@/app/admin/actions";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Leads", icon: Inbox },
  { href: "/admin/rechner", label: "Kalkulationen", icon: Calculator },
  { href: "/admin/preise", label: "Preise", icon: Tags },
];

/** Geschützte Dashboard-Hülle: Middleware + requireAdmin (doppelt gesichert) + RLS in der DB. */
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[232px_1fr]">
      <aside className="flex items-center gap-4 bg-night px-4 py-3 text-white lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:items-stretch lg:px-4 lg:py-6">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <LogoMark className="h-7" />
          <span className="font-bold tracking-tight">TasWiq Admin</span>
        </Link>
        <nav aria-label="Dashboard" className="flex flex-1 gap-1 overflow-x-auto lg:mt-8 lg:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-night-muted hover:bg-white/5 hover:text-white">
              <n.icon className="size-4" aria-hidden /> {n.label}
            </Link>
          ))}
          <Link href="/" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-night-muted hover:bg-white/5 hover:text-white">
            <ExternalLink className="size-4" aria-hidden /> Website
          </Link>
        </nav>
        <div className="hidden text-xs text-night-muted lg:block lg:px-3">{admin.email}</div>
        <form action={signOut}>
          <button type="submit" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-night-muted hover:bg-white/5 hover:text-white">
            <LogOut className="size-4" aria-hidden /> <span className="max-lg:sr-only">Abmelden</span>
          </button>
        </form>
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
