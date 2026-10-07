import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle, ArrowRight, BarChart3, Check, CircleDot, Code2, Compass, Handshake, Lightbulb, type LucideIcon, Megaphone, MessageCircleQuestion, Pause, Play, Power, ShieldCheck, TrendingUp, X,
} from "lucide-react";
import { removeTask, requestRun, setTeam } from "@/app/admin/actions";
import { getTasks, getTeam, needsYou } from "@/lib/admin/data";
import { TASK_CATEGORY_LABEL } from "@/lib/admin/labels";
import { departmentById, departments, type Department } from "@/config/team";
import { isDemoMode } from "@/lib/env";
import { cn, formatDateTime } from "@/lib/format";
import type { AgentEventKind, TaskRow, TeamState } from "@/types/database";
import { LiveRefresh } from "@/components/admin/LiveRefresh";

export const metadata: Metadata = { title: "Team" };

const ICON: Record<Department["icon"], LucideIcon> = { compass: Compass, code: Code2, trending: TrendingUp, megaphone: Megaphone, handshake: Handshake, shield: ShieldCheck, chart: BarChart3 };

const EVENT: Record<AgentEventKind, { icon: LucideIcon; tone: string; label: string }> = {
  start: { icon: Play, tone: "bg-brand-50 text-brand-600", label: "Start" },
  schritt: { icon: CircleDot, tone: "bg-canvas text-body", label: "Zwischenstand" },
  fertig: { icon: Check, tone: "bg-emerald-50 text-emerald-800", label: "Erledigt" },
  rueckfrage: { icon: MessageCircleQuestion, tone: "bg-amber-50 text-amber-800", label: "Rückfrage" },
  fehler: { icon: AlertTriangle, tone: "bg-rose-50 text-rose-800", label: "Fehler" },
  vorschlag: { icon: Lightbulb, tone: "bg-brand-50 text-brand-600", label: "Vorschlag" },
  uebergabe: { icon: ArrowRight, tone: "bg-sky-50 text-sky-800", label: "Übergabe" },
  planung: { icon: Compass, tone: "bg-canvas text-body", label: "Planung" },
  info: { icon: Power, tone: "bg-canvas text-body", label: "Hinweis" },
};

const time = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
const dayKey = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Berlin" });
const pill = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-colors";

function DepartmentCard({ d, state, tasks, active }: { d: Department; state: TeamState; tasks: TaskRow[]; active: boolean }) {
  const Icon = ICON[d.icon];
  const s = state.departments.find((x) => x.id === d.id);
  const working = state.running?.department === d.id ? state.running : null;
  const mine = tasks.filter((t) => t.department === d.id && t.status !== "erledigt");
  const queue = mine.filter((t) => t.run_state === "beauftragt");
  const doneCount = tasks.filter((t) => t.department === d.id && t.status === "erledigt").length;
  const max = Number(state.settings.max_tasks_per_day);

  const status = working
    ? { label: "Arbeitet gerade", tone: "bg-brand-500 text-white", dot: "bg-white animate-pulse" }
    : !active
      ? { label: "Pausiert", tone: "bg-canvas text-muted", dot: "bg-muted" }
      : queue.length
        ? { label: `${queue.length} in der Warteschlange`, tone: "bg-brand-50 text-brand-600", dot: "bg-brand-500" }
        : { label: "Frei", tone: "bg-emerald-50 text-emerald-800", dot: "bg-mint-500" };

  return (
    <li className={cn("flex flex-col rounded-[1.75rem] border bg-white p-5", working ? "border-brand-300 shadow-[var(--shadow-picked)]" : "border-line")}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", working ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600")}>
          <Icon className="size-5" aria-hidden />
        </span>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", status.tone)}>
          <span className={cn("size-1.5 rounded-full", status.dot)} aria-hidden />
          {status.label}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">{d.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">{d.role}</p>

      <div className="mt-4 min-h-[4.5rem] flex-1 rounded-2xl bg-canvas p-3.5 text-sm">
        {working ? (
          <>
            <p className="text-xs font-semibold text-brand-600">Jetzt · seit {time.format(new Date(working.since))} Uhr</p>
            <p className="mt-1 font-semibold text-ink">{working.title}</p>
            {s?.last_event && s.last_event.kind === "schritt" && <p className="mt-1 text-body">{s.last_event.text}</p>}
          </>
        ) : queue.length ? (
          <>
            <p className="text-xs font-semibold text-muted">Als Nächstes</p>
            <p className="mt-1 font-semibold text-ink">{queue[0].title}</p>
          </>
        ) : s?.last_event ? (
          <>
            <p className="text-xs font-semibold text-muted">Zuletzt · {formatDateTime(s.last_event.created_at)}</p>
            <p className="mt-1 line-clamp-2 text-body">{s.last_event.text}</p>
          </>
        ) : (
          <p className="text-muted">Noch kein Durchlauf.</p>
        )}
      </div>

      <dl className="num mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Offen", mine.length],
          ["Erledigt", doneCount],
          ["Heute", `${s?.starts_today ?? 0}/${max}`],
        ].map(([label, value]) => (
          <div key={label}>
            <dd className="text-lg font-extrabold text-ink">{value}</dd>
            <dt className="text-xs text-muted">{label}</dt>
          </div>
        ))}
      </dl>
      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Fertigkeiten">
        {d.skills.map((k) => (
          <li key={k} className="rounded-full border border-line px-2.5 py-1 text-xs text-body">
            {k}
          </li>
        ))}
      </ul>
    </li>
  );
}

