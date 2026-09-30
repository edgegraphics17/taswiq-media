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
  | "infinity-cut"
  | "ggc"
  | "brancos"
  | "raum-rasen"
  | "ai-produktfilm"
  | "huqup"
  | "qabila"
  | "bt-revive"
  | "motion-reel"
  | "la-louve-fotos"
  | "ki-shootings"
  | "festivals"
  | "dj-presskits";

export type PortfolioCat = "software" | "web" | "gastro" | "immobilien" | "events" | "media";

export type PortfolioMedia =
  /** Live-Website oder Web-App: Screenshot + Link */
  | { type: "site"; image: string; url: string }
  /** Film oder Reel: stummer Vorschau-Loop + optional voller Film mit Ton */
  | { type: "video"; poster: string; preview: string; full?: string; youtube?: string; orientation: "v" | "h" }
  /** Ohne Bildmaterial: kleine Komposition, die zeigt, was geliefert wurde */
  | { type: "mock"; mock: "menu" | "lineup" | "mediakit" | "nodes" | "dashboard" }
  /** Projekt-Paket: mehrere Videos und Fotos in einem Dialog · Karte zeigt den Vorschau-Loop */
  | { type: "pack"; poster: string; preview: string; clips: PackClip[] }
  /** Vorher/Nachher-Regler mit mehreren Beispielen */
  | { type: "compare"; poster: string; pairs: ComparePair[] }
  /** DJ-Presse-Kits: alle Kits aus src/config/kits.ts, Seite für Seite zum Durchklicken */
  | { type: "kits"; poster: string };

/** Ein Clip oder Foto innerhalb eines Projekt-Pakets */
export type PackClip =
  | { kind: "video"; src: string; poster: string; orientation: "v" | "h" }
  | { kind: "image"; src: string; width: number; height: number };

