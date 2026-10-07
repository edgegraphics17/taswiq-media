import type { TaskCategory } from "@/types/database";

/**
 * Das Team: sieben Abteilungen mit klarer Zuständigkeit. Dieselbe Aufteilung steht für die Agenten in team/<id>.md –
 * bei Änderungen beide Stellen und DEPARTMENTS in backend/server.mjs anpassen.
 */
export const DEPARTMENT_IDS = ["leitung", "entwicklung", "wachstum", "marketing", "vertrieb", "qualitaet", "analyse"] as const;
export type DepartmentId = (typeof DEPARTMENT_IDS)[number];

export interface Department {
  id: DepartmentId;
  name: string;
  role: string;
  /** Lucide-Icon, aufgelöst in der Team-Seite */
  icon: "compass" | "code" | "trending" | "megaphone" | "handshake" | "shield" | "chart";
  /** Fertigkeiten (Skills), die diese Abteilung nutzt */
  skills: string[];
  categories: TaskCategory[];
}

export const departments: Department[] = [
  { id: "leitung", name: "Leitung", role: "Hält das Team auf Kurs zum Umsatzziel, verteilt Aufgaben und schreibt den Wochenbericht.", icon: "compass", skills: ["Planung", "Wochenbericht", "Aufgaben ordnen"], categories: ["sonstiges"] },
  { id: "entwicklung", name: "Entwicklung", role: "Baut und repariert Website, Rechner, Anfrage-Wege, Dashboard und Backend.", icon: "code", skills: ["UI/UX", "Frontend", "Fehlersuche", "Code-Review"], categories: ["workflows", "fehlt"] },
  { id: "wachstum", name: "Wachstum", role: "Bringt passende Besucher über Google, KI-Assistenten und Ratgeber-Inhalte.", icon: "trending", skills: ["SEO-Audit", "KI-Suche", "Texte", "Recherche"], categories: ["seo", "geo", "traffic"] },
  { id: "marketing", name: "Marketing", role: "Plant Anzeigen und Kampagnen, gestaltet Grafiken und Videos – für TasWiq und für Kundenaufträge.", icon: "megaphone", skills: ["Meta Ads", "Anzeigen-Motive", "Grafikdesign", "Video", "Kampagnenplan"], categories: [] },
  { id: "vertrieb", name: "Angebot & Vertrieb", role: "Macht aus Anfragen Aufträge: Angebote, Pakete, Vorlagen und Fallstudien.", icon: "handshake", skills: ["Angebote", "Verkaufstexte", "Einwände", "Pipeline"], categories: ["angebote", "vertrieb"] },
  { id: "qualitaet", name: "Qualität & Sicherheit", role: "Testet alle Wege zur Anfrage, behebt Fehler und hält Risiken klein.", icon: "shield", skills: ["Tests", "Sicherheit", "Barrierefreiheit", "Fehleranalyse"], categories: ["bugs", "risiken"] },
  { id: "analyse", name: "Analyse", role: "Liest die Zahlen und zeigt den anderen, wo der größte Hebel liegt.", icon: "chart", skills: ["Auswertung", "Statistik", "Kennzahlen"], categories: [] },
];

export const departmentById = Object.fromEntries(departments.map((d) => [d.id, d])) as Record<DepartmentId, Department>;

/** Welche Abteilung ist für einen Aufgaben-Bereich zuständig? */
export function departmentFor(category: TaskCategory): DepartmentId {
  return departments.find((d) => d.categories.includes(category))?.id ?? "leitung";
}
