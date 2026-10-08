import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { insertHit } from "@/lib/db";
import { env, isBackendConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { isAdminEmail } from "@/lib/auth";
import { INTERNAL_COOKIE, internalCookieOptions } from "@/lib/internal";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const runtime = "nodejs";

const schema = z.object({
  type: z.enum(["pageview", "event"]),
  name: z.string().max(60).regex(/^[\w-]+$/).optional(),
  path: z.string().min(1).max(200).startsWith("/"),
  referrer: z.string().max(500).optional(),
  utm_source: z.string().max(120).optional(),
  utm_medium: z.string().max(120).optional(),
  utm_campaign: z.string().max(120).optional(),
  locale: z.string().max(5).optional(),
  width: z.number().int().min(0).max(10_000).optional(),
  session: z.string().uuid().optional(),
  internal: z.boolean().optional(),
});

const BOT = /bot|crawl|spider|slurp|preview|monitor|lighthouse|headless|pingdom|uptime|scan|fetch|curl|wget|python|node/i;
const SEARCH = /(^|\.)(google|bing|duckduckgo|ecosia|yahoo|startpage|qwant|brave|yandex)\./;
const AI = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com|you\.com|phind\.com|mistral\.ai|deepseek\.com)$/;
const SOCIAL = /(^|\.)(instagram|facebook|fb|tiktok|linkedin|lnkd|youtube|youtu|twitter|x|t|pinterest|threads|whatsapp|snapchat)\.(com|net|in|co|be|me)$/;

/** Kanal aus UTM-Parametern und Referrer – so beantwortet das Dashboard „Woher kommt der Traffic?“. */
function classify(referrer: string | undefined, utmSource: string | undefined, utmMedium: string | undefined, ownHost: string) {
  let host: string | null = null;
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : null;
  } catch {
    host = null;
  }
  if (host === ownHost.replace(/^www\./, "")) host = null;
  if (utmSource) {
    const m = (utmMedium ?? "").toLowerCase();
    const channel = /cpc|ppc|paid|ads?$/.test(m) ? "anzeigen" : /mail|newsletter/.test(m) ? "email" : /social/.test(m) ? "social" : "kampagne";
    return { channel, source: utmSource.toLowerCase() };
  }
  if (!host) return { channel: "direkt", source: null };
  if (AI.test(host)) return { channel: "ki", source: host };
  if (SEARCH.test(host)) return { channel: "suche", source: host };
  if (SOCIAL.test(host)) return { channel: "social", source: host };
  return { channel: "verweis", source: host };
}

/**
 * Eigenes Gerät? Dann wird nichts gespeichert. Erkennung über das Merkzeichen aus src/lib/internal.ts – oder über eine
 * gültige Dashboard-Anmeldung, falls das Merkzeichen noch fehlt (wird dann gleich mitgesetzt).
 */
async function internalDevice(req: NextRequest): Promise<"cookie" | "session" | null> {
  const mark = req.cookies.get(INTERNAL_COOKIE)?.value;
  if (mark === "1") return "cookie";
  if (mark === "0") return null;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
  return session && isAdminEmail(session.email) ? "session" : null;
}

/**
 * POST /api/track – eigene Reichweitenmessung ohne Cookies.
 * Der Besucher wird nur als täglich wechselnder Hash gezählt (IP + Browser + Datum + Salt);
 * weder die IP noch der Browser-String werden gespeichert.
 */
export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const ip = clientIp(req.headers);
  if (!ua || BOT.test(ua) || !isBackendConfigured() || !rateLimit(`track:${ip}`, 120, 60_000)) return new NextResponse(null, { status: 204 });

  const internal = await internalDevice(req);
  if (internal) {
    const res = new NextResponse(null, { status: 204 });
    if (internal === "session") res.cookies.set(INTERNAL_COOKIE, "1", internalCookieOptions);
    return res;
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || parsed.data.path.startsWith("/admin")) return new NextResponse(null, { status: 204 });
  const d = parsed.data;

  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256").update(`${env.ipHashSalt}:${env.sessionSecret}:${day}:${ip}:${ua}`).digest("hex").slice(0, 24);
  const { channel, source } = classify(d.referrer, d.utm_source, d.utm_medium, req.nextUrl.hostname);
  const device = d.width === undefined ? null : d.width < 768 ? "mobil" : d.width < 1024 ? "tablet" : "desktop";

  await insertHit({
    type: d.type,
    name: d.name ?? null,
    path: d.path,
    locale: d.locale ?? null,
    visitor,
    session_id: d.session ?? null,
    channel,
    source,
    campaign: d.utm_campaign ?? null,
    device,
    inherit: d.type === "event" || d.internal === true,
  }).catch((e) => console.error("[track]", e instanceof Error ? e.message : e));

  return new NextResponse(null, { status: 204 });
}
