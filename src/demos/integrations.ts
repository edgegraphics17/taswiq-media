import type { DemoSlug } from "@/demos/registry";

/**
 * Anbindungen: Tools, die Betriebe schon im Einsatz haben und die sich über die Schnittstelle des Anbieters
 * an ein System von uns anschließen lassen (Kasse, Kalender, Zahlung, Buchhaltung, Portale).
 * Das ist eine Auswahl, kein Partnerverzeichnis – deshalb überall die Formulierung „lässt sich anbinden“.
 *
 * Logos: Originale in Originalfarben als Datei in public/logos/tools/<id>.svg
 * (gilbarbara/logos, CC0 · Wikimedia Commons · Website des Anbieters) – nichts nachgebaut oder umgefärbt.
 * h = Höhe in der kleinen Marke (px), ratio = Breite/Höhe; label = Name steht daneben, weil das Logo nur ein Zeichen ist.
 */
export const toolLogos = {
  datev: { name: "DATEV", ratio: 61 / 60, h: 26, label: true },
  lexware: { name: "Lexware", ratio: 353 / 60, h: 15 },
  sevdesk: { name: "sevdesk", ratio: 207 / 60, h: 18 },
  elster: { name: "ELSTER", ratio: 184 / 60, h: 16 },
  sumup: { name: "SumUp", ratio: 204 / 60, h: 20 },
  paypal: { name: "PayPal", ratio: 51 / 60, h: 22, label: true },
  stripe: { name: "Stripe", ratio: 144 / 60, h: 18 },
  klarna: { name: "Klarna", ratio: 269 / 60, h: 14 },
  applepay: { name: "Apple Pay", ratio: 146 / 60, h: 17 },
  epson: { name: "Epson", ratio: 267 / 60, h: 13 },
  googlecalendar: { name: "Google Kalender", ratio: 56 / 60, h: 22, label: true },
  microsoftoutlook: { name: "Outlook", ratio: 64 / 60, h: 22, label: true },
  apple: { name: "Apple Kalender", ratio: 49 / 60, h: 20, label: true },
  google: { name: "Google", ratio: 59 / 60, h: 20, label: true },
  googlemaps: { name: "Google Maps", ratio: 42 / 60, h: 22, label: true },
  gmail: { name: "Gmail", ratio: 76 / 60, h: 17, label: true },
  googledrive: { name: "Google Drive", ratio: 65 / 60, h: 20, label: true },
  googlesheets: { name: "Google Sheets", ratio: 44 / 60, h: 22, label: true },
  microsoft: { name: "Microsoft 365", ratio: 60 / 60, h: 18, label: true },
  microsoftteams: { name: "Microsoft Teams", ratio: 65 / 60, h: 22, label: true },
  dropbox: { name: "Dropbox", ratio: 71 / 60, h: 20, label: true },
  nextcloud: { name: "Nextcloud", ratio: 86 / 60, h: 15, label: true },
  whatsapp: { name: "WhatsApp", ratio: 60 / 60, h: 24, label: true },
  instagram: { name: "Instagram", ratio: 61 / 60, h: 22, label: true },
  slack: { name: "Slack", ratio: 60 / 60, h: 20, label: true },
  sipgate: { name: "sipgate", ratio: 200 / 60, h: 18 },
  immoscout24: { name: "ImmoScout24", ratio: 100 / 60, h: 24 },
  immowelt: { name: "Immowelt", ratio: 261 / 60, h: 18 },
  kleinanzeigen: { name: "Kleinanzeigen", ratio: 360 / 60, h: 17 },
  propstack: { name: "Propstack", ratio: 368 / 60, h: 15 },
  docusign: { name: "Docusign", ratio: 299 / 60, h: 17 },
  mobilede: { name: "mobile.de", ratio: 285 / 60, h: 20 },
  autoscout24: { name: "AutoScout24", ratio: 95 / 60, h: 24 },
  dat: { name: "DAT", ratio: 39 / 60, h: 24, label: true },
  tecdoc: { name: "TecDoc", ratio: 60 / 60, h: 24, label: true },
  claude: { name: "Claude", ratio: 60 / 60, h: 20, label: true },
  openai: { name: "OpenAI", ratio: 60 / 60, h: 22, label: true },
  googlegemini: { name: "Gemini", ratio: 164 / 60, h: 20 },
  n8n: { name: "n8n", ratio: 114 / 60, h: 14, label: true },
  zapier: { name: "Zapier", ratio: 60 / 60, h: 20, label: true },
  notion: { name: "Notion", ratio: 58 / 60, h: 22, label: true },
  airtable: { name: "Airtable", ratio: 72 / 60, h: 19, label: true },
  shopify: { name: "Shopify", ratio: 53 / 60, h: 23, label: true },
  woocommerce: { name: "WooCommerce", ratio: 101 / 60, h: 17 },
  hubspot: { name: "HubSpot", ratio: 207 / 60, h: 19 },
  salesforce: { name: "Salesforce", ratio: 86 / 60, h: 24 },
  mailchimp: { name: "Mailchimp", ratio: 53 / 60, h: 24, label: true },
  personio: { name: "Personio", ratio: 191 / 60, h: 18 },
  dhl: { name: "DHL", ratio: 272 / 60, h: 13 },
  trustpilot: { name: "Trustpilot", ratio: 245 / 60, h: 18 },
} satisfies Record<string, { name: string; ratio: number; h: number; label?: boolean }>;

