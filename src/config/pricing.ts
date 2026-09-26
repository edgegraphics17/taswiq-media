/**
 * ════════════════════════════════════════════════════════════════════
 *  PREIS-MATRIX & RECHNER-ABLAUF  –  alles Kaufmännische steht hier.
 * ════════════════════════════════════════════════════════════════════
 *  Aufbau nach dem Vorbild asapmarketing.de/rechner.html:
 *   - OPTIONEN: jede Auswahl mit `preis` (einmalig) und/oder `mtl` (monatlich)
 *   - SCHRITTE: welche Frage wann kommt – `wenn` blendet Schritte/Felder je
 *     nach bisherigen Antworten ein (Verzweigung nach gewählten Leistungen)
 *   - KONFIG: Spanne, Rundung, Aufschläge
 *
 *  Beträge in Euro, Endpreise (Kleinunternehmer, § 19 UStG).
 *  Preise ohne Deploy ändern: Tabelle `services` in Supabase – deren Werte
 *  überschreiben diese Datei zur Laufzeit (siehe lib/pricing-source.ts).
 *  Nach Änderungen `version` hochzählen – sie wird mit jeder Kalkulation gespeichert.
 */

export const KONFIG = {
  version: "2026-09",
  /** Richtwert-Spanne um die Summe: −10 % / +18 % */
  spanneUnten: 0.1,
  spanneOben: 0.18,
  rundenAuf: 50,
  expressAufschlag: 0.25,
  /** Festival-, Club- und Nachtdrehs: mehr Crew, spätere Zeiten */
  festivalFaktor: 1.15,
};

export type CalcValue = string | string[] | number | boolean;
export type CalcState = Record<string, CalcValue>;

export interface Option {
  id: string;
  label: string;
  hint?: string;
  /** Einmalig in € */
  preis?: number;
  /** Monatlich in € */
  mtl?: number;
  /** Dreh vor Ort → Festival-Faktor greift */
  dreh?: boolean;
  /** Kleines Label auf der Karte, z. B. "Beliebt" */
  badge?: string;
}

/**
 * Felder & Schritte enthalten nur Logik. Überschriften, Labels, Hinweise und Einheiten
 * kommen aus messages → calculator.steps.<id> / calculator.fields.<id>
 * (`posten` dort = Präfix der Posten-Zeile, z. B. "Video" → "Video · Standard").
 */
interface FieldBase {
  id: string;
  wenn?: (s: CalcState) => boolean;
}
export type Field =
  | (FieldBase & { typ: "radio"; quelle: string; spalten?: 1 | 2 | 3; standard: string })
  | (FieldBase & { typ: "check"; quelle: string; spalten?: 1 | 2 | 3; standard: string[]; min?: number })
  | (FieldBase & { typ: "zahl"; min: number; max: number; standard: number; preisProEinheit: number; dreh?: boolean })
  | (FieldBase & { typ: "schalter" });

export interface Step {
  id: string;
  felder: Field[];
  wenn?: (s: CalcState) => boolean;
  ergebnis?: boolean;
}

/* ─────────────────────────── OPTIONEN ───────────────────────────
 * `label`/`hint`/`badge` hier = deutsche Stammdaten für Supabase-Seed & Dashboard.
 * Die Website zeigt die Texte aus messages → calculator.options (DE + EN);
 * ein im Dashboard geändertes Label überschreibt auf Deutsch weiterhin (lib/pricing-i18n.ts).
 */

