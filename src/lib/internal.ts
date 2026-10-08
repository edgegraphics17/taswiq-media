/**
 * Eigene Geräte aus der Besucherstatistik heraushalten (Edge-tauglich, kein Netzwerkzugriff).
 * Ein Merkzeichen im Browser: "1" = dieses Gerät zählt nicht mit, "0" = zählt bewusst mit (auch wenn man im Dashboard angemeldet ist).
 * Gesetzt wird es automatisch beim Öffnen des Dashboards, über den Schalter unter Analytics oder über den Link `/?intern=1`
 * (für Prüf-Browser ohne Login; `/?intern=0` hebt es wieder auf). Normale Besucher bekommen es nie.
 */
export const INTERNAL_COOKIE = "taswiq_intern";
export const INTERNAL_PARAM = "intern";

export const internalCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
