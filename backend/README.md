# TasWiq Backend (Sprite `taswiq-media`)

Node-Dienst (`server.mjs`, keine npm-Abhängigkeiten, `node:sqlite`, Node ≥ 22.13) mit SQLite (`schema.sql`).
Architektur & API: `docs/ARCHITECTURE.md` → „Phase 4 · Backend“.

## Lokal testen
```bash
cd backend
TASWIQ_API_TOKEN=$(openssl rand -hex 24) ADMIN_EMAILS=du@example.de SITE_URL=http://localhost:3000 \
  DB_PATH=/tmp/taswiq.db PORT=8099 node --no-warnings server.mjs
```

## Auf dem Sprite
Dateien liegen in `/home/sprite/taswiq/` (`backend/`, `start.sh`, `.env`, `.token`). Service `api` (Port 8080) startet `start.sh`,
das `.env` lädt und `.token` als `TASWIQ_API_TOKEN` setzt (wird beim ersten Start erzeugt).
Änderungen: Dateien per Sprites-Tool/`sprite` CLI ersetzen, Service neu starten, danach `checkpoint_create`.

`.env` auf dem Sprite (0600): `PORT`, `SITE_URL`, `ADMIN_EMAILS`, optional `MAGIC_LINK_WEBHOOK_URL`/`MAGIC_LINK_WEBHOOK_SECRET`, `JEV_API_KEY`.
Ohne `MAGIC_LINK_WEBHOOK_URL` steht der Login-Link im Service-Log (nur Bootstrap – bitte n8n-Webhook einrichten).

## Preis-Seed
`npm run db:seed-sql` erzeugt `seed.sql`. Das Backend lädt sie nur beim ersten Start in eine leere Tabelle `services`; eine leere Tabelle
ist unkritisch (die Seite rechnet dann mit `src/config/pricing.ts`).
