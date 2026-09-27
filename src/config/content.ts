/**
 * Struktur der Startseite & des Portfolios.
 * Hier stehen nur sprachunabhängige Daten (IDs, Icons, Medien, Links, Eigennamen).
 * Sämtliche Texte: messages/{de,en}.json → Namespaces "home" und "portfolio".
 * Tonalität DE: durchgehend "du" · EN: professionell, modern, direkt.
 *
 * Positionierung seit 2026-09: Software & Systeme für KMU und Mittelstand.
 * Die Media-Referenzen (Events, Festivals, Artists, Hotels) sind Vertrauensbeweis –
 * nicht mehr das Hauptangebot.
 */

/** Sechs Software-Säulen im Bento (Texte: home.services.items.<id>) · `page` = passende Landingpage */
export const serviceItems = [
  { id: "systems", icon: "cart", page: "bestellsystem" },
  { id: "custom", icon: "code", page: "individualsoftware" },
  { id: "dashboards", icon: "chart", page: "dashboard" },
  { id: "portals", icon: "smartphone", page: "webapp" },
  { id: "ai", icon: "sparkles", page: "ki" },
  { id: "web", icon: "monitor", page: "website" },
] as const;

/** Vorteile gegenüber Plattformen & Abo-Software (Texte: home.problem.compare.<id>) */
export const compareRows = ["fees", "data", "brand", "features", "exit"] as const;

/* ─────────────────────────── PORTFOLIO ─────────────────────────── */

export type PortfolioId =
  | "daron"
  | "omed"
  | "antragsbruder"
  | "klarvoran"
  | "mipp"
  | "taswiq-system"
  | "reviews"
  | "lilys"
  | "agile"
  | "mangal"
  | "land-of-plenty"
  | "bistro"
  | "bread"
  | "zuan-yuan"
  | "il-forno"
  | "cinnamon"
  | "the-sphere"
  | "festivals"
  | "artists";

export type PortfolioCat = "software" | "web" | "gastro" | "immobilien" | "events" | "media";

export type PortfolioMedia =
  /** Live-Website oder Web-App: Screenshot + Link */
  | { type: "site"; image: string; url: string }
  /** Film oder Reel: stummer Vorschau-Loop + optional voller Film mit Ton */
  | { type: "video"; poster: string; preview: string; full?: string; youtube?: string; orientation: "v" | "h" }
  /** Ohne Bildmaterial: kleine Komposition, die zeigt, was geliefert wurde */
  | { type: "mock"; mock: "menu" | "lineup" | "mediakit" | "nodes" | "dashboard" };

export interface PortfolioItem {
  id: PortfolioId;
  cats: PortfolioCat[];
  /** live = echtes Kundenprojekt online · demo = Demo/Pilot · film / reel = Media-Projekt · case = Kampagne/Referenz · internal = eigenes System */
  kind: "live" | "demo" | "film" | "reel" | "case" | "internal";
  media: PortfolioMedia;
  /** Eigennamen/Orte – werden nicht übersetzt */
  location?: string;
  /** Auf der Startseite zeigen */
  featured?: boolean;
  /** Interner Link statt externer URL (eigene Systeme) */
  internal?: "/preisrechner";
}

/** Texte: portfolio.items.<id> (title, tag, text, result, services[]) */
export const portfolioFilters = ["alle", "software", "web", "gastro", "events", "media"] as const;
export type PortfolioFilter = (typeof portfolioFilters)[number];

