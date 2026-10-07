# TasWiq Media. – Architektur (Phasen 1–5)

**Logik (Funnel, Rechner, Scoring, Backend):** nach asapmarketing.de (Analyse: [`ASAP-ANALYSE.md`](./ASAP-ANALYSE.md))
**Design-System „Soft UI“ (seit Redesign 27.09.2026):** nach der Design-Vorlage – Violett `#7840FE`, Canvas `#F6F6F6`, Kontrast-Schwarz `#141414`, Mint `#1DAF59`, Rosé `#F9CFD4`, Inter Tight; weiche Radien (`rounded-[2rem]`), alle Buttons/Tags als Pillen, Bento-Grids, schwebende Info-Karten. Tokens in `src/app/globals.css`.
**Stack:** Next.js 15.5 (App Router) · Tailwind CSS 4 · Framer Motion · Backend auf Fly.io-Sprite (Node + SQLite) · n8n · Zod

---

## File-Tree

```
Taswiq Media./
├─ docs/
│  ├─ ARCHITECTURE.md            ← dieses Dokument
│  └─ ASAP-ANALYSE.md            ← Blaupause: Sektionen, Funnel, Rechner, Motion von asap
├─ n8n/
│  └─ taswiq-lead-automation.json ← importierbarer Workflow (14 Nodes)
├─ backend/                      ← läuft auf dem Sprite "taswiq-media" (siehe Phase 4)
│  ├─ server.mjs                 ← REST-API + SSE (Node, node:sqlite)
│  ├─ schema.sql                 ← SQLite-Schema
│  └─ seed.sql                   ← generiert aus src/config/pricing.ts
├─ scripts/generate-seed.ts      ← npm run db:seed-sql
├─ public/
│  ├─ videos/showreel.mp4        ← 17-s-Hero-Showreel (4,7 MB) aus den SPOTS-Filmen
│  ├─ videos/cases/*.mp4         ← 6-s-Vorschauclips je Projekt (0,5–0,8 MB)
│  └─ images/                    ← Poster, Nebel-Motiv der Rechnung
└─ src/
   ├─ middleware.ts              ← next-intl (DE/EN) + schützt /admin/*
   ├─ i18n/                      ← routing.ts (Sprachen, übersetzte Pfade), navigation.ts, request.ts
   ├─ app/
   │  ├─ layout.tsx              ← Fonts, Metadata, Organisation-JSON-LD
   │  ├─ globals.css             ← Design-Tokens + asap-Motion (Wobble, Wipe, 3D-Menü, Marquee)
   │  ├─ (site)/                 ← öffentliche Seiten mit SiteShell (Header, 3D-Menü, Footer)
   │  │  ├─ page.tsx             ← Startseite (Sektionsfolge 1:1 wie asap)
   │  │  ├─ preisrechner/        ← Phase 2
   │  │  ├─ content-pipeline/    ← Flaggschiff-Unterseite (wie asaps KI-Telefonassistent)
   │  │  ├─ leistungen/[slug]/   ← Geo-SEO-Landingpages (SSG)
   │  │  └─ impressum/, datenschutz/
   │  ├─ admin/                  ← Phase 5.2 – Dashboard
   │  │  ├─ (dash)/              ← Leads, Lead-Detail, Kalkulationen, Preis-Editor
   │  │  ├─ login/, auth/callback/
   │  │  └─ actions.ts           ← Server Actions (Status, Notizen, Preise, Login)
   │  ├─ api/leads/route.ts      ← Phase 3 – Funnel/Rechner → Backend → n8n
   │  ├─ api/calculator/route.ts ← Phase 2 – Kalkulation protokollieren
   │  ├─ robots.ts, sitemap.ts, llms.txt/, opengraph-image.tsx
   ├─ config/                    ← Struktur & Preise (IDs, Icons, Medien) – Texte in messages/
   │  ├─ site.ts                 ← Stammdaten, Adresse, Calendly, Social, Navigation
   │  ├─ content.ts              ← Struktur Startseite + Portfolio + Referenzen
   │  ├─ pipeline.ts             ← Copy Flaggschiff-Seite + Pakete + FAQ
   │  ├─ pricing.ts              ← Preis-Matrix + Rechner-Schritte
   │  ├─ funnel.ts               ← Funnel-Optionen + Starter-Pakete
   │  └─ seo-pages.ts            ← Geo-SEO-Seiten
   ├─ lib/
   │  ├─ pricing-engine.ts       ← reine Rechenlogik (Client + Server identisch)
   │  ├─ pricing-source.ts       ← Preise aus dem Backend überschreiben config (Cache 5 Min.)
   │  ├─ lead-scoring.ts         ← Score + Tier
   │  ├─ validation.ts           ← Zod-Schemas (Client-Inline + Server)
   │  ├─ webhook.ts              ← n8n-Forwarding (Secret + HMAC, 4-s-Timeout)
   │  ├─ seo.ts                  ← Metadata-Helfer + JSON-LD
   │  ├─ db.ts                   ← einzige Naht zum Backend (Token, Timeout, Retry)
   │  ├─ session.ts              ← signiertes Admin-Cookie (Web Crypto, Edge-tauglich)
   │  └─ admin/                  ← Datenschicht Dashboard + Demo-Daten
   └─ components/
      ├─ layout/                 ← SiteShell (3D-Menü), Header, MobileMenu, Footer
      ├─ home/                   ← Hero, Promise, Services, KiSection, Portfolio, References, Process, CalculatorTeaser, Contact
      ├─ calculator/             ← Calculator, Fields, QuoteSheet (Rechnungs-Look + PDF)
      ├─ funnel/                 ← LeadFunnel, ContactForm, LeadResult (Tier-Screens)
      ├─ product/                ← Sektionen der Unterseiten (wiederverwendbar)
      ├─ admin/, ui/, seo/, providers/
```

