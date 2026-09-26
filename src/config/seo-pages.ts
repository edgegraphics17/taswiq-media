import type { FunnelIndustry, InterestId } from "@/config/funnel";

/**
 * Geo-SEO-Landingpages unter /leistungen/[slug] – je eine Seite pro Suchintention.
 * Aufbau wie die asap-Produktseite (Hero → Problem → Funktionen → Paket → FAQ → Funnel).
 *
 * Städte-Seiten später: gleichen Eintrag mit `city` duplizieren, z. B.
 * "festival-videograf-koeln" – Title, H1 und JSON-LD `areaServed` ziehen die Stadt automatisch.
 */

export interface SeoPage {
  slug: string;
  navLabel: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  industry: FunnelIndustry;
  interests: InterestId[];
  hero: { badge: string; titleStart: string; titleHighlight: string; text: string };
  problem: { title: string; text: string; points: string[] };
  features: { title: string; text: string }[];
  /** Name eines Pakets aus pipeline.ts */
  highlightPackage: string;
  faq: { q: string; a: string }[];
  city?: string;
}

export const seoPages: SeoPage[] = [
  {
    slug: "medienagentur-gastronomie",
    navLabel: "Medienagentur Gastronomie",
    keyword: "Medienagentur Gastronomie",
    metaTitle: "Medienagentur für Gastronomie – Food-Fotos, Reels & Speisekarte",
    metaDescription:
      "Medienagentur für Restaurants, Bars & Cafés: Food-Fotografie, Reels im Wochenrhythmus, digitale Speisekarte und Google-Profil. Festpreise, erste Clips in 72 h.",
    keywords: ["Medienagentur Gastronomie", "Restaurant Marketing Agentur", "Food Fotograf", "Gastro Social Media", "digitale Speisekarte"],
    industry: "gastro",
    interests: ["reels", "foto", "social"],
    hero: {
      badge: "Medienagentur für Gastronomie",
      titleStart: "Bilder, die",
      titleHighlight: "Tische füllen",
      text: "Food-Fotografie, Reels und Social Media für Restaurants, Bars und Cafés – plus digitale Speisekarte und Google-Profil. Ein Dreh im Monat, Content für jede Woche.",
    },
    problem: {
      title: "Gäste entscheiden auf dem Handy, bevor sie deine Tür sehen.",
      text: "Google-Profil, Instagram, TikTok – dort wird heute reserviert. Wer dort mit dunklen Handyfotos oder gar nicht auftaucht, verliert gegen den Laden nebenan.",
      points: [
        "Food-Fotos, die auf Karte, Google und Lieferdiensten gleich gut aussehen",
        "Jede Woche neue Reels, ohne dass du im Service filmen musst",
        "Digitale Speisekarte mit QR-Code – Preise in Sekunden geändert",
        "Google-Profil gepflegt, damit du bei „Restaurant in der Nähe“ auftauchst",
      ],
    },
    features: [
      { title: "Food-Fotografie", text: "Teller, Drinks und Atmosphäre – mit Food-Styling und Licht wie im Magazin." },
      { title: "Reels im Wochenrhythmus", text: "12 Reels pro Monat aus einem halben Drehtag, geplant und getextet." },
      { title: "Digitale Speisekarte", text: "Mobile Karte mit QR-Codes für Tische und Fenster – ab 199 €." },
      { title: "Website mit Reservierung", text: "Tischreservierung rund um die Uhr, ohne Provision an Plattformen." },
      { title: "Google & Bewertungen", text: "Profil-Pflege und KI-gestützte Antworten auf Reviews in deinem Ton." },
      { title: "Mehrsprachig", text: "Karte und Clips in DE, EN, AR oder TR – für Touristen und Communities." },
    ],
    highlightPackage: "Gastro Social-Retainer",
    faq: [
      { q: "Was kostet eine Medienagentur für Gastronomie?", a: "Einzelne Leistungen starten bei 199 € (digitale Speisekarte) und 390 € (Food-Foto Express). Der Social-Retainer mit Dreh, 12 Reels und 20 Fotos pro Monat kostet 1.490 € monatlich. Im Preisrechner siehst du deinen Rahmen in zwei Minuten." },
      { q: "Stört der Dreh den laufenden Service?", a: "Nein. Wir drehen Food und Küche vor dem Service und Atmosphäre im laufenden Betrieb mit kleinem Setup – Gäste filmen wir nur mit Einverständnis." },
      { q: "Kann ich Preise auf der digitalen Speisekarte selbst ändern?", a: "Ja, jederzeit. Die Karte ist sofort aktualisiert, die QR-Codes bleiben gleich." },
      { q: "Postet ihr auch für uns?", a: "Im Retainer ja: Wir planen, texten und posten. Du gibst in einer Freigabe-Runde pro Monat frei." },
    ],
  },
  {
    slug: "festival-videograf",
    navLabel: "Festival-Videograf",
    keyword: "Festival Videograf",
    metaTitle: "Festival-Videograf – Aftermovies in 7 Tagen, Reels & KI-Promo",
    metaDescription:
      "Festival-Videograf für Open Airs, Clubs und Konzerte: Multi-Cam-Aftermovie in 7 Tagen, Social-Cutdowns und KI-Ad-Varianten für den Vorverkauf. Deutschlandweit.",
    keywords: ["Festival Videograf", "Aftermovie erstellen lassen", "Eventvideograf", "Konzert Videograf", "Club Aftermovie"],
    industry: "musik",
    interests: ["aftermovie", "musikvideo", "ki_content"],
    hero: {
      badge: "Festival-Videograf",
      titleStart: "Aftermovies, die den",
      titleHighlight: "Vorverkauf starten",
      text: "Multi-Cam-Dreh auf deinem Festival, Aftermovie in 7 Tagen und Social-Cutdowns für jede Plattform. Mit KI-Varianten für die Ads der nächsten Saison – in mehreren Sprachen.",
    },
    problem: {
      title: "Das Aftermovie ist die beste Werbung fürs nächste Jahr.",
      text: "Wenn es erst drei Monate später kommt, ist der Hype vorbei. Wir liefern, solange die Crowd noch darüber spricht.",
      points: [
        "Aftermovie in 7 Tagen – mit Express sogar in 72 Stunden",
        "Cutdowns für Reels, TikTok und Stories direkt mitgeliefert",
        "20+ Ad-Varianten für Early-Bird- und Vorverkaufs-Kampagnen",
        "Line-up-Reveals und Visualizer mit KI-generierten Szenen",
      ],
    },
    features: [
      { title: "Multi-Cam & Drohne", text: "Bühne, Crowd, Backstage und Luftbilder – mit zwei oder mehr Kameras." },
      { title: "Aftermovie in 4K", text: "2–3 Minuten Film mit lizenzfreier Musik und Kino-Grading." },
      { title: "Social-Cutdowns", text: "Hochkant-Clips für Reels und TikTok, direkt nach dem Event." },
      { title: "KI-Ad-Varianten", text: "Hooks, Längen und Formate für A/B-Tests im Vorverkauf." },
      { title: "Artist-Content", text: "Clips für auftretende Artists – mehr Reichweite für dein Event." },
      { title: "Mehrsprachig", text: "Voiceover und Untertitel für internationale Besucher." },
    ],
    highlightPackage: "AI-Enhanced Promo",
    faq: [
      { q: "Was kostet ein Festival-Aftermovie?", a: "Unser Classic Aftermovie mit einem Drehtag, zwei Kameras und 6 Social-Cutdowns kostet 2.490 €. Mit KI-Varianten und Voiceover (AI-Enhanced Promo) 3.490 €. Mehrtägige Festivals rechnest du im Preisrechner." },
      { q: "Wie schnell ist das Aftermovie fertig?", a: "In 7 Tagen, erste Cutdowns nach 72 Stunden. Mit Express-Option liefern wir alles in 72 Stunden." },
      { q: "Dreht ihr auch mehrtägige Festivals?", a: "Ja. Für mehrere Tage planen wir Crew und Kameras entsprechend – der Rechner zeigt dir den Rahmen." },
      { q: "Dürfen wir das Material für Werbung nutzen?", a: "Ja, du erhältst volle, unbegrenzte Nutzungsrechte an allen finalen Dateien." },
    ],
  },
  {
    slug: "ki-marketing-agentur",
    navLabel: "KI-Marketing-Agentur",
    keyword: "KI Marketing Agentur",
    metaTitle: "KI-Marketing-Agentur – Content-Pipelines, Voiceover & Automatisierung",
    metaDescription:
      "KI-Marketing-Agentur für Gastronomie und Events: Content-Pipelines, KI-Voiceover in 4 Sprachen, Ad-Varianten und n8n-Automatisierungen – eingerichtet und betreut.",
    keywords: ["KI Marketing Agentur", "KI Content Agentur", "KI Voiceover", "n8n Automatisierung Agentur", "KI Video Produktion"],
    industry: "andere",
    interests: ["ki_content", "automation"],
    hero: {
      badge: "KI-Marketing-Agentur",
      titleStart: "KI, die",
      titleHighlight: "wirklich Content liefert",
      text: "Keine Tool-Demo, sondern fertige Ergebnisse: Content-Pipelines, Voiceover in vier Sprachen, Ad-Varianten und Automatisierungen, die dir jeden Tag Arbeit abnehmen.",
    },
    problem: {
      title: "KI-Tools gibt es genug. Was fehlt, ist jemand, der sie zum Laufen bringt.",
      text: "Zwischen „ChatGPT ausprobiert“ und „läuft jeden Tag von allein“ liegt Arbeit: Prompts, Freigaben, Markenlook, Schnittstellen. Die übernehmen wir.",
      points: [
        "Content-Pipeline: aus einem Dreh 12–30 Clips in allen Formaten",
        "KI-Voiceover und Untertitel in DE, EN, AR und TR",
        "n8n-Workflows für Captions, Bewertungen und Anfragen",
        "Reporting, das dir sagt, was funktioniert – statt Tabellen",
      ],
    },
    features: [
      { title: "Content-Pipelines", text: "Automatisierter Schnitt mit menschlicher Endkontrolle." },
      { title: "KI-Voiceover", text: "Deine Stimme oder Premium-Stimmen in mehreren Sprachen." },
      { title: "Ad-Varianten", text: "Dutzende Varianten für A/B-Tests auf Meta und TikTok." },
      { title: "n8n-Automatisierung", text: "Workflows, die auf deinen Konten laufen und dir gehören." },
      { title: "Bewertungs-Antworten", text: "Google-Reviews im Ton des Hauses, du gibst nur frei." },
      { title: "Betreuung", text: "Monitoring, Updates und Weiterentwicklung ab 49 € im Monat." },
    ],
    highlightPackage: "AI-Enhanced Promo",
    faq: [
      { q: "Was kostet eine KI-Automatisierung?", a: "Ein einzelner Workflow startet bei 490 € einmalig, Betreuung ab 49 € im Monat. Die komplette Content-Pipeline ist Teil der AI-Enhanced Promo für 3.490 €." },
      { q: "Wem gehören die Workflows?", a: "Dir. Wir bauen auf deinen Konten, du bekommst Zugang und Dokumentation." },
      { q: "Ist KI-Content erkennbar?", a: "Generierte Szenen und KI-Stimmen kennzeichnen wir auf Wunsch. Gerichte, Gäste und Bühnen filmen wir immer echt." },
      { q: "Arbeitet ihr DSGVO-konform?", a: "Wir wählen Anbieter mit EU-Verarbeitung wo möglich, schließen Auftragsverarbeitungsverträge und dokumentieren die Datenflüsse." },
    ],
  },
];

export const getSeoPage = (slug: string) => seoPages.find((p) => p.slug === slug);
