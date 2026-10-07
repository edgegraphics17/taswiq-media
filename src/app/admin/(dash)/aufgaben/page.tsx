import type { Metadata } from "next";
import Link from "next/link";
import { Check, Play, Plus, RotateCcw, Sparkles, Trash2, UserRound } from "lucide-react";
import { createTask, removeTask, setTask } from "@/app/admin/actions";
import { getLeads, getTasks, MONTHLY_GOAL, wonThisMonth } from "@/lib/admin/data";
import { EFFORT_LABEL, PRIORITY_LABEL, TASK_CATEGORY_LABEL } from "@/lib/admin/labels";
import { isDemoMode } from "@/lib/env";
import { cn, formatDate, formatEUR } from "@/lib/format";
import { TASK_CATEGORIES, type TaskRow } from "@/types/database";
import { LiveRefresh } from "@/components/admin/LiveRefresh";

export const metadata: Metadata = { title: "Fokus & Aufgaben" };

const PRIORITY_TONE: Record<number, string> = {
  1: "bg-night text-white",
  2: "bg-brand-50 text-brand-600",
  3: "border border-line text-muted",
};
const input = "h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-500";
const iconBtn = "grid size-11 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink";

function StatusButton({ id, status, label, children, className }: { id: string; status: TaskRow["status"]; label: string; children: React.ReactNode; className?: string }) {
  return (
    <form action={setTask}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={className} aria-label={label} title={label}>
        {children}
      </button>
    </form>
  );
}

