# SEO- und GEO-Plan (Stand 08.10.2026)

Arbeitsgrundlage der Abteilung Wachstum. Ziel: 600 passende Besucher und 12 Anfragen pro Monat über Google und KI-Assistenten.

## Vorgehen

1. **Suchbegriffe aus echten Daten.** Quelle bisher: Google-Suchvorschläge (was Menschen tatsächlich eintippen). Suchvolumen kennen wir
   noch nicht – dafür braucht es die Search Console (ab Einrichtung, nach ca. 2 Wochen) oder den Google-Ads-Keyword-Planer.
   Sobald Search-Console-Daten da sind: Begriffe auf Position 8–30 zuerst ausbauen, das sind die schnellsten Gewinne.
2. **Nische vor Masse.** Wir ranken nicht für „Software“ oder „Website erstellen“. Wir ranken für **Branche + Problem + Kaufabsicht**:
   „Bestellsystem Bäckerei“, „Lieferando Alternative“, „Buchungssystem Friseur ohne Provision“, „Mandantenportal Steuerberater“,
   „KI Telefonassistent Kosten“. Wenig Konkurrenz von Agenturen, klare Absicht, wir haben echte Referenzen.
3. **Eine Seite je Suchabsicht.** Jedes Haupt-Suchwort hat genau eine Zielseite (Tabelle unten). Neue Artikel dürfen einer bestehenden
   Seite nicht das Suchwort wegnehmen – sie decken eine engere Frage ab und verlinken auf die Zielseite.
4. **Themen-Cluster.** Leistungs-/Branchenseite = Zentrum; Ratgeber = Speichen. Jeder Ratgeber verlinkt im ersten Drittel auf seine
   Zielseite und einmal auf den Preisrechner; die Zielseite verlinkt zurück (`blog`-Liste in `src/config/seo-pages.ts`).
5. **Gegen Konkurrenz gewinnen.** Standard-Anbieter (Plattformen, Baukästen) ranken mit Produktseiten. Unsere Lücke: ehrliche
   Vergleiche „Plattform oder eigene Lösung“, echte Kostenrechnungen, Schritt-für-Schritt-Antworten. Vor jedem Artikel die ersten
   fünf Google-Treffer ansehen und etwas liefern, das dort fehlt (Rechnung, Tabelle, Checkliste, Beispiel aus einem echten Projekt).

## So ist jeder Ratgeber gebaut (für Google und für KI-Antworten)

- `seoTitle` ≤ 60 Zeichen, Suchwort vorn · `description` ≤ 155 Zeichen mit Nutzen · `slug` = Suchwort.
- Erster Absatz beantwortet die Frage direkt in 2–3 Sätzen (das zitieren KI-Assistenten und Google-Snippets).
- Zwischenüberschriften als Fragen, wie Kunden sie stellen. Mindestens eine Tabelle oder Rechnung, eine Checkliste, 4–6 FAQ.
- 1.000–1.500 Wörter, konkret, Du-Form, keine Floskeln. Preise nur aus `src/config/packages.ts` / `pricing.ts`.
- Keine erfundenen Zahlen, Studien oder Kundenstimmen. Fakten von außen (Förderung, Gesetze, Marktzahlen) nur mit Quelle im Text
  und nur, wenn die Quelle beim Schreiben geprüft wurde. Fremde Marken sachlich nennen, nichts Abwertendes.
- Titelbild wie bei den bestehenden Artikeln (`docs/IMAGE-CREDITS.md`), Eintrag in `src/content/blog/index.ts`, bei der Zielseite verlinken.
- Nach dem Veröffentlichen prüfen: Seite lädt, steht in `/sitemap.xml`, Titel und Beschreibung stimmen, FAQ-Schema vorhanden.

## Zielseiten (ein Haupt-Suchwort je Seite)