export const OPTIONEN: Record<string, Option[]> = {
  branche: [
    { id: "gastro", label: "Gastronomie", hint: "Restaurant, Bar, Café, Catering" },
    { id: "musik", label: "Festival & Musik", hint: "Open Air, Club, Konzert, Artist" },
  ],
  leistungen: [
    { id: "video", label: "Video", hint: "Aftermovie, Imagefilm, Reels" },
    { id: "foto", label: "Foto", hint: "Food, Location, Event, Artist" },
    { id: "web", label: "Web", hint: "Website, Speisekarte, Tickets" },
    { id: "ki", label: "KI-Automatisierung", hint: "Content-Pipelines, Voice, n8n" },
  ],

  /* Video */
  videoUmfang: [
    { id: "kompakt", label: "Kompakt", hint: "Halber Drehtag · 1 Clip (60 s) + 3 Reels", preis: 990, dreh: true },
    { id: "standard", label: "Standard", hint: "1 Drehtag · Film (2–3 Min.) + 6 Reels", preis: 1890, dreh: true, badge: "Beliebt" },
    { id: "premium", label: "Premium", hint: "2 Drehtage · Multi-Cam · Film + 12 Reels", preis: 3690, dreh: true },
  ],
  videoExtras: [
    { id: "drohne", label: "Drohnenaufnahmen", hint: "Luftbilder von Location oder Crowd", preis: 290, dreh: true },
    { id: "zweitkamera", label: "Zweite Kamera + Operator", hint: "Mehr Perspektiven, sichere Momente", preis: 390, dreh: true },
    { id: "gimbal", label: "FPV- & Gimbal-Fahrten", hint: "Dynamische Kamerafahrten durch die Location", preis: 240, dreh: true },
    { id: "grading", label: "Kino-Color-Grading", hint: "Eigener Look statt Standard-LUT", preis: 190 },
  ],

  /* Foto */
  fotoUmfang: [
    { id: "kompakt", label: "Kompakt", hint: "2 Stunden · 25 bearbeitete Fotos", preis: 390, dreh: true },
    { id: "standard", label: "Standard", hint: "Halber Tag · 60 bearbeitete Fotos", preis: 790, dreh: true, badge: "Beliebt" },
    { id: "premium", label: "Premium", hint: "Ganzer Tag · 150 Fotos inkl. Retusche", preis: 1490, dreh: true },
  ],
  fotoExtras: [
    { id: "styling", label: "Food-Styling", hint: "Teller, Props und Licht wie im Magazin", preis: 190, dreh: true },
    { id: "retusche", label: "High-End-Retusche", hint: "Für Karte, Plakate und Großformate", preis: 290 },
    { id: "kivarianten", label: "KI-Bildvarianten", hint: "Hintergründe, Formate, Saison-Versionen", preis: 240 },
  ],

  /* Web – Preise aus der TasWiq-Rechnung übernommen */
  webArt: [
    { id: "speisekarte", label: "Digitale Speisekarte", hint: "Mobile Karte mit QR-Code, jederzeit änderbar", preis: 199 },
    { id: "onepager", label: "One-Pager Website", hint: "Karte oder Line-up, Öffnungszeiten, Anfahrt", preis: 399 },
    { id: "reservierung", label: "Website mit Reservierung", hint: "Mehrseitig · Reservierung/Tickets rund um die Uhr", preis: 699, badge: "Empfehlung" },
    { id: "komplett", label: "Website mit Bestellung", hint: "Reservierung + Online-Bestellung + Dashboard", preis: 999 },
  ],
  webExtras: [
    { id: "mehrsprachig", label: "Zweite Sprache", hint: "z. B. Englisch oder Arabisch", preis: 190 },
    { id: "gmb", label: "Google-Unternehmensprofil", hint: "Einrichtung und Optimierung mit Fotos & Karte", preis: 149 },
    { id: "seo", label: "SEO-Startpaket", hint: "„Restaurant in der Nähe“ – lokal gefunden werden", preis: 290 },
    { id: "geo", label: "GEO für KI-Suchen", hint: "Sichtbar in ChatGPT, Gemini & Google AI", preis: 290 },
  ],

  /* KI */
  kiWorkflows: [
    { id: "captions", label: "Captions & Posting-Plan", hint: "Texte in deinem Ton, von uns redigiert", preis: 490 },
    { id: "voiceover", label: "KI-Voiceover & Übersetzung", hint: "Deine Clips in DE · EN · AR · TR", preis: 590 },
    { id: "varianten", label: "Ad-Varianten-Generator", hint: "Hooks, Längen, Formate für A/B-Tests", preis: 890 },
    { id: "bewertungen", label: "Bewertungs-Antworten", hint: "Google-Reviews automatisch beantworten", preis: 490 },
    { id: "leads", label: "Anfragen-Automatik", hint: "Reservierungen & Anfragen sortieren, weiterleiten", preis: 690 },
    { id: "reporting", label: "Reporting-Dashboard", hint: "Zahlen aus allen Kanälen, einmal pro Woche", preis: 790 },
  ],

  /* Gemeinsam */
  anfahrt: [
    { id: "lokal", label: "Lokal", hint: "bis 50 km – inklusive", preis: 0 },
    { id: "regional", label: "Regional", hint: "bis 200 km", preis: 90 },
    { id: "bundesweit", label: "Deutschlandweit", hint: "inkl. Übernachtung", preis: 290 },
  ],
  contentAbo: [
    { id: "keins", label: "Kein Abo", hint: "Einmaliges Projekt", mtl: 0 },
    { id: "basis", label: "Social Basis", hint: "6 Reels + 10 Fotos pro Monat", mtl: 790 },
    { id: "retainer", label: "Social-Retainer", hint: "12 Reels + 20 Fotos, Planung & Posting", mtl: 1490, badge: "Gastro-Favorit" },
  ],
  hosting: [
    { id: "eigen", label: "Bleibt bei meinem Anbieter", mtl: 0 },
    { id: "wartung", label: "Hosting & Wartung", hint: "Domain, SSL, Backups, kleine Änderungen", mtl: 19 },
  ],
  kiBetrieb: [
    { id: "keiner", label: "Ohne Betreuung", hint: "Du betreibst die Workflows selbst", mtl: 0 },
    { id: "basis", label: "Betrieb Basis", hint: "Monitoring, Updates, Fehlerbehebung", mtl: 49 },
    { id: "aktiv", label: "Betrieb Aktiv", hint: "Zusätzlich Weiterentwicklung jeden Monat", mtl: 129 },
  ],
};

