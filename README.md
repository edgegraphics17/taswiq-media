# TasWiq Media. – Website

Software-Agentur für KMU & Mittelstand – Bestell- & Buchungssysteme, Portale, Dashboards, Websites und KI-Automatisierung. Premium-Media für Events, Festivals & Artists als zweites Standbein. Backed by winsym.ai (KI-Technologie, Kuala Lumpur).
Logik nach asapmarketing.de, Design-System „Soft UI“ (Violett, Bento, schwebende Karten) – Tokens in `src/app/globals.css`.

**Stack:** Next.js 15 · Tailwind CSS 4 · Framer Motion · Backend (Node + SQLite auf Fly.io-Sprite, `backend/`) · n8n · Zod

## Schnellstart

```bash
npm install
npm run dev        # http://localhost:3000 – läuft ohne Keys (Leads werden geloggt, Dashboard zeigt Demo-Daten)
```

Mit Backend: `.env.example` → `.env.local` kopieren und ausfüllen.

| Befehl | Zweck |
|--------|-------|
| `npm run dev` | Entwicklung |
| `npm run build` | Produktions-Build |
| `npm run lint` / `npm run typecheck` | Qualität |
| `npm run db:seed-sql` | `backend/seed.sql` aus `src/config/pricing.ts` erzeugen |

## Wo ändere ich was?

| Was | Datei |
|-----|-------|
| Struktur Startseite, Portfolio-Projekte, Referenzen | `src/config/content.ts` |
| Pakete & Einstiegspreise (Software + Premium-Media) | `src/config/packages.ts` |
| Ratgeber-Artikel (Blog, Deutsch) | `src/content/blog/posts/*.ts` |
| Alle sichtbaren Texte (DE/EN) | `messages/de.json`, `messages/en.json` |
| Preise & Rechner-Schritte | `src/config/pricing.ts` oder Dashboard → Preise |
| Funnel-Optionen, Starter-Pakete | `src/config/funnel.ts` |
| Branchen-, Leistungs- & Media-Landingpages (inkl. alter Slugs → 301) | `src/config/seo-pages.ts` |
| Adresse, Domain, Calendly, Social, Partner winsym.ai | `src/config/site.ts` |
| Farben, Radien, Schatten, Motion | `src/app/globals.css` (`@theme`) |

Ausführlich: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Vorlage-Analyse: [`docs/ASAP-ANALYSE.md`](docs/ASAP-ANALYSE.md)
