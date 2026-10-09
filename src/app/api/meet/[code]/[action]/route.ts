import { NextResponse, type NextRequest } from "next/server";
import { BackendError, isBackendConfigured, meetPoll, meetSignal } from "@/lib/db";
import { MEET_CODE } from "@/lib/meet";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Signalisierung der Videocalls: reicht die Aufrufe der Browser ans Backend durch (dort liegen Räume und Teilnehmer).
 * Öffentlich, weil Gäste ohne Konto beitreten – geschützt durch den nicht erratbaren Raum-Code und den Schlüssel je Teilnehmer.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Ctx = { params: Promise<{ code: string; action: string }> };

/** Optionaler TURN-Server (MEET_TURN_URL/_USER/_PASS) für Netze, in denen die direkte Verbindung scheitert. */
const iceServers = () => [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
  ...(process.env.MEET_TURN_URL ? [{ urls: process.env.MEET_TURN_URL.split(","), username: process.env.MEET_TURN_USER ?? "", credential: process.env.MEET_TURN_PASS ?? "" }] : []),
];

const fail = (e: unknown) => {
  if (e instanceof BackendError) return NextResponse.json({ error: e.code }, { status: e.status });
  console.error("[meet] Signalisierung fehlgeschlagen", e);
  return NextResponse.json({ error: "unavailable" }, { status: 503 });
};

export async function GET(request: NextRequest, { params }: Ctx) {
  const { code, action } = await params;
  if (action !== "poll" || !MEET_CODE.test(code) || !isBackendConfigured()) return NextResponse.json({ error: "notFound" }, { status: 404 });
  try {
    return NextResponse.json(await meetPoll(code, request.nextUrl.searchParams), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return fail(e);
  }
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const { code, action } = await params;
  if (!(action === "join" || action === "send" || action === "leave") || !MEET_CODE.test(code) || !isBackendConfigured()) {
    return NextResponse.json({ error: "notFound" }, { status: 404 });
  }
  if (action === "join" && !rateLimit(`meet:${clientIp(request.headers)}`, 30, 60_000)) return NextResponse.json({ error: "rateLimited" }, { status: 429 });
  // „leave“ kommt beim Schließen des Tabs per sendBeacon – der Inhalt ist trotzdem JSON.
  const body = await request.json().catch(() => null);
  try {
    const data = await meetSignal<Record<string, unknown>>(code, action, body);
    return NextResponse.json(action === "join" ? { ...data, iceServers: iceServers() } : data);
  } catch (e) {
    return fail(e);
  }
}
