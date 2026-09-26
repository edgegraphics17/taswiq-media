import type { User } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Admin = Rolle "admin" in app_metadata (nur per Service-Key/SQL setzbar,
 * nicht vom Nutzer selbst) UND – falls gesetzt – E-Mail in ADMIN_EMAILS.
 */
export function isAdminUser(user: Pick<User, "email" | "app_metadata"> | null | undefined): boolean {
  if (!user) return false;
  const hasRole = user.app_metadata?.role === "admin";
  const allowlisted = env.adminEmails.length === 0 || env.adminEmails.includes((user.email ?? "").toLowerCase());
  return hasRole && allowlisted;
}