export const portfolioItems: PortfolioItem[] = [
  /* Software & Systeme */
  {
    id: "daron",
    cats: ["software", "gastro"],
    kind: "live",
    media: { type: "site", image: "/images/portfolio/site-daron.jpg", url: "https://daron-brot-ii.vercel.app" },
    location: "Aachen",
    featured: true,
  },
  {
    id: "omed",
    cats: ["software", "web"],
    kind: "live",
    media: { type: "site", image: "/images/portfolio/site-omed.jpg", url: "https://omed-friseursalon.vercel.app" },
    location: "Aachen-Burtscheid",
    featured: true,
  },
  {
    id: "antragsbruder",
    cats: ["software"],
    kind: "live",
    media: { type: "site", image: "/images/portfolio/site-antragsbruder.jpg", url: "https://www.antragsbruder.de" },
    location: "Deutschland",
    featured: true,
  },
  {
    id: "taswiq-system",
    cats: ["software"],
    kind: "internal",
    media: { type: "mock", mock: "dashboard" },
    internal: "/preisrechner",
  },
  {
    id: "reviews",
    cats: ["software"],
    kind: "internal",
    media: { type: "mock", mock: "nodes" },
  },
  /* Websites */
  {
    id: "klarvoran",
    cats: ["web"],
    kind: "live",
    media: { type: "site", image: "/images/portfolio/site-klarvoran.jpg", url: "https://www.klarvoran.de" },
    location: "Kriftel · Rhein-Main",
    featured: true,
  },
  {
    id: "mipp",
    cats: ["web"],
    kind: "demo",
    media: { type: "site", image: "/images/portfolio/site-mipp.jpg", url: "https://mipp-website.vercel.app" },
    location: "Malaysia",
  },
  { id: "lilys", cats: ["web", "gastro"], kind: "case", media: { type: "mock", mock: "menu" } },
  /* Immobilien & Media */
  {
    id: "agile",
    cats: ["media", "immobilien"],
    kind: "film",
    media: { type: "video", poster: "/images/portfolio/agile.jpg", preview: "/videos/portfolio/agile-preview.mp4", full: "/videos/portfolio/agile.mp4", orientation: "h" },
    featured: true,
  },
  {
    id: "mangal",
    cats: ["media", "gastro"],
    kind: "reel",
    media: { type: "video", poster: "/images/portfolio/mangal.jpg", preview: "/videos/portfolio/mangal-preview.mp4", full: "/videos/portfolio/mangal.mp4", orientation: "v" },
    featured: true,
  },
  {
    id: "land-of-plenty",
    cats: ["media", "gastro"],
    kind: "reel",
    media: { type: "video", poster: "/images/portfolio/land-of-plenty.jpg", preview: "/videos/portfolio/land-of-plenty-preview.mp4", full: "/videos/portfolio/land-of-plenty.mp4", orientation: "v" },
  },
  {
    id: "bistro",
    cats: ["media", "gastro"],
    kind: "reel",
    media: { type: "video", poster: "/images/portfolio/bistro.jpg", preview: "/videos/portfolio/bistro-preview.mp4", full: "/videos/portfolio/bistro.mp4", orientation: "v" },
  },
  {
    id: "bread",
    cats: ["media", "gastro"],
    kind: "reel",
    media: { type: "video", poster: "/images/portfolio/bread.jpg", preview: "/videos/portfolio/bread-preview.mp4", full: "/videos/portfolio/bread.mp4", orientation: "v" },
  },
  {
    id: "zuan-yuan",
    cats: ["media", "gastro"],
    kind: "film",
    media: { type: "video", poster: "/images/cases/zuan-yuan.jpg", preview: "/videos/cases/zuan-yuan.mp4", youtube: "https://www.youtube.com/watch?v=NByHQO1MmoE", orientation: "h" },
    location: "One World Hotel · Petaling Jaya",
  },
  {
    id: "il-forno",
    cats: ["media", "gastro"],
    kind: "film",
    media: { type: "video", poster: "/images/cases/il-forno.jpg", preview: "/videos/cases/il-forno.mp4", youtube: "https://www.youtube.com/watch?v=vUdW32F-UgQ", orientation: "h" },
    location: "Hyatt Centric · Kuala Lumpur",
  },
  {
    id: "cinnamon",
    cats: ["media", "gastro"],
    kind: "film",
    media: { type: "video", poster: "/images/cases/cinnamon.jpg", preview: "/videos/cases/cinnamon.mp4", youtube: "https://www.youtube.com/watch?v=CYj5KCpYFVI", orientation: "h" },
    location: "One World Hotel · Petaling Jaya",
  },
  {
    id: "the-sphere",
    cats: ["media", "gastro"],
    kind: "film",
    media: { type: "video", poster: "/images/cases/the-sphere.jpg", preview: "/videos/cases/the-sphere.mp4", youtube: "https://www.youtube.com/watch?v=qQjFA1WtrbU", orientation: "h" },
    location: "One World Hotel · Petaling Jaya",
  },
  /* Events & Artists */
  { id: "festivals", cats: ["events", "media"], kind: "case", media: { type: "mock", mock: "lineup" } },
  { id: "artists", cats: ["events", "media"], kind: "case", media: { type: "mock", mock: "mediakit" } },
];

export const getPortfolioItem = (id: PortfolioId) => portfolioItems.find((p) => p.id === id)!;

/** Vorschaubild eines Projekts (für Avatare, Teaser) */
export function thumbOf(p: PortfolioItem): string | undefined {
  if (p.media.type === "site") return p.media.image;
  if (p.media.type === "video") return p.media.poster;
  return undefined;
}

/* ─────────────────────────── REFERENZEN ─────────────────────────── */

/**
 * Referenzen aus der bisherigen Event-, Artist- und Brand-Arbeit (EDGE Eventmarketing, Spots KL).
 * Nur Namen – keine Logos oder Pressefotos (Marken- und Bildrechte liegen bei den Inhabern).
 * Gruppen-Labels: home.references.groups.<id>
 */
export const referenceGroups = [
  { id: "hospitality", names: ["Hyatt Centric", "One World Hotel", "Radisson Blu", "Hilton", "Marriott", "Hard Rock Hotel", "Club Med"] },
  { id: "clubs", names: ["Tomorrowland", "DWP Bali", "Afro Nation", "splash!", "O Beach Ibiza", "La Louve", "Gibs'n", "Shôko", "Vanity Cologne", "NF", "808"] },
  { id: "spirits", names: ["Grey Goose", "Don Julio", "Patrón", "Bacardí"] },
  { id: "automotive", names: ["Audi", "Volvo", "NIO", "Ford", "Emil Frey"] },
  { id: "brands", names: ["Lufthansa", "adidas", "IQOS", "Taylor's"] },
] as const;

export const referenceArtists = [
  "Chris Brown", "Bryson Tiller", "Central Cee", "Burna Boy", "Lil Yachty", "Uncle Waffles", "DJ Hamida", "Dystinct",
  "Haftbefehl", "Luciano", "Summer Cem", "Samra", "Reezy", "Ufo361", "Celo & Abdi", "Monet192", "Kalim",
  "Dafina Zeqiri", "Dhurata Dora", "Azet & Albi", "Ardian Bujupi", "Noizy", "Yll Limani",
];

/** Beispiel im Rechner-Teaser – wird live mit der Rechner-Engine berechnet */
export const calculatorTeaserExample = {
  branche: "gastro",
  leistungen: ["bestellung", "website"],
  bestellUmfang: "pro",
  websiteUmfang: "business",
  funktionen: ["whatsapp"],
  express: false,
  betrieb: "betrieb",
};
