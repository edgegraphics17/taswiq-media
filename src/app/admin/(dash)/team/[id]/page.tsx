import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, ChevronsUp, Clock } from "lucide-react";
import { reorderTask, requestRun, setTask } from "@/app/admin/actions";
import { getTasks, getTeam, needsYou } from "@/lib/admin/data";
import { EFFORT_LABEL, PRIORITY_LABEL, TASK_CATEGORY_LABEL } from "@/lib/admin/labels";
import { DEPARTMENT_IDS, departmentById, type DepartmentId } from "@/config/team";
import { isDemoMode } from "@/lib/env";
import { cn, formatDate, formatDateTime } from "@/lib/format";
import type { TaskRow } from "@/types/database";
import { ApprovalItem } from "@/components/admin/ApprovalItem";
import { LiveRefresh } from "@/components/admin/LiveRefresh";

export const metadata: Metadata = { title: "Abteilung" };

const iconBtn = "grid size-11 shrink-0 place-items-center rounded-lg text-body transition-colors hover:bg-canvas hover:text-ink disabled:opacity-25 disabled:hover:bg-transparent";

function Move({ id, dir, label, disabled, children }: { id: string; dir: "up" | "down" | "top"; label: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <form action={reorderTask}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="dir" value={dir} />
      <button type="submit" disabled={disabled} aria-label={label} title={label} className={iconBtn}>
        {children}
      </button>
    </form>
  );
}

