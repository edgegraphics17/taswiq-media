# asapmarketing.de – Analyse als Blaupause für TasWiq Media.

Analysiert am 26.09.2026 aus dem Quelltext aller Seiten der `sitemap.xml`
(`/`, `/rechner.html`, `/ki-telefonassistent.html`, `/impressum.html`, `/datenschutz.html`)
plus `robots.txt`, `llms.txt` und Kunden-Login (`app.asapmarketing.de/login`).

**Rollenverteilung:** Struktur, Funnels, Rechner und Animationen kommen von asap.
Farben, Typografie und UI-Details kommen aus der TasWiq-Rechnung (Navy + Teal, Exo 2, gesperrte Labels).

---

## 1. Technik

- Statisches HTML, CSS und JS inline, keine Frameworks, ~137 KB Startseite.
- Formulare → `mailer.php` (JSON). Rechner und Startseiten-Funnel schicken **dasselbe Payload-Format** an denselben Endpunkt.
- Consent: CCM19; Analytics: GA4 mit Events `page_view` (pro Sektion), `generate_lead`, `rechner_anfrage`, `ki_rueckruf_test`.
- SEO/GEO: JSON-LD `@graph` (ProfessionalService + Organization + WebSite, `hasOfferCatalog`), eigenes `WebApplication`-Schema für den Rechner, `Service`-Schema mit `UnitPriceSpecification` auf der Produktseite. `robots.txt` lädt KI-Crawler ausdrücklich ein (GPTBot, ClaudeBot, PerplexityBot …), `llms.txt` beschreibt Firma und Leistungen für LLMs.

## 2. Sitemap & Seitenaufbau

### Startseite `/`
| # | Sektion | Inhalt | Interaktion |
|---|---------|--------|-------------|
| 1 | Nav | Home · Services · KI-Lösungen · KI-Telefonassistent · Ablauf · Preisrechner · CTA „Projekt starten“ · Kunden-Login | transparent → ab 50 px weiß mit Blur |
| 2 | Hero | H1 aus **einem Wort** („Marketing.“) + Typewriter-Zeile mit Verlaufs-Schimmer, Subline, 2 CTAs, 3 Kennzahlen, Scroll-Indikator | gestaffeltes fadeUp (0.4 / 0.6 / 0.8 / 1.0 / 1.4 s), schwebende Glow-Orbs, Rasterlinien |
| 3 | Über uns | Links „Unser Versprechen“-Karte mit Checkliste + Badge, rechts „Warum ASAP“ + 3 Features | Reveal |
| 4 | Services | 6 Karten: Icon, Titel, Text, Tag-Zeile | Hover: Karte skaliert 1.05, hebt sich −10 px, kippt ±1.5° (abwechselnd), Teal-Schatten; **alle anderen Karten schrumpfen auf 0.95 und blenden auf 65 %** (`:has`) |
| 5 | KI-Lösungen | Dunkle Flaggschiff-Karte (→ Unterseite), 4 KI-Karten, Zweiweg-Split („Sie sind aus dem Handwerk“ / „anderen Branche“) | Karten: Teal-Linie oben fährt per scaleX ein |
| 6 | Referenzen | Filter-Buttons + Case-Karten mit Overlay | Hover: Bild zoomt, Beschreibung klappt auf |
| 7 | Ablauf | 4 Schritte 01–04 auf Verbindungslinie (Deep Dive · Masterplan · Umsetzung · Scale & Optimize) | Kreis füllt sich Teal + Glow |
| 8 | Rechner-Teaser | Dunkle Box: „Was kostet das bei uns? Sehen Sie es in zwei Minuten.“, 3 Pills, Hinweis „Richtwert, kein Angebot“, CTA → Rechner, Beispiel-Ergebniskarte | – |
| 9 | Kontakt | Links Text + E-Mail/Telefon, rechts **4-Schritte-Funnel** | siehe 3. |
| 10 | Footer | Claim, Social, Navigation, Kontakt, Rechtliches, Cookie-Einstellungen | – |

**Mobile (< 900 px):** Services, KI-Karten, Ablauf und Referenzen werden zu horizontalen Scroll-Snap-Slidern. Die Karte in der Mitte ist „aktiv“ (volle Deckkraft, Scale 1), die anderen 45 % / Scale 0.94. Punkte darunter zeigen die Position.

**Mobile-Menü:** Die ganze Seite klappt in 3D weg (`perspective(1000px) rotateY(-24deg) scale(.84)`), links erscheint das Menü mit gestaffelt einfliegenden Links (30 ms Versatz). Tipp auf die weggeklappte Seite schließt. Scroll-Position bleibt erhalten.