| Haupt-Suchwort | Zielseite |
|---|---|
| Software Gastronomie, Bestellsystem Restaurant | /leistungen/software-gastronomie |
| Bestellsystem ohne Provision, Online-Bestellsystem Gastronomie | /leistungen/bestellsystem-ohne-provision |
| Lieferando Alternative | /blog/eigenes-bestellsystem-statt-lieferando |
| Bestellsystem Bäckerei, Vorbestellung Bäckerei online | /blog/bestellsystem-baeckerei |
| QR-Code-Bestellsystem (+ kostenlos, Kosten), Tischbestellung per QR-Code | /blog/qr-code-bestellsystem |
| Buchungssystem Friseur, Online-Terminbuchung Friseur | /leistungen/buchungssystem-friseur-beauty |
| Online-Buchungssystem | /leistungen/online-buchungssystem |
| Mandantenportal Steuerberater / Kanzlei | /leistungen/software-steuerberater-kanzlei |
| Software Makler, Software Hausverwaltung, Mieterportal | /leistungen/software-immobilien |
| Autohaus Software, Werkstatt Termin online, Fahrschule Software | /leistungen/software-autohaus-fahrschule |
| Handwerkersoftware | /leistungen/software-handwerk-dienstleister |
| Individualsoftware (entwickeln lassen) | /leistungen/individualsoftware-mittelstand |
| Web-App / Kundenportal entwickeln lassen | /leistungen/web-app-entwicklung |
| Dashboard erstellen lassen | /leistungen/dashboard-entwicklung |
| KI-Automatisierung Unternehmen | /leistungen/ki-automatisierung-unternehmen |
| KI Telefonassistent Kosten (+ Handwerk, Arztpraxis, Hausverwaltung) | /blog/ki-telefonassistent-kosten |
| Website erstellen lassen (Kosten) | /leistungen/website-erstellen-lassen |

**Im Dashboard:** Die Zielseiten und Lücken stehen zusätzlich in `src/config/keywords.ts` – daraus prüft die Seitenstruktur (Reiter „Suchbegriffe“), ob ein Begriff in Titel oder Überschrift seiner Zielseite steht. Beide Stellen gemeinsam pflegen.

## Gefundene Suchanfragen ohne eigene Seite (Lücken → Aufgaben)

Aus den Google-Vorschlägen vom 08.10.2026, sortiert nach Kaufabsicht und danach, ob wir eine Referenz haben:

- Gastronomie: ~~`bestellsystem bäckerei`, `vorbestellung bäckerei online`~~ (erledigt 08.10.2026: /blog/bestellsystem-baeckerei) · ~~`qr code bestellsystem` (+ kostenlos)~~ (erledigt 08.10.2026: /blog/qr-code-bestellsystem) ·
  ~~`tischreservierungssystem`~~ (/blog/tischreservierungssystem) · `lieferando alternative` + Stadt
- Beauty/Gesundheit: ~~`treatwell alternative`~~ (/blog/treatwell-alternative) · ~~`buchungssystem physiotherapie`~~ (/blog/buchungssystem-physiotherapie) · ~~`online buchungssystem für kurse` · `online buchungssystem mit bezahlfunktion`~~ (/blog/online-buchungssystem-fuer-kurse) · `online buchungssystem kostenlos` (Vergleich: was kostenlos wirklich kostet)
- Handwerk: ~~`handwerkersoftware für kleinbetriebe` (+ vergleich)~~ (/blog/handwerkersoftware-kleinbetriebe) · ~~`digitalisierung handwerk förderung`~~ (/blog/digitalisierung-handwerk-foerderung) · `ki telefonassistent handwerk`
- Immobilien: `software hausverwaltung für private vermieter` · ~~`mieterportal`~~ (/blog/mieterportal) · `maklersoftware vergleich`
- Automotive: ~~`werkstatt termin online buchen`~~ (/blog/werkstatt-termin-online-buchen) · `fahrschul app kosten` · `autohaus software vergleich`
- Software allgemein: ~~`individualsoftware beispiele` · `individualsoftware vs standardsoftware`~~ (/blog/individualsoftware-vs-standardsoftware) · ~~`software entwickeln lassen kosten` · `app entwickeln lassen kosten`~~ (/blog/software-entwickeln-lassen-kosten) · ~~`kundenportal erstellen lassen`~~ (/blog/kundenportal-erstellen-lassen) · `ki software entwickeln lassen`
- KI: ~~`ki telefonassistent kosten` (+ handwerk, arztpraxis, hausverwaltung)~~ (erledigt 08.10.2026: /blog/ki-telefonassistent-kosten) · `ki automatisierung für kleine unternehmen`
- Website: ~~`website erstellen lassen monatliche kosten`~~ (/blog/website-erstellen-lassen-monatliche-kosten)

## Noch offen (braucht Karim)

- Search Console und Bing Webmaster Tools einrichten, Sitemap einreichen → erst dann sehen wir Positionen und Klicks.
- Geschäftsanschrift → erst dann lokale Suche („Software Agentur + Stadt“) und Google-Unternehmensprofil.
