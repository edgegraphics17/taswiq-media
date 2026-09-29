import "server-only";
import { createHash, createHmac } from "node:crypto";
import { env, isN8nConfigured } from "@/lib/env";

/**
 * Leitet ein Event an n8n weiter.
 *  - `x-taswiq-secret`: Shared Secret (n8n Webhook → Header Auth)
 *  - `x-taswiq-signature`: HMAC-SHA256 über den Body (optional prüfbar im Code-Node)
 * Timeout 4 s – ein langsames n8n darf den Funnel nie blockieren.
 * Der Lead ist zu diesem Zeitpunkt bereits im Backend gespeichert.
 */
export async function forwardToN8n(event: string, payload: Record<string, unknown>) {
  if (!isN8nConfigured()) {
    console.info(`[n8n] nicht konfiguriert – Event "${event}" nur geloggt`, payload);
    return { delivered: false as const, reason: "not_configured" };
  }
  const body = JSON.stringify({ event, version: 1, sentAt: new Date().toISOString(), ...payload });
  const signature = createHmac("sha256", env.n8nWebhookSecret || "unsigned").update(body).digest("hex");

  try {
    const res = await fetch(env.n8nWebhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-taswiq-secret": env.n8nWebhookSecret,
        "x-taswiq-signature": signature,
      },
      body,
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { delivered: true as const };
  } catch (error) {
    console.error("[n8n] Weiterleitung fehlgeschlagen", error);
    return { delivered: false as const, reason: "request_failed" };
  }
}

/** IP nie im Klartext speichern (DSGVO) – gesalzener Hash reicht für Spam-Analyse. */
export function hashIp(ip: string) {
  return createHash("sha256").update(`${env.ipHashSalt}:${ip}`).digest("hex").slice(0, 32);
}
