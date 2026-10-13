import { NextResponse, type NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { getAdminUser } from "@/lib/admin/data";
import { getMeetTranscript } from "@/lib/db";
import { transcriptDate, transcriptMarkdown, transcriptTime, type MeetLine, type MeetTranscript } from "@/lib/meet";

/** Mitschrift herunterladen: ?format=md (Markdown) oder ?format=pdf. Nur für angemeldete Admins. */
export const dynamic = "force-dynamic";

// Die eingebauten PDF-Schriften kennen nur Westeuropäisch – alles andere (Emojis usw.) fällt weg.
const plain = (s: string) => s.replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"').replace(/…/g, "...").replace(/[–—]/g, "-").replace(/[^\x20-\x7e\xa0-\xff]/g, "");

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(next, size) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

async function pdf(t: MeetTranscript & { lines: MeetLine[] }): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(plain(t.title));
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const [W, H, M] = [595.28, 841.89, 56];
  const ink = rgb(0.09, 0.09, 0.12);
  const muted = rgb(0.45, 0.45, 0.5);
  const brand = rgb(0.47, 0.25, 1);
  let page = doc.addPage([W, H]);
  let y = H - M;
  const room = (need: number) => {
    if (y - need >= M) return;
    page = doc.addPage([W, H]);
    y = H - M;
  };

  page.drawText("TasWiq Media. · Mitschrift", { x: M, y, size: 9, font: bold, color: brand });
  y -= 30;
  for (const l of wrap(plain(t.title), bold, 22, W - 2 * M)) {
    page.drawText(l, { x: M, y, size: 22, font: bold, color: ink });
    y -= 28;
  }
  const speakers = [...new Set(t.lines.map((l) => l.speaker))];
  for (const l of wrap(plain(`${transcriptDate(t.started_at)} Uhr · ${speakers.join(", ")}`), regular, 10, W - 2 * M)) {
    page.drawText(l, { x: M, y, size: 10, font: regular, color: muted });
    y -= 14;
  }
  y -= 6;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: rgb(0.88, 0.88, 0.9) });
  y -= 26;

  for (const line of t.lines) {
    const body = wrap(plain(line.text), regular, 11, W - 2 * M);
    room(16 + Math.min(body.length, 3) * 15);
    const speaker = plain(line.speaker);
    page.drawText(speaker, { x: M, y, size: 10, font: bold, color: brand });
    page.drawText(transcriptTime(line.at), { x: M + bold.widthOfTextAtSize(speaker, 10) + 8, y, size: 9, font: regular, color: muted });
    y -= 16;
    for (const l of body) {
      room(15);
      page.drawText(l, { x: M, y, size: 11, font: regular, color: ink });
      y -= 15;
    }
    y -= 10;
  }
  const pages = doc.getPages();
  pages.forEach((p, i) => p.drawText(`Seite ${i + 1} von ${pages.length}`, { x: M, y: 30, size: 8, font: regular, color: muted }));
  return doc.save();
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const transcript = await getMeetTranscript(Number((await params).id) || 0).catch(() => null);
  if (!transcript) return NextResponse.json({ error: "notFound" }, { status: 404 });
  const file = `mitschrift-${transcript.started_at.slice(0, 10)}-${transcript.title.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "meeting"}`;
  if (request.nextUrl.searchParams.get("format") === "pdf") {
    return new NextResponse(Buffer.from(await pdf(transcript)), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${file}.pdf"`, "cache-control": "no-store" } });
  }
  return new NextResponse(transcriptMarkdown(transcript), { headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": `attachment; filename="${file}.md"`, "cache-control": "no-store" } });
}