export type Integration = keyof typeof toolLogos;

/** Zwei gegenläufige Bänder auf der Demo-Übersicht */
export const integrationRows: Integration[][] = [
  ["datev", "googlecalendar", "immoscout24", "whatsapp", "stripe", "lexware", "paypal", "microsoftoutlook", "sumup", "mobilede", "klarna", "googlemaps", "sevdesk", "instagram", "slack", "shopify", "elster", "hubspot", "applepay", "kleinanzeigen", "trustpilot", "epson", "gmail", "tecdoc", "airtable"],
  ["claude", "openai", "googlegemini", "sipgate", "n8n", "zapier", "microsoftteams", "immowelt", "notion", "salesforce", "autoscout24", "googledrive", "docusign", "googlesheets", "dropbox", "propstack", "personio", "dhl", "microsoft", "woocommerce", "nextcloud", "mailchimp", "dat", "google"],
];

/**
 * Was eine Anbindung typischerweise bringt – erscheint als Hinweis, wenn man in einer Demo-Fläche über ein Logo fährt.
 * data = was zwischen den Systemen fließt, use = was der Betrieb davon hat.
 */
export const integrationInfo: Partial<Record<Integration, { data: string; use: string }>> = {
  sumup: { data: "Kartenzahlungen, Trinkgeld, Tagesumsatz", use: "Zahlungen aus System und Kartenterminal stehen in einer Abrechnung – der Tagesabschluss stimmt ohne Nachtragen." },
  paypal: { data: "Zahlungseingänge, Erstattungen, Gebühren", use: "Kunden zahlen gleich beim Bestellen oder Buchen, jede Zahlung hängt automatisch am richtigen Vorgang." },
  applepay: { data: "Zahlung per Face ID oder Fingerabdruck", use: "Bezahlen, ohne eine Karte abzutippen – weniger Abbrüche an der Kasse, vor allem am Handy." },
  epson: { data: "Bestellungen als Bon für Küche und Theke", use: "Jede Online-Bestellung druckt sich selbst aus, niemand muss dafür aufs Tablet schauen." },
  lexware: { data: "Rechnungen, Zahlungen, Kundendaten", use: "Rechnungen entstehen aus dem Vorgang und liegen fertig in der Buchhaltung – nichts wird doppelt erfasst." },
  sevdesk: { data: "Rechnungen, Belege, offene Posten", use: "Belege und Rechnungen landen vorsortiert in der Buchhaltung, offene Posten siehst du im System." },
  datev: { data: "Rechnungen, Belege, Buchungssätze", use: "Das Steuerbüro bekommt alles fertig vorbereitet – kein Pendelordner, keine Excel-Liste." },
  elster: { data: "Voranmeldungen, Erklärungen, Übermittlungsprotokoll", use: "Freigegebene Erklärungen gehen direkt ans Finanzamt, der Stand steht am Mandat." },
  googlemaps: { data: "Adressen, Entfernungen, Fahrzeiten", use: "Liefergebiete und Anfahrten rechnet das System selbst, Kunden finden mit einem Tipp zu dir." },
  googlecalendar: { data: "Termine, freie Zeiten, Abwesenheiten", use: "Gebuchte Termine stehen sofort im Kalender des Teams, private Einträge sperren die Zeit von allein." },
  microsoftoutlook: { data: "Termine, Einladungen, E-Mails", use: "Termine landen im Outlook-Kalender, Bestätigungen gehen von deiner eigenen Adresse raus." },
  microsoft: { data: "Kalender, E-Mail, Dateien in OneDrive und SharePoint", use: "Dokumente liegen dort, wo das Büro ohnehin arbeitet – Anmeldung mit dem Firmenkonto." },
  dropbox: { data: "Dokumente, Ordner, Freigaben", use: "Hochgeladene Unterlagen liegen automatisch im richtigen Ordner des Mandanten." },
  instagram: { data: "Buchen-Button, Profilaufrufe, Anfragen", use: "Aus dem Profil direkt zum freien Termin – ohne Umweg über Nachrichten." },
  google: { data: "Buchen-Button in Suche und Maps, Bewertungen", use: "Wer dich googelt, bucht mit zwei Tipps; nach dem Termin geht die Bitte um eine Bewertung raus." },
  klarna: { data: "Kauf auf Rechnung oder in Raten", use: "Größere Beträge und Pakete verkaufen sich leichter, du bekommst dein Geld trotzdem sofort." },
  whatsapp: { data: "Bestätigungen, Erinnerungen, Status-Meldungen", use: "Kunden bekommen die Nachricht dort, wo sie sie lesen – weniger Rückrufe, weniger verpasste Termine." },
  sipgate: { data: "Anrufe, Rufnummern, Sprachnachrichten", use: "Verpasste Anrufe werden zur Anfrage im System – mit Nummer, Uhrzeit und Anliegen." },
  immoscout24: { data: "Objektdaten, Bilder, Anfragen aus dem Portal", use: "Einmal pflegen, überall aktuell – und jede Portal-Anfrage landet direkt in deiner Pipeline." },
  immowelt: { data: "Inserate, Objektstatus, Interessenten-Anfragen", use: "Reserviert oder vermietet? Der Status zieht im Portal nach, Anfragen kommen sortiert an." },
  kleinanzeigen: { data: "Inserate und Anfragen", use: "Anfragen aus Kleinanzeigen laufen mit denselben Vorab-Fragen ein wie alle anderen." },
  propstack: { data: "Objekte, Kontakte, Aktivitäten", use: "Deine Maklersoftware bleibt das führende System, Website und Portal lesen und schreiben mit." },
  docusign: { data: "Unterschriften mit Zeitstempel, Stand je Dokument", use: "Reservierung, Auftrag oder Vertrag digital unterschreiben – ohne Drucken und Scannen." },
  mobilede: { data: "Fahrzeugbestand, Preise, Anfragen", use: "Dein Bestand erscheint automatisch auf der eigenen Seite, Probefahrt-Anfragen laufen ins System." },
  autoscout24: { data: "Inserate, Fahrzeugdaten, Interessenten", use: "Fahrzeug einmal anlegen, überall inseriert – und verkauft heißt überall verkauft." },
  dat: { data: "Fahrzeugdaten per Fahrgestellnummer, Arbeitswerte, Restwerte", use: "Kalkulation und Richtpreis stehen schon bei der Terminbuchung." },
  tecdoc: { data: "Ersatzteile passend zum Fahrzeug, Artikelnummern", use: "Das richtige Teil ist vor dem Termin bestellt, die Bühne steht nicht." },
};

