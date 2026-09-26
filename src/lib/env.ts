/**
 * Zentraler Zugriff auf Umgebungsvariablen.
 * Die Seite läuft auch ohne Supabase/n8n (lokale Entwicklung) – Leads werden dann
 * nur in der Konsole geloggt und das Admin-Dashboard zeigt Demo-Daten.
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  n8nWebhookUrl: process.env.N8N_LEAD_WEBHOOK_URL ?? "",
  n8nWebhookSecret: process.env.N8N_WEBHOOK_SECRET ?? "",
  ipHashSalt: process.env.IP_HASH_SALT ?? "taswiq-dev-salt",
  /** Zusätzliche Allowlist fürs Admin-Dashboard (kommagetrennt). Leer = nur Rolle prüfen. */
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};

export const isSupabaseConfigured = () => Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const isSupabaseAdminConfigured = () => Boolean(env.supabaseUrl && env.supabaseServiceKey);
export const isN8nConfigured = () => Boolean(env.n8nWebhookUrl);

/** Demo-Modus: nur lokal, nur wenn Supabase fehlt. In Produktion niemals. */
export const isDemoMode = () => !isSupabaseConfigured() && process.env.NODE_ENV !== "production";
