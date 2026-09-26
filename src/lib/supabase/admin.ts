import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env, isSupabaseAdminConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Service-Role-Client – umgeht RLS. Nur in API-Routen/Server Actions verwenden,
 * niemals an den Browser geben. Gibt `null` zurück, wenn nicht konfiguriert.
 */
export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) return null;
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
