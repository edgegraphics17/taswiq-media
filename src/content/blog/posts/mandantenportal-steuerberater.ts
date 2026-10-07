import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "mandantenportal-steuerberater",
  category: "branchen",
  title: "Mandantenportal für Steuerberater und Kanzleien: Belege digital statt Pendelordner",
  seoTitle: "Mandantenportal für Steuerberater: Belege digital",
  description: "Wie ein eigenes Mandantenportal Belege, Fristen und Rückfragen bündelt – als Ergänzung zu DATEV, DSGVO-konform und mit KI-Belegerkennung.",
  keywords: ["Mandantenportal Steuerberater", "Software Steuerberater", "Kanzlei Digitalisierung", "Belege digital einreichen", "Mandantenportal Kanzlei"],
  date: "2026-09-27",
  page: "kanzlei",
  intro:
    "In vielen Kanzleien ist die Fachsoftware längst digital – der Weg der Unterlagen dorthin aber nicht. Belege kommen als Foto per WhatsApp, als Mail-Anhang oder im Pendelordner. Rückfragen laufen über drei Kanäle, und am Monatsende fehlt trotzdem die Hälfte. Ein eigenes Mandantenportal räumt genau diese Strecke auf.",
  takeaways: [
    "Das Portal ersetzt nicht die Fachsoftware, sondern die chaotische Strecke davor.",
    "Mandanten sehen per Checkliste, welche Unterlagen noch fehlen.",
    "KI liest Belege aus und schlägt Zuordnungen vor – ein Mensch prüft.",
    "Hosting in der EU, Rollen und Rechte, Protokollierung sind Pflicht.",
  ],
  sections: [
    {
      h2: "Das eigentliche Problem: der Weg der Unterlagen",
      blocks: [
        {
          p: "Viele Kanzleien arbeiten mit DATEV oder vergleichbarer Fachsoftware, und das ist gut so. Ein Mandantenportal ersetzt diese Systeme nicht. Es sitzt **davor**: Es sammelt Belege, Fragen und Freigaben strukturiert ein und übergibt sie sauber an die Fachsoftware oder an den Sachbearbeiter.",
        },
        {
          p: "Der Effekt zeigt sich vor allem bei den vielen kleinen Mandanten: Selbstständige, kleine GmbHs, Vermieter. Sie reichen unregelmäßig ein, fragen oft nach und brauchen viel Hinterherlaufen.",
        },
      ],
    },
    {
      h2: "Was ein gutes Mandantenportal kann",
      blocks: [
        {
          ul: [
            "**Belege hochladen** per Handy-Foto, PDF oder Weiterleitung aus dem Mail-Postfach",
            "**Checklisten pro Mandant**: Was fehlt noch für den Monat, das Quartal, den Jahresabschluss?",
            "**Fristen-Übersicht** mit automatischen Erinnerungen an Mandanten",
            "**Rückfragen am Beleg** statt in langen Mail-Verläufen",
            "**Freigaben** für Erklärungen und Dokumente mit Zeitstempel",
            "**Termine buchen** für Beratungsgespräche direkt aus dem Portal",
          ],
        },
        {
          p: "Ein gutes Vorbild für diese Art von Oberfläche ist [Antragsbruder](/portfolio), eine Web-App, die wir gebaut haben: Nutzer laden Briefe und Unterlagen hoch, bekommen erklärt, was verlangt wird, und sehen per Checkliste, was noch fehlt – in neun Sprachen.",
        },
      ],
    },
    {
      h2: "KI-Belegerkennung: sinnvoll, wenn ein Mensch prüft",
      blocks: [
        {
          p: "Moderne KI-Modelle erkennen Rechnungsdatum, Betrag, Steuersatz und Lieferant zuverlässig und schlagen eine Zuordnung vor. Der Sachbearbeiter bestätigt oder korrigiert. So wird aus Abtippen ein kurzes Prüfen. Wichtig ist, dass die Verarbeitung datenschutzkonform läuft und Daten nicht zum Training fremder Modelle verwendet werden.",
        },
        { tip: "Unser Grundsatz bei KI in sensiblen Bereichen: Die KI schlägt vor, der Mensch entscheidet. Jede Entscheidung wird protokolliert." },
      ],
    },
    {
      h2: "Datenschutz und Sicherheit",
      blocks: [
        {
          ul: [
            "Hosting und Datenbank in der EU",
            "Verschlüsselte Übertragung und Speicherung",
            "Rollen und Rechte: Mandant, Sachbearbeiter, Berufsträger",
            "Zwei-Faktor-Anmeldung für Kanzlei-Mitarbeiter",
            "Protokoll: Wer hat wann was hochgeladen, geändert oder freigegeben?",
            "Auftragsverarbeitungsvertrag für alle beteiligten Dienste",
          ],
        },
        {
          p: "Die Softwareentwicklung und Beratung erfolgen durch unser Team in Deutschland. Unser Technologiepartner winsym.ai unterstützt bei KI-Methodik und Modellauswahl – Mandantendaten verlassen dabei die vereinbarte EU-Infrastruktur nicht.",
        },
      ],
    },
    {
      h2: "Kosten und Ablauf",
      blocks: [
        {
          p: "Ein Kundenportal mit Login, Dokumenten, Status und Nachrichten startet bei rund 7.400 €, mit Workflows, Freigaben und Rollen bei rund 12.900 €. KI-Belegerkennung kommt als Modul hinzu. Der Betrieb inklusive Updates und Support liegt ab 149 € im Monat.",
        },
        {
          ol: [
            "Workshop: Welche Mandantengruppen, welche Unterlagen, welche Fristen?",
            "Klickbarer Prototyp in sieben Tagen – Test mit drei echten Mandanten",
            "Entwicklung in Etappen, jede Etappe ist nutzbar",
            "Einführung mit Anleitung für Mandanten und Team",
          ],
        },
      ],
    },
    {
      h2: "So bringst du Mandanten ins Portal",
      blocks: [
        {
          p: "Das beste Portal nützt nichts, wenn Mandanten weiter per WhatsApp schicken. Diese Schritte helfen bei der Einführung:",
        },
        {
          ol: [
            "**Mit einer Pilotgruppe starten**: zehn Mandanten, die digital affin sind und regelmäßig einreichen.",
            "**Onboarding in zwei Minuten**: Einladung per Mail, Passwort setzen, erste Checkliste sehen.",
            "**Kurze Anleitung als Video** – ein Handy-Video genügt.",
            "**Freundlich konsequent**: Unterlagen per Mail werden ins Portal übernommen, mit Hinweis auf den einfacheren Weg.",
            "**Nutzen zeigen**: Mandanten sehen, was fehlt, und bekommen weniger Rückfragen.",
          ],
        },
      ],
    },
    {
      h2: "Welche Kanzleien profitieren am meisten?",
      blocks: [
        {
          ul: [
            "Kanzleien mit vielen kleinen Mandanten – Selbstständige, Vermieter, kleine GmbHs",
            "Kanzleien mit mehreren Standorten oder mobilem Team",
            "Anwaltskanzleien mit vielen Dokumenten pro Mandat",
            "Versicherungsmakler, die Unterlagen für Anträge und Schäden einsammeln",
            "Coaches und Bildungsträger, die Nachweise und Unterlagen brauchen",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Ersetzt das Portal DATEV Unternehmen online oder ähnliche Lösungen?",
      a: "Nein. Es ergänzt sie. Wo eine Schnittstelle vorhanden ist, übergeben wir Daten direkt. Wo nicht, bereitet das Portal alles so vor, dass die Übernahme schnell geht.",
    },
    {
      q: "Brauchen Mandanten eine App?",
      a: "Nein. Das Portal läuft im Browser und lässt sich auf dem Handy wie eine App auf den Homescreen legen – ohne App Store.",
    },
    {
      q: "Eignet sich das auch für Anwaltskanzleien und Versicherungsmakler?",
      a: "Ja. Das Prinzip ist gleich: Unterlagen sicher einsammeln, Status zeigen, Fristen im Blick behalten. Nur die Checklisten unterscheiden sich.",
    },
  ],
};
