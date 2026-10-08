import { brandMarks, type BrandId } from "@/demos/brand-marks";
import type { DemoSlug } from "@/demos/registry";

/**
 * Anbindungen: Tools, die Betriebe schon im Einsatz haben und die sich über die Schnittstelle des Anbieters
 * an ein System von uns anschließen lassen (Kasse, Kalender, Zahlung, Buchhaltung, Portale).
 * Das ist eine Auswahl, kein Partnerverzeichnis – deshalb überall die Formulierung „lässt sich anbinden“.
 *
 * Zwei Quellen für die Logos:
 *  - brand-marks.ts: Zeichen aus Simple Icons, einfarbig auf Markenfläche, daneben der Name
 *  - toolLogos: Original-Logos der Branchen-Tools als Datei in public/logos/tools (Wikimedia Commons bzw. Website des Anbieters).
 *    `h` = Höhe in der kleinen Marke (px), `ratio` = Breite/Höhe; `label` nur, wo das Logo den Namen nicht lesbar enthält.
 */
export const toolLogos = {
  immoscout24: { name: "ImmoScout24", ratio: 100 / 60, h: 24 },
  immowelt: { name: "Immowelt", ratio: 261 / 60, h: 18 },
  propstack: { name: "Propstack", ratio: 368 / 60, h: 15 },
  mobilede: { name: "mobile.de", ratio: 285 / 60, h: 20 },
  autoscout24: { name: "AutoScout24", ratio: 95 / 60, h: 24 },
  dat: { name: "DAT", ratio: 39 / 60, h: 24, label: true },
  tecdoc: { name: "TecDoc", ratio: 1, h: 24, label: true },
  lexware: { name: "Lexware", ratio: 353 / 60, h: 15 },
  sevdesk: { name: "sevdesk", ratio: 207 / 60, h: 18 },
  elster: { name: "ELSTER", ratio: 184 / 60, h: 16 },
  sipgate: { name: "sipgate", ratio: 200 / 60, h: 18 },
} satisfies Record<string, { name: string; ratio: number; h: number; label?: boolean }>;

export type ToolId = keyof typeof toolLogos;
export type Integration = BrandId | ToolId;

export const isTool = (id: Integration): id is ToolId => id in toolLogos;
export const integrationName = (id: Integration) => (isTool(id) ? toolLogos[id].name : brandMarks[id].name);

/** Zwei gegenläufige Bänder auf der Demo-Übersicht */
export const integrationRows: Integration[][] = [
  ["datev", "googlecalendar", "immoscout24", "whatsapp", "stripe", "lexware", "paypal", "microsoftoutlook", "sumup", "mobilede", "klarna", "googlemaps", "sevdesk", "instagram", "slack", "shopify", "elster", "hubspot", "applepay"],
  ["claude", "openai", "googlegemini", "sipgate", "n8n", "make", "microsoftteams", "immowelt", "notion", "salesforce", "calendly", "autoscout24", "googledrive", "docusign", "googlesheets", "dropbox", "propstack", "brevo", "personio", "dhl"],
];

/** Je Demo: was in der Branche üblich ist und wofür es gebraucht wird (steht als Hinweis über den Logos) */
export const demoIntegrations: Record<DemoSlug, { note: string; items: Integration[] }> = {
  restaurant: { note: "Kasse, Zahlung, Bon-Drucker", items: ["sumup", "paypal", "applepay", "epson", "lexware", "googlemaps"] },
  friseur: { note: "Kalender, Buchen-Button, Zahlung", items: ["googlecalendar", "microsoftoutlook", "instagram", "google", "sumup", "klarna"] },
  immobilien: { note: "Portale, Maklersoftware, Unterschrift", items: ["immoscout24", "immowelt", "kleinanzeigen", "propstack", "docusign", "googlecalendar"] },
  werkstatt: { note: "Börsen, Fahrzeugdaten, Buchhaltung", items: ["mobilede", "autoscout24", "dat", "tecdoc", "datev", "whatsapp"] },
  steuerkanzlei: { note: "Kanzleiprogramm, Buchhaltung, Ablage", items: ["datev", "elster", "lexware", "sevdesk", "microsoft", "dropbox"] },
  handwerk: { note: "Buchhaltung, Telefon, Kalender", items: ["datev", "lexware", "sevdesk", "sipgate", "googlecalendar", "whatsapp"] },
};
