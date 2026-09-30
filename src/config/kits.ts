/**
 * DJ-Presse-Kits (Portfolio-Referenz): jede Seite als WebP unter public/portfolio/kits/<id>/p<n>.webp.
 * Neues Kit: Seiten ablegen, hier eintragen – der Viewer im Portfolio zieht automatisch nach.
 */
export interface DjKit {
  id: string;
  name: string;
  year: number | null;
  pages: number;
  /** Maße der Seite (Seitenverhältnis) */
  w: number;
  h: number;
}

export const djKits: DjKit[] = [
  { id: "pierce-merrill", name: "Pierce Merrill", year: null, pages: 8, w: 1280, h: 2276 },
  { id: "yuna", name: "Yuna", year: 2025, pages: 8, w: 1280, h: 720 },
  { id: "mich2mich", name: "Mich2Mich", year: 2025, pages: 7, w: 1280, h: 720 },
  { id: "vision", name: "Vision", year: 2024, pages: 8, w: 1280, h: 720 },
  { id: "vkm", name: "VKM", year: 2024, pages: 9, w: 1280, h: 720 },
  { id: "tibafa", name: "Tibafa", year: null, pages: 7, w: 1280, h: 720 },
  { id: "assil", name: "Assil", year: 2025, pages: 8, w: 1280, h: 720 },
  { id: "hayakawa", name: "Hayakawa", year: 2025, pages: 5, w: 1280, h: 720 },
  { id: "chris-carve", name: "Chris Carve", year: 2025, pages: 8, w: 1280, h: 720 },
  { id: "complexo", name: "Complexo", year: 2025, pages: 8, w: 1280, h: 720 },
  { id: "dle", name: "DLE", year: 2025, pages: 6, w: 1280, h: 720 },
  { id: "apollo", name: "Apollo", year: null, pages: 7, w: 1280, h: 720 },
  { id: "dj-marques-2023", name: "DJ Marques", year: 2023, pages: 9, w: 1280, h: 721 },
  { id: "soundspider", name: "Soundspider", year: 2024, pages: 9, w: 1280, h: 720 },
  { id: "dj-arly", name: "DJ Arly", year: 2024, pages: 7, w: 1280, h: 2276 },
  { id: "dj-chemics", name: "DJ Chemics", year: 2025, pages: 7, w: 1280, h: 720 },
  { id: "paul-str", name: "Paul STR", year: 2025, pages: 8, w: 1280, h: 720 },
  { id: "cantelli", name: "Cantelli", year: 2024, pages: 8, w: 1280, h: 720 },
  { id: "baguncada", name: "Baguncada", year: 2025, pages: 7, w: 1280, h: 720 },
  { id: "bobdk", name: "BobDk", year: null, pages: 9, w: 1280, h: 720 },
  { id: "marques-2025", name: "Marques", year: 2025, pages: 9, w: 1280, h: 720 },
  { id: "mdasilva", name: "MDA Silva", year: 2025, pages: 11, w: 1280, h: 720 },
];
