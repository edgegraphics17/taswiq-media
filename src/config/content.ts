/**
 * Sämtliche Texte der Website – Reihenfolge = Sektionen von asapmarketing.de.
 * Copy-Änderungen nur hier, Komponenten bleiben unberührt.
 * Tonalität: durchgehend "du", konkret, keine Superlative ohne Beleg.
 */

export const hero = {
  word: "Content.",
  /** Typewriter-Zeile (asap: "Aus einer Hand." / "As soon as possible.") */
  typewriter: ["Der satt macht.", "Der laut ist.", "In KI-Tempo."],
  sub: "Wir filmen und fotografieren Restaurants, Bars und Festivals auf Kino-Niveau – und machen aus jedem Dreh mit KI-Workflows Dutzende Reels, Ads und Posts.",
  primary: { label: "Jetzt Projekt starten", href: "/#kontakt" },
  secondary: { label: "Leistungen entdecken", href: "/#services" },
  /** 450+ = Projekte aus Event-, Artist- und Gastro-Arbeit (EDGE & Spots KL), Rest = Leistungsversprechen */
  stats: [
    { value: "450+", label: "Projekte" },
    { value: "72 h", label: "Erste Clips" },
    { value: "4", label: "Sprachen per KI" },
  ],
};

export const promise = {
  cardTag: "Unser Versprechen",
  cardTitle: "Du kümmerst dich um deine Gäste. Wir um den Content.",
  checks: [
    "Ein Dreh – alle Formate, von 16:9 bis 9:16",
    "Ein fester Ansprechpartner für alles",
    "Festpreis steht vor dem ersten Drehtag",
    "Erste Clips 72 Stunden nach dem Dreh",
    "Volle Nutzungsrechte an allen Dateien",
  ],
  badge: { title: "Alles aus einer Hand", text: "Dreh · Schnitt · KI · Posting" },
  tag: "Warum TasWiq",
  title: "Kamera-Handwerk trifft KI-Pipeline.",
  text: "TasWiq (تسويق) ist Arabisch und heißt Marketing. Genau darum geht's: Bilder, die nicht nur schön sind, sondern Tische füllen und Tickets verkaufen. Gedreht haben wir unter anderem für Hotel-Restaurants in Kuala Lumpur – vom IL Forno im Hyatt Centric bis zum Zuan Yuan im One World Hotel. Heute verbinden wir diesen Kino-Look mit KI-Workflows, damit aus einem Drehtag Content für Wochen wird.",
  features: [
    { icon: "zap", title: "Schnell geliefert", text: "Erste Reels nach 72 Stunden, fertiger Film nach 7 Tagen." },
    { icon: "layers", title: "Klassik + KI", text: "Echte Bilder vor Ort, KI für Menge, Varianten und Sprachen." },
    { icon: "target", title: "Gastro & Festival", text: "Wir kennen Service-Stress um 19 Uhr und den Drop um 1 Uhr nachts." },
  ],
};

export const services = {
  tag: "Was wir anbieten",
  title: "Unsere Services",
  text: "Vom ersten Konzept bis zum laufenden Content-Abo – alles koordiniert, alles aus einer Hand.",
  cta: { label: "Alle Services anfragen", href: "/#kontakt" },
  items: [
    { icon: "clapperboard", title: "Video & Aftermovie", text: "Aftermovies, Imagefilme und Musikvideos in 4K – mit Multi-Cam, Drohne und Kino-Grading.", tags: "Festival · Club · Restaurant" },
    { icon: "camera", title: "Fotografie", text: "Food, Location, Event und Artist. Bearbeitet, in Web- und Druckauflösung, sofort nutzbar.", tags: "Food · Event · Press-Kit" },
    { icon: "smartphone", title: "Social-Media-Content", text: "Reels, Stories und Posts im Wochenrhythmus – geplant, getextet und gepostet.", tags: "Instagram · TikTok · Google" },
    { icon: "audio", title: "KI-Audio & Voiceover", text: "Sprachfassungen deiner Clips mit deiner oder einer KI-Stimme, inklusive Untertitel.", tags: "DE · EN · AR · TR" },
    { icon: "sparkles", title: "KI-Video & Visuals", text: "Generierte Szenen, Visualizer und Ad-Varianten für Line-ups, Launches und Kampagnen.", tags: "Visuals · Ads · Motion" },
    { icon: "workflow", title: "Web & Automatisierung", text: "Websites, digitale Speisekarten und n8n-Workflows, die dir jeden Tag Arbeit abnehmen.", tags: "Website · QR-Karte · n8n" },
  ],
};

