"use client";

import type { LeadPayload, ValidationCode } from "@/lib/validation";
import type { LeadTier } from "@/config/funnel";
import { getAttribution } from "@/lib/attribution";

/** Sprachneutrale Fehler-Codes → UI übersetzt über messages → contactForm.server.<code> */
export type ServerErrorCode = "rateLimit" | "invalid" | "saveFailed" | "connection" | "offline";

export type SubmitResult =
  | { ok: true; tier: LeadTier; leadId: string | null }
  | { ok: false; error: ServerErrorCode; fields?: Record<string, ValidationCode> };

const KNOWN: ServerErrorCode[] = ["rateLimit", "invalid", "saveFailed"];

/** Sendet den Lead als JSON an /api/leads (→ Backend → n8n-Webhook). */
export async function submitLead(payload: Omit<LeadPayload, "attribution">): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, attribution: getAttribution() }),
      signal: AbortSignal.timeout(15_000),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      return { ok: false, error: KNOWN.includes(json?.error) ? json.error : "connection", fields: json?.fields };
    }
    return { ok: true, tier: json.tier, leadId: json.leadId };
  } catch {
    return { ok: false, error: "offline" };
  }
}
