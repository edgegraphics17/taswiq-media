# TasWiq Media. – Website

Medienagentur für Gastronomie, Festivals & Musik – Premium-Video/Foto, skaliert mit KI.
Struktur, Funnel, Rechner und Animationen nach asapmarketing.de, Design aus der TasWiq-Rechnung.

**Stack:** Next.js 15 · Tailwind CSS 4 · Framer Motion · Supabase · n8n · Zod

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
| `npm run db:seed-sql` | `supabase/seed.sql` aus `src/config/pricing.ts` erzeugen |

## Wo ändere ich was?

| Was | Datei |
|-----|-------|
| Texte der Startseite, Portfolio, Referenzen | `src/config/content.ts` |
| Flaggschiff-Seite, Pakete, FAQ | `src/config/pipeline.ts` |
| Preise & Rechner-Schritte | `src/config/pricing.ts` oder Dashboard → Preise |
| Funnel-Optionen, Starter-Pakete | `src/config/funnel.ts` |
| SEO-Landingpages | `src/config/seo-pages.ts` |
| Adresse, Domain, Calendly, Social | `src/config/site.ts` |
| Farben, Motion | `src/app/globals.css` |

Ausführlich: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Vorlage-Analyse: [`docs/ASAP-ANALYSE.md`](docs/ASAP-ANALYSE.md)
