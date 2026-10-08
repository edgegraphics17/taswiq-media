/**
 * Sicherung der TasWiq-Datenbank (läuft auf dem Sprite, neben server.mjs).
 *
 *   node --no-warnings backup.mjs            Schnappschuss anlegen, prüfen, alte aufräumen
 *
 * Liest die laufende Datenbank nur (eigene Verbindung, `VACUUM INTO`) und schreibt eine in sich
 * vollständige Kopie nach BACKUP_DIR. Der Dienst muss dafür nicht angehalten werden.
 * Abgeholt wird die Kopie von `team/bin/backup` auf Karims Rechner – das ist der zweite Ort.
 *
 * Umgebungsvariablen:
 *   DB_PATH       Standard: ./data/taswiq.db
 *   BACKUP_DIR    Standard: ../backups (also außerhalb von backend/data)
 *   BACKUP_KEEP   Anzahl aufbewahrter Schnappschüsse auf dem Sprite, Standard 7
 *
 * Ausgabe: eine Zeile JSON ({ ok, file, bytes, tables } oder { ok: false, error }).
 */
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readdirSync, rmSync, statSync, chmodSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(process.env.DB_PATH ?? `${here}/data/taswiq.db`);
const BACKUP_DIR = resolve(process.env.BACKUP_DIR ?? `${here}/../backups`);
const KEEP = Math.max(1, Number(process.env.BACKUP_KEEP ?? 7));

try {
  mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 });
  const day = new Date().toISOString().slice(0, 10);
  const file = join(BACKUP_DIR, `taswiq-${day}.db`);
  rmSync(file, { force: true }); // VACUUM INTO verlangt eine neue Datei – ein zweiter Lauf am selben Tag ersetzt den ersten

  const db = new DatabaseSync(DB_PATH);
  db.exec("pragma busy_timeout = 5000;");
  db.exec(`vacuum into '${file.replaceAll("'", "''")}'`);
  db.close();
  chmodSync(file, 0o600);

  // Kopie öffnen und prüfen: unbeschädigt, Tabellen vorhanden
  const copy = new DatabaseSync(file, { readOnly: true });
  const check = copy.prepare("pragma integrity_check").get().integrity_check;
  if (check !== "ok") throw new Error(`Kopie beschädigt: ${check}`);
  const tables = {};
  for (const { name } of copy.prepare("select name from sqlite_master where type = 'table' and name not like 'sqlite_%' order by name").all()) {
    tables[name] = copy.prepare(`select count(*) as n from "${name}"`).get().n;
  }
  copy.close();

  const old = readdirSync(BACKUP_DIR).filter((f) => /^taswiq-\d{4}-\d{2}-\d{2}\.db$/.test(f)).sort().reverse().slice(KEEP);
  for (const f of old) rmSync(join(BACKUP_DIR, f), { force: true });

  console.log(JSON.stringify({ ok: true, file, bytes: statSync(file).size, tables }));
} catch (err) {
  console.log(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
  process.exit(1);
}