function Task({ t, focus = false }: { t: TaskRow; focus?: boolean }) {
  const done = t.status === "erledigt";
  const steps = t.steps?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [];
  return (
    <li className={cn("rounded-2xl border bg-white", focus ? "border-brand-200 shadow-[var(--shadow-soft)]" : "border-line")}>
      <div className="flex items-start gap-1 p-2 sm:gap-2 sm:p-3">
        {done ? (
          <StatusButton id={t.id} status="offen" label={`„${t.title}“ wieder öffnen`} className={iconBtn}>
            <RotateCcw className="size-4" aria-hidden />
          </StatusButton>
        ) : (
          <StatusButton id={t.id} status="erledigt" label={`„${t.title}“ als erledigt markieren`} className="group grid size-11 shrink-0 place-items-center rounded-lg">
            <span className="grid size-6 place-items-center rounded-full border-2 border-line text-transparent transition-colors group-hover:border-mint-500 group-hover:bg-mint-500 group-hover:text-white">
              <Check className="size-3.5" aria-hidden />
            </span>
          </StatusButton>
        )}
        <details className="group min-w-0 flex-1 py-2">
          <summary className="list-none [&::-webkit-details-marker]:hidden">
            <span className={cn("font-semibold text-ink", done && "text-muted line-through")}>{t.title}</span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              {!done && <span className={cn("rounded-full px-2.5 py-0.5 font-bold", PRIORITY_TONE[t.priority])}>{PRIORITY_LABEL[t.priority]}</span>}
              {t.status === "in_arbeit" && <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-800 ring-1 ring-amber-200 ring-inset">In Arbeit</span>}
              <span className="rounded-full bg-canvas px-2.5 py-0.5 font-medium text-body">{TASK_CATEGORY_LABEL[t.category]}</span>
              <span className="text-muted">{EFFORT_LABEL[t.effort]}</span>
              <span className="inline-flex items-center gap-1 text-muted">
                {t.source === "claude" ? <Sparkles className="size-3" aria-hidden /> : <UserRound className="size-3" aria-hidden />}
                {t.source === "claude" ? "von Claude" : "von dir"}
              </span>
              {done && t.done_at && <span className="text-muted">erledigt am {formatDate(t.done_at)}</span>}
              {(t.why || steps.length > 0) && <span className="font-medium text-brand-600 group-open:hidden">Details</span>}
            </span>
          </summary>
          {(t.why || steps.length > 0) && (
            <div className="mt-3 max-w-2xl space-y-3 text-sm leading-relaxed text-body">
              {t.why && (
                <p>
                  <b className="text-ink">Warum: </b>
                  {t.why}
                </p>
              )}
              {steps.length > 0 && (
                <div>
                  <p className="font-semibold text-ink">So gehst du vor:</p>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                    {steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </details>
        {!done && t.status === "offen" && (
          <StatusButton id={t.id} status="in_arbeit" label={`„${t.title}“ starten`} className={iconBtn}>
            <Play className="size-4" aria-hidden />
          </StatusButton>
        )}
        {done && (
          <form action={removeTask}>
            <input type="hidden" name="id" value={t.id} />
            <button type="submit" className={cn(iconBtn, "hover:text-danger")} aria-label={`„${t.title}“ löschen`} title="Löschen">
              <Trash2 className="size-4" aria-hidden />
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

/**
 * Arbeits-Dashboard: Was ist als Nächstes zu tun, um dem Umsatzziel näherzukommen?
 * Oben der Fokus (höchstens drei Aufgaben), darunter alles Offene nach Dringlichkeit.
 */
export default async function TasksPage({ searchParams }: { searchParams: Promise<{ bereich?: string; error?: string; saved?: string }> }) {
  const { bereich, error } = await searchParams;
  const [tasks, leads] = await Promise.all([getTasks(), getLeads()]);
  const won = wonThisMonth(leads);
  const share = Math.min(100, (won.value / MONTHLY_GOAL) * 100);

  const open = tasks.filter((t) => t.status !== "erledigt");
  const done = tasks.filter((t) => t.status === "erledigt").sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""));
  const focus = open.slice(0, 3); // Backend sortiert: in Arbeit → Priorität → Alter
  const filtered = open.filter((t) => !focus.includes(t) && (!bereich || t.category === bereich));
  const counts = TASK_CATEGORIES.map((c) => ({ c, n: open.filter((t) => t.category === c).length })).filter((x) => x.n > 0);

  return (
    <div className="mx-auto max-w-[1100px]">
      {!isDemoMode() && <LiveRefresh />}
      <p className="text-xs font-medium text-brand-600">Arbeit</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Fokus &amp; Aufgaben</h1>

      {/* Ziel: ehrliche Standortbestimmung statt Deko */}
      <section aria-labelledby="goal-title" className="card-night mt-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="goal-title" className="text-sm font-medium text-night-muted">
              Ziel: {formatEUR(MONTHLY_GOAL)} Umsatz pro Monat
            </h2>
            <p className="num mt-2 text-4xl font-extrabold tracking-tight">{formatEUR(won.value)}</p>
            <p className="mt-1 text-sm text-night-muted">
              gewonnen in diesem Monat · {won.count} {won.count === 1 ? "Auftrag" : "Aufträge"} · {share.toLocaleString("de-DE", { maximumFractionDigits: 1 })} % vom Ziel
            </p>
          </div>
          <dl className="flex gap-6 text-sm">
            <div>
              <dt className="text-night-muted">Offen</dt>
              <dd className="num text-2xl font-extrabold">{open.length}</dd>
            </div>
            <div>
              <dt className="text-night-muted">Erledigt</dt>
              <dd className="num text-2xl font-extrabold">{done.length}</dd>
            </div>
          </dl>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(share)} aria-label="Fortschritt zum Monatsziel">
          <div className="h-full rounded-full bg-mint-400" style={{ width: `${share}%`, minWidth: won.value ? 6 : 0 }} />
        </div>
        <p className="mt-3 text-xs text-night-muted">
          Zählt Anfragen mit Status „Gewonnen“ und eingetragenem Auftragswert. Trag den Wert im Lead ein, sobald ein Auftrag steht.
        </p>
      </section>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-danger/5 px-4 py-3 text-sm text-danger">
          Das hat nicht geklappt. Bitte prüf die Eingabe (Titel mindestens 3 Zeichen) und versuch es erneut.
        </p>
      )}

      <section aria-labelledby="focus-title" className="mt-8">
        <h2 id="focus-title" className="text-lg font-bold text-ink">
          Dein Fokus
        </h2>
        <p className="mt-1 text-sm text-muted">Die drei wichtigsten offenen Aufgaben. Erst diese, dann der Rest.</p>
        {focus.length ? (
          <ul className="mt-4 space-y-2">
            {focus.map((t) => (
              <Task key={t.id} t={t} focus />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-line bg-white p-8 text-center text-muted">Alles erledigt. Leg unten die nächste Aufgabe an.</p>
        )}
      </section>

      <section aria-labelledby="open-title" className="mt-10">
        <h2 id="open-title" className="text-lg font-bold text-ink">
          Danach
        </h2>
        {counts.length > 0 && (
          <nav aria-label="Bereich filtern" className="mt-3 flex flex-wrap gap-1.5">
            <Link href="/admin/aufgaben" aria-current={!bereich ? "page" : undefined} className={cn("flex min-h-9 items-center rounded-full px-3.5 text-sm font-medium", !bereich ? "bg-night text-white" : "bg-white text-body hover:text-ink")}>
              Alle
            </Link>
            {counts.map(({ c, n }) => (
              <Link key={c} href={`/admin/aufgaben?bereich=${c}`} aria-current={bereich === c ? "page" : undefined} className={cn("flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium", bereich === c ? "bg-night text-white" : "bg-white text-body hover:text-ink")}>
                {TASK_CATEGORY_LABEL[c]} <span className="num text-xs opacity-70">{n}</span>
              </Link>
            ))}
          </nav>
        )}
        {filtered.length ? (
          <ul className="mt-4 space-y-2">
            {filtered.map((t) => (
              <Task key={t.id} t={t} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted">{bereich ? "In diesem Bereich ist außerhalb des Fokus nichts offen." : "Keine weiteren offenen Aufgaben."}</p>
        )}
      </section>

      <section aria-labelledby="new-title" className="mt-10 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <h2 id="new-title" className="flex items-center gap-2 text-lg font-bold text-ink">
          <Plus className="size-5 text-brand-600" aria-hidden /> Neue Aufgabe
        </h2>
        <form action={createTask} className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5 text-xs font-semibold text-muted sm:col-span-3">
            Was ist zu tun? *
            <input name="title" required minLength={3} maxLength={200} className={input} />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-muted">
            Bereich
            <select name="category" defaultValue="sonstiges" className={input}>
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {TASK_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-muted">
            Dringlichkeit
            <select name="priority" defaultValue="2" className={input}>
              {[1, 2, 3].map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-muted">
            Aufwand
            <select name="effort" defaultValue="M" className={input}>
              {Object.entries(EFFORT_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-muted sm:col-span-3">
            Warum bringt das Umsatz? (optional)
            <textarea name="why" rows={2} maxLength={4000} className={cn(input, "h-auto py-2.5")} />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-muted sm:col-span-3">
            Schritte – einer pro Zeile (optional)
            <textarea name="steps" rows={3} maxLength={4000} className={cn(input, "h-auto py-2.5")} />
          </label>
          <div className="sm:col-span-3">
            <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              <Plus className="size-4" aria-hidden /> Aufgabe anlegen
            </button>
          </div>
        </form>
      </section>

      {done.length > 0 && (
        <details className="mt-10">
          <summary className="inline-flex min-h-11 items-center text-sm font-semibold text-muted hover:text-ink">Erledigt ({done.length})</summary>
          <ul className="mt-3 space-y-2">
            {done.map((t) => (
              <Task key={t.id} t={t} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
