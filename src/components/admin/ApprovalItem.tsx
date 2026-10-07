import { Check, Clock, X } from "lucide-react";
import { removeTask, requestRun } from "@/app/admin/actions";
import { departmentById } from "@/config/team";
import { PRIORITY_LABEL, TASK_CATEGORY_LABEL } from "@/lib/admin/labels";
import { cn } from "@/lib/format";
import type { TaskRow } from "@/types/database";

const pill = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-colors";

/** Warum liegt die Aufgabe bei dir? Ein Satz, damit die Entscheidung schnell geht. */
export function approvalReason(t: TaskRow): string {
  if (t.run_state === "rueckfrage") return "Das Team hat eine Rückfrage";
  if (t.risk === "hoch") return "Braucht dein Okay (Preise, Recht, Kosten oder Ähnliches)";
  if (t.executor === "beide") return "Braucht eine Angabe von dir";
  return "Vorschlag des Teams";
}

/**
 * Eine Entscheidung: Freigeben (ans Team), Zurückstellen (parken) oder Ablehnen (löschen).
 * Bei Rückfragen und Aufgaben, die eine Angabe brauchen, gibt es ein Antwortfeld.
 */
export function ApprovalItem({ t }: { t: TaskRow }) {
  const question = t.run_state === "rueckfrage";
  const needsInput = question || t.executor === "beide";
  const steps = t.steps?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [];
  return (
    <li className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className={cn("rounded-full px-2.5 py-0.5 font-semibold", question ? "bg-amber-50 text-amber-800" : t.risk === "hoch" ? "bg-rose-50 text-rose-800" : "bg-brand-50 text-brand-600")}>{approvalReason(t)}</span>
        <span className="rounded-full bg-canvas px-2.5 py-0.5 font-medium text-body">
          {t.requested_by && t.requested_by !== t.department ? `${departmentById[t.requested_by].name} → ${departmentById[t.department].name}` : departmentById[t.department].name}
        </span>
        <span className="text-muted">
          {TASK_CATEGORY_LABEL[t.category]} · {PRIORITY_LABEL[t.priority]}
        </span>
        {t.client && <span className="rounded-full bg-night px-2.5 py-0.5 font-semibold text-white">Kunde: {t.client}</span>}
      </div>
      <p className="mt-2 font-semibold text-ink">{t.title}</p>
      {question ? <p className="mt-1 text-sm leading-relaxed text-body">{t.run_note}</p> : t.why && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-body">{t.why}</p>}
      {steps.length > 0 && (
        <details className="mt-2 text-sm text-body">
          <summary className="inline-flex min-h-9 items-center font-medium text-brand-600">Schritte ansehen</summary>
          <ol className="mt-1 max-w-3xl list-decimal space-y-1 pl-5 leading-relaxed">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </details>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <form action={requestRun} className={cn("flex flex-wrap items-end gap-2", needsInput && "min-w-0 flex-1 basis-full lg:basis-auto")}>
          <input type="hidden" name="id" value={t.id} />
          {needsInput && (
            <label className="grid min-w-48 flex-1 gap-1 text-xs font-semibold text-muted">
              {question ? "Deine Antwort" : "Deine Angabe (optional – ohne arbeitet das Team mit Annahmen)"}
              <input name="input" required={question} defaultValue={question ? "" : (t.run_input ?? "")} className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-brand-500" />
            </label>
          )}
          <button type="submit" className={cn(pill, "bg-night text-white hover:bg-night-soft")}>
            <Check className="size-4" aria-hidden /> {question ? "Antworten und weiter" : "Freigeben"}
          </button>
        </form>
        <form action={requestRun}>
          <input type="hidden" name="id" value={t.id} />
          <input type="hidden" name="defer" value="1" />
          <button type="submit" className={cn(pill, "border border-line bg-white text-body hover:text-ink")}>
            <Clock className="size-4" aria-hidden /> Zurückstellen
          </button>
        </form>
        <form action={removeTask}>
          <input type="hidden" name="id" value={t.id} />
          <button type="submit" className={cn(pill, "border border-line bg-white text-body hover:text-danger")}>
            <X className="size-4" aria-hidden /> Ablehnen
          </button>
        </form>
      </div>
    </li>
  );
}
