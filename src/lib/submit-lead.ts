"use client";

import type { LeadPayload } from "@/lib/validation";
import type { LeadTier } from "@/config/funnel";
import { getAttribution } from "@/lib/attribution";

export type SubmitResult =
  | { ok: true; tier: LeadTier; leadId: string | null }
  | { ok: false; error: string; fields?: Record<string, string> };

/** Sendet den Lead als JSON an /api/leads (→ Supabase → n8n-Webhook). */
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
      return {
        ok: false,
        error: json?.error ?? "Die Verbindung hat nicht geklappt. Bitte versuch es noch einmal.",
        fields: json?.fields,
      };
    }
    return { ok: true, tier: json.tier, leadId: json.leadId };
  } catch {
    return { ok: false, error: "Keine Verbindung zum Server. Prüfe dein Internet und versuch es erneut – oder ruf uns direkt an." };
  }
}