---

## Phase 1 · Strategie & Copywriting

### Sitemap

| URL | Zweck | asap-Pendant |
|-----|-------|--------------|
| `/` | Startseite: Hero → Versprechen → Services → KI-Lösungen → Arbeiten & Referenzen → Ablauf → Rechner-Teaser → Kontakt-Funnel | `/` |
| `/preisrechner` | Verzweigter Konfigurator mit Richtwert, PDF und Anfrage | `/rechner.html` |
| `/content-pipeline` | Flaggschiff: Hero → Problem → Funktionen → 3 Modi → Für wen → Rolle → **3 Pakete** → FAQ → Funnel | `/ki-telefonassistent.html` |
| `/leistungen/medienagentur-gastronomie` | SEO: „Medienagentur Gastronomie“ | – |
| `/leistungen/festival-videograf` | SEO: „Festival Videograf“ | – |
| `/leistungen/ki-marketing-agentur` | SEO: „KI Marketing Agentur“ | – |
| `/impressum`, `/datenschutz` | Rechtliches (noindex) | ✓ |
| `/admin` | Dashboard (geschützt, noindex) | Kunden-Login |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | SEO & GEO | ✓ |

### Hero (USP)
> **Content.** *Der satt macht. / Der laut ist. / In KI-Tempo.* (Typewriter mit Teal-Schimmer)
> Wir filmen und fotografieren Restaurants, Bars und Festivals auf Kino-Niveau – und machen aus jedem Dreh mit KI-Workflows Dutzende Reels, Ads und Posts.
> Kennzahlen: **450+ Projekte · 72 h erste Clips · 4 Sprachen per KI**

USP in einem Satz: **Ein Drehtag – Content für ein ganzes Quartal.** Echte Bilder vor Ort, KI nur für Menge, Varianten und Sprachen.