/** Vorher/Nachher-Paar (beide Bilder im gleichen Ausschnitt) */
export interface ComparePair {
  before: string;
  after: string;
}

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
  /* Business, Branding & KI-Video */
  {
    id: "infinity-cut",
    cats: ["media"],
    kind: "reel",
    media: {
      type: "pack",
      poster: "/images/portfolio/infinity-cut.jpg",
      preview: "/videos/portfolio/infinity-cut-preview.mp4",
      clips: [
        { kind: "video", src: "/videos/portfolio/infinity-cut.mp4", poster: "/images/portfolio/infinity-cut.jpg", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/infinity-cut/monitor.mp4", poster: "/portfolio/packs/infinity-cut/monitor.webp", orientation: "v" },
        { kind: "image", src: "/portfolio/packs/infinity-cut/preisliste.webp", width: 720, height: 1280 },
        { kind: "image", src: "/portfolio/packs/infinity-cut/combo.webp", width: 720, height: 1290 },
        { kind: "image", src: "/portfolio/packs/infinity-cut/haare-solarium.webp", width: 720, height: 1290 },
        { kind: "image", src: "/portfolio/packs/infinity-cut/extra.webp", width: 720, height: 1290 },
      ],
    },
    location: "Frankfurt am Main",
  },
  {
    id: "ggc",
    cats: ["media"],
    kind: "reel",
    media: {
      type: "pack",
      poster: "/images/portfolio/ggc.jpg",
      preview: "/videos/portfolio/ggc-preview.mp4",
      clips: [
        { kind: "video", src: "/videos/portfolio/ggc.mp4", poster: "/images/portfolio/ggc.jpg", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/ggc/clip-2.mp4", poster: "/portfolio/packs/ggc/clip-2.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/ggc/clip-3.mp4", poster: "/portfolio/packs/ggc/clip-3.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/ggc/clip-4.mp4", poster: "/portfolio/packs/ggc/clip-4.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/ggc/clip-5.mp4", poster: "/portfolio/packs/ggc/clip-5.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/ggc/clip-6.mp4", poster: "/portfolio/packs/ggc/clip-6.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/ggc/clip-7.mp4", poster: "/portfolio/packs/ggc/clip-7.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/ggc/clip-8.mp4", poster: "/portfolio/packs/ggc/clip-8.webp", orientation: "v" },
      ],
    },
  },
  {
    id: "brancos",
    cats: ["media"],
    kind: "reel",
    media: {
      type: "pack",
      poster: "/images/portfolio/brancos.jpg",
      preview: "/videos/portfolio/brancos-preview.mp4",
      clips: [
        { kind: "video", src: "/videos/portfolio/brancos.mp4", poster: "/images/portfolio/brancos.jpg", orientation: "v" },
        { kind: "image", src: "/portfolio/packs/brancos/brand-kit.webp", width: 1600, height: 904 },
      ],
    },
  },
  {
    id: "raum-rasen",
    cats: ["media"],
    kind: "reel",
    media: {
      type: "pack",
      poster: "/images/portfolio/raum-rasen.jpg",
      preview: "/videos/portfolio/raum-rasen-preview.mp4",
      clips: [
        { kind: "video", src: "/portfolio/packs/raum-rasen/clip-1.mp4", poster: "/portfolio/packs/raum-rasen/clip-1.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/raum-rasen/clip-2.mp4", poster: "/portfolio/packs/raum-rasen/clip-2.webp", orientation: "v" },
        { kind: "video", src: "/portfolio/packs/raum-rasen/clip-3.mp4", poster: "/portfolio/packs/raum-rasen/clip-3.webp", orientation: "v" },
      ],
    },
  },
  {
    id: "ai-produktfilm",
    cats: ["media"],
    kind: "reel",
    media: { type: "video", poster: "/images/portfolio/ai-produktfilm.jpg", preview: "/videos/portfolio/ai-produktfilm-preview.mp4", full: "/videos/portfolio/ai-produktfilm.mp4", orientation: "v" },
  },
  /* Events */
  {
    id: "huqup",
    cats: ["media"],
    kind: "film",
    media: { type: "video", poster: "/images/portfolio/huqup.jpg", preview: "/videos/portfolio/huqup-preview.mp4", full: "/videos/portfolio/huqup.mp4", orientation: "h" },
  },
  {
    id: "qabila",
    cats: ["media"],
    kind: "film",
    media: { type: "video", poster: "/images/portfolio/qabila.jpg", preview: "/videos/portfolio/qabila-preview.mp4", full: "/videos/portfolio/qabila.mp4", orientation: "h" },
  },
  {
    id: "bt-revive",
    cats: ["media"],
    kind: "film",
    media: { type: "video", poster: "/images/portfolio/bt-revive.jpg", preview: "/videos/portfolio/bt-revive-preview.mp4", full: "/videos/portfolio/bt-revive.mp4", orientation: "h" },
  },
  {
    id: "motion-reel",
    cats: ["events", "media"],
    kind: "reel",
    media: { type: "video", poster: "/images/portfolio/motion-reel.jpg", preview: "/videos/portfolio/motion-reel-preview.mp4", full: "/videos/portfolio/motion-reel.mp4", orientation: "v" },
  },
  {
    id: "la-louve-fotos",
    cats: ["events", "media"],
    kind: "case",
    media: {
      type: "pack",
      poster: "/images/portfolio/la-louve-fotos.jpg",
      preview: "/videos/portfolio/la-louve-fotos-preview.mp4",
      clips: [
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01181.webp", width: 1000, height: 1248 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01186.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01189.webp", width: 1000, height: 1216 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01191.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01194.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01197.webp", width: 1000, height: 1288 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01203.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01216.webp", width: 1000, height: 1330 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01224.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01227.webp", width: 1000, height: 1356 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01228.webp", width: 1000, height: 1204 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01244.webp", width: 1000, height: 1302 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01255.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01258.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01259.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01292.webp", width: 1000, height: 1256 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01295.webp", width: 1000, height: 1250 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01296.webp", width: 1000, height: 1280 },
        { kind: "image", src: "/portfolio/packs/la-louve-fotos/rp_01350.webp", width: 1000, height: 1334 },
      ],
    },
  },
  {
    id: "ki-shootings",
    cats: ["media"],
    kind: "case",
    media: {
      type: "compare",
      poster: "/portfolio/packs/ki-shootings/hanger-model-nachher.webp",
      pairs: [
        { before: "/portfolio/packs/ki-shootings/hanger-model-vorher.webp", after: "/portfolio/packs/ki-shootings/hanger-model-nachher.webp" },
        { before: "/portfolio/packs/ki-shootings/greenscreen-studio-1-vorher.webp", after: "/portfolio/packs/ki-shootings/greenscreen-studio-1-nachher.webp" },
        { before: "/portfolio/packs/ki-shootings/greenscreen-studio-2-vorher.webp", after: "/portfolio/packs/ki-shootings/greenscreen-studio-2-nachher.webp" },
      ],
    },
  },
  /* Events & Artists */
  { id: "festivals", cats: ["events", "media"], kind: "case", media: { type: "mock", mock: "lineup" } },
  { id: "dj-presskits", cats: ["events", "media"], kind: "case", media: { type: "kits", poster: "/images/portfolio/dj-presskits-v2.jpg" } },
];

export const getPortfolioItem = (id: PortfolioId) => portfolioItems.find((p) => p.id === id)!;

/** Vorschaubild eines Projekts (für Avatare, Teaser) */
export function thumbOf(p: PortfolioItem): string | undefined {
  if (p.media.type === "site") return p.media.image;
  if (p.media.type === "video" || p.media.type === "pack" || p.media.type === "compare" || p.media.type === "kits") return p.media.poster;
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