/**
 * Command Center: Wer arbeitet woran, was wartet auf Karim, was ist passiert.
 * Alles hier ist echt – die Abteilungen melden ihre Schritte selbst (team/README.md); nichts wird simuliert.
 */
export default async function TeamPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, state, tasks] = await Promise.all([searchParams, getTeam(), getTasks()]);
  const active = state.settings.team_active === "1";
  const auto = state.settings.autonomy === "selbststaendig";
  const waiting = tasks.filter(needsYou);
  const queued = tasks.filter((t) => t.run_state === "beauftragt" && t.status !== "erledigt").length;

  // Protokoll nach Tagen gruppieren
  const days = new Map<string, TeamState["events"]>();
  for (const e of state.events) {
    const k = dayKey.format(new Date(e.created_at));
    days.set(k, [...(days.get(k) ?? []), e]);
  }

  return (
    <div className="mx-auto max-w-[1280px]">
      {!isDemoMode() && <LiveRefresh />}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-brand-600">Arbeit</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Team</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Sieben Abteilungen suchen selbst nach Aufgaben, setzen sie um und geben sich gegenseitig Arbeit weiter. Du siehst jeden Schritt und kannst jederzeit eingreifen.
          </p>
        </div>
        <form action={setTeam}>
          <input type="hidden" name="active" value={active ? "0" : "1"} />
          <button type="submit" className={cn(pill, "min-h-12 px-6", active ? "border border-line bg-white text-ink hover:border-brand-300" : "bg-brand-500 text-white shadow-[var(--shadow-brand)] hover:bg-brand-600")}>
            {active ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {active ? "Team pausieren" : "Team einschalten"}
          </button>
        </form>
      </header>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-danger/5 px-4 py-3 text-sm text-danger">
          Die Einstellung wurde nicht gespeichert. Bitte versuch es erneut.
        </p>
      )}

      {/* Stand + Regeln: eine dunkle Karte, damit der Hauptschalter-Zustand nicht zu übersehen ist */}
      <section aria-label="Stand und Regeln" className="card-night mt-6 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-night-muted">
            <span className={cn("size-2 rounded-full", active ? "bg-mint-400" : "bg-night-muted")} aria-hidden />
            {active ? "Team ist eingeschaltet" : "Team ist pausiert"}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {state.running
              ? `${departmentById[state.running.department].name} arbeitet gerade.`
              : !active
                ? "Niemand arbeitet. Schalte das Team ein, wenn du bereit bist."
                : queued
                  ? `${queued} ${queued === 1 ? "Aufgabe wartet" : "Aufgaben warten"} auf den nächsten Durchlauf.`
                  : "Alles abgearbeitet. Das Team wartet auf neue Aufgaben."}
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-night-muted">
            Nach jeder Aufgabe startet die nächste Abteilung von selbst; ist nichts offen, sucht eine Abteilung neue Aufgaben. Zusätzlich stößt ein Taktgeber das Team stündlich zwischen 7 und 22 Uhr an. Das läuft nur, solange die Claude-App auf deinem Mac geöffnet ist.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <form action={setTeam} className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs font-semibold text-night-muted">Neue Vorschläge des Teams</p>
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-white/5 p-1">
              {(
                [
                  ["freigabe", "Mit Freigabe"],
                  ["selbststaendig", "Selbstständig"],
                ] as const
              ).map(([value, label]) => (
                <button key={value} type="submit" name="autonomy" value={value} aria-pressed={state.settings.autonomy === value} className={cn("min-h-11 rounded-full px-3 text-sm font-semibold transition-colors", state.settings.autonomy === value ? "bg-white text-ink" : "text-night-muted hover:text-white")}>
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-night-muted">
              {auto ? "Das Team legt Aufgaben an und setzt sie direkt um. Nur Preise, Rechtstexte, Kosten, Löschungen und das Scharfschalten von Anzeigen warten auf dich." : "Jeder Vorschlag wartet auf dein Okay, bevor jemand daran arbeitet."}
            </p>
          </form>
          <form action={setTeam} className="rounded-2xl bg-white/5 p-4">
            <label htmlFor="max" className="text-xs font-semibold text-night-muted">
              Aufgaben pro Abteilung und Tag
            </label>
            <div className="mt-3 flex gap-2">
              <select id="max" name="max" defaultValue={state.settings.max_tasks_per_day} className="h-11 flex-1 rounded-full bg-white px-4 text-sm font-semibold text-ink">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    höchstens {n}
                  </option>
                ))}
              </select>
              <button type="submit" className="min-h-11 rounded-full bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/20">
                Speichern
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-night-muted">Begrenzt den Verbrauch. Ohne Aufgabe startet keine Abteilung.</p>
          </form>
        </div>
      </section>

      {waiting.length > 0 && (
        <section aria-labelledby="wait-title" className="mt-8">
          <h2 id="wait-title" className="flex items-center gap-2 text-lg font-bold text-ink">
            Wartet auf dich <span className="num rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">{waiting.length}</span>
          </h2>
          <ul className="mt-4 space-y-2">
            {waiting.map((t) => {
              const question = t.run_state === "rueckfrage";
              return (
                <li key={t.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", question ? "bg-amber-50 text-amber-800" : "bg-brand-50 text-brand-600")}>{question ? "Rückfrage" : "Vorschlag"}</span>
                    <span className="rounded-full bg-canvas px-2.5 py-0.5 font-medium text-body">
                      {t.requested_by && t.requested_by !== t.department ? `${departmentById[t.requested_by].name} → ${departmentById[t.department].name}` : departmentById[t.department].name}
                    </span>
                    <span className="text-muted">{TASK_CATEGORY_LABEL[t.category]}</span>
                    {t.client && <span className="rounded-full bg-night px-2.5 py-0.5 font-semibold text-white">Kunde: {t.client}</span>}
                    {t.risk === "hoch" && <span className="rounded-full bg-rose-50 px-2.5 py-0.5 font-semibold text-rose-800">Braucht immer dein Okay</span>}
                    {t.executor === "karim" && <span className="rounded-full border border-line px-2.5 py-0.5 text-muted">Nur du kannst das erledigen</span>}
                  </div>
                  <p className="mt-2 font-semibold text-ink">{t.title}</p>
                  {question ? <p className="mt-1 text-sm leading-relaxed text-body">{t.run_note}</p> : t.why && <p className="mt-1 text-sm leading-relaxed text-body">{t.why}</p>}
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    {t.executor !== "karim" && (
                      <form action={requestRun} className={cn("flex flex-wrap items-end gap-2", (question || t.executor === "beide") && "min-w-0 flex-1 basis-full sm:basis-auto")}>
                        <input type="hidden" name="id" value={t.id} />
                        {(question || t.executor === "beide") && (
                          <label className="grid min-w-48 flex-1 gap-1 text-xs font-semibold text-muted">
                            {question ? "Deine Antwort" : "Angaben für das Team (optional)"}
                            <input name="input" required={question} defaultValue={question ? "" : (t.run_input ?? "")} className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-500" />
                          </label>
                        )}
                        <button type="submit" className={cn(pill, "bg-night text-white hover:bg-night-soft")}>
                          <Check className="size-4" aria-hidden /> {question ? "Antworten und weiter" : "Freigeben"}
                        </button>
                      </form>
                    )}
                    {!question && (
                      <form action={removeTask}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className={cn(pill, "border border-line bg-white text-body hover:text-danger")}>
                          <X className="size-4" aria-hidden /> Ablehnen
                        </button>
                      </form>
                    )}
                    <Link href="/admin/aufgaben" className={cn(pill, "px-3 font-medium text-brand-600")}>
                      Details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="dept-title" className="mt-10">
        <h2 id="dept-title" className="text-lg font-bold text-ink">
          Abteilungen
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => (
            <DepartmentCard key={d.id} d={d} state={state} tasks={tasks} active={active} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="log-title" className="mt-10">
        <h2 id="log-title" className="text-lg font-bold text-ink">
          Live-Protokoll
        </h2>
        <p className="mt-1 text-sm text-muted">Jeder Schritt, den eine Abteilung meldet. Die Seite aktualisiert sich von selbst.</p>
        {state.events.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-line bg-white p-8 text-center text-muted">Noch nichts passiert. Sobald das Team arbeitet, erscheint hier jeder Schritt.</p>
        ) : (
          <div className="mt-4 rounded-2xl border border-line bg-white p-2 sm:p-4" aria-live="polite">
            {[...days.entries()].map(([day, events]) => (
              <div key={day}>
                <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted">{day}</p>
                <ol>
                  {events.map((e) => {
                    const k = EVENT[e.kind];
                    return (
                      <li key={e.id} className="grid grid-cols-[auto_1fr] gap-x-3 rounded-xl px-3 py-2.5 hover:bg-canvas/70 sm:grid-cols-[3.25rem_auto_1fr]">
                        <time dateTime={e.created_at} className="num pt-1 text-xs text-muted max-sm:col-start-2 max-sm:row-start-2">
                          {time.format(new Date(e.created_at))}
                        </time>
                        <span className={cn("row-span-2 grid size-8 place-items-center rounded-full sm:row-span-1", k.tone)} title={k.label}>
                          <k.icon className="size-4" aria-hidden />
                          <span className="sr-only">{k.label}</span>
                        </span>
                        <p className="min-w-0 text-sm leading-relaxed text-body">
                          <b className="font-semibold text-ink">{departmentById[e.agent]?.name ?? e.agent}</b>
                          {e.task_title && e.kind === "schritt" && <span className="text-muted"> · {e.task_title}</span>}
                          <br />
                          {e.text}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
