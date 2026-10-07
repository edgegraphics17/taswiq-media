"use client";

import { getSessionId } from "@/lib/attribution";

interface Hit {
  type: "pageview" | "event";
  name?: string;
  path: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  /** Folgeseite innerhalb der Website – Herkunft bleibt die des Einstiegs */
  internal?: boolean;
}

/**
 * Eigene Reichweitenmessung: schickt Seitenaufrufe und Ereignisse an /api/track (→ Dashboard „Analytics“).
 * Ohne Cookies; die Session-ID hängt nur mit Einwilligung „Statistik“ dran (sonst „anonymous“).
 */
export function sendHit(hit: Hit) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1") return;
  const session = getSessionId();
  const body = JSON.stringify({ ...hit, locale: document.documentElement.lang, width: window.innerWidth, session: session === "anonymous" ? undefined : session });
  try {
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      void fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {
    /* Messung darf die Seite nie stören */
  }
}

/** Ereignisse (Rechner, Funnel, Lead). Namen wie bei asap; zusätzlich an einen evtl. geladenen dataLayer. */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer?.push({ event, ...params });
  sendHit({ type: "event", name: event, path: window.location.pathname });
}
