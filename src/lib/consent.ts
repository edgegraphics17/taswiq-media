"use client";

/**
 * Einwilligung (TDDDG § 25 / DSGVO): Die Wahl selbst liegt als technisch notwendiger Eintrag im localStorage.
 * Kategorien:
 *  - notwendig: immer an (Einwilligungs-Wahl selbst)
 *  - statistics: Besuch über mehrere Seiten zusammenführen + Herkunft (UTM, Referrer) im sessionStorage merken
 * Ohne Einwilligung wird nichts auf dem Gerät gespeichert oder ausgelesen.
 */
const KEY = "taswiq:consent";
const VERSION = 1;
export const CONSENT_EVENT = "taswiq:consent";
export const CONSENT_OPEN_EVENT = "taswiq:consent-open";

export interface Consent {
  v: number;
  statistics: boolean;
  at: string;
}

/** null = noch keine Entscheidung (Banner zeigen). */
export function getConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const c = JSON.parse(localStorage.getItem(KEY) ?? "null") as Consent | null;
    return c && c.v === VERSION ? c : null;
  } catch {
    return null;
  }
}

export const hasStatisticsConsent = () => getConsent()?.statistics === true;

export function setConsent(statistics: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, statistics, at: new Date().toISOString() } satisfies Consent));
    // Widerruf: alles entfernen, was nur mit Einwilligung gespeichert wurde.
    if (!statistics) {
      sessionStorage.removeItem("taswiq:attribution");
      sessionStorage.removeItem("taswiq:session");
    }
  } catch {
    /* Speicher blockiert (Privatmodus) – Banner erscheint beim nächsten Besuch erneut */
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

/** Öffnet die Einstellungen erneut (Footer-Link „Cookie-Einstellungen“). */
export const openConsentSettings = () => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
