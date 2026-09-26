/**
 * Struktur der Startseite – Reihenfolge = Sektionen von asapmarketing.de.
 * Hier stehen nur sprachunabhängige Daten (IDs, Icons, Medien, Eigennamen).
 * Sämtliche Texte: messages/{de,en}.json → Namespace "home".
 * Tonalität DE: durchgehend "du" · EN: professionell, modern, direkt.
 */

/** Bento-Reihenfolge der Services (Texte: home.services.items.<id>) */
export const serviceItems = [
  { id: "video", icon: "clapperboard" },
  { id: "foto", icon: "camera" },
  { id: "social", icon: "smartphone" },
  { id: "audio", icon: "audio" },
  { id: "visuals", icon: "sparkles" },
  { id: "web", icon: "workflow" },
] as const;

/** Feature-Karten der KI-Sektion (Texte: home.ki.cards.<id>) */
export const kiCards = [
  { id: "cut", icon: "scissors" },
  { id: "languages", icon: "languages" },
  { id: "captions", icon: "message" },
  { id: "reporting", icon: "chart" },
] as const;

/** Zwei Einstiege unter der KI-Sektion → Geo-SEO-Seiten (Texte: home.ki.split.<id>) */
export const kiSplit = [
  { id: "gastro", seoPage: "gastro" },
  { id: "festival", seoPage: "festival" },
] as const;

export type PortfolioItem = {
  id: "zuan-yuan" | "il-forno" | "cinnamon" | "the-sphere" | "lilys" | "festivals" | "artists" | "voiceover" | "reviews";
  cat: "gastro" | "festival" | "ki";
  kind: "case" | "format";
  /** Eigennamen – werden nicht übersetzt */
  location?: string;
  /** Echte Projekte: kurzer Vorschau-Clip (stumm) + Poster + Link zum vollen Film */
  video?: string;
  poster?: string;
  youtube?: string;
  /** Ohne Video: kleine Komposition, die zeigt, was geliefert wird */
  mock?: "menu" | "film" | "phones" | "wave" | "lineup" | "nodes" | "mediakit";
};

/** Texte: home.portfolio.items.<id> · kind "case" = echtes Projekt · "format" = Leistungsformat */
export const portfolioFilters = ["alle", "gastro", "festival", "ki"] as const;
export const portfolioItems: PortfolioItem[] = [
  {
    id: "zuan-yuan",
    cat: "gastro",
    kind: "case",
    location: "One World Hotel · 1 Utama, Petaling Jaya",
    video: "/videos/cases/zuan-yuan.mp4",
    poster: "/images/cases/zuan-yuan.jpg",
    youtube: "https://www.youtube.com/watch?v=NByHQO1MmoE",
  },
  {
    id: "il-forno",
    cat: "gastro",
    kind: "case",
    location: "Hyatt Centric · KLCC, Kuala Lumpur",
    video: "/videos/cases/il-forno.mp4",
    poster: "/images/cases/il-forno.jpg",
    youtube: "https://www.youtube.com/watch?v=vUdW32F-UgQ",
  },
  {
    id: "cinnamon",
    cat: "gastro",
    kind: "case",
    location: "One World Hotel · 1 Utama, Petaling Jaya",
    video: "/videos/cases/cinnamon.mp4",
    poster: "/images/cases/cinnamon.jpg",
    youtube: "https://www.youtube.com/watch?v=CYj5KCpYFVI",
  },
  {
    id: "the-sphere",
    cat: "gastro",
    kind: "case",
    location: "One World Hotel · 1 Utama, Petaling Jaya",
    video: "/videos/cases/the-sphere.mp4",
    poster: "/images/cases/the-sphere.jpg",
    youtube: "https://www.youtube.com/watch?v=qQjFA1WtrbU",
  },
  { id: "lilys", cat: "gastro", kind: "case", mock: "menu" },
  { id: "festivals", cat: "festival", kind: "case", mock: "lineup" },
  { id: "artists", cat: "festival", kind: "case", mock: "mediakit" },
  { id: "voiceover", cat: "ki", kind: "format", mock: "wave" },
  { id: "reviews", cat: "ki", kind: "format", mock: "nodes" },
];

export const posterOf = (id: PortfolioItem["id"]) => portfolioItems.find((p) => p.id === id)?.poster ?? "";

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
  leistungen: ["video"],
  videoUmfang: "standard",
  videoExtras: ["drohne"],
  extraReels: 0,
  sprachen: 1,
  anfahrt: "lokal",
  express: false,
  contentAbo: "basis",
};