/* ─────────────────────────── SCHRITTE ─────────────────────────── */

const hat = (s: CalcState, id: string) => Array.isArray(s.leistungen) && s.leistungen.includes(id);

export const SCHRITTE: Step[] = [
  {
    id: "start",
    felder: [
      { id: "branche", typ: "radio", quelle: "branche", spalten: 2, standard: "gastro" },
      { id: "leistungen", typ: "check", quelle: "leistungen", spalten: 2, standard: ["video"], min: 1 },
    ],
  },
  {
    id: "video",
    wenn: (s) => hat(s, "video"),
    felder: [
      { id: "videoUmfang", typ: "radio", quelle: "videoUmfang", spalten: 1, standard: "standard" },
      { id: "videoExtras", typ: "check", quelle: "videoExtras", spalten: 2, standard: [] },
      { id: "extraReels", typ: "zahl", min: 0, max: 30, standard: 0, preisProEinheit: 45 },
    ],
  },
  {
    id: "foto",
    wenn: (s) => hat(s, "foto"),
    felder: [
      { id: "fotoUmfang", typ: "radio", quelle: "fotoUmfang", spalten: 1, standard: "standard" },
      { id: "fotoExtras", typ: "check", quelle: "fotoExtras", spalten: 2, standard: [] },
    ],
  },
  {
    id: "web",
    wenn: (s) => hat(s, "web"),
    felder: [
      { id: "webArt", typ: "radio", quelle: "webArt", spalten: 2, standard: "reservierung" },
      { id: "webExtras", typ: "check", quelle: "webExtras", spalten: 2, standard: [] },
    ],
  },
  {
    id: "ki",
    wenn: (s) => hat(s, "ki"),
    felder: [{ id: "kiWorkflows", typ: "check", quelle: "kiWorkflows", spalten: 2, standard: ["captions"], min: 1 }],
  },
  {
    id: "extras",
    felder: [
      { id: "sprachen", typ: "zahl", min: 0, max: 4, standard: 0, preisProEinheit: 190, wenn: (s) => hat(s, "video") || hat(s, "ki") },
      { id: "anfahrt", typ: "radio", quelle: "anfahrt", spalten: 3, standard: "lokal", wenn: (s) => hat(s, "video") || hat(s, "foto") },
      { id: "express", typ: "schalter" },
    ],
  },
  {
    id: "laufend",
    felder: [
      { id: "contentAbo", typ: "radio", quelle: "contentAbo", spalten: 3, standard: "keins" },
      { id: "hosting", typ: "radio", quelle: "hosting", spalten: 2, standard: "wartung", wenn: (s) => hat(s, "web") },
      { id: "kiBetrieb", typ: "radio", quelle: "kiBetrieb", spalten: 3, standard: "basis", wenn: (s) => hat(s, "ki") },
    ],
  },
  { id: "ende", felder: [], ergebnis: true },
];
