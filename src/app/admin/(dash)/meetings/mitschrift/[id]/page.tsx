import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { deleteTranscript, renameTranscript } from "@/app/admin/actions";
import { TranscriptChat } from "@/components/admin/TranscriptChat";
import { getMeetTranscript } from "@/lib/db";
import { transcriptDate } from "@/lib/meet";

export const metadata: Metadata = { title: "Mitschrift" };

const pill = "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-300";

/** Mitschrift eines Videocalls: als Chat lesen, Zeilen korrigieren, als PDF oder Markdown herunterladen. */
export default async function TranscriptPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id) || 0;
  const transcript = await getMeetTranscript(id).catch(() => null);
  if (!transcript) notFound();
  const speakers = [...new Set(transcript.lines.map((l) => l.speaker))];

  return (
    <div className="mx-auto max-w-[820px]">
      <Link href="/admin/meetings" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Meetings
      </Link>
      <p className="mt-6 text-xs font-medium text-brand-600">Mitschrift</p>
      <form action={renameTranscript} className="mt-2 flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={id} />
        <label htmlFor="transcript-title" className="sr-only">Titel</label>
        <input id="transcript-title" name="title" defaultValue={transcript.title} maxLength={80} required className="-ml-2 min-w-0 basis-full rounded-xl border border-transparent bg-transparent px-2 py-1 text-2xl font-extrabold sm:flex-1 sm:basis-0 sm:text-3xl tracking-tight text-ink outline-none hover:border-line focus:border-brand-400 focus:bg-white" />
        <button type="submit" className={pill}>Titel speichern</button>
      </form>
      <p className="mt-2 text-sm text-muted">
        {transcriptDate(transcript.started_at)} Uhr · {transcript.lines.length} Beiträge{speakers.length > 0 && ` · ${speakers.join(", ")}`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <a href={`/admin/meetings/mitschrift/${id}/export?format=pdf`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-night px-5 text-sm font-bold text-white transition-colors hover:bg-night-soft">
          <Download className="size-4" aria-hidden /> PDF
        </a>
        <a href={`/admin/meetings/mitschrift/${id}/export?format=md`} className={pill}>
          <Download className="size-4" aria-hidden /> Markdown
        </a>
        <form action={deleteTranscript} className="ml-auto">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:bg-red-50 hover:text-danger">
            <Trash2 className="size-4" aria-hidden /> Mitschrift löschen
          </button>
        </form>
      </div>

      {transcript.lines.length ? (
        <TranscriptChat id={id} lines={transcript.lines} />
      ) : (
        <p className="mt-8 rounded-3xl border border-dashed border-line p-8 text-center text-sm text-muted">Diese Mitschrift ist leer.</p>
      )}
    </div>
  );
}
