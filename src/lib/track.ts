"use client";

/** Analytics-Events (GA4/GTM), nur wenn nach Consent geladen – sonst No-op. Namen wie bei asap. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer?.push({ event, ...params });
}