### Über uns / Services
Texte in `src/config/content.ts` (`promise`, `services`, `ki`). Sechs Services: Video & Aftermovie · Fotografie · Social-Media-Content · KI-Audio & Voiceover · KI-Video & Visuals · Web & Automatisierung.

### Die 3 Pakete (`src/config/pipeline.ts`)
| Paket | Preis | Für | Kern |
|-------|-------|-----|------|
| **Classic Aftermovie** | 2.490 € | Festivals, Clubs, Konzerte | 1 Drehtag, 2 Kameras, Film 2–3 Min. 4K, 6 Cutdowns, 7 Tage |
| **AI-Enhanced Promo** ★ | 3.490 € | Launches, Line-ups, Eröffnungen | + 20 Ad-Varianten, KI-Voiceover in 4 Sprachen, KI-Szenen |
| **Gastro Social-Retainer** | 1.490 €/Monat | Restaurants, Bars, Cafés | ½ Drehtag/Monat, 12 Reels + 20 Fotos, Captions, Google-Profil |

### Ablauf (asap-Adaption)
1. **Deep Dive** – Lokal/Festival kennenlernen, ehrlich & unverbindlich
2. **Der Masterplan** – Shotlist, Drehplan, KI-Pipeline; Formate stehen vorab fest
3. **Dreh & Umsetzung** – Premium-Equipment, Grading, KI-Veredelung, erste Clips nach 72 h
4. **Scale & Optimize** – messen, Varianten nachproduzieren ohne neuen Drehtag

### Referenzen
Echte Video-Cases aus Kuala Lumpur (Zuan Yuan, Cinnamon Coffee House, The Sphere Lounge – One World Hotel/1 Utama; IL Forno – Hyatt Centric KLCC) mit Vorschauclip + YouTube-Link. Kunden, Events und Artists aus der EDGE-Präsentation als typografische Laufbänder – **nur Namen, keine Logos/Pressefotos**. Die alten EDGE-Leistungen und -Preise sind bewusst nicht übernommen.

---

## Phase 2 · Interaktiver Preisrechner

**Modell (wie asap):** jede Option hat `preis` (einmalig) und/oder `mtl` (monatlich). Schritte sind an Bedingungen geknüpft (`wenn`) → die gewählten Leistungen bestimmen den Pfad.

```
Projekt (Branche + Leistungen) → [Video] → [Foto] → [Web] → [KI] → Extras → Laufend → Ergebnis
```

**Formel** (`src/lib/pricing-engine.ts`):
```
Summe  = Σ Optionen (nur beantwortete Schritte)
       + Festival-Zuschlag 15 % auf Dreh-Posten (Branche „Festival & Musik“)
       + Express 25 %
Spanne = Summe × 0,90 … Summe × 1,18, gerundet auf 50 €
Monatlich separat
```

**Preise ändern – drei Wege:**
1. `src/config/pricing.ts` (Code, Version hochzählen)
2. Dashboard → **Preise** (schreibt in die Backend-Tabelle `services`, live nach Speichern)
3. Direkt in der Tabelle `services`

Ergebnis: Summenbox · Aufstellung als **A4-Blatt im Rechnungs-Design** (Job-Nr., Gesamt-Box) · „Zusammenfassung kopieren“ · „Als PDF speichern“ (`window.print` + eigene Druckvorlage) · Anfrage direkt im Ergebnis. Server rechnet jede Kalkulation neu (`/api/calculator`, `/api/leads`) – Client-Preise werden nie übernommen.

---

## Phase 3 · 4-Schritte-Funnel mit Lead-Scoring

`Vorhaben (Mehrfach + Branche) → Status → Budget → Kontakt` · asap-Wipe-Übergang · Inline-Validierung · Honeypot · Rate-Limit.

**Scoring** (`src/lib/lead-scoring.ts`, 0–100):

