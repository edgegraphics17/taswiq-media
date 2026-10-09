import type { Metadata } from "next";
import Link from "next/link";
import { VideoOff } from "lucide-react";
import { MeetApp } from "@/components/meet/MeetApp";
import { getMeetRoom } from "@/lib/db";
import { isBackendConfigured } from "@/lib/env";
import { MEET_CODE } from "@/lib/meet";

export const dynamic = "force-dynamic";

const load = async (code: string) => (MEET_CODE.test(code) && isBackendConfigured() ? getMeetRoom(code).catch(() => undefined) : null);

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const room = await load((await params).code);
  return { title: room?.title ?? "Meeting" };
}

/** Der Einladungslink: Vorschau mit Kamera und Mikrofon, danach der Call. `undefined` = Backend gerade nicht erreichbar. */
export default async function MeetPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = await load(code);
  if (room) return <MeetApp code={room.code} title={room.title} />;
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center text-white">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10">
          <VideoOff className="size-6" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">{room === undefined ? "Das Meeting ist gerade nicht erreichbar" : "Dieses Meeting gibt es nicht"}</h1>
        <p className="mt-3 text-sm text-night-muted">
          {room === undefined ? "Bitte lade die Seite in einem Moment neu." : "Der Link ist falsch geschrieben oder das Meeting wurde beendet. Bitte frag nach einem neuen Link."}
        </p>
        <Link href="/" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-white/10 px-5 text-sm font-semibold hover:bg-white/15">
          Zur Website
        </Link>
      </div>
    </main>
  );
}
