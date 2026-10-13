"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTranscriptLine, saveTranscriptLine } from "@/app/admin/actions";
import { cn } from "@/lib/format";
import { transcriptTime, type MeetLine } from "@/lib/meet";

/** Mitschrift als Chat: wer zuerst spricht, steht links, die zweite Person rechts. Ein Klick auf den Stift macht eine Zeile änderbar. */
export function TranscriptChat({ id, lines }: { id: number; lines: MeetLine[] }) {
  const [editing, setEditing] = useState<number | null>(null);
  const speakers = [...new Set(lines.map((l) => l.speaker))];

  return (
    <ol className="mt-8 space-y-3 rounded-3xl bg-surface p-4 shadow-soft sm:p-6">
      {lines.map((line, i) => {
        const right = speakers.indexOf(line.speaker) % 2 === 1;
        const head = lines[i - 1]?.speaker !== line.speaker;
        return (
          <li key={line.id} className={cn("group flex flex-col", right ? "items-end" : "items-start")}>
            {head && (
              <p className={cn("mb-1 px-1 text-xs font-semibold text-ink", i > 0 && "mt-3")}>
                {line.speaker} <span className="font-normal text-muted">· {transcriptTime(line.at)}</span>
              </p>
            )}
            {editing === line.id ? (
              <form action={saveTranscriptLine} onSubmit={() => setEditing(null)} className="w-full max-w-[36rem] rounded-2xl border border-brand-300 bg-white p-3">
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="line" value={line.id} />
                <label className="block text-xs font-medium text-muted">
                  Sprecher
                  <input name="speaker" defaultValue={line.speaker} maxLength={40} required className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm text-ink" />
                </label>
                <label className="mt-2 block text-xs font-medium text-muted">
                  Text
                  <textarea name="text" defaultValue={line.text} required rows={Math.min(8, Math.ceil(line.text.length / 70) + 1)} maxLength={4000} autoFocus className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm leading-relaxed text-ink" />
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="submit" className="min-h-10 cursor-pointer rounded-full bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600">Speichern</button>
                  <button type="button" onClick={() => setEditing(null)} className="min-h-10 cursor-pointer rounded-full px-4 text-sm font-semibold text-muted hover:text-ink">Abbrechen</button>
                  <button type="submit" formAction={deleteTranscriptLine} formNoValidate className="ml-auto inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:bg-red-50 hover:text-danger">
                    <Trash2 className="size-4" aria-hidden /> Zeile löschen
                  </button>
                </div>
              </form>
            ) : (
              <div className={cn("flex max-w-[min(36rem,92%)] items-end gap-1", right && "flex-row-reverse")}>
                <p className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap", right ? "rounded-br-md bg-brand-500 text-white" : "rounded-bl-md bg-white text-ink ring-1 ring-line")}>{line.text}</p>
                <button
                  type="button"
                  onClick={() => setEditing(line.id)}
                  aria-label={`Beitrag von ${line.speaker} bearbeiten`}
                  title="Bearbeiten"
                  className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted transition hover:bg-white hover:text-ink focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