| Signal | Punkte |
|--------|--------|
| Budget < 1k / 1–2,5k / 2,5–5k / > 5k / k. A. | 5 / 20 / 35 / 50 / 12 |
| Status Neustart … Dringend | 6 … 24 |
| Kalkulation im Rechner | +12 |
| Kernbranche (Gastro, Musik) | +8 |
| je Leistung (max. 3) / KI-Interesse | +3 / +4 |
| Telefon / Firma angegeben | +5 / +4 |

**Tier → Abschluss-Screen → n8n-Mail:**
| Tier | Regel | Screen | Mail |
|------|-------|--------|------|
| `starter` | Budget < 1.000 € | 3 produktisierte Pakete je Branche, per WhatsApp buchbar | Paketübersicht |
| `growth` | Rest | „Angebot in 24 h“ + nächste Schritte | Ablauf + Richtwert |
| `premium` | Budget > 5.000 € **oder** 2,5–5k + Termin/Rechner + Score ≥ 70 | Calendly (Zwei-Klick, DSGVO) | Terminlink + @here in Discord |

**Webhook-Payload** (`POST` an `N8N_LEAD_WEBHOOK_URL`, Header `x-taswiq-secret` + `x-taswiq-signature` HMAC-SHA256):
```json
{
  "event": "lead.created",
  "version": 1,
  "sentAt": "2026-09-26T21:00:00.000Z",
  "lead": {
    "id": "uuid", "createdAt": "…", "name": "Mara Beispiel", "firstName": "Mara",
    "email": "mara@example.com", "phone": null, "company": "Trattoria Beispiel", "message": null,
    "source": "funnel", "industry": "gastro", "interests": ["reels", "foto"],
    "projectStatus": "regelmaessig", "budget": "1k_2_5k",
    "estimate": null, "calculatorSummary": null,
    "score": 45, "scoreReasons": ["Budget 1k_2_5k (+20)", "…"], "tier": "growth"
  },
  "meta": { "attribution": { "utm_source": "instagram", "landingPage": "/" }, "calculatorRequestId": null }
}
```

---

## Phase 4 · Backend & Automatisierung

### Backend (Sprite `taswiq-media` auf Fly.io · Code in `backend/`)
Ersetzt Supabase. Ein kleiner Node-Dienst (`backend/server.mjs`, keine Abhängigkeiten, `node:sqlite`) läuft dort als Service `api`
(Port 8080) und speichert in SQLite (`backend/schema.sql`, Daten auf dem persistenten Sprite-Volume). Sprites schlafen bei Inaktivität;
der Client (`src/lib/db.ts`) hat deshalb ein 10-s-Timeout und einen Retry bei Verbindungsfehlern.

| Tabelle | Inhalt |
|---------|--------|
| `services` | Preis-Matrix (group_id, option_id, preis, mtl, dreh, is_active) – überschreibt pricing.ts (leer = Standardwerte) |
| `calculator_requests` | jede Kalkulation: State, Posten, Spanne, Preisversion, UTM, `converted_lead_id` |
| `leads` | Kontakt, Qualifizierung, Score/Tier, **Kunden-Status** (neu → kontaktiert → angebot → verhandlung → gewonnen/verloren/archiviert), Auftragswert, n8n-Automation |
| `lead_events` | Verlauf: Erstellung & Status-Wechsel automatisch (im API-Dienst, in einer Transaktion), Notizen, Automationen |
| `login_tokens` | einmalige Magic-Link-Tokens (nur SHA-256-Hash, 15 min gültig) |
| `admin_credentials` | Passwort-Login: scrypt-Hash + Salt je Admin-E-Mail |
| `tasks` | Arbeits-Dashboard: Aufgaben mit Bereich, Dringlichkeit, Aufwand, Status, Herkunft (karim/claude) |
| `site_hits` | Besucherstatistik: Seitenaufrufe und Ereignisse (ohne IP, Tages-Hash) |

