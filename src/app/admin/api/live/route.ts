import { getAdminUser } from "@/lib/admin/data";
import { isAdminAuthConfigured } from "@/lib/env";
import { openEventStream } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** SSE-Proxy: reicht den Live-Stream des Backends nur an eingeloggte Admins durch (Token bleibt serverseitig). */
export async function GET(req: Request) {
  if (!isAdminAuthConfigured() || !(await getAdminUser())) return new Response("Forbidden", { status: 403 });
  const upstream = await openEventStream(req.signal).catch(() => null);
  if (!upstream?.ok || !upstream.body) return new Response("Backend nicht erreichbar", { status: 502 });
  return new Response(upstream.body, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-store, no-transform", "x-accel-buffering": "no" },
  });
}