export const ki = {
  tag: "KI-Lösungen",
  title: "KI, die im Alltag wirklich Content liefert.",
  text: "Werkzeuge, die ab dem ersten Dreh etwas übernehmen: schneiden, übersetzen, vertonen, posten. Wir richten sie ein und betreuen sie – wie deinen Content.",
  flagship: {
    badge: "Unser Flaggschiff",
    label: "Content-Pipeline",
    title: "Ein Drehtag. Content für ein ganzes Quartal.",
    text: "Unsere Pipeline macht aus dem Rohmaterial eines Drehs 12 bis 30 fertige Clips – in mehreren Formaten, Längen und Sprachen. Du bekommst jede Woche neues Material, ohne jede Woche zu drehen.",
    primary: { label: "Wie die Pipeline arbeitet", href: "/content-pipeline" },
    secondary: { label: "Kosten berechnen", href: "/preisrechner" },
  },
  cards: [
    { icon: "scissors", title: "Schnitt in Serie", text: "Die KI schlägt Hooks, Längen und Formate vor. Wir wählen aus und geben den Look." },
    { icon: "languages", title: "Sprachen & Stimmen", text: "Ein Clip, vier Sprachen – Voiceover und Untertitel, abgestimmt auf dein Publikum." },
    { icon: "message", title: "Captions & Planung", text: "Texte in deinem Ton, Posting-Plan und Hashtags – vorbereitet, von uns redigiert." },
    { icon: "chart", title: "Auswertung", text: "Welche Clips ziehen? Die KI wertet aus und schreibt den Report. Du liest Erkenntnisse statt Tabellen." },
  ],
  split: [
    {
      tag: "Du bist aus der Gastronomie",
      title: "Dann starte mit dem Social-Retainer.",
      text: "Ein halber Drehtag im Monat, 12 Reels und 20 Fotos – Karte, Team und Atmosphäre. Dazu die digitale Speisekarte und dein Google-Profil.",
      cta: { label: "Gastro-Paket ansehen", href: "/leistungen/medienagentur-gastronomie" },
    },
    {
      tag: "Du veranstaltest Festivals & Events",
      title: "Dann plane das Aftermovie mit KI-Paket.",
      text: "Multi-Cam-Dreh, Aftermovie in 7 Tagen und 20+ Ad-Varianten für den Vorverkauf der nächsten Saison – in mehreren Sprachen.",
      cta: { label: "Festival-Paket ansehen", href: "/leistungen/festival-videograf" },
    },
  ],
};

export type PortfolioItem = {
  id: string;
  cat: "gastro" | "festival" | "ki";
  kind: "case" | "format";
  tag: string;
  title: string;
  text: string;
  location?: string;
  /** Echte Projekte: kurzer Vorschau-Clip (stumm) + Poster + Link zum vollen Film */
  video?: string;
  poster?: string;
  youtube?: string;
  /** Ohne Video: kleine Komposition, die zeigt, was geliefert wird */
  mock?: "menu" | "film" | "phones" | "wave" | "lineup" | "nodes" | "mediakit";
};

