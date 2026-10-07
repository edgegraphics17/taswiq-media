import type { Metadata } from "next";
import Link from "next/link";
import { Undo2 } from "lucide-react";
import { requestRun } from "@/app/admin/actions";
import { getTasks, needsYou } from "@/lib/admin/data";
import { departmentById } from "@/config/team";
import { isDemoMode } from "@/lib/env";
import { ApprovalItem } from "@/components/admin/ApprovalItem";
import { LiveRefresh } from "@/components/admin/LiveRefresh";

export const metadata: Metadata = { title: "Freigaben" };

/**
 * Alles, was auf deine Entscheidung wartet – und nur das. Was das Team allein lösen kann, landet hier nie.
 * Reihenfolge: Rückfragen zuerst (dort steht jemand), dann nach Dringlichkeit.
 */
export default async function ApprovalsPage() {
  const tasks = await getTasks();
  const waiting = tasks.filter(needsYou).sort((a, b) => Number(b.run_state === "rueckfrage") - Number(a.run_state === "rueckfrage") || a.priority - b.priority);
  const parked = tasks.filter((t) => t.run_state === "zurueckgestellt" && t.status !== "erledigt");
  const own = tasks.filter((t) => t.executor === "karim" && t.status !== "erledigt");

  return (
    <div className="mx-auto max-w-[1100px]">
      {!isDemoMode() && <LiveRefresh />}
      <p className="text-xs font-medium text-brand-600">Arbeit</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Freigaben</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Nur Aufgaben, bei denen es ohne dich nicht geht: Preise, Rechtliches, Kosten, fehlende Zugänge oder eine Rückfrage. Alles andere erledigt das Team von selbst.
      </p>

      {waiting.length ? (
        <ul className="mt-6 space-y-2">
          {waiting.map((t) => (
            <ApprovalItem key={t.id} t={t} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl border border-line bg-white p-10 text-center text-muted">Nichts zu entscheiden. Das Team arbeitet an allem, was es allein lösen kann.</p>
      )}

      {parked.length > 0 && (
        <section aria-labelledby="parked-title" className="mt-10">
          <h2 id="parked-title" className="text-lg font-bold text-ink">
            Zurückgestellt
          </h2>
          <p className="mt-1 text-sm text-muted">Geparkt – das Team fasst diese Aufgaben nicht an, bis du sie wieder einreihst.</p>
          <ul className="mt-4 space-y-2">
            {parked.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{t.title}</p>
                  <p className="text-xs text-muted">{departmentById[t.department].name}</p>
                </div>
                <form action={requestRun}>
                  <input type="hidden" name="id" value={t.id} />
                  <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink hover:border-brand-300">
                    <Undo2 className="size-4" aria-hidden /> Wieder einreihen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {own.length > 0 && (
        <p className="mt-10 rounded-2xl border border-line bg-white p-5 text-sm text-body">
          Daneben gibt es <b className="text-ink">{own.length === 1 ? "eine Aufgabe, die nur du selbst erledigen kannst" : `${own.length} Aufgaben, die nur du selbst erledigen kannst`}</b> (anrufen, Konten anlegen, Entscheidungen beim Steuerberater). Zu finden unter{" "}
          <Link href="/admin/aufgaben" className="font-semibold text-brand-600">
            Fokus &amp; Aufgaben
          </Link>
          .
        </p>
      )}
    </div>
  );
}
