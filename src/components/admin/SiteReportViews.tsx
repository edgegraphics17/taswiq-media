"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, CircleCheck, CircleDashed, CircleMinus, ListChecks, Send, TriangleAlert } from "lucide-react";
import { sendFinding } from "@/app/admin/actions";
import { keywordAreas } from "@/config/keywords";
import type { Finding, SiteReport } from "@/lib/admin/site-findings";
import type { KeywordResult } from "@/lib/admin/site-structure";
import { cn, formatDate, formatNumber } from "@/lib/format";

/**
 * Reiter „Heute“ und „Suchbegriffe“ der Seitenstruktur.
 * Heute = Arbeitsliste: Befunde nach Dringlichkeit, jeder mit Begründung, betroffenen Seiten, Lösungsvorschlag
 * und der Übergabe an Claude. Darunter die Bereiche im Vergleich.
 */

const LEVEL = [
  { label: "Zuerst beheben", dot: "bg-danger" },
  { label: "Verbessern", dot: "bg-amber-500" },
  { label: "Feinschliff", dot: "bg-muted" },
];

const panel = "rounded-2xl border border-line bg-white";

function TaskState({ task }: { task: NonNullable<Finding["task"]> }) {
  const text = task.status === "erledigt" ? "Als erledigt gemeldet – besteht aber noch" : task.run_state === "laeuft" ? "Claude arbeitet daran" : task.run_state === "beauftragt" ? "An Claude übergeben" : task.run_state === "rueckfrage" ? "Rückfrage an dich" : "Aufgabe angelegt";
  return (
    <Link href="/admin/aufgaben" className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-100">
      <ListChecks className="size-3.5" aria-hidden /> {text}
      {!task.exact && " (anderer Umfang)"}
    </Link>
  );
}