/** Je Demo: was in der Branche üblich ist und wofür es gebraucht wird (steht als Hinweis über den Logos) */
export const demoIntegrations: Record<DemoSlug, { note: string; items: Integration[] }> = {
  restaurant: { note: "Kasse, Zahlung, Bon-Drucker", items: ["sumup", "paypal", "applepay", "epson", "lexware", "googlemaps"] },
  friseur: { note: "Kalender, Buchen-Button, Zahlung", items: ["googlecalendar", "microsoftoutlook", "instagram", "google", "sumup", "klarna"] },
  immobilien: { note: "Portale, Maklersoftware, Unterschrift", items: ["immoscout24", "immowelt", "kleinanzeigen", "propstack", "docusign", "googlecalendar"] },
  werkstatt: { note: "Börsen, Fahrzeugdaten, Buchhaltung", items: ["mobilede", "autoscout24", "dat", "tecdoc", "datev", "whatsapp"] },
  steuerkanzlei: { note: "Kanzleiprogramm, Buchhaltung, Ablage", items: ["datev", "elster", "lexware", "sevdesk", "microsoft", "dropbox"] },
  handwerk: { note: "Buchhaltung, Telefon, Kalender", items: ["datev", "lexware", "sevdesk", "sipgate", "googlecalendar", "whatsapp"] },
  kosmetik: { note: "Kalender, Buchen-Button, Zahlung", items: ["googlecalendar", "instagram", "google", "sumup", "klarna", "whatsapp"] },
  sonnenstudio: { note: "Kasse, Zahlung, Erinnerung", items: ["sumup", "paypal", "applepay", "whatsapp", "google", "lexware"] },
  fahrschule: { note: "Kalender, Zahlung, Buchhaltung", items: ["googlecalendar", "whatsapp", "paypal", "klarna", "datev", "lexware"] },
};