export const portfolio = {
  tag: "Arbeiten & Referenzen",
  title: "Ergebnisse, die bewegen",
  text: "Hotel-Restaurants in Kuala Lumpur, Clubs und Festivals, Artists und Marken – eine Auswahl unserer Projekte.",
  filters: [
    { id: "alle", label: "Alle" },
    { id: "gastro", label: "Gastro & Hotel" },
    { id: "festival", label: "Festival & Artists" },
    { id: "ki", label: "KI & Web" },
  ],
  /** kind "case" = echtes Projekt · kind "format" = Leistungsformat ohne Kundennamen */
  items: [
    {
      id: "zuan-yuan",
      cat: "gastro",
      kind: "case",
      tag: "Restaurant-Film",
      title: "Zuan Yuan – Kantonesische Küche",
      text: "Dim Sum, Signature-Gerichte und der Chef am Tisch: ein Imagefilm für das kantonesische Fine-Dining-Restaurant.",
      location: "One World Hotel · 1 Utama, Petaling Jaya",
      video: "/videos/cases/zuan-yuan.mp4",
      poster: "/images/cases/zuan-yuan.jpg",
      youtube: "https://www.youtube.com/watch?v=NByHQO1MmoE",
    },
    {
      id: "il-forno",
      cat: "gastro",
      kind: "case",
      tag: "Restaurant-Film",
      title: "IL Forno – Italian Fine Dining",
      text: "Pizza aus dem Steinofen, Pasta aus der offenen Küche: der Launch-Film für das neue Italiener im Hyatt Centric.",
      location: "Hyatt Centric · KLCC, Kuala Lumpur",
      video: "/videos/cases/il-forno.mp4",
      poster: "/images/cases/il-forno.jpg",
      youtube: "https://www.youtube.com/watch?v=vUdW32F-UgQ",
    },
    {
      id: "cinnamon",
      cat: "gastro",
      kind: "case",
      tag: "Buffet-Film",
      title: "Cinnamon Coffee House",
      text: "Wok-Flammen, Grill und internationale Stationen: das All-Day-Dining-Buffet in Szene gesetzt.",
      location: "One World Hotel · 1 Utama, Petaling Jaya",
      video: "/videos/cases/cinnamon.mp4",
      poster: "/images/cases/cinnamon.jpg",
      youtube: "https://www.youtube.com/watch?v=CYj5KCpYFVI",
    },
    {
      id: "the-sphere",
      cat: "gastro",
      kind: "case",
      tag: "Lounge-Film",
      title: "The Sphere Lounge",
      text: "Cocktails, High Tea und Live-Musik: die Lounge zwischen Afternoon Tea und Abendstimmung.",
      location: "One World Hotel · 1 Utama, Petaling Jaya",
      video: "/videos/cases/the-sphere.mp4",
      poster: "/images/cases/the-sphere.jpg",
      youtube: "https://www.youtube.com/watch?v=qQjFA1WtrbU",
    },
    {
      id: "lilys",
      cat: "gastro",
      kind: "case",
      tag: "Print & Digital",
      title: "LILY'S Restaurant – Speisekarte",
      text: "Redesign der Speisekarte im neuen Stil: 8 Seiten, Druck und Digital, Inhalte auf Deutsch und Englisch.",
      mock: "menu",
    },
    {
      id: "festivals",
      cat: "festival",
      kind: "case",
      tag: "Event-Kampagnen",
      title: "Clubs & Festivals",
      text: "Visuals und Kampagnen für Tomorrowland, DWP Bali, Afro Nation, splash!, O Beach Ibiza und Clubs in ganz Deutschland.",
      mock: "lineup",
    },
    {
      id: "artists",
      cat: "festival",
      kind: "case",
      tag: "Artist-Branding",
      title: "Media-Kits für Artists",
      text: "Press-Kits, KI-Shootings und Booking-Kalender – u. a. für Pierce Merrill und DJ Yuna.",
      mock: "mediakit",
    },
    {
      id: "voiceover",
      cat: "ki",
      kind: "format",
      tag: "KI-Voiceover",
      title: "Ein Clip, vier Sprachen",
      text: "Voiceover und Untertitel in DE, EN, AR und TR – für Gäste, Touristen und Communities.",
      mock: "wave",
    },
    {
      id: "reviews",
      cat: "ki",
      kind: "format",
      tag: "Automatisierung",
      title: "Bewertungen auf Autopilot",
      text: "Ein n8n-Workflow beantwortet Google-Reviews im Ton des Hauses – du gibst nur frei.",
      mock: "nodes",
    },
  ] satisfies PortfolioItem[],
};

/**
 * Referenzen aus der bisherigen Event-, Artist- und Brand-Arbeit (EDGE Eventmarketing, Spots KL).
 * Nur Namen – keine Logos oder Pressefotos (Marken- und Bildrechte liegen bei den Inhabern).
 */
