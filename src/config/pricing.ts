import type { FunnelIndustry, InterestId } from "@/config/funnel";

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
 *  Fokus seit 2026-09: Software & Systeme (Website, Bestell-/Buchungssystem,
 *  Portal, Dashboard, Individualsoftware, App, KI). Media nur noch als
 *  Premium-Paket für Events, Artists und Marken.
 *
 *  Beträge in Euro, Endpreise (Kleinunternehmer, § 19 UStG).
 *  Preise ohne Deploy ändern: Tabelle `services` im Backend – deren Werte
 *  überschreiben diese Datei zur Laufzeit (siehe lib/pricing-source.ts).
 *  Nach Änderungen `version` hochzählen – sie wird mit jeder Kalkulation gespeichert.
 */

export const KONFIG = {
  version: "2026-09-software",
  /** Richtwert-Spanne um die Summe: −10 % / +18 % */
  spanneUnten: 0.1,
  spanneOben: 0.18,
  rundenAuf: 50,
  expressAufschlag: 0.25,
  /** Festival-, Club- und Nachtdrehs: mehr Crew, spätere Zeiten (nur Media) */
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
 * (`posten` dort = Präfix der Posten-Zeile, z. B. "Website" → "Website · Business").
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
 * `label`/`hint`/`badge` hier = deutsche Stammdaten für den Backend-Seed & Dashboard.
 * Die Website zeigt die Texte aus messages → calculator.options (DE + EN);
 * ein im Dashboard geändertes Label überschreibt auf Deutsch weiterhin (lib/pricing-i18n.ts).
 */

export const OPTIONEN: Record<string, Option[]> = {
  branche: [
    { id: "gastro", label: "Gastronomie & Food", hint: "Restaurant, Lieferdienst, Bäckerei, Café" },
    { id: "immobilien", label: "Immobilien & Verwaltung", hint: "Makler, Hausverwaltung, Bauträger" },
    { id: "automotive", label: "Automotive & Mobilität", hint: "Autohaus, Werkstatt, Fahrschule, Vermietung" },
    { id: "kanzlei", label: "Kanzleien & Beratung", hint: "Steuerberater, Anwälte, Makler, Coaches" },
    { id: "beauty", label: "Beauty, Gesundheit & Wellness", hint: "Friseur, Barber, Kosmetik, Physio, Studio" },
    { id: "handwerk", label: "Handwerk & Dienstleistungen", hint: "Handwerk, Reinigung, Umzug, Services" },
    { id: "musik", label: "Events, Festivals & Artists", hint: "Veranstalter, Clubs, Labels, Artists" },
    { id: "andere", label: "Andere Branche", hint: "Handel, Bildung, Vereine, Verbände" },
  ],
  leistungen: [
    { id: "bestellung", label: "Bestellsystem", hint: "Online-Bestellung ohne Provision" },
    { id: "buchung", label: "Buchungssystem", hint: "Termine, Reservierungen, Kurse" },
    { id: "website", label: "Website", hint: "Neu oder Relaunch, SEO & KI-Suche" },
    { id: "portal", label: "Web-App & Kundenportal", hint: "Login, Dokumente, Status, Self-Service" },
    { id: "dashboard", label: "Dashboard & Reporting", hint: "Alle Zahlen an einem Ort" },
    { id: "software", label: "Individuelle Software", hint: "Deine Prozesse als eigenes System" },
    { id: "app", label: "Mobile App", hint: "iOS & Android" },
    { id: "ki", label: "KI-Automatisierung", hint: "Workflows, Agenten, Dokumente" },
    { id: "media", label: "Premium-Media", hint: "Event-, Artist- oder Brand-Film" },
  ],

  /* Website */
  websiteUmfang: [
    { id: "onepager", label: "One-Pager", hint: "Eine starke Seite mit Kontakt, Karte & WhatsApp", preis: 1490 },
    { id: "business", label: "Business-Website", hint: "Bis 8 Seiten · CMS · Anfrage-Funnel · SEO-Basis", preis: 2490, badge: "Beliebt" },
    { id: "pro", label: "Website Pro", hint: "Mehrsprachig · Blog · Landingpages · Tracking", preis: 4490 },
  ],
  websiteExtras: [
    { id: "seo", label: "Lokales SEO-Paket", hint: "Gefunden werden bei „… in der Nähe“", preis: 490 },
    { id: "geo", label: "GEO für KI-Suchen", hint: "Sichtbar in ChatGPT, Gemini & Google AI", preis: 390 },
    { id: "gmb", label: "Google-Unternehmensprofil", hint: "Einrichtung und Optimierung", preis: 190 },
    { id: "texte", label: "Texte & Bildaufbereitung", hint: "Wir schreiben, du gibst frei", preis: 490 },
  ],

  /* Bestell- & Buchungssysteme */
  bestellUmfang: [
    { id: "start", label: "Bestellsystem Start", hint: "Speisekarte · Warenkorb · Abholung & Lieferung · Bestell-Dashboard", preis: 3900 },
    { id: "pro", label: "Bestellsystem Pro", hint: "+ Online-Zahlung · Küchen-Display · Liefergebiete · Gutscheine", preis: 6900, badge: "Empfehlung" },
    { id: "filialen", label: "Mehrere Standorte", hint: "Filialen · Rollen · zentrales Reporting", preis: 10900 },
  ],
  buchungUmfang: [
    { id: "start", label: "Buchung Start", hint: "Leistungen · Kalender · Bestätigung per Mail & WhatsApp", preis: 2900 },
    { id: "pro", label: "Buchung Pro", hint: "+ Kundenkonto · Anzahlung · Erinnerungen · Warteliste", preis: 5400, badge: "Beliebt" },
    { id: "team", label: "Team & Standorte", hint: "Mehrere Mitarbeiter, Räume oder Filialen · Schichtplan", preis: 8900 },
  ],

  /* Web-App, Dashboard, Individualsoftware, App */
  portalUmfang: [
    { id: "basis", label: "Kundenportal", hint: "Login · Dokumente · Status · Nachrichten", preis: 9900 },
    { id: "erweitert", label: "Portal mit Workflows", hint: "+ Rollen · Formulare · Freigaben · Automationen", preis: 16900, badge: "Beliebt" },
  ],
  dashboardUmfang: [
    { id: "basis", label: "Dashboard", hint: "Kennzahlen aus 2–3 Quellen, täglich aktuell", preis: 6900 },
    { id: "pro", label: "Dashboard Pro", hint: "Echtzeit · Rollen · Alarme · Prognosen", preis: 11900 },
  ],
  softwareUmfang: [
    { id: "s", label: "Ein Kernprozess", hint: "z. B. Auftrag → Einsatz → Rechnung als eigenes System", preis: 14900 },
    { id: "m", label: "Mehrere Prozesse", hint: "Rollen & Rechte · Schnittstellen · Admin-Bereich", preis: 24900, badge: "Beliebt" },
    { id: "l", label: "Plattform", hint: "Mehrere Abteilungen oder Standorte, individuelle Module", preis: 39900 },
  ],
  appUmfang: [
    { id: "pwa", label: "Web-App für den Homescreen", hint: "iOS & Android ohne App Store · Push", preis: 4900, badge: "Günstig" },
    { id: "native", label: "Native App", hint: "App Store & Google Play · Offline · Push", preis: 12900 },
  ],
  funktionen: [
    { id: "zahlung", label: "Online-Zahlung", hint: "Stripe, PayPal, Apple Pay, Google Pay", preis: 890 },
    { id: "schnittstellen", label: "Schnittstellen", hint: "Kasse, DATEV, CRM, ERP oder Warenwirtschaft", preis: 1490 },
    { id: "ki", label: "KI-Funktion", hint: "Chat, Dokumente auslesen, Texte vorschlagen", preis: 1490 },
    { id: "whatsapp", label: "WhatsApp-Benachrichtigungen", hint: "Bestätigungen und Status automatisch", preis: 590 },
    { id: "mehrsprachig", label: "Mehrsprachig", hint: "z. B. Deutsch, Englisch, Arabisch, Türkisch", preis: 690 },
    { id: "migration", label: "Datenübernahme", hint: "Aus Excel, Papierlisten oder dem Altsystem", preis: 990 },
  ],

  /* KI */
  kiWorkflows: [
    { id: "anfragen", label: "Anfragen-Automatik", hint: "Mails & Formulare sortieren, beantworten, weiterleiten", preis: 990 },
    { id: "dokumente", label: "Dokumente & Belege", hint: "Automatisch auslesen, ablegen, prüfen", preis: 1290 },
    { id: "telefon", label: "KI-Telefonassistent", hint: "Nimmt Anrufe an, bucht Termine, fasst zusammen", preis: 1490 },
    { id: "chatbot", label: "Website-Chat", hint: "Beantwortet Fragen mit deinem Wissen, rund um die Uhr", preis: 1190 },
    { id: "bewertungen", label: "Bewertungs-Antworten", hint: "Google-Reviews im Ton des Hauses", preis: 590 },
    { id: "reporting", label: "Wochen-Report", hint: "Zahlen aus allen Tools, einmal pro Woche", preis: 890 },
  ],

  /* Premium-Media */
  mediaPaket: [
    { id: "brand", label: "Brand- & Hospitality-Film", hint: "1 Drehtag · Imagefilm + 6 Reels · Kino-Grading", preis: 2990, dreh: true },
    { id: "artist", label: "Artist-Kampagne", hint: "Musikvideo oder Visualizer · Press-Kit · 8 Reels", preis: 3490, dreh: true },
    { id: "festival", label: "Festival & Event Premium", hint: "Multi-Cam-Crew · Aftermovie in 7 Tagen · 20+ Ad-Varianten", preis: 4900, dreh: true, badge: "Premium" },
  ],
  mediaExtras: [
    { id: "drohne", label: "Drohnenaufnahmen", hint: "Luftbilder von Location oder Crowd", preis: 290, dreh: true },
    { id: "zweitkamera", label: "Zweite Kamera + Operator", hint: "Mehr Perspektiven, sichere Momente", preis: 390, dreh: true },
    { id: "varianten", label: "KI-Sprachfassungen", hint: "Voiceover & Untertitel in DE · EN · AR · TR", preis: 490 },
  ],
  anfahrt: [
    { id: "lokal", label: "Lokal", hint: "bis 50 km – inklusive", preis: 0 },
    { id: "regional", label: "Regional", hint: "bis 200 km", preis: 90 },
    { id: "bundesweit", label: "Deutschlandweit", hint: "inkl. Übernachtung", preis: 290 },
  ],

  /* Laufend */
  betrieb: [
    { id: "selbst", label: "Selbst betreiben", hint: "Du bekommst Code & Zugänge, Hosting übernimmst du", mtl: 0 },
    { id: "wartung", label: "Hosting & Wartung", hint: "Server, SSL, Backups, Sicherheitsupdates", mtl: 49 },
    { id: "betrieb", label: "Betrieb & Support", hint: "+ Monitoring, Support, kleine Änderungen", mtl: 149, badge: "Empfehlung" },
    { id: "wachstum", label: "Weiterentwicklung", hint: "+ jeden Monat neue Funktionen (ca. 1 Tag)", mtl: 490 },
  ],
};

/* ─────────────────────────── SCHRITTE ─────────────────────────── */

const hat = (s: CalcState, ...ids: string[]) => Array.isArray(s.leistungen) && ids.some((id) => (s.leistungen as string[]).includes(id));
const SOFTWARE = ["bestellung", "buchung", "portal", "dashboard", "software", "app"];

export const SCHRITTE: Step[] = [
  {
    id: "start",
    felder: [
      { id: "branche", typ: "radio", quelle: "branche", spalten: 2, standard: "gastro" },
      { id: "leistungen", typ: "check", quelle: "leistungen", spalten: 3, standard: ["bestellung"], min: 1 },
    ],
  },
  {
    id: "website",
    wenn: (s) => hat(s, "website"),
    felder: [
      { id: "websiteUmfang", typ: "radio", quelle: "websiteUmfang", spalten: 1, standard: "business" },
      { id: "websiteExtras", typ: "check", quelle: "websiteExtras", spalten: 2, standard: [] },
    ],
  },
  {
    id: "system",
    wenn: (s) => hat(s, "bestellung", "buchung"),
    felder: [
      { id: "bestellUmfang", typ: "radio", quelle: "bestellUmfang", spalten: 1, standard: "pro", wenn: (s) => hat(s, "bestellung") },
      { id: "buchungUmfang", typ: "radio", quelle: "buchungUmfang", spalten: 1, standard: "pro", wenn: (s) => hat(s, "buchung") },
    ],
  },
  {
    id: "software",
    wenn: (s) => hat(s, "portal", "dashboard", "software", "app"),
    felder: [
      { id: "portalUmfang", typ: "radio", quelle: "portalUmfang", spalten: 2, standard: "basis", wenn: (s) => hat(s, "portal") },
      { id: "dashboardUmfang", typ: "radio", quelle: "dashboardUmfang", spalten: 2, standard: "basis", wenn: (s) => hat(s, "dashboard") },
      { id: "softwareUmfang", typ: "radio", quelle: "softwareUmfang", spalten: 1, standard: "m", wenn: (s) => hat(s, "software") },
      { id: "appUmfang", typ: "radio", quelle: "appUmfang", spalten: 2, standard: "pwa", wenn: (s) => hat(s, "app") },
    ],
  },
  {
    id: "funktionen",
    wenn: (s) => hat(s, ...SOFTWARE),
    felder: [{ id: "funktionen", typ: "check", quelle: "funktionen", spalten: 2, standard: [] }],
  },
  {
    id: "ki",
    wenn: (s) => hat(s, "ki"),
    felder: [{ id: "kiWorkflows", typ: "check", quelle: "kiWorkflows", spalten: 2, standard: ["anfragen"], min: 1 }],
  },
  {
    id: "media",
    wenn: (s) => hat(s, "media"),
    felder: [
      { id: "mediaPaket", typ: "radio", quelle: "mediaPaket", spalten: 1, standard: "festival" },
      { id: "mediaExtras", typ: "check", quelle: "mediaExtras", spalten: 3, standard: [] },
      { id: "anfahrt", typ: "radio", quelle: "anfahrt", spalten: 3, standard: "lokal" },
    ],
  },
  {
    id: "extras",
    felder: [{ id: "express", typ: "schalter" }],
  },
  {
    id: "laufend",
    wenn: (s) => hat(s, "website", "ki", ...SOFTWARE),
    felder: [{ id: "betrieb", typ: "radio", quelle: "betrieb", spalten: 2, standard: "betrieb" }],
  },
  { id: "ende", felder: [], ergebnis: true },
];

/** Hauptoption je Leistung – für den "ab"-Preis in Schritt 1 */
export const LEISTUNG_QUELLE: Record<string, { quelle: string; dreh?: boolean }> = {
  website: { quelle: "websiteUmfang" },
  bestellung: { quelle: "bestellUmfang" },
  buchung: { quelle: "buchungUmfang" },
  portal: { quelle: "portalUmfang" },
  dashboard: { quelle: "dashboardUmfang" },
  software: { quelle: "softwareUmfang" },
  app: { quelle: "appUmfang" },
  ki: { quelle: "kiWorkflows" },
  media: { quelle: "mediaPaket", dreh: true },
};

/** Rechner-Leistung → Funnel-Interesse (Lead-Payload & Scoring) */
export const LEISTUNG_INTEREST: Record<string, InterestId> = {
  website: "web",
  bestellung: "bestellsystem",
  buchung: "buchungssystem",
  portal: "webapp",
  dashboard: "dashboard",
  software: "software",
  app: "app",
  ki: "automation",
  media: "media",
};

export const isIndustry = (v: unknown): v is FunnelIndustry => typeof v === "string" && OPTIONEN.branche.some((o) => o.id === v);