**API** (Header `x-taswiq-token`, nur von Next.js-Server und n8n genutzt): `POST /leads`, `GET /leads?status&tier&q`, `GET|PATCH /leads/:id`
(`?fields=a,b` = flach, für n8n), `POST /leads/:id/events`, `POST|GET /calculator-requests`, `GET|PUT /services`, `POST /auth/request`,
`POST /auth/verify`, `GET /events` (SSE), `GET /health` (offen).

**Sicherheit:** Der Browser spricht nie mit dem Backend. Rechte werden im Dienst/Next.js geprüft (keine RLS): Admin = E-Mail in `ADMIN_EMAILS`
+ signiertes Session-Cookie. Secrets liegen auf dem Sprite in `/home/sprite/taswiq/.env` und `.token` (0600), nie im Repo. IPs nur als gesalzener Hash.

### n8n (`n8n/taswiq-lead-automation.json`)
```
Webhook (Header-Auth) → Code: Lead aufbereiten (Mail-Template je Branche × Tier, Discord-Embed)
   ├─ Discord: Neuer Lead
   └─ Switch: Tier ─┬─ Starter  → Mail: Starter-Pakete ─┐
                    ├─ Growth   → Mail: Angebot 24 h ───┼→ Backend: automation speichern → Verlauf-Eintrag
                    └─ Premium  → Mail: Premium+Termin ─┘        → Warten 48 h → Status prüfen
                                                                    → IF noch „neu“ → Discord: Follow-up-Erinnerung
```
Setup-Schritte stehen als Sticky-Note im Workflow. Slack statt Discord: Incoming-Webhook-URL eintragen und Body auf `{ "text": … }` umstellen.

---

## Phase 5 · Geo-SEO & Admin-Dashboard

### SEO / GEO
- **Metadata** zentral in `layout.tsx` + `pageMetadata()` je Seite (Title-Template, Canonical, `de-DE`, Open Graph, Twitter, Robots)
- **JSON-LD:** `ProfessionalService` + `LocalBusiness` + `Organization` (mit `hasOfferCatalog` der 3 Pakete, `areaServed` DACH, `knowsAbout`), `WebSite`, `Service` je Unterseite, `FAQPage`, `BreadcrumbList`, `WebApplication` (Rechner)
- **Keyword-Seiten** `/leistungen/*` für „Medienagentur Gastronomie“, „Festival Videograf“, „KI Marketing Agentur“ – Städte-Varianten per Eintrag in `seo-pages.ts` (`city` → Title, H1, `areaServed`)
- **GEO wie asap:** `robots.txt` lädt GPTBot, ClaudeBot, PerplexityBot & Co. ausdrücklich ein; `/llms.txt` wird aus den Configs generiert
- Generiertes OG-Bild (`/opengraph-image`) aus dem Showreel-Standbild
- **Lokal-Signal fehlt noch:** Adresse + Koordinaten in `site.ts` eintragen → LocalBusiness komplett; Google-Unternehmensprofil verknüpfen

### Admin-Dashboard – Architektur
```
Request /admin/* ──► middleware.ts (signiertes Session-Cookie prüfen, Edge-tauglich → sonst /admin/login)
                 ──► (dash)/layout.tsx  requireAdmin()   ← zweite Prüfung serverseitig (ADMIN_EMAILS)
                 ──► Server Components lesen über src/lib/db.ts (Backend-API mit Token)
Mutationen      ──► Server Actions (actions.ts) prüfen Admin erneut → Backend → revalidatePath
Live            ──► LiveRefresh (EventSource) → /admin/api/live (SSE-Proxy, nur mit Session) → Backend /events → router.refresh()
Login           ──► Magic Link: Backend erzeugt Einmal-Token (nur für ADMIN_EMAILS) → Mail via n8n-Webhook → /admin/auth/callback löst ein, setzt Cookie
```
**Zwei Bereiche (seit 08.10.2026):**
- **Kunden & Website:** Anfragen (Leads), Analytics, Kalkulationen, Preise
- **Arbeit:** Fokus & Aufgaben – alle offenen Aufgaben auf dem Weg zum Umsatzziel (10.000 €/Monat, Annahmen und Zwischenstufen in `src/config/goal.ts`), oben die drei wichtigsten.
  Aufgaben lassen sich im Dashboard an Claude übergeben (`run_state`, siehe `backend/README.md`).
  Neue Aufgaben kommen aus dem Dashboard-Formular oder als JSON über `POST /tasks/bulk` (siehe `backend/README.md` → „Aufgaben einspielen“).