export const references = {
  tag: "Referenzen",
  title: "Marken, Events & Artists, mit denen wir gearbeitet haben",
  groups: [
    { label: "Hospitality", names: ["Hyatt Centric", "One World Hotel", "Radisson Blu", "Hilton", "Marriott", "Hard Rock Hotel", "Club Med"] },
    { label: "Clubs & Festivals", names: ["Tomorrowland", "DWP Bali", "Afro Nation", "splash!", "O Beach Ibiza", "La Louve", "Gibs'n", "Shôko", "Vanity Cologne", "NF", "808"] },
    { label: "Spirits", names: ["Grey Goose", "Don Julio", "Patrón", "Bacardí"] },
    { label: "Automotive", names: ["Audi", "Volvo", "NIO", "Ford", "Emil Frey"] },
    { label: "Marken", names: ["Lufthansa", "adidas", "IQOS", "Taylor's"] },
  ],
  artists: {
    label: "Artists",
    names: [
      "Chris Brown", "Bryson Tiller", "Central Cee", "Burna Boy", "Lil Yachty", "Uncle Waffles", "DJ Hamida", "Dystinct",
      "Haftbefehl", "Luciano", "Summer Cem", "Samra", "Reezy", "Ufo361", "Celo & Abdi", "Monet192", "Kalim",
      "Dafina Zeqiri", "Dhurata Dora", "Azet & Albi", "Ardian Bujupi", "Noizy", "Yll Limani",
    ],
  },
  partners: ["Google Partner", "Meta Marketing Partner"],
};

export const process = {
  tag: "Unser Ablauf",
  title: "In 4 Schritten zum",
  accent: "Content-System",
  text: "Strukturiert, transparent und schnell – so arbeiten wir mit dir.",
  steps: [
    { title: "Deep Dive", text: "Wir lernen dein Lokal oder Festival kennen: Zielgruppe, Kanäle, Stimmung. Ehrlich und unverbindlich." },
    { title: "Der Masterplan", text: "Shotlist, Drehplan und KI-Pipeline. Vorab steht fest, welche Formate in welcher Menge entstehen." },
    { title: "Dreh & Umsetzung", text: "Premium-Equipment vor Ort, danach Schnitt, Grading und KI-Veredelung. Erste Clips nach 72 Stunden." },
    { title: "Scale & Optimize", text: "Wir messen, was performt, und produzieren Varianten nach – automatisiert, ohne neuen Drehtag." },
  ],
};

export const calculatorTeaser = {
  label: "Kostenrahmen",
  title: "Was kostet das bei uns?",
  titleAccent: "Sieh es in zwei Minuten.",
  text: "Die häufigste Frage im Erstgespräch. Stell dein Projekt selbst zusammen – Video, Foto, Website oder KI-Workflows, mit allem, was dazugehört. Du siehst sofort, in welchem Rahmen es sich bewegt.",
  pills: ["Zwei Minuten", "Ohne Anmeldung", "Unverbindlich"],
  hint: "Du bekommst einen Richtwert, kein Angebot. Was dein Projekt wirklich braucht, klären wir gemeinsam.",
  primary: { label: "Projekt durchrechnen", href: "/preisrechner" },
  secondary: { label: "Lieber direkt fragen", href: "/#kontakt" },
  example: {
    label: "So sieht das Ergebnis aus",
    /** Wird live mit der Rechner-Engine berechnet – Zahlen stimmen immer mit dem Rechner überein */
    state: {
      branche: "gastro",
      leistungen: ["video"],
      videoUmfang: "standard",
      videoExtras: ["drohne"],
      extraReels: 0,
      sprachen: 1,
      anfahrt: "lokal",
      express: false,
      contentAbo: "basis",
    },
    foot: "Beispielhafte Zusammenstellung. Deine Zahlen hängen von deinen Angaben ab.",
  },
};

export const contact = {
  tag: "Kontakt",
  title: "Bereit für Content,",
  accent: "der wirkt?",
  text: "Starte jetzt dein Projekt. Wir melden uns innerhalb von 24 Stunden bei dir.",
};

export const footer = {
  claim: "Premium-Content für Gastronomie, Festivals und Musik – skaliert mit KI-Workflows.",
};

/** Gestrichelte Box aus Seite 2 der Rechnung ("Interesse an einem Paket?") */
export const contactBox = {
  title: "Lieber direkt sprechen?",
  text: "Kurze Nachricht genügt – wir beraten dich persönlich und unverbindlich.",
};
