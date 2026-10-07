"use client";

import type { Attribution } from "@/lib/validation";
import { hasStatisticsConsent } from "@/lib/consent";

const KEY = "taswiq:attribution";
const SESSION_KEY = "taswiq:session";

function readCurrent(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const data: Attribution = {
    landingPage: window.location.pathname,
    referrer: document.referrer || undefined,
  };
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const) {
    const v = params.get(k);
    if (v) data[k] = v.slice(0, 200);
  }
  return data;
}

/**
 * Erfasst UTM-Parameter & Referrer beim ersten Seitenaufruf der Session
 * (First-Touch) – landet mit jedem Lead im Backend → Kampagnen-Auswertung.
 * Gemerkt wird das nur mit Einwilligung „Statistik“; ohne sie zählt allein die aktuelle Seite.
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    if (!hasStatisticsConsent()) return readCurrent();
    const stored = sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored) as Attribution;
    const data = readCurrent();
    sessionStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    return {};
  }
}

export function getSessionId(): string {
  try {
    if (!hasStatisticsConsent()) return "anonymous";
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}