**Team / Command Center (`/admin/team`, seit 08.10.2026):** sieben Abteilungen (Leitung, Entwicklung, Wachstum, Marketing, Angebot & Vertrieb, Qualität & Sicherheit, Analyse),
jede eine eigene Claude-Sitzung auf Karims Rechner mit Stellenbeschreibung in `team/<abteilung>.md`; gemeinsame Arbeitsordnung und Grenzen in `team/README.md`.
```
Claude-App (geplante Aufgaben „taswiq-team-<abteilung>“, alle 3 Std. 7–22 Uhr, versetzt) ──► Abteilung startet
Abteilung ──► team claim ──► Aufgabe umsetzen, Schritte melden (team say) ──► team finish
          └─► Warteschlange leer + Planung fällig (1×/Tag) ──► Bereich prüfen ──► team propose (für sich oder als Übergabe an andere)
Dashboard ──► Hauptschalter, Freigabe-Modus, Tageslimit, Freigeben/Ablehnen, Live-Protokoll (SSE)
```
Abteilungen können sich nicht gegenseitig starten (die App verlangt dafür eine Freigabe, die unbeaufsichtigt niemand gibt) – deshalb hat jede ihren eigenen Takt.
Die Erlaubnisse für unbeaufsichtigte Durchläufe stehen lokal in `.claude/settings.local.json` (nicht im Repo), die Liste dazu in `team/README.md`.
Sieben Abteilungen seit Marketing (Anzeigen, Kampagnen, Grafik, Video, Kundenaufträge über das Feld `client`; Ablage lokal unter `kunden/`).
Durchgesetzt wird im Backend, nicht im Prompt: pausiert = niemand bekommt Arbeit · immer nur eine Abteilung gleichzeitig (ein Arbeitsverzeichnis) ·
Tageslimit je Abteilung · im Modus „Selbstständig“ wandern alle offenen Aufgaben mit `executor: claude` und `risk: niedrig` von selbst in die Warteschlange · hängende Durchläufe verfallen nach 45 Min.
Tabellen `agent_events` (Protokoll) und `settings`; Endpunkte `/team/state|next|claim|events|finish|propose|settings`; Werkzeug `team/bin/team`.

**Login:** E-Mail + Passwort (`/admin/login`, Link im Footer). Passwort liegt als scrypt-Hash in `admin_credentials`; 5 Fehlversuche sperren das Konto 15 Minuten.
Ändern unter `/admin/konto`. Der Magic-Link-Weg (`/admin/auth/callback`) bleibt als Reserve im Code.

**Analytics:** eigene Messung ohne Cookies. `PageViews` (Client) → `POST /api/track` → Backend-Tabelle `site_hits`. Besucher = täglich wechselnder Hash aus IP + Browser
(nichts davon wird gespeichert), Kanal aus Referrer/UTM (Suche, KI-Assistenten, Social, Direkt, Verweis, Anzeigen, E-Mail). Bots und „Do Not Track“ werden nicht gezählt.

**Einwilligung:** `CookieBanner` + `src/lib/consent.ts`. Ohne Zustimmung wird nichts im Browser gespeichert; mit „Statistik“ merkt sich die Seite
Session-ID und Herkunft im sessionStorage (`src/lib/attribution.ts`). Footer-Link „Cookie-Einstellungen“ öffnet die Auswahl erneut.

