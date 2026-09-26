# TasWiq Media. – Architektur (Phasen 1–5)

**Logik (Funnel, Rechner, Scoring, Backend):** nach asapmarketing.de (Analyse: [`ASAP-ANALYSE.md`](./ASAP-ANALYSE.md))
**Design-System „Soft UI“ (seit Redesign 27.09.2026):** nach der Design-Vorlage – Violett `#7840FE`, Canvas `#F6F6F6`, Kontrast-Schwarz `#141414`, Mint `#1DAF59`, Rosé `#F9CFD4`, Inter Tight; weiche Radien (`rounded-[2rem]`), alle Buttons/Tags als Pillen, Bento-Grids, schwebende Info-Karten. Tokens in `src/app/globals.css`.
**Stack:** Next.js 15.5 (App Router) · Tailwind CSS 4 · Framer Motion · Supabase · n8n · Zod

---

## File-Tree

```
Taswiq Media./
├─ docs/
│  ├─ ARCHITECTURE.md            ← dieses Dokument
│  └─ ASAP-ANALYSE.md            ← Blaupause: Sektionen, Funnel, Rechner, Motion von asap
├─ n8n/
│  └─ taswiq-lead-automation.json ← importierbarer Workflow (14 Nodes)
├─ supabase/
│  ├─ migrations/20260926000000_init.sql  ← Schema, RLS, Trigger, View
│  └─ seed.sql                   ← generiert aus src/config/pricing.ts
├─ scripts/generate-seed.ts      ← npm run db:seed-sql
├─ public/
│  ├─ videos/showreel.mp4        ← 17-s-Hero-Showreel (4,7 MB) aus den SPOTS-Filmen
│  ├─ videos/cases/*.mp4         ← 6-s-Vorschauclips je Projekt (0,5–0,8 MB)
│  └─ images/                    ← Poster, Nebel-Motiv der Rechnung
└─ src/
   ├─ middleware.ts              ← schützt /admin/*
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
   │  ├─ api/leads/route.ts      ← Phase 3 – Funnel/Rechner → Supabase → n8n
   │  ├─ api/calculator/route.ts ← Phase 2 – Kalkulation protokollieren
   │  ├─ robots.ts, sitemap.ts, llms.txt/, opengraph-image.tsx
   ├─ config/                    ← ALLE Inhalte & Preise (Copy ändern = nur hier)
   │  ├─ site.ts                 ← Stammdaten, Adresse, Calendly, Social
   │  ├─ content.ts              ← Copy Startseite + Portfolio + Referenzen
   │  ├─ pipeline.ts             ← Copy Flaggschiff-Seite + Pakete + FAQ
   │  ├─ pricing.ts              ← Preis-Matrix + Rechner-Schritte
   │  ├─ funnel.ts               ← Funnel-Optionen + Starter-Pakete
   │  └─ seo-pages.ts            ← Geo-SEO-Seiten
   ├─ lib/
   │  ├─ pricing-engine.ts       ← reine Rechenlogik (Client + Server identisch)
   │  ├─ pricing-source.ts       ← Preise aus Supabase überschreiben config (Cache 5 Min.)
   │  ├─ lead-scoring.ts         ← Score + Tier
   │  ├─ validation.ts           ← Zod-Schemas (Client-Inline + Server)
   │  ├─ webhook.ts              ← n8n-Forwarding (Secret + HMAC, 4-s-Timeout)
   │  ├─ seo.ts                  ← Metadata-Helfer + JSON-LD
   │  ├─ supabase/               ← server / admin (Service-Role) / browser / middleware
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
2. Dashboard → **Preise** (schreibt in Supabase `services`, live nach Speichern)
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

### Supabase (`supabase/migrations/20260926000000_init.sql`)
| Tabelle | Inhalt |
|---------|--------|
| `services` | Preis-Matrix (group_id, option_id, preis, mtl, dreh, is_active) – überschreibt pricing.ts |
| `calculator_requests` | jede Kalkulation: State, Posten, Spanne, Preisversion, UTM, `converted_lead_id` |
| `leads` | Kontakt, Qualifizierung, Score/Tier, **Kunden-Status** (neu → kontaktiert → angebot → verhandlung → gewonnen/verloren/archiviert), Auftragswert, n8n-Automation |
| `lead_events` | Verlauf: Erstellung & Status-Wechsel automatisch per Trigger, Notizen, Automationen |
| View `lead_pipeline_summary` | Anzahl & Summen je Status (security_invoker) |

**Sicherheit:** RLS auf allen Tabellen. Website schreibt nur über API-Routen mit Service-Key. Admins = `app_metadata.role = 'admin'` (nicht vom Nutzer änderbar) + optional `ADMIN_EMAILS`. IPs nur als gesalzener Hash.

### n8n (`n8n/taswiq-lead-automation.json`)
```
Webhook (Header-Auth) → Code: Lead aufbereiten (Mail-Template je Branche × Tier, Discord-Embed)
   ├─ Discord: Neuer Lead
   └─ Switch: Tier ─┬─ Starter  → Mail: Starter-Pakete ─┐
                    ├─ Growth   → Mail: Angebot 24 h ───┼→ Supabase: automation speichern → Verlauf-Eintrag
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
Request /admin/* ──► middleware.ts (Supabase-Session erneuern, Rolle prüfen → sonst /admin/login)
                 ──► (dash)/layout.tsx  requireAdmin()   ← zweite Prüfung serverseitig
                 ──► Server Components lesen mit der Nutzer-Session → RLS (is_admin()) als dritte Ebene
Mutationen      ──► Server Actions (actions.ts) prüfen Rolle erneut → update/insert → revalidatePath
Live            ──► LiveRefresh (Supabase Realtime auf `leads`) → router.refresh()
Login           ──► Magic Link (shouldCreateUser: false) → /admin/auth/callback
```
Seiten: **Leads** (KPIs, Pipeline nach Status, Filter per URL, Tabelle mit Score/Tier/Status) · **Lead-Detail** (Kontakt-Buttons inkl. WhatsApp, Rechner-Auswahl, Score-Begründung, Verlauf + Notizen, Status/Auftragswert/Nächster Schritt) · **Kalkulationen** (Conversion Rechner → Lead) · **Preise** (Editor für `services`). Ohne Supabase lokal: Demo-Modus mit Beispieldaten; in Produktion gesperrt.

---

## Go-Live-Checkliste
1. Supabase-Projekt (Region Frankfurt) → Migration + `supabase/seed.sql` ausführen
2. Admin anlegen: Auth → User einladen, dann
   `update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'karim@azzaoui.de';`
3. n8n: Workflow importieren, Credentials (Header-Auth, SMTP, Supabase, Discord) verbinden, aktivieren
4. `.env` aus `.env.example` befüllen (Vercel: Project → Environment Variables)
5. `site.ts`: Domain, Adresse, Social-Profile · Impressum & Datenschutz final prüfen lassen
6. Freigaben: Nennung der Referenzkunden/Artists und Nutzung der SPOTS-Filme (Endcards „Spots KL“ sind herausgeschnitten)
