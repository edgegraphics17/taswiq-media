import "server-only";
import { unstable_cache } from "next/cache";
import { KONFIG, OPTIONEN, type Option } from "@/config/pricing";
import type { PricingData } from "@/lib/pricing-engine";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Preisquelle für Rechner & API: Standardwerte aus src/config/pricing.ts,
 * überschrieben durch die Tabelle `services` in Supabase (falls verbunden).
 *  → Preis im Dashboard ändern, nach max. 5 Minuten live – ohne Deploy.
 *  → `is_active = false` blendet eine Option aus.
 * Fällt Supabase aus, rechnet die Seite unverändert mit den Standardwerten.
 */
export const getPricingData = unstable_cache(
  async (): Promise<PricingData> => {
    const supabase = createAdminClient();
    if (!supabase) return { optionen: OPTIONEN, konfig: KONFIG };

    const { data, error } = await supabase.from("services").select("group_id, option_id, label, hint, preis, mtl, dreh, is_active");
    if (error || !data?.length) return { optionen: OPTIONEN, konfig: KONFIG };

    const byKey = new Map(data.map((r) => [`${r.group_id}:${r.option_id}`, r]));
    const optionen: Record<string, Option[]> = {};
    for (const [group, options] of Object.entries(OPTIONEN)) {
      optionen[group] = options.flatMap((o) => {
        const row = byKey.get(`${group}:${o.id}`);
        if (!row) return [o];
        if (!row.is_active) return [];
        return [{ ...o, label: row.label, hint: row.hint ?? o.hint, preis: row.preis ?? undefined, mtl: row.mtl ?? undefined, dreh: row.dreh }];
      });
    }
    return { optionen, konfig: KONFIG };
  },
  ["pricing-data"],
  { revalidate: 300, tags: ["pricing"] },
);
