/**
 * Suchbegriffe, die TasWiq besetzen will – je Begriff genau eine Zielseite (deutsche Website).
 * Quelle und Begründung: team/seo-plan.md („Zielseiten“ und „Lücken“). Beide Stellen gemeinsam pflegen:
 * Neuer Ratgeber → `target` eintragen; neue Lücke gefunden → Begriff mit `target: null` ergänzen.
 *
 * Das Dashboard (Seitenstruktur → Suchbegriffe) prüft daraus, ob der Begriff auf der Zielseite in Titel oder Überschrift steht.
 * Positionen bei Google kommen erst mit der Search Console dazu.
 */

export type KeywordArea = "gastro" | "beauty" | "immobilien" | "automotive" | "kanzlei" | "handwerk" | "software" | "ki" | "website" | "media";

export const keywordAreas: { id: KeywordArea; label: string }[] = [
  { id: "gastro", label: "Gastronomie" },
  { id: "beauty", label: "Beauty & Gesundheit" },
  { id: "immobilien", label: "Immobilien" },
  { id: "automotive", label: "Autohaus & Werkstatt" },
  { id: "kanzlei", label: "Kanzlei" },
  { id: "handwerk", label: "Handwerk" },
  { id: "software", label: "Software allgemein" },
  { id: "ki", label: "KI" },
  { id: "website", label: "Website" },
  { id: "media", label: "Media" },
];

export interface KeywordTarget {
  term: string;
  area: KeywordArea;
  /** Zielseite (deutscher Pfad) – null = noch keine Seite, Lücke */
  target: string | null;
  /** Haupt-Suchwort einer Leistungs- oder Branchenseite */
  main?: boolean;
}

const L = "/leistungen/";
const B = "/blog/";

export const keywords: KeywordTarget[] = [
  // Gastronomie
  { term: "Software Gastronomie", area: "gastro", target: `${L}software-gastronomie`, main: true },
  { term: "Bestellsystem Restaurant", area: "gastro", target: `${L}software-gastronomie` },
  { term: "Bestellsystem ohne Provision", area: "gastro", target: `${L}bestellsystem-ohne-provision`, main: true },
  { term: "Online-Bestellsystem Gastronomie", area: "gastro", target: `${L}bestellsystem-ohne-provision` },
  { term: "Lieferando Alternative", area: "gastro", target: `${B}eigenes-bestellsystem-statt-lieferando` },
  { term: "Bestellsystem Bäckerei", area: "gastro", target: `${B}bestellsystem-baeckerei` },
  { term: "QR-Code Bestellsystem", area: "gastro", target: `${B}qr-code-bestellsystem` },
  { term: "Tischreservierungssystem", area: "gastro", target: `${B}tischreservierungssystem` },
  // Beauty & Gesundheit
  { term: "Buchungssystem Friseur", area: "beauty", target: `${L}buchungssystem-friseur-beauty`, main: true },
  { term: "Online-Terminbuchung Friseur", area: "beauty", target: `${L}buchungssystem-friseur-beauty` },
  { term: "Online-Buchungssystem", area: "beauty", target: `${L}online-buchungssystem`, main: true },
  { term: "Treatwell Alternative", area: "beauty", target: `${B}treatwell-alternative` },
  { term: "Buchungssystem Physiotherapie", area: "beauty", target: `${B}buchungssystem-physiotherapie` },
  { term: "Online-Buchungssystem für Kurse", area: "beauty", target: `${B}online-buchungssystem-fuer-kurse` },
  { term: "Online-Buchungssystem kostenlos", area: "beauty", target: null },
  // Immobilien
  { term: "Software Makler", area: "immobilien", target: `${L}software-immobilien`, main: true },
  { term: "Software Hausverwaltung", area: "immobilien", target: `${L}software-immobilien` },
  { term: "Mieterportal", area: "immobilien", target: `${B}mieterportal` },
  { term: "Software Hausverwaltung für private Vermieter", area: "immobilien", target: null },
  { term: "Maklersoftware Vergleich", area: "immobilien", target: null },
  // Autohaus & Werkstatt
  { term: "Autohaus Software", area: "automotive", target: `${L}software-autohaus-fahrschule`, main: true },
  { term: "Fahrschule Software", area: "automotive", target: `${L}software-autohaus-fahrschule` },
  { term: "Werkstatt Termin online buchen", area: "automotive", target: `${B}werkstatt-termin-online-buchen` },
  { term: "Fahrschul-App Kosten", area: "automotive", target: null },
  { term: "Autohaus Software Vergleich", area: "automotive", target: null },
  // Kanzlei
  { term: "Mandantenportal Steuerberater", area: "kanzlei", target: `${L}software-steuerberater-kanzlei`, main: true },
  { term: "Software Steuerberater", area: "kanzlei", target: `${L}software-steuerberater-kanzlei` },
  // Handwerk
  { term: "Handwerkersoftware", area: "handwerk", target: `${L}software-handwerk-dienstleister`, main: true },
  { term: "Handwerkersoftware für Kleinbetriebe", area: "handwerk", target: `${B}handwerkersoftware-kleinbetriebe` },
  { term: "Digitalisierung Handwerk Förderung", area: "handwerk", target: `${B}digitalisierung-handwerk-foerderung` },
  { term: "KI Telefonassistent Handwerk", area: "handwerk", target: null },
  // Software allgemein
  { term: "Individualsoftware", area: "software", target: `${L}individualsoftware-mittelstand`, main: true },
  { term: "Individualsoftware vs Standardsoftware", area: "software", target: `${B}individualsoftware-vs-standardsoftware` },
  { term: "Software entwickeln lassen Kosten", area: "software", target: `${B}software-entwickeln-lassen-kosten` },
  { term: "Web-App entwickeln lassen", area: "software", target: `${L}web-app-entwicklung`, main: true },
  { term: "Kundenportal erstellen lassen", area: "software", target: `${B}kundenportal-erstellen-lassen` },
  { term: "Dashboard erstellen lassen", area: "software", target: `${L}dashboard-entwicklung`, main: true },
  { term: "KI Software entwickeln lassen", area: "software", target: null },
  // KI
  { term: "KI-Automatisierung Unternehmen", area: "ki", target: `${L}ki-automatisierung-unternehmen`, main: true },
  { term: "KI Telefonassistent Kosten", area: "ki", target: `${B}ki-telefonassistent-kosten` },
  { term: "KI-Automatisierung für kleine Unternehmen", area: "ki", target: null },
  // Website
  { term: "Website erstellen lassen", area: "website", target: `${L}website-erstellen-lassen`, main: true },
  { term: "Website erstellen lassen monatliche Kosten", area: "website", target: `${B}website-erstellen-lassen-monatliche-kosten` },
  { term: "Was kostet eine Website", area: "website", target: `${B}was-kostet-eine-website` },
  // Media
  { term: "Aftermovie Festival", area: "media", target: `${L}premium-eventvideo-festival`, main: true },
];