Seiten: **Leads** (KPIs, Pipeline nach Status, Filter per URL, Tabelle mit Score/Tier/Status) · **Lead-Detail** (Kontakt-Buttons inkl. WhatsApp, Rechner-Auswahl, Score-Begründung, Verlauf + Notizen, Status/Auftragswert/Nächster Schritt) · **Kalkulationen** (Conversion Rechner → Lead) · **Preise** (Editor für `services`). Ohne Backend lokal: Demo-Modus mit Beispieldaten; in Produktion gesperrt.

---

## Phase 6 · Mehrsprachigkeit (DE/EN)

- **next-intl 4**, App Router. Alle öffentlichen Seiten liegen unter `src/app/[locale]/(site)`, Dashboard bleibt unter `/admin` (deutsch).
- **URLs:** Deutsch ohne Präfix (alle bisherigen URLs bleiben), Englisch unter `/en` mit übersetzten Pfaden:
  `/preisrechner` ↔ `/en/pricing-calculator`, `/leistungen/festival-videograf` ↔ `/en/services/festival-videographer`,
  `/impressum` ↔ `/en/legal-notice`, `/datenschutz` ↔ `/en/privacy`.
- **Keine Auto-Redirects** nach Browsersprache oder Cookie (`localeDetection: false`) – die URL entscheidet.
- **Texte:** `messages/de.json` (Referenz, typisiert über `src/global.d.ts`) und `messages/en.json` mit identischen Keys.
  Neue Texte immer in beiden Dateien anlegen – `npm run typecheck` meldet fehlende DE-Keys.
- **Rechner:** Optionslabels in `config/pricing.ts` sind die deutschen Stammdaten für Backend-Seed & Dashboard.
  Die Website zeigt `calculator.options.*` aus den JSONs; ein im Dashboard geändertes Label gewinnt auf Deutsch weiterhin.
- **Validierung:** Zod liefert Codes (`nameRequired` …), die UI übersetzt sie (`contactForm.errors.*`). API-Fehler ebenso (`contactForm.server.*`).
- **Leads:** Payload enthält `locale`; n8n bekommt zusätzlich `calculatorSummaryLocalized` → Bestätigungs-Mail in der Sprache des Leads.
- **SEO:** Canonical je Sprache, `hreflang` de-DE / en / x-default (Metadata + Sitemap), `og:locale`, JSON-LD mit `inLanguage`, OG-Bild je Sprache.

## Go-Live-Checkliste
1. Backend: Sprite `taswiq-media` (Service `api`) läuft; auf dem Sprite in `/home/sprite/taswiq/.env` `ADMIN_EMAILS`, `SITE_URL` und
   `MAGIC_LINK_WEBHOOK_URL` setzen (sonst landet der Login-Link nur im Service-Log), Service neu starten. Sprite-URL-Zugriff so einstellen,
   dass Vercel und n8n sie erreichen (Token-Schutz liegt im Dienst selbst).
2. Admin = Adresse in `ADMIN_EMAILS` (kein Anlegen in einer Auth-Tabelle nötig)
3. n8n: Workflow importieren, Credentials (Header-Auth `x-taswiq-secret`, Header-Auth `x-taswiq-token` = Backend, SMTP, Discord) verbinden, aktivieren;
   zusätzlich einen Webhook-Flow für `admin.login` ({email, link} → Mail) anlegen
4. `.env` aus `.env.example` befüllen (Vercel: Project → Environment Variables): `TASWIQ_API_URL`, `TASWIQ_API_TOKEN`, `SESSION_SECRET`, `ADMIN_EMAILS`
5. `site.ts`: Domain, Adresse, Social-Profile · Impressum & Datenschutz final prüfen lassen
6. Freigaben: Nennung der Referenzkunden/Artists und Nutzung der SPOTS-Filme (Endcards „Spots KL“ sind herausgeschnitten)
