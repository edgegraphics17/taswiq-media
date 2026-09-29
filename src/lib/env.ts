/**
 * Zentraler Zugriff auf Umgebungsvariablen.
 * Die Seite läuft auch ohne Backend/n8n (lokale Entwicklung) – Leads werden dann
 * nur in der Konsole geloggt und das Admin-Dashboard zeigt Demo-Daten.
 */

export const env = {
  /** Basis-URL der Backend-API auf dem Sprite "taswiq-media" (ohne Slash am Ende). */
  backendUrl: (process.env.TASWIQ_API_URL ?? "").replace(/\/$/, ""),
  /** Gemeinsames Secret für die Backend-API (nur serverseitig, nie im Browser). */
  backendToken: process.env.TASWIQ_API_TOKEN ?? "",
  /** Signiert das Admin-Session-Cookie (mind. 32 Zeichen, z. B. `openssl rand -hex 32`). */
  sessionSecret: process.env.SESSION_SECRET ?? "",
  n8nWebhookUrl: process.env.N8N_LEAD_WEBHOOK_URL ?? "",
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET ?? "",
  ipHashSalt: process.env.IP_HASH_SALT ?? "taswiq-dev-salt",
  /** Allowlist fürs Admin-Dashboard (kommagetrennt). Leer = niemand darf rein. */
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

/** Backend-API erreichbar konfiguriert (Leads, Preise, Dashboard-Daten). */
export const isBackendConfigured = () => Boolean(env.backendUrl && env.backendToken);
/** Admin-Login möglich: Backend + Session-Secret. */
export const isAdminAuthConfigured = () => isBackendConfigured() && env.sessionSecret.length >= 32;
export const isN8nConfigured = () => Boolean(env.n8nWebhookUrl);

/** Demo-Modus: nur lokal, nur wenn das Backend fehlt. In Produktion niemals. */
export const isDemoMode = () => !isBackendConfigured() && process.env.NODE_ENV !== "production";
