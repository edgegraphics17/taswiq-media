# TasWiq Media. – Arbeitsregeln

Website, Admin-Dashboard und Vertriebssystem der Agentur. Ziel, an dem sich jede Aufgabe misst: 10.000 € Umsatz pro Monat (`src/config/goal.ts`).

Details stehen in `README.md` (Wo ändere ich was) und `docs/ARCHITECTURE.md`. Dort gezielt den passenden Abschnitt lesen, nicht das Repo durchsuchen.

## Positionierung

- Zuerst Software für kleine und mittlere Betriebe (Bestell- und Buchungssysteme, Portale, Dashboards, Websites, KI-Automatisierung). Media (Hyatt, Festivals, Artists) ist Beleg und drei Premium-Pakete, nicht das Hauptangebot.
- „Backed by winsym.ai“ = KI-Technologiepartner in Kuala Lumpur. TasWiq = Agentur, gebaut wird in Deutschland.
- Software-Referenzen sind die Demos mit Musterfirmen unter `/demo/<slug>`, keine Kundenprojekte.

## Stack

Next.js 15 (App Router, Turbopack), React 19, Tailwind 4, Framer Motion, next-intl (DE/EN), Zod. **Kein Supabase:** Backend ist ein Node-Dienst mit SQLite auf dem Fly-Sprite `taswiq-media` (`backend/`). Mail über Resend, DNS bei Hostinger.

## Wo liegt was

| Was | Ort |
|---|---|
| Sichtbare Texte | `messages/de.json` und `messages/en.json` – immer beide pflegen |
| Startseite, Portfolio, Referenzen | `src/config/content.ts` |
| Pakete, Preise, Mietformel | `src/config/packages.ts`, `src/config/pricing.ts` |
| Branchen- und Leistungsseiten, Städte-Varianten, 301 | `src/config/seo-pages.ts` |
| Ratgeber-Artikel (nur Deutsch) | `src/content/blog/posts/*.ts` |
| Demos (nur Deutsch, außerhalb der Sprach-Routen) | `src/demos/` (`registry.ts`, `apps/`, `kit/`), Route `src/app/demo` |
| Adresse, Domain, Social | `src/config/site.ts` |
| Farben, Radien, Schatten, Motion | `src/app/globals.css` (`@theme`) |
| Dashboard | `src/app/admin`, `src/components/admin`, `src/lib/admin` |
| Mail-Vorlagen | `src/emails/templates.ts`, danach `npm run mail:sync` |
| Vertriebs-PDFs (nicht im Repo) | `vertrieb/quelle/`, Bau: `node vertrieb/quelle/build.mjs [name]` |
| LinkedIn-Konnektor | `linkedin/` |
| Agenten-Team | `team/README.md` – für Abteilungs-Sitzungen gilt diese Datei vor allem anderen |

## Arbeitsablauf

1. Umsetzen.
2. `npm run typecheck`; bei größeren Änderungen auch `npm run lint` und `npm run build`.
3. Im Browser prüfen, Desktop und Handy. Lokaler Server: `taswiq-dev` (Port 3100) aus `.claude/launch.json`.
4. **Ohne Rückfrage live stellen:** nur eigene Dateien stagen, committen, `git pull --rebase`, `git push` auf `main` (= Produktion). Deploy über Vercel bis `READY` prüfen (Team `team_25pc00wdMTW71mtrC9d04HL8`, Projekt `prj_ump2Q8jQEWWanRSrNjiAOJqM0x2V`), dann die Live-Seite ansehen.
5. Kurz melden, was live ist.

**Backend wird durch Push nicht deployt:** Dateien per `sprite file push` übertragen, Dienst `api` neu starten, `sprite checkpoint create`. Näheres in `backend/README.md`.

## Regeln

- Design: fotogetrieben nach Referenz, große weiche Radien, klare Karten, eine warme Markenfarbe. Demo-Dashboards nüchtern und dicht mit echten Daten. `ui-ux-pro-max` nur für Abstände, Textgrößen und Kontrast.
- Neue Seiten bekommen Metadaten über `pageMetadata()`, passendes JSON-LD und einen Eintrag, der in `/llms.txt` und der Sitemap landet. Nach neuen Seiten `npm run indexnow`.
- Ändert sich eine Demo sichtbar, die Vorschaubilder in `public/images/demo/` neu erzeugen.
- Preise nur in den Config-Dateien ändern; `vertrieb/quelle/h.mjs` ist eine Kopie und muss nachgezogen werden.
- Referenz-Inhalte sind freigegeben, nicht nach Rechten fragen. Fremde Werbung bleibt draußen.
- Auffälligkeiten, die nicht zur Aufgabe gehören, als Aufgabe ins Dashboard einspielen statt nebenbei zu beheben.
- Mails: Anfragen gehen an info@taswiq-media.de. Kaltakquise per E-Mail nur mit Erlaubnis (§ 7 UWG).
- Zugangsdaten liegen in `.env.local` und in Vercel, nie im Repo und nie im Chat.