### Projekt-Rechner `/rechner.html`
- Layout: links dunkle Info-Spalte mit **vertikaler Schrittleiste**, rechts Frage-Bereich, unten **sticky Leiste** mit „Richtwert“ + Zurück/Weiter.
- **Verzweigung:** Die erste Antwort (Onepager / Website / Relaunch / Shop / App) bestimmt, welche Schritte folgen (`wenn`-Bedingungen pro Schritt und Feld).
- Feldtypen: Radio-Karten und Checkbox-Karten (mit Preis-Hinweis „+ 490 €“, „+ 25 %“, „+ 49 €/Monat“), Zahl-Stepper (− / +), Schalter (Express).
- Preis zählt nur, **was schon beantwortet ist** – der Richtwert wächst mit jedem Schritt. Schritt 1 zeigt „ab X €“, danach eine Spanne.
- Spanne: Summe −10 % / +18 %, gerundet auf 50 €. Einmalige und monatliche Kosten getrennt.
- Ergebnis: Summenbox, aufklappbare Aufstellung „Wie kommt der Betrag zustande?“, „Zusammenfassung kopieren“, „Als PDF speichern“ (eigene Druckansicht), Richtwert-Hinweis, **Anfrageformular direkt im Ergebnis**.
- Schrittleiste: erledigte Schritte anklickbar, zukünftige gesperrt. Pfeiltasten ← → navigieren.
- Preise liegen in einem Datenblock und werden von `preise.json` überschrieben (Preisänderung ohne Code).

### Produktseite `/ki-telefonassistent.html`
Hero mit Partner-Badge + 4 Kennzahlen → Problem (Liste + „So läuft ein Anruf“) → 9 Funktionen → Ablauf in 3 Modi → Für wen (Branchen-Chips + Zweiweg-Split) → Unsere Rolle (4 Punkte) → 3 Preisstufen („Meist gewählt“ markiert) + Trust-Zeile → CTA-Sektion.

## 3. Kontakt-Funnel (Vorhaben → Status → Budget → Kontakt)

| Schritt | Frage | Typ |
|---------|-------|-----|
| 1 Vorhaben | „Was ist dein Vorhaben?“ – 10 Bereiche inkl. „Bin noch unsicher“ | Mehrfachauswahl-Chips, 2 Spalten, Häkchen |
| 2 Status | „Wie aktiv bist du aktuell im Marketing?“ – 5 Stufen von „Neustart“ bis „Konkretes Projekt“ | Einfachauswahl, Pill-Form mit Punkt |
| 3 Budget | „Was ist dein monatliches Budget?“ – Unter 1.000 / 1.000–5.000 / 5.000–10.000 / Über 10.000 / Keine Angabe | Einfachauswahl, 2er-Raster |
| 4 Kontakt | Name*, E-Mail*, Telefon, Nachricht | Formular + Honeypot |

- Fortschritt: 4 Punkte mit Labels, Teal-Linie füllt sich (`(step-1)/3`).
- Schrittwechsel mit **Wipe-Animation**: zwei Teal-Flächen wischen per `clip-path` über die Karte (0.8 s, `cubic-bezier(.8,0,.2,1)`, zweite Fläche 0.1 s versetzt), rückwärts gespiegelt. Inhalt wird unter der Fläche getauscht.
- Erfolg: Kreis und Häkchen zeichnen sich per `stroke-dashoffset`.
- Schwächen, die wir besser machen: `alert()` statt Inline-Fehler, kein Lead-Scoring, gleicher Abschluss-Screen für alle, keine Speicherung außer Mail.

## 4. Motion-System

| Token | Wert | Einsatz |
|-------|------|---------|
| `--ease-wobble` | `cubic-bezier(.34,1.56,.64,1)` | Reveal, Karten-Hover (leichtes Überschwingen) |
| `--ease-bounce` | `cubic-bezier(.175,.885,.32,1.275)` | Chips, Menü, Slider |
| `--ease-smooth` | `cubic-bezier(.4,0,.2,1)` | Linien, Farben |
| Reveal | `translateY(50px) scale(.9)` → 0 / 1, 0.8 s wobble, Stagger 150 ms | alle Sektionen |
| Keyframes | orbFloat (8–10 s), gradientShine (4 s), blink, scrollPulse, wipeIn, strokeCirc/strokeCheck | Hero, Funnel |

## 5. Übertragung auf TasWiq

| asap | TasWiq Media. |
|------|---------------|
| „Marketing.“ + Typewriter | „Content.“ + Typewriter („der satt macht.“ / „der laut ist.“ / „in KI-Tempo.“) |
| Orbs + Raster auf Dunkelgrau | Nebelwald aus der Rechnung + Teal-Glows + Filmkorn |
| KI-Telefonassistent (Flaggschiff) | **KI-Content-Pipeline** (eigene Unterseite) |
| Projekt-Rechner (Web/Shop/App) | Rechner mit Verzweigung nach **Branche → Leistungen (Video/Foto/Web/KI) → Umfang je Leistung** |
| Druckansicht | Angebots-Sheet im Rechnungs-Design (Navy-Kopf, Job-Nr., Gesamtbetrag-Box) |
| mailer.php | `/api/leads` → Supabase → n8n (Slack/Discord, Mail je Branche, Follow-up) |
| gleicher Erfolgs-Screen | **Lead-Scoring:** < 1.000 € → Starter-Pakete, > 5.000 € → Calendly-Termin |
| Sie/du gemischt | durchgehend „du“ |
| Emojis als Icons | Lucide-Icons (skalierbar, markenkonform) |
