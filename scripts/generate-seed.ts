/**
 * Erzeugt backend/seed.sql (SQLite, wird vom Backend beim ersten Start geladen) aus src/config/pricing.ts.
 * Ausführen:  npm run db:seed-sql   (Node ≥ 22.18 führt TypeScript direkt aus)
 */
import { writeFileSync } from "node:fs";
import { OPTIONEN } from "../src/config/pricing.ts";

const q = (v: string | undefined) => (v === undefined ? "null" : `'${v.replace(/'/g, "''")}'`);
const n = (v: number | undefined) => (v === undefined ? "null" : String(v));

const rows: string[] = [];
for (const [group, options] of Object.entries(OPTIONEN)) {
  options.forEach((o, i) => {
    rows.push(`  (${q(group)}, ${q(o.id)}, ${q(o.label)}, ${q(o.hint)}, ${n(o.preis)}, ${n(o.mtl)}, ${o.dreh ? "true" : "false"}, ${i})`);
  });
}

const sql = `-- Automatisch erzeugt aus src/config/pricing.ts – nicht von Hand bearbeiten.
-- Neu erzeugen: npm run db:seed-sql
insert into services (group_id, option_id, label, hint, preis, mtl, dreh, sort_order) values
${rows.join(",\n")}
on conflict (group_id, option_id) do update set
  label = excluded.label, hint = excluded.hint, preis = excluded.preis,
  mtl = excluded.mtl, dreh = excluded.dreh, sort_order = excluded.sort_order;
`;

writeFileSync(new URL("../backend/seed.sql", import.meta.url), sql);
console.log(`seed.sql geschrieben: ${rows.length} Optionen`);