function Details({ t }: { t: TaskRow }) {
  const steps = t.steps?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [];
  if (!t.why && !steps.length && !t.run_note) return null;
  return (
    <details className="mt-1.5 text-sm text-body">
      <summary className="inline-flex min-h-9 items-center font-medium text-brand-600">Details</summary>
      <div className="max-w-3xl space-y-2 pb-1 leading-relaxed">
        {t.why && <p>{t.why}</p>}
        {steps.length > 0 && (
          <ol className="list-decimal space-y-1 pl-5">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
        {t.run_note && (
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-ink">
            <b>Rückmeldung: </b>
            {t.run_note}
          </p>
        )}
      </div>
    </details>
  );
}

const Meta = ({ t }: { t: TaskRow }) => (
  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
    <span className="rounded-full bg-canvas px-2.5 py-0.5 font-medium text-body">{TASK_CATEGORY_LABEL[t.category]}</span>
    <span>{EFFORT_LABEL[t.effort]}</span>
    {t.client && <span className="rounded-full bg-night px-2.5 py-0.5 font-semibold text-white">Kunde: {t.client}</span>}
    {t.proposed_by && <span>angelegt von {departmentById[t.proposed_by].name}</span>}
  </p>
);

/** Eine Abteilung von innen: was läuft, was als Nächstes kommt (Reihenfolge änderbar), was auf dich wartet, was erledigt ist. */
export default async function DepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(DEPARTMENT_IDS as readonly string[]).includes(id)) notFound();
  const d = departmentById[id as DepartmentId];
  const [state, all] = await Promise.all([getTeam(), getTasks()]);
  const tasks = all.filter((t) => t.department === d.id);
  const open = tasks.filter((t) => t.status !== "erledigt");
  const running = open.filter((t) => t.run_state === "laeuft");
  // gleiche Reihenfolge wie im Backend: fester Platz → Dringlichkeit → Zeitpunkt der Übergabe
  const queue = open
    .filter((t) => t.run_state === "beauftragt" && t.executor !== "karim")
    .sort((a, b) => (a.queue_pos ?? 1e6) - (b.queue_pos ?? 1e6) || a.priority - b.priority || (a.run_requested_at ?? "").localeCompare(b.run_requested_at ?? ""));
  const waiting = open.filter(needsYou);
  const parked = open.filter((t) => t.run_state === "zurueckgestellt");
  const own = open.filter((t) => t.executor === "karim");
  const done = tasks.filter((t) => t.status === "erledigt").sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""));
  const events = state.events.filter((e) => e.agent === d.id).slice(0, 15);
  const info = state.departments.find((x) => x.id === d.id);
  const max = Number(state.settings.max_tasks_per_day);

  return (
    <div className="mx-auto max-w-[1100px]">
      {!isDemoMode() && <LiveRefresh />}
      <Link href="/admin/team" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Team
      </Link>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">{d.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{d.role}</p>
      <dl className="num mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["In der Warteschlange", queue.length],
          ["Wartet auf dich", waiting.length],
          ["Erledigt", done.length],
          ["Heute gestartet", `${info?.starts_today ?? 0} von ${max}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4">
            <dt className="text-xs font-semibold text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-extrabold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {running.map((t) => (
        <section key={t.id} aria-label="Läuft gerade" className="mt-6 rounded-2xl border border-brand-300 bg-white p-5 shadow-[var(--shadow-picked)]">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600">
            <span className="size-1.5 animate-pulse rounded-full bg-brand-500" aria-hidden /> Läuft gerade
          </p>
          <p className="mt-1 text-lg font-bold text-ink">{t.title}</p>
          {events[0] && <p className="mt-1 text-sm text-body">{events[0].text}</p>}
        </section>
      ))}

      <section aria-labelledby="queue-title" className="mt-8">
        <h2 id="queue-title" className="text-lg font-bold text-ink">
          Warteschlange
        </h2>
        <p className="mt-1 text-sm text-muted">Von oben nach unten wird abgearbeitet. Mit den Pfeilen änderst du die Reihenfolge.</p>
        {queue.length ? (
          <ol className="mt-4 space-y-2">
            {queue.map((t, i) => (
              <li key={t.id} className="flex items-start gap-1 rounded-2xl border border-line bg-white p-2 sm:gap-3 sm:p-3">
                <span className="num grid size-11 shrink-0 place-items-center text-lg font-extrabold text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1 py-1.5">
                  <p className="font-semibold text-ink">{t.title}</p>
                  <Meta t={t} />
                  <Details t={t} />
                </div>
                <div className="flex shrink-0 flex-wrap justify-end">
                  <Move id={t.id} dir="top" label={`„${t.title}“ ganz nach oben`} disabled={i === 0}>
                    <ChevronsUp className="size-4" aria-hidden />
                  </Move>
                  <Move id={t.id} dir="up" label={`„${t.title}“ eins nach oben`} disabled={i === 0}>
                    <ArrowUp className="size-4" aria-hidden />
                  </Move>
                  <Move id={t.id} dir="down" label={`„${t.title}“ eins nach unten`} disabled={i === queue.length - 1}>
                    <ArrowDown className="size-4" aria-hidden />
                  </Move>
                  <form action={requestRun}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="defer" value="1" />
                    <button type="submit" aria-label={`„${t.title}“ zurückstellen`} title="Zurückstellen" className={iconBtn}>
                      <Clock className="size-4" aria-hidden />
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-2xl border border-line bg-white p-8 text-center text-muted">
            Leer. Beim nächsten Takt sucht die Abteilung selbst nach neuen Aufgaben{info?.last_plan_at ? ` (zuletzt geplant am ${formatDateTime(info.last_plan_at)})` : ""}.
          </p>
        )}
      </section>

      {waiting.length > 0 && (
        <section aria-labelledby="wait-title" className="mt-10">
          <h2 id="wait-title" className="text-lg font-bold text-ink">
            Wartet auf dich
          </h2>
          <ul className="mt-4 space-y-2">
            {waiting.map((t) => (
              <ApprovalItem key={t.id} t={t} />
            ))}
          </ul>
        </section>
      )}

      {(own.length > 0 || parked.length > 0) && (
        <section aria-labelledby="other-title" className="mt-10">
          <h2 id="other-title" className="text-lg font-bold text-ink">
            Nicht beim Team
          </h2>
          <ul className="mt-4 space-y-2">
            {[...own, ...parked.filter((t) => !own.includes(t))].map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-line bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{t.title}</p>
                  <p className="mt-1 text-xs text-muted">{t.executor === "karim" ? "Nur du kannst das erledigen" : "Zurückgestellt"} · {PRIORITY_LABEL[t.priority]}</p>
                  <Details t={t} />
                </div>
                {t.executor !== "karim" && (
                  <form action={requestRun}>
                    <input type="hidden" name="id" value={t.id} />
                    <button type="submit" className="min-h-11 rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink hover:border-brand-300">
                      Wieder einreihen
                    </button>
                  </form>
                )}
                {t.executor === "karim" && (
                  <form action={setTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value="erledigt" />
                    <button type="submit" className="min-h-11 rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink hover:border-brand-300">
                      Erledigt
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {done.length > 0 && (
        <section aria-labelledby="done-title" className="mt-10">
          <h2 id="done-title" className="text-lg font-bold text-ink">
            Erledigt
          </h2>
          <ul className="mt-4 space-y-2">
            {done.slice(0, 12).map((t) => (
              <li key={t.id} className="rounded-2xl border border-line bg-white p-4">
                <p className="font-semibold text-ink">{t.title}</p>
                <p className="mt-1 text-xs text-muted">{t.done_at ? `erledigt am ${formatDate(t.done_at)}` : "erledigt"}</p>
                {t.run_note && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-body">{t.run_note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {events.length > 0 && (
        <section aria-labelledby="log-title" className="mt-10">
          <h2 id="log-title" className="text-lg font-bold text-ink">
            Letzte Meldungen
          </h2>
          <ol className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white px-4">
            {events.map((e) => (
              <li key={e.id} className={cn("grid gap-x-4 py-3 text-sm sm:grid-cols-[9.5rem_1fr]")}>
                <time dateTime={e.created_at} className="num text-xs text-muted sm:pt-0.5">
                  {formatDateTime(e.created_at)}
                </time>
                <p className="leading-relaxed text-body">{e.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
