import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "was-kostet-eine-website",
  category: "ratgeber",
  title: "Was kostet eine Website 2026? Preise, Leistungen und versteckte Kosten",
  description: "Website-Kosten 2026 realistisch: One-Pager, Business-Website, Website mit Buchung oder Shop – mit Richtpreisen, laufenden Kosten und Checkliste.",
  keywords: ["Was kostet eine Website", "Website Kosten 2026", "Website erstellen lassen Kosten", "Homepage Kosten", "Website für kleine Unternehmen"],
  date: "2026-09-27",
  page: "website",
  intro:
    "Zwischen 500 € und 50.000 € ist alles möglich – und genau das macht die Frage so schwer. Der Preis einer Website hängt weniger von der Anzahl der Seiten ab als davon, was sie für dein Geschäft leisten soll: informieren, Anfragen bringen, Termine verkaufen oder Bestellungen abwickeln. Hier bekommst du realistische Richtwerte und eine Checkliste für Angebote.",
  takeaways: [
    "One-Pager ab ca. 1.490 €, Business-Website ab ca. 2.490 €, Website Pro ab ca. 4.490 €.",
    "Buchung oder Bestellung machen aus der Website ein System – und aus Besuchern Umsatz.",
    "Laufende Kosten: Hosting, Wartung, Updates – ab ca. 49 € im Monat.",
    "SEO und Sichtbarkeit in KI-Suchen sind 2026 Pflicht, nicht Extra.",
  ],
  sections: [
    {
      h2: "Richtpreise im Überblick",
      blocks: [
        {
          table: {
            head: ["Typ", "Richtpreis einmalig", "Geeignet für"],
            rows: [
              ["One-Pager", "ab 1.490 €", "Kleine Betriebe, Launch, Events"],
              ["Business-Website", "ab 2.490 €", "Bis 8 Seiten, CMS, Anfrage-Funnel, SEO-Basis"],
              ["Website Pro", "ab 4.490 €", "Mehrsprachig, Blog, Landingpages, Tracking"],
              ["Website + Buchungssystem", "ab 5.390 €", "Salons, Praxen, Werkstätten, Coaches"],
              ["Website + Bestellsystem", "ab 6.390 €", "Restaurants, Bäckereien, Lieferdienste"],
            ],
            caption: "Richtwerte, Endpreise nach § 19 UStG. Den genauen Rahmen zeigt der Preisrechner.",
          },
        },
      ],
    },
    {
      h2: "Was den Preis wirklich bestimmt",
      blocks: [
        {
          ul: [
            "**Ziel der Website**: Visitenkarte, Anfragen-Maschine oder Verkaufssystem?",
            "**Inhalte**: Hast du Texte und Fotos – oder erstellen wir sie? Texte und Bilder sind oft der größte Zeitfaktor.",
            "**Funktionen**: Buchung, Bestellung, Kundenlogin, Mehrsprachigkeit, Schnittstellen.",
            "**Design**: Vorlage angepasst oder individuell gestaltet?",
            "**Sichtbarkeit**: Technisches SEO, lokales SEO, Google-Profil, Optimierung für KI-Suchen (GEO).",
          ],
        },
      ],
    },
    {
      h2: "Laufende Kosten, die oft vergessen werden",
      blocks: [
        {
          ul: [
            "Domain und E-Mail-Postfächer",
            "Hosting und SSL-Zertifikat",
            "Sicherheitsupdates und Backups",
            "Kleine Änderungen: neue Preise, Öffnungszeiten, Team-Fotos",
            "Lizenzen für Plugins oder Themes, falls verwendet",
          ],
        },
        { p: "Bei uns sind Hosting, SSL, Backups und Sicherheitsupdates ab 49 € im Monat enthalten, mit Support und kleinen Änderungen ab 149 € im Monat." },
      ],
    },
    {
      h2: "SEO und KI-Suche: 2026 kein Extra mehr",
      blocks: [
        {
          p: "Immer mehr Menschen fragen nicht mehr nur Google, sondern auch ChatGPT, Gemini oder die KI-Antworten in der Google-Suche. Damit deine Website dort auftaucht, braucht sie klare Strukturen, strukturierte Daten, eindeutige Antworten auf typische Fragen und eine Datei wie **llms.txt**, die dein Unternehmen für KI-Systeme beschreibt. Wir nennen das GEO – Generative Engine Optimization – und bauen es von Anfang an ein.",
        },
      ],
    },
    {
      h2: "Checkliste für Website-Angebote",
      blocks: [
        {
          ol: [
            "Gehören dir Domain, Inhalte und Code?",
            "Ist Hosting in der EU enthalten – und was kostet es nach dem ersten Jahr?",
            "Kannst du Inhalte selbst ändern?",
            "Sind Impressum, Datenschutz und Cookie-Lösung berücksichtigt?",
            "Ist die Website auf dem Handy getestet – nicht nur verkleinert?",
            "Wie schnell lädt sie? Frag nach den Core Web Vitals.",
            "Was passiert, wenn du den Anbieter wechseln willst?",
          ],
        },
        {
          p: "Beispiele für Websites, die Anfragen bringen, findest du im [Portfolio](/portfolio) – vom Job-Coaching in Rhein-Main bis zum Friseursalon mit eigener Buchung.",
        },
      ],
    },
    {
      h2: "Website oder direkt ein System?",
      blocks: [
        {
          p: "Für viele Betriebe ist die Website nur der erste Schritt. Wer Termine vergibt, Bestellungen annimmt oder Unterlagen einsammelt, sollte gleich mitdenken, welches System dahinter stehen soll. Das spart doppelte Arbeit: Die Website wird so gebaut, dass [Buchung](/leistungen/online-buchungssystem), [Bestellung](/leistungen/bestellsystem-ohne-provision) oder ein Kundenportal später ohne Neubau dazukommen.",
        },
      ],
    },
    {
      h2: "So sparst du bei deiner Website, ohne an der Wirkung zu sparen",
      blocks: [
        {
          ul: [
            "**Texte selbst vorbereiten**: Stichpunkte zu Leistungen, Preisen und Ablauf beschleunigen alles.",
            "**Gute Fotos nutzen**: Echte Bilder deines Betriebs schlagen jedes Stockfoto.",
            "**Mit dem Wichtigsten starten**: Eine starke Startseite und die Top-Leistungen zuerst, weitere Seiten später.",
            "**Google-Profil nicht vergessen**: Für lokale Betriebe oft wichtiger als jede Unterseite.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Warum sind Baukasten-Websites so viel günstiger?",
      a: "Weil du die Arbeit selbst machst und Funktionen, Geschwindigkeit und SEO begrenzt sind. Für den Start kann das reichen. Sobald die Website Anfragen oder Umsatz bringen soll, lohnt sich eine professionelle Lösung.",
    },
    {
      q: "Wie lange dauert eine Website?",
      a: "Ein One-Pager ist oft in einer Woche online, eine Business-Website in zwei bis vier Wochen – abhängig davon, wie schnell Inhalte vorliegen.",
    },
    {
      q: "Kann ich später Buchung oder Bestellung ergänzen?",
      a: "Ja. Wir bauen Websites so, dass Systeme wie Buchung, Bestellung oder Kundenlogin später nahtlos dazukommen.",
    },
  ],
};
