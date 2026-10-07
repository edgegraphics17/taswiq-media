import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "unternehmens-dashboard-kennzahlen",
  category: "software",
  title: "Unternehmens-Dashboard: Welche Kennzahlen KMU wirklich brauchen",
  description: "Welche KPIs gehören in ein Dashboard für kleine und mittlere Unternehmen? Beispiele je Branche, Datenquellen und was ein eigenes Dashboard kostet.",
  keywords: ["Dashboard für Unternehmen", "KPI Dashboard KMU", "Dashboard erstellen lassen", "Kennzahlen Dashboard", "Business Dashboard"],
  date: "2026-09-27",
  page: "dashboard",
  intro:
    "Die meisten Betriebe haben kein Datenproblem, sondern ein Sammelproblem. Umsätze stehen in der Kasse, Anfragen im Postfach, Termine im Kalender, Bewertungen bei Google. Ein Dashboard holt das an einen Ort – aber nur, wenn es die richtigen Fragen beantwortet. Hier sind die Kennzahlen, die sich im Alltag wirklich lohnen.",
  takeaways: [
    "Fünf bis acht Kennzahlen reichen. Mehr liest niemand.",
    "Jede Kennzahl braucht eine Frage, die sie beantwortet.",
    "Automatische Wochen-Reports sind oft wertvoller als ein Live-Dashboard.",
    "Ein eigenes Dashboard startet bei ca. 4.900 €.",
  ],
  sections: [
    {
      h2: "Die Grundregel: Frage vor Zahl",
      blocks: [
        {
          p: "Eine gute Kennzahl beantwortet eine Frage, die zu einer Entscheidung führt. „Umsatz gesamt“ ist interessant. „Umsatz pro Stunde je Wochentag“ entscheidet, wann du Personal einplanst. Beginne deshalb immer mit den drei bis fünf Fragen, die dich jede Woche beschäftigen.",
        },
      ],
    },
    {
      h2: "Kennzahlen, die fast jeder Betrieb braucht",
      blocks: [
        {
          ul: [
            "**Anfragen pro Woche** – und aus welchem Kanal sie kommen",
            "**Abschlussquote** – wie viele Anfragen werden zu Aufträgen?",
            "**Umsatz und Marge** pro Leistung oder Produktgruppe",
            "**Auslastung** – Termine, Maschinen, Mitarbeiter",
            "**Offene Posten** – wie viel Geld steht aus, seit wann?",
            "**Bewertungen** – Durchschnitt und neue Bewertungen pro Woche",
          ],
        },
      ],
    },
    {
      h2: "Beispiele je Branche",
      blocks: [
        {
          table: {
            head: ["Branche", "Kennzahlen mit Hebel"],
            rows: [
              ["Gastronomie", "Umsatz pro Stunde, Anteil Direktbestellungen vs. Plattform, Top-Artikel, Stornoquote"],
              ["Beauty & Salon", "Auslastung pro Mitarbeiter, No-Show-Quote, Wiederkehrrate, Umsatz pro Termin"],
              ["Immobilien", "Anfragen pro Objekt, Tage bis Vermietung, offene Schadensmeldungen"],
              ["Handwerk", "Angebote vs. Aufträge, Deckungsbeitrag pro Auftrag, Tage bis Rechnung"],
              ["Kanzlei", "Fehlende Unterlagen pro Mandant, Fristen der nächsten 14 Tage, Bearbeitungszeit"],
            ],
          },
        },
      ],
    },
    {
      h2: "Woher die Daten kommen",
      blocks: [
        {
          p: "Ein Dashboard ist nur so gut wie seine Datenquellen. Typische Quellen sind Kassensysteme, Buchhaltung, Kalender, CRM, Google-Unternehmensprofil, Website-Analytics und eigene Systeme wie ein [Bestellsystem](/leistungen/bestellsystem-ohne-provision). Viele davon bieten Schnittstellen an. Wo nicht, helfen regelmäßige Exporte, die automatisch eingelesen werden.",
        },
        {
          tip: "Unser eigenes Lead-Dashboard zeigt Anfragen, Lead-Score, Quelle und Status in einer Ansicht – gespeist aus Website-Funnel und Preisrechner. Im Portfolio findest du es als „TasWiq Lead-System“.",
        },
      ],
    },
    {
      h2: "Live-Dashboard oder Wochen-Report?",
      blocks: [
        {
          p: "Ehrlich: Viele Inhaber schauen nicht täglich in ein Dashboard. Ein automatischer Report jeden Montag um 7 Uhr per Mail oder WhatsApp – mit drei Sätzen Zusammenfassung von einer KI – wird oft mehr gelesen. Ideal ist beides: Report für den Überblick, Dashboard für die Details.",
        },
      ],
    },
    {
      h2: "Kosten",
      blocks: [
        {
          table: {
            head: ["Paket", "Richtpreis einmalig", "Enthalten"],
            rows: [
              ["Wochen-Report", "ab 890 €", "Zahlen aus allen Tools, einmal pro Woche per Mail"],
              ["Dashboard", "ab 4.900 €", "Kennzahlen aus 2–3 Quellen, täglich aktuell"],
              ["Dashboard Pro", "ab 8.900 €", "Echtzeit, Rollen, Alarme, Prognosen"],
            ],
          },
        },
      ],
    },
    {
      h2: "In vier Schritten zum eigenen Dashboard",
      blocks: [
        {
          ol: [
            "**Fragen sammeln**: Welche drei bis fünf Fragen stellst du dir jede Woche?",
            "**Quellen prüfen**: Wo liegen die Daten, gibt es Schnittstellen oder Exporte?",
            "**Prototyp**: Ein klickbares Dashboard mit Beispieldaten – passt die Sicht?",
            "**Anbindung & Automatik**: Echte Daten, Aktualisierung, Alarme, Wochen-Report.",
          ],
        },
      ],
    },
    {
      h2: "Häufige Fehler bei Dashboards",
      blocks: [
        {
          ul: [
            "**Zu viele Kennzahlen**: 30 Diagramme auf einer Seite liest niemand.",
            "**Keine Vergleichswerte**: Eine Zahl ohne Vorwoche oder Ziel sagt wenig.",
            "**Falsche Datenbasis**: Wenn Zahlen im Dashboard von der Buchhaltung abweichen, verliert es sofort Vertrauen.",
            "**Kein Besitzer**: Jemand muss verantworten, dass Definitionen stimmen und das Dashboard genutzt wird.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Reicht nicht ein Tool wie Google Looker Studio?",
      a: "Für Marketing-Daten oft ja. Sobald Daten aus Kasse, eigener Software und Buchhaltung zusammenkommen oder Mitarbeiter unterschiedliche Rechte brauchen, lohnt sich ein eigenes Dashboard.",
    },
    {
      q: "Kann das Dashboard auch warnen?",
      a: "Ja. Zum Beispiel, wenn die Auslastung nächste Woche unter 60 % liegt oder eine Rechnung 30 Tage offen ist – per Mail, Push oder WhatsApp.",
    },
    {
      q: "Wie aktuell sind die Daten?",
      a: "Je nach Quelle in Echtzeit, stündlich oder täglich. Das legen wir pro Kennzahl fest.",
    },
  ],
};
