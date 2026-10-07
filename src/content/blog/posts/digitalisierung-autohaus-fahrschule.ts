import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "digitalisierung-autohaus-fahrschule",
  category: "branchen",
  title: "Digitalisierung in Autohaus, Werkstatt und Fahrschule: Online-Termine, Fahrzeugbörse und Schüler-App",
  description: "Werkstatttermine online, Fahrzeuganfragen ohne Portal-Gebühr, Fahrstunden per App buchen: So digitalisieren Autohäuser und Fahrschulen ihre Abläufe.",
  keywords: ["Software Fahrschule", "Fahrschul App", "Werkstatt Termin online buchen", "Autohaus Digitalisierung", "Software Autohaus"],
  date: "2026-09-27",
  page: "automotive",
  intro:
    "Autohäuser, Werkstätten, Vermietungen und Fahrschulen haben eines gemeinsam: Termine, Fahrzeuge und Menschen müssen zusammenpassen. Das passiert heute oft am Telefon, in Excel und in WhatsApp-Gruppen. Mit einem eigenen System buchen Kunden selbst, Mitarbeiter sehen ihren Plan auf dem Handy, und die Chefin sieht die Auslastung auf einen Blick.",
  takeaways: [
    "Online-Terminbuchung entlastet Werkstatt-Annahme und Fahrschul-Büro sofort.",
    "Eine eigene Fahrzeugbörse auf der Website bringt Anfragen ohne Portal-Umweg.",
    "Fahrschüler buchen Fahrstunden, sehen ihren Fortschritt und zahlen online.",
    "Eine Web-App für den Homescreen reicht oft – ohne App-Store-Aufwand.",
  ],
  sections: [
    {
      h2: "Werkstatt: Termine, Annahme und Status ohne Telefonschleife",
      blocks: [
        {
          p: "Kunden wählen online Leistung, Fahrzeug und Wunschtermin – Inspektion, Reifenwechsel, HU. Das System kennt die Kapazität pro Tag und verhindert Überbuchung. Bei der Abgabe ist alles vorbereitet, und der Kunde bekommt eine Nachricht, sobald das Auto fertig ist.",
        },
        {
          ul: [
            "Leistungskatalog mit Dauer und Richtpreis",
            "Kapazitätsplanung pro Tag und Bühne",
            "Erinnerung an Reifenwechsel und HU per Mail oder WhatsApp",
            "Status „fertig zur Abholung“ automatisch an den Kunden",
          ],
        },
      ],
    },
    {
      h2: "Autohaus: Fahrzeugbestand auf der eigenen Website",
      blocks: [
        {
          p: "Große Fahrzeugbörsen bringen Reichweite, aber jeder Klick auf deiner eigenen Website ist ein Kunde ohne Umweg. Ein Bestand-Modul zeigt deine Fahrzeuge mit Filtern, Finanzierungsrechner und Probefahrt-Buchung. Anfragen landen strukturiert im Dashboard – mit Fahrzeug, Wunschtermin und Kontaktdaten.",
        },
        {
          p: "Weil wir aus dem Video-Bereich kommen, gehört für uns auch das Bild dazu: Ein kurzer Fahrzeugfilm oder Reel pro Premium-Fahrzeug verkauft besser als zwanzig Fotos. Wir haben für Marken wie Audi, Volvo und NIO produziert.",
        },
      ],
    },
    {
      h2: "Fahrschule: Schüler-App statt Zettelwirtschaft",
      blocks: [
        {
          p: "In der Fahrschule laufen Theorie, Fahrstunden, Prüfungen und Zahlungen parallel. Eine Schüler-App bündelt das:",
        },
        {
          ul: [
            "**Fahrstunden buchen** aus den freien Slots der Fahrlehrer",
            "**Fortschritt sehen**: absolvierte Sonderfahrten, nächste Schritte bis zur Prüfung",
            "**Online zahlen** für Fahrstunden und Pakete – weniger offene Posten",
            "**Erinnerungen** vor jeder Stunde, weniger No-Shows",
            "**Fahrlehrer-Ansicht** mit Tagesplan und Schülernotizen auf dem Handy",
          ],
        },
        {
          p: "Wichtig: Die App ersetzt keine vorgeschriebene Dokumentation, sondern macht den Alltag drumherum einfacher. Was rechtlich gefordert ist, bleibt, wie es ist – oder wird per Schnittstelle angebunden.",
        },
      ],
    },
    {
      h2: "Web-App oder App aus dem Store?",
      blocks: [
        {
          p: "Für die meisten Betriebe reicht eine Web-App, die sich auf den Homescreen legen lässt. Sie funktioniert auf iPhone und Android, schickt Push-Nachrichten und braucht keinen App-Store-Freigabeprozess. Eine native App lohnt sich, wenn du viele Offline-Funktionen oder tiefe Geräteintegration brauchst. Die Details stehen in unserem Vergleich [Web-App oder native App](/blog/web-app-oder-native-app).",
        },
        {
          table: {
            head: ["Lösung", "Richtpreis einmalig", "Geeignet für"],
            rows: [
              ["Buchungssystem Start", "ab 2.200 €", "Werkstatt-Termine, Probefahrten"],
              ["Buchung Team & Standorte", "ab 6.400 €", "Mehrere Fahrlehrer, Bühnen oder Filialen"],
              ["Web-App für den Homescreen", "ab 3.900 €", "Schüler-App, Kunden-App"],
              ["Native App", "ab 9.900 €", "App Store & Google Play, Offline"],
            ],
          },
        },
      ],
    },
    {
      h2: "So starten wir",
      blocks: [
        {
          p: "Wir beginnen mit einem Workshop vor Ort oder per Video und bauen in sieben Tagen einen klickbaren Prototyp. Den testest du mit zwei, drei echten Kunden oder Fahrschülern. Erst wenn der Ablauf sitzt, entwickeln wir. Rechne deinen Fall vorab im [Preisrechner](/preisrechner) durch.",
        },
      ],
    },
    {
      h2: "Typische Fehler bei der Digitalisierung",
      blocks: [
        {
          ul: [
            "**Zu viel auf einmal**: Termin, Bestand, CRM und App gleichzeitig – und nichts wird richtig fertig. Starte mit dem Engpass.",
            "**Das Team nicht einbinden**: Werkstattmeister und Fahrlehrer müssen das System im Alltag bedienen. Ihr Feedback gehört in den Prototyp.",
            "**Doppelte Kalender**: Wenn Telefonbuchungen woanders landen als Online-Buchungen, ist Chaos programmiert.",
            "**Keine Erinnerungen**: Ohne automatische Erinnerung verpufft ein Großteil des Effekts.",
          ],
        },
      ],
    },
    {
      h2: "Was ein System für eine Fahrschule konkret spart",
      blocks: [
        {
          p: "Rechne einmal durch, wie viele Minuten am Tag für Terminabsprachen per WhatsApp, Telefon und Zettel draufgehen – bei Fahrlehrern und im Büro. Dazu kommen Ausfälle durch vergessene Stunden und offene Beträge, denen jemand hinterherlaufen muss. Eine Schüler-App bündelt Buchung, Erinnerung und Zahlung an einem Ort. Die gewonnene Zeit fließt in mehr Fahrstunden statt in Organisation.",
        },
        {
          tip: "Starte mit der Fahrstunden-Buchung und Online-Zahlung. Fortschrittsanzeige, Theorie-Termine und Prüfungsplanung lassen sich in einer zweiten Etappe ergänzen.",
        },
      ],
    },
    {
      h2: "Für Autohäuser: Content, der Fahrzeuge verkauft",
      blocks: [
        {
          p: "Ein eigener Fahrzeugbestand auf der Website lohnt sich doppelt, wenn die Präsentation stimmt. Kurze Walkaround-Videos, gute Fotos und klare Preise erhöhen die Anfragen pro Fahrzeug. Weil wir aus der Videoproduktion kommen, verbinden wir beides: das System für Anfragen und Probefahrten und den Content, der sie auslöst.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Können Kunden weiter anrufen?",
      a: "Natürlich. Telefonbuchungen trägst du im selben System ein – so gibt es nur einen Kalender und keine Doppelbuchungen.",
    },
    {
      q: "Lässt sich das an unser Dealer-Management-System anbinden?",
      a: "Wenn das System eine Schnittstelle anbietet, ja. Das prüfen wir im Workshop, bevor wir ein Angebot machen.",
    },
    {
      q: "Wie lange dauert eine Schüler-App?",
      a: "Als Web-App für den Homescreen rechnen wir mit etwa vier bis sechs Wochen bis zum Start, inklusive Testphase mit echten Schülern.",
    },
  ],
};
