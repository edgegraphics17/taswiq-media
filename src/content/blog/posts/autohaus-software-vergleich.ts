import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "autohaus-software-vergleich",
  category: "branchen",
  title: "Autohaus-Software im Vergleich: DMS, CRM, Börsen-Tools und eigenes Kundenportal",
  seoTitle: "Autohaus-Software im Vergleich: DMS, CRM, Kundenportal",
  description: "Autohaus-Software im Vergleich: Was DMS, CRM und Börsen-Tools leisten, wo die Lücke zum Kunden bleibt und was ein eigenes Kundenportal kostet.",
  keywords: ["Autohaus Software Vergleich", "Autohaus Software", "DMS Autohaus", "Werkstatt Software", "Kundenportal Autohaus"],
  date: "2026-10-08",
  page: "automotive",
  intro:
    "Autohaus-Software besteht im Vergleich aus vier Bausteinen, die verschiedene Aufgaben lösen: das Dealer-Management-System (DMS) für Aufträge, Teile und Abrechnung, ein CRM für Verkauf und Nachfassen, die Werkzeuge der Fahrzeugbörsen für Inserate – und die Schnittstelle zum Kunden: Terminbuchung, Fahrzeugstatus und Freigaben. Die ersten drei kaufst du im Standard. Der vierte ist die Lücke, in der die meisten Anrufe entstehen, und dort lohnt sich ein eigenes Kundenportal ab 2.200 € oder ab 239 € im Monat.",
  takeaways: [
    "Vergleiche Bausteine, nicht Marken: DMS, CRM, Börsen-Tools und Kundenportal lösen unterschiedliche Aufgaben.",
    "Das DMS bleibt das Fundament – ersetz es nicht durch Eigenentwicklung.",
    "Die meisten Anrufe entstehen an der Kundenschnittstelle: Termin, Status, Freigabe von Zusatzarbeiten.",
    "Ein eigenes Kundenportal ergänzt das DMS und kostet ab 2.200 € einmalig oder ab 239 € im Monat.",
  ],
  sections: [
    {
      h2: "Welche Arten von Autohaus-Software gibt es?",
      blocks: [
        {
          table: {
            head: ["Baustein", "Aufgabe", "Typische Grenze", "Kaufen oder bauen?"],
            rows: [
              ["Dealer-Management-System (DMS)", "Werkstattaufträge, Teile, Fahrzeugbestand, Fakturierung, Herstelleranbindung", "Für Mitarbeiter gebaut, kein Zugang für Kunden", "Standard kaufen"],
              ["CRM und Lead-Management", "Anfragen, Probefahrten, Nachfassen, Verkaufschancen", "Kennt den Werkstattkunden oft nicht", "Standard kaufen"],
              ["Börsen-Werkzeuge (z. B. mobile.de, AutoScout24)", "Inserate, Anfragen aus der Börse, Preisvergleich", "Kontakte entstehen auf der Plattform, nicht bei dir", "Mit dem Inserat nutzen"],
              ["Kundenportal und Online-Termine", "Termin buchen, Fahrzeugstatus, Freigabe, Erinnerung an HU und Service", "Im Standard selten unter eigenem Namen und im eigenen Ablauf", "Hier lohnt sich eine eigene Lösung"],
            ],
            caption: "Die genannten Börsen sind Beispiele. Welches DMS infrage kommt, hängt bei Markenhändlern von den Vorgaben des Herstellers ab.",
          },
        },
      ],
    },
    {
      h2: "Worauf kommt es beim DMS-Vergleich an?",
      blocks: [
        {
          p: "Beim DMS entscheidet selten der Funktionsumfang – die großen Systeme können alle das Wesentliche. Es entscheiden diese Punkte:",
        },
        {
          ol: [
            "**Herstellerfreigabe:** Welche Systeme lässt dein Hersteller zu, und welche Schnittstellen verlangt er?",
            "**Schnittstellen nach außen:** Gibt es eine dokumentierte Schnittstelle für Termine, Aufträge und Kundendaten?",
            "**Datenexport:** Bekommst du Kunden, Fahrzeuge und Historie vollständig heraus?",
            "**Werkstattplanung:** Lassen sich Bühnen, Mechaniker und Leihwagen in einem Plan führen?",
            "**Kosten je Arbeitsplatz:** Was zahlst du, wenn das Team wächst?",
            "**Umstellung:** Wie lange dauert der Wechsel, und wer übernimmt die Altdaten?",
          ],
        },
        {
          tip: "Frag jeden DMS-Anbieter nach der Schnittstelle für Online-Termine. An dieser einen Antwort erkennst du, ob du später ein Kundenportal anbinden kannst – oder ob Termine doppelt gepflegt werden müssen.",
        },
      ],
    },
    {
      h2: "Wo bleibt bei Standard-Software die Lücke?",
      blocks: [
        {
          p: "DMS und CRM sind für die Arbeit im Betrieb gebaut. Der Kunde sieht davon nichts. Deshalb klingelt das Telefon in der Annahme: für den Termin, für die Frage nach dem Stand, für die Freigabe einer Zusatzarbeit. Jeder dieser Anrufe unterbricht jemanden, und bei der Freigabe steht währenddessen die Bühne.",
        },
        {
          ul: [
            "**Termin:** Der Kunde wählt Leistung, Tag und Mobilität selbst – mit Richtpreis und Dauer.",
            "**Status:** Er sieht wie bei einer Paketverfolgung, wo sein Fahrzeug steht.",
            "**Freigabe:** Befund mit Foto und Preis aufs Handy, Zusage mit einem Tipp und Zeitstempel.",
            "**Erinnerung:** Wer bald zur Hauptuntersuchung muss, bekommt den Buchungslink.",
          ],
        },
        {
          p: "Genau diese vier Abläufe kannst du in der [Werkstatt-Demo](/demo/werkstatt) durchspielen: als Kunde buchen und freigeben, im Dashboard den Werkstattplan sehen. Den Leitfaden zur Einführung findest du unter [Werkstatt-Termin online buchen](/blog/werkstatt-termin-online-buchen).",
        },
      ],
    },
    {
      h2: "Was kostet ein eigenes Kundenportal fürs Autohaus?",
      blocks: [
        {
          table: {
            head: ["Paket", "Preis", "Für wen", "Live in"],
            rows: [
              ["Online-Termine", "2.200 € einmalig oder ab 239 € im Monat zur Miete", "Werkstätten, Reifenservice, Aufbereiter", "2–3 Wochen"],
              ["Kunden-App", "3.900 € einmalig oder ab 309 € im Monat zur Miete", "Autohäuser, Fahrschulen, Vermieter", "4–6 Wochen"],
              ["Betriebs-Plattform", "ab 10.900 € einmalig oder ab 599 € im Monat zur Miete", "Vermietung, Handel, Betriebe mit eigenen Abläufen", "nach Umfang"],
            ],
            caption: "Endpreise nach § 19 UStG. Schnittstelle zum DMS als Zusatz: 1.490 €, sofern das DMS eine anbietet. Den Festpreis gibt es nach dem Prototyp.",
          },
        },
        {
          p: "DMS und CRM werden üblicherweise monatlich je Arbeitsplatz oder als Paket abgerechnet; die Preise bekommst du als Angebot vom Anbieter. Das Kundenportal kostet unabhängig von der Zahl der Arbeitsplätze. Deinen Rahmen siehst du im [Preisrechner](/preisrechner), Umfang und Ablauf auf der Seite [Software für Autohaus, Werkstatt und Fahrschule](/leistungen/software-autohaus-fahrschule).",
        },
      ],
    },
    {
      h2: "In welcher Reihenfolge solltest du vorgehen?",
      blocks: [
        {
          ol: [
            "**Anrufe zählen.** Zwei Wochen lang notieren, warum Kunden anrufen: Termin, Status, Freigabe, Preis.",
            "**DMS-Schnittstelle klären.** Was lässt sich lesen und schreiben, was kostet der Zugang?",
            "**Mit Terminen starten.** Online-Buchung bringt den schnellsten Effekt und das geringste Risiko.",
            "**Status und Freigabe ergänzen.** Erst wenn die Buchung läuft und das Team sie nutzt.",
            "**Messen.** Anrufe pro Tag, Anteil online gebuchter Termine, Zeit bis zur Freigabe.",
          ],
        },
        {
          p: "Weitere Ansatzpunkte für Autohaus, Werkstatt und Fahrschule beschreibt der Ratgeber zur [Digitalisierung im Autohaus](/blog/digitalisierung-autohaus-fahrschule).",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Welche Autohaus-Software ist die beste?",
      a: "Es gibt nicht die eine. Beim DMS entscheidet oft die Herstellervorgabe, beim CRM die Größe des Verkaufsteams. Den größten Unterschied für Kunden macht die Schnittstelle nach außen: Online-Termine, Status und Freigabe.",
    },
    {
      q: "Kann eigene Software das DMS ersetzen?",
      a: "Davon raten wir ab. Abrechnung, Teilewirtschaft und Herstelleranbindung sind im Standard gut gelöst und aufwendig nachzubauen. Sinnvoll ist eine eigene Lösung für das, was der Kunde sieht – verbunden mit dem DMS über eine Schnittstelle.",
    },
    {
      q: "Funktioniert ein Kundenportal auch ohne DMS-Schnittstelle?",
      a: "Ja. Termine und Freigaben laufen dann im Portal, und das Team überträgt sie in das DMS. Für kleine Werkstätten reicht das oft. Mit Schnittstelle entfällt die doppelte Pflege.",
    },
    {
      q: "Was kostet Online-Terminbuchung für eine Werkstatt?",
      a: "Das Paket Online-Termine kostet einmalig 2.200 € oder ab 239 € im Monat zur Miete und ist in zwei bis drei Wochen live. Mit Erinnerungen und Anzahlung ab 3.900 €.",
    },
    {
      q: "Für welche Betriebe lohnt sich das?",
      a: "Für freie Werkstätten, Markenhändler, Reifenservice und Aufbereiter, bei denen das Telefon die Annahme blockiert. Wer am Tag nur wenige Termine hat und sie selbst vergibt, braucht kein Portal.",
    },
  ],
};
