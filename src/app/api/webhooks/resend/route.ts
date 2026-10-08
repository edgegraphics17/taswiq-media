import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { addLeadNote } from "@/lib/db";
import { env, isBackendConfigured } from "@/lib/env";
import { sendInternalNotice } from "@/lib/mail";

export const runtime = "nodejs";

/**
 * POST /api/webhooks/resend – Zustell-Ereignisse von Resend (signiert nach dem Svix-Schema).
 *
 * Jede Mail trägt die Tags `kind` und `lead_id` (src/lib/mail.ts). Daraus wird:
 *  - Bestätigung zugestellt        → Notiz im Verlauf der Anfrage
 *  - Bestätigung nicht zustellbar  → Notiz + Hinweis ans offizielle Postfach (Adresse falsch → lieber anrufen)
 * Hinweis-Mails selbst lösen nichts aus, sonst entstünde bei einem vollen Postfach eine Schleife.
 */

const FAILED: Record<string, string> = {
  "email.bounced": "konnte nicht zugestellt werden (Adresse unbekannt oder Postfach abgelehnt)",
  "email.failed": "konnte nicht verschickt werden",
  "email.suppressed": "wurde nicht verschickt – die Adresse ist nach früheren Fehlversuchen gesperrt",
  "email.complained": "wurde vom Empfänger als Spam markiert",
};

function verify(body: string, headers: Headers) {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures || !env.resendWebhookSecret) return false;
  // Alte Aufrufe ablehnen (Replay-Schutz): ± 5 Minuten
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = Buffer.from(env.resendWebhookSecret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest();
  return signatures.split(" ").some((part) => {
    const given = Buffer.from(part.split(",")[1] ?? "", "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (!verify(body, req.headers)) return NextResponse.json({ ok: false }, { status: 401 });

  const event = JSON.parse(body) as { type?: string; data?: { to?: string[]; tags?: Record<string, string>; bounce?: { message?: string } } };
  const { kind, lead_id: leadId } = event.data?.tags ?? {};
  const to = event.data?.to?.join(", ") ?? "unbekannt";
  const type = event.type ?? "";

  try {
    if (kind === "bestaetigung" && leadId && isBackendConfigured()) {
      if (type === "email.delivered") {
        await addLeadNote(leadId, `Bestätigungs-Mail an ${to} zugestellt.`, "resend");
      } else if (FAILED[type]) {
        const reason = event.data?.bounce?.message ? ` Meldung des Mailservers: ${event.data.bounce.message}` : "";
        await addLeadNote(leadId, `Bestätigungs-Mail an ${to} ${FAILED[type]}.${reason}`, "resend");
        await sendInternalNotice(
          "Bestätigung nicht angekommen",
          `Die Bestätigungs-Mail an ${to} ${FAILED[type]}.\n\nDer Kunde weiß also nicht, dass seine Anfrage angekommen ist. Wenn eine Telefonnummer vorliegt, am besten kurz anrufen.${reason ? `\n\n${reason.trim()}` : ""}`,
          leadId,
        );
      }
    } else if (kind === "benachrichtigung" && FAILED[type]) {
      console.error(`[resend] Benachrichtigung an ${to} ${FAILED[type]}`, event.data?.bounce ?? "");
    }
  } catch (error) {
    // 500 → Resend versucht es später erneut
    console.error("[resend] Webhook konnte nicht verarbeitet werden", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