function FindingCard({ f, locale, label, onSelect }: { f: Finding; locale: string; label: (path: string) => string; onSelect: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  const [state, action, pending] = useActionState(sendFinding, null);
  // Welcher der beiden Knöpfe gedrückt wurde – als Feld, nicht über den Knopf selbst (der wird beim Absenden gesperrt).
  const run = useRef<HTMLInputElement>(null);
  const items = all ? f.items : f.items.slice(0, 6);
  const done = state?.ok || f.task?.exact;

  return (
    <li className={cn(panel, "overflow-hidden")}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left hover:bg-canvas/60">
        <span className={cn("size-2.5 shrink-0 rounded-full", LEVEL[f.level - 1].dot)} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">{f.title}</span>
          <span className="block text-xs text-muted">
            {f.topic} · {LEVEL[f.level - 1].label}
          </span>
        </span>
        {f.task && <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 max-sm:hidden">{f.task.run_state === "beauftragt" || f.task.run_state === "laeuft" ? "bei Claude" : "Aufgabe"}</span>}
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <div className="grid gap-x-8 gap-y-5 border-t border-line px-4 py-4 lg:grid-cols-2">
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-muted">Warum das zählt</h4>
            <p className="mt-1 text-sm leading-relaxed text-body">{f.why}</p>
            <h4 className="mt-4 text-xs font-semibold text-muted">Betroffen</h4>
            <ul className="mt-1">
              {items.map((i, n) => (
                <li key={n}>
                  {i.path ? (
                    <button type="button" onClick={() => onSelect(i.path!)} className="flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-canvas">
                      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-brand-600" aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{label(i.path)}</span>
                        {i.note && <span className="block text-xs break-words text-body">{i.note}</span>}
                      </span>
                    </button>
                  ) : (
                    <p className="flex items-center gap-2 px-2 py-1.5 text-sm text-ink">
                      <CircleDashed className="size-3.5 shrink-0 text-muted" aria-hidden /> {i.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {f.items.length > 6 && (
              <button type="button" onClick={() => setAll(!all)} className="mt-1 min-h-9 cursor-pointer px-2 text-xs font-semibold text-brand-600 hover:text-brand-700">
                {all ? "Weniger zeigen" : `Alle ${f.items.length} zeigen`}
              </button>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-muted">Lösungsvorschlag</h4>
            <ol className="mt-1 space-y-1.5">
              {f.steps.map((s, n) => (
                <li key={n} className="flex gap-2.5 text-sm leading-relaxed text-body">
                  <span className="num mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-ink">{n + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-xl bg-canvas p-3">
              {done ? (
                <div className="flex flex-wrap items-center gap-3">
                  {f.task ? <TaskState task={f.task} /> : null}
                  {state?.ok && (
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700" role="status">
                      <Check className="size-4" aria-hidden /> {state.message}
                    </p>
                  )}
                </div>
              ) : (
                <form action={action}>
                  <input type="hidden" name="id" value={f.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="run" ref={run} defaultValue="" />
                  {f.task && (
                    <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-body">
                      <TaskState task={f.task} /> Inzwischen sind andere Seiten betroffen – du kannst den neuen Stand zusätzlich übergeben.
                    </p>
                  )}
                  <label className="block text-xs font-semibold text-muted" htmlFor={`hinweis-${f.id}`}>
                    Hinweis für Claude (optional)
                  </label>
                  <textarea id={`hinweis-${f.id}`} name="input" rows={2} maxLength={2000} placeholder="z. B. „Erst die Branchenseiten, Ratgeber später“" className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="submit" onClick={() => run.current && (run.current.value = "1")} disabled={pending} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                      <Send className="size-4" aria-hidden /> {pending ? "Wird übergeben …" : "An Claude übergeben"}
                    </button>
                    <button type="submit" onClick={() => run.current && (run.current.value = "")} disabled={pending} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-semibold text-ink hover:border-brand-200 disabled:opacity-60">
                      Nur als Aufgabe merken
                    </button>
                  </div>
                  {state && !state.ok && (
                    <p className="mt-2 text-sm text-danger" role="alert">
                      {state.message}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export function TodayView({ report, locale, label, onSelect, onKeywords }: { report: SiteReport; locale: string; label: (path: string) => string; onSelect: (path: string) => void; onKeywords: () => void }) {
  const s = report.summary;
  const d = report.diff;
  const [topic, setTopic] = useState<string>("alle");
  const topics = Array.from(new Set(report.findings.map((f) => f.topic)));
  const shown = report.findings.filter((f) => topic === "alle" || f.topic === topic);
  const changes = d ? [d.newFindings.length && `${d.newFindings.length} neu`, d.resolved.length && `${d.resolved.length} behoben`, d.newPages.length && `${d.newPages.length} neue ${d.newPages.length === 1 ? "Seite" : "Seiten"}`, d.gonePages.length && `${d.gonePages.length} entfernt`].filter(Boolean) : [];
  const tiles = [
    { label: "Seiten ohne Befund", value: `${s.clean} von ${s.pages}`, hint: "ohne dringende oder wichtige Auffälligkeit" },
    { label: "Offene Befunde", value: formatNumber(s.level[0] + s.level[1] + s.level[2]), hint: `${s.level[0]} dringend · ${s.level[1]} wichtig · ${s.level[2]} Feinschliff`, tone: s.level[0] ? "text-danger" : s.level[1] ? "text-amber-600" : "text-emerald-600" },
    { label: "Besucher über Suche", value: formatNumber(s.search), hint: `30 Tage · dazu ${formatNumber(s.ai)} über KI-Assistenten` },
    { label: "Suchbegriffe besetzt", value: s.keywordsTotal ? `${s.keywordsStrong} von ${s.keywordsTotal}` : "–", hint: s.keywordsTotal ? "Begriff steht in Titel oder Überschrift" : "nur für die deutsche Website" },
  ];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className={cn(panel, "p-4")}>
            <p className="text-xs font-medium text-muted">{t.label}</p>
            <p className={cn("num mt-1 text-2xl font-extrabold tracking-tight", t.tone ?? "text-ink")}>{t.value}</p>
            <p className="mt-0.5 text-xs text-muted">{t.hint}</p>
          </div>
        ))}
      </div>

      {d && (
        <section className={cn(panel, "mt-3 px-4 py-3")}>
          <p className="text-sm text-ink">
            <b>Seit {formatDate(d.since)}:</b> {changes.length ? changes.join(" · ") : "keine Veränderung"}
          </p>
          {(d.newFindings.length > 0 || d.resolved.length > 0 || d.newPages.length > 0) && (
            <ul className="mt-1.5 space-y-0.5 text-xs text-body">
              {d.newFindings.map((t) => (
                <li key={`n${t}`} className="flex items-center gap-1.5">
                  <TriangleAlert className="size-3.5 shrink-0 text-amber-600" aria-hidden /> Neu: {t}
                </li>
              ))}
              {d.resolved.map((t) => (
                <li key={`r${t}`} className="flex items-center gap-1.5">
                  <CircleCheck className="size-3.5 shrink-0 text-emerald-600" aria-hidden /> Behoben: {t}
                </li>
              ))}
              {d.newPages.slice(0, 8).map((p) => (
                <li key={`p${p}`} className="flex items-center gap-1.5">
                  <ArrowRight className="size-3.5 shrink-0 text-brand-600" aria-hidden /> Neue Seite: {label(p)}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Was jetzt zu tun ist</h2>
            <p className="mt-0.5 text-sm text-muted">{report.findings.length ? "Aufklappen zeigt Ursache, betroffene Seiten und den Lösungsvorschlag – mit einem Klick an Claude übergeben." : "Nichts – die Website ist ohne Befund."}</p>
          </div>
          {topics.length > 1 && (
            <div role="group" aria-label="Thema" className="flex flex-wrap gap-1.5">
              {["alle", ...topics].map((t) => (
                <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)} className={cn("min-h-9 cursor-pointer rounded-full px-3.5 text-xs font-semibold", topic === t ? "bg-night text-white" : "border border-line bg-white text-muted hover:text-ink")}>
                  {t === "alle" ? "Alle" : t}
                </button>
              ))}
            </div>
          )}
        </div>
        <ul className="mt-3 space-y-2">
          {shown.map((f) => (
            <FindingCard key={f.key} f={f} locale={locale} label={label} onSelect={onSelect} />
          ))}
        </ul>
      </section>

      {report.areas.length > 0 && (
        <section className={cn(panel, "mt-6 overflow-x-auto")}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
            <div>
              <h2 className="text-sm font-bold text-ink">Bereiche im Vergleich</h2>
              <p className="mt-0.5 text-xs text-muted">Wo läuft es, wo fehlt noch Abdeckung? Besucher und Anfragen der letzten 30 Tage.</p>
            </div>
            <button type="button" onClick={onKeywords} className="flex min-h-9 cursor-pointer items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
              Alle Suchbegriffe <ArrowRight className="size-3.5" aria-hidden />
            </button>
          </div>
          <table className="mt-3 w-full min-w-[640px] text-left text-sm">
            <thead className="border-y border-line text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Bereich</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Suchbegriffe besetzt</th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">Ohne Seite</th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">Besucher</th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">davon Suche</th>
                <th scope="col" className="px-4 py-2.5 text-right font-semibold">Anfragen</th>
              </tr>
            </thead>
            <tbody>
              {report.areas.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-4 py-2.5 font-semibold text-ink">{a.label}</th>
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-canvas" aria-hidden>
                        <span className="block h-full rounded-full bg-brand-500" style={{ width: `${(a.strong / a.total) * 100}%` }} />
                      </span>
                      <span className="num text-body">
                        {a.strong} von {a.total}
                      </span>
                    </span>
                  </td>
                  <td className={cn("num px-3 py-2.5 text-right", a.open ? "font-semibold text-amber-600" : "text-muted")}>{a.open}</td>
                  <td className="num px-3 py-2.5 text-right">{formatNumber(a.visitors)}</td>
                  <td className="num px-3 py-2.5 text-right">{formatNumber(a.search)}</td>
                  <td className="num px-4 py-2.5 text-right">{a.leads ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

const KW: Record<KeywordResult["status"], { label: string; tone: string; icon: typeof CircleCheck }> = {
  stark: { label: "Besetzt", tone: "text-emerald-600", icon: CircleCheck },
  schwach: { label: "Nur im Text", tone: "text-amber-600", icon: TriangleAlert },
  fehlt: { label: "Fehlt auf der Zielseite", tone: "text-danger", icon: TriangleAlert },
  offen: { label: "Keine Seite", tone: "text-muted", icon: CircleMinus },
};

export function KeywordView({ keywords, report, label, onSelect }: { keywords: KeywordResult[]; report: SiteReport; label: (path: string) => string; onSelect: (path: string) => void }) {
  const [only, setOnly] = useState<"alle" | KeywordResult["status"]>("alle");
  const stats = new Map((report.paths?.pages ?? []).map((p) => [p.path, p]));
  if (!keywords.length) return <p className={cn(panel, "mt-4 px-4 py-6 text-sm text-muted")}>Suchbegriffe sind bisher nur für die deutsche Website hinterlegt.</p>;
  const count = (s: KeywordResult["status"]) => keywords.filter((k) => k.status === s).length;

  return (
    <div className="mt-4">
      <p className="rounded-xl border border-line bg-white px-4 py-3 text-sm leading-relaxed text-body">
        <b className="text-ink">Was hier geprüft wird:</b> ob jeder Suchbegriff eine Zielseite hat und dort in Titel oder Hauptüberschrift steht, und wie viele Besucher über Suchmaschinen auf dieser Seite landen.{" "}
        <b className="text-ink">Was noch fehlt:</b> die tatsächliche Position bei Google – die liefert erst die Search Console, sobald sie eingerichtet ist.
      </p>
      <div role="group" aria-label="Status" className="mt-3 flex flex-wrap gap-1.5">
        {(["alle", "stark", "schwach", "fehlt", "offen"] as const).map((s) => (
          <button key={s} type="button" aria-pressed={only === s} onClick={() => setOnly(s)} className={cn("num min-h-9 cursor-pointer rounded-full px-3.5 text-xs font-semibold", only === s ? "bg-night text-white" : "border border-line bg-white text-muted hover:text-ink")}>
            {s === "alle" ? `Alle ${keywords.length}` : `${KW[s].label} ${count(s)}`}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {keywordAreas.map((a) => {
          const list = keywords.filter((k) => k.area === a.id && (only === "alle" || k.status === only));
          if (!list.length) return null;
          return (
            <section key={a.id} className={cn(panel, "p-4")}>
              <h2 className="text-sm font-bold text-ink">{a.label}</h2>
              <ul className="mt-2 divide-y divide-line">
                {list.map((k) => {
                  const st = KW[k.status];
                  const search = k.target ? (stats.get(k.target)?.search ?? 0) : 0;
                  return (
                    <li key={k.term} className="flex items-start gap-2.5 py-2">
                      <st.icon className={cn("mt-0.5 size-4 shrink-0", st.tone)} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">
                          {k.term} {k.main && <span className="ml-1 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-muted">Hauptbegriff</span>}
                        </span>
                        {k.target ? (
                          <button type="button" onClick={() => onSelect(k.target!)} className="block max-w-full cursor-pointer truncate text-left text-xs text-brand-600 hover:text-brand-700">
                            {label(k.target)}
                          </button>
                        ) : (
                          <span className="block text-xs text-muted">Noch kein Ratgeber und keine Leistungsseite</span>
                        )}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className={cn("block text-xs font-semibold", st.tone)}>{st.label}</span>
                        {k.target && <span className="num block text-[11px] text-muted">{formatNumber(search)} über Suche</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
