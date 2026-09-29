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

## Jev (Lead-Qualifizierung)
`jev.mjs` fragt nach jedem neuen Lead im Hintergrund bei [Jev](https://thejevai.com) (`POST /v1/systemone`, ein Aufruf = ein Credit) drei typisierte Fragen ab:
Priorität (Score 0–3), Spam-Risiko (Ja/Nein-Wahrscheinlichkeit) und passendes Paket (starter/growth/premium). Das Ergebnis landet in `leads.automation.jev`,
als Verlaufseintrag und im Lead-Detail des Dashboards („Jev-Einschätzung“).
- **Key:** `JEV_API_KEY` nur in `/home/sprite/taswiq/.env` – ohne Key ist Jev aus, der Rest läuft unverändert.
- **Credits:** Tageslimit `JEV_DAILY_LIMIT` (Standard 50, Slot wird vor dem Aufruf reserviert), Timeout 8 s, kein Auto-Retry. Verbrauch: `GET /jev/usage`.
- **Datenschutz:** Name, E-Mail, Telefon und Firma gehen nicht raus, nur Branche, Interessen, Budget, Projektstatus, Schätzung und der gekürzte Freitext.
- **Robust:** Antworten werden strikt validiert; bei Fehlern bleibt der Lead beim Standard-Scoring (`src/lib/lead-scoring.ts`).
- **Erneut ausführen:** `POST /leads/:id/qualify` (zählt zum Tageslimit).

## Preis-Seed
`npm run db:seed-sql` erzeugt `seed.sql`. Das Backend lädt sie nur beim ersten Start in eine leere Tabelle `services`; eine leere Tabelle
ist unkritisch (die Seite rechnet dann mit `src/config/pricing.ts`).
