import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "online-buchungssystem-fuer-kurse",
  category: "branchen",
  title: "Online-Buchungssystem für Kurse: Plätze verkaufen, mit Bezahlfunktion und ohne Listen",
  seoTitle: "Online-Buchungssystem für Kurse – mit Bezahlfunktion",
  description: "Online-Buchungssystem für Kurse und Workshops: was es können muss, wann die Bezahlfunktion sich lohnt, Abo oder eigene Lösung – mit Kosten und Checkliste.",
  keywords: ["Online Buchungssystem für Kurse", "Online Buchungssystem mit Bezahlfunktion", "Kursbuchung online", "Buchungssystem Workshops", "Kursverwaltung Studio"],
  date: "2026-10-08",
  page: "buchungssystem",
  intro:
    "Ein Online-Buchungssystem für Kurse verkauft Plätze statt Uhrzeiten: Jeder Termin hat eine feste Teilnehmerzahl, und wer bucht, bezahlt am besten gleich mit. So ersetzt es Anmeldelisten, Überweisungen und Erinnerungs-Mails von Hand. Für Studios mit Standardablauf reicht ein Kurs-Abo ab einem niedrigen zweistelligen Monatsbetrag; ein eigenes System auf deiner Website gibt es ab 2.200 € oder ab 239 € im Monat zur Miete, die Online-Zahlung als Zusatz für 890 €.",
  takeaways: [
    "Kurse sind anders als Einzeltermine: Kapazität, Warteliste, Serien und Karten statt freier Zeitfenster.",
    "Die Bezahlfunktion ist der größte Hebel gegen Nichterscheinen und Mahnungen.",
    "Für Yoga-, Pilates- und Fitnessstudios gibt es gute Spezial-Abos – eine eigene Lösung lohnt sich bei Sonderfällen.",
    "Zahlungsgebühren fallen immer an, egal ob Abo oder eigenes System.",
  ],
  sections: [
    {
      h2: "Was unterscheidet eine Kursbuchung von einer Terminbuchung?",
      blocks: [
        {
          table: {
            head: ["", "Einzeltermin", "Kurs oder Workshop"],
            rows: [
              ["Gebucht wird", "ein freies Zeitfenster", "ein Platz in einem festen Termin"],
              ["Begrenzung", "Kalender einer Person", "Teilnehmerzahl, Raum, Material"],
              ["Wenn voll", "nächster freier Termin", "Warteliste, automatisches Nachrücken"],
              ["Preis", "pro Leistung", "Einzelticket, Kursreihe, 10er-Karte, Mitgliedschaft"],
              ["Absage", "Termin wird wieder frei", "Platz geht an die Warteliste, Geld zurück oder Gutschrift"],
            ],
          },
        },
        {
          p: "Ein gewöhnliches Termin-Tool kann das nur zum Teil. Achte deshalb darauf, dass das System Kurse wirklich als Kurse kennt. Wie unser [Online-Buchungssystem](/leistungen/online-buchungssystem) aufgebaut ist, steht auf der Leistungsseite.",
        },
      ],
    },
    {
      h2: "Was muss ein Buchungssystem für Kurse können?",
      blocks: [
        {
          ul: [
            "**Kursplan mit freien Plätzen** – auf einen Blick sichtbar, auch am Handy.",
            "**Kursreihen und Einzeltermine** – acht Abende als Paket oder eine Schnupperstunde.",
            "**Warteliste** – wer nachrückt, wird automatisch benachrichtigt.",
            "**Karten und Guthaben** – 5er- und 10er-Karten, die bei jeder Buchung heruntergezählt werden.",
            "**Teilnehmerliste zum Abhaken** – auf dem Handy der Kursleitung.",
            "**Bestätigung, Erinnerung und Absage per Link** – mit einer Frist, die du festlegst.",
            "**Rechnung oder Beleg** automatisch nach der Zahlung.",
            "**Mehrere Kursleiter, Räume und Standorte** – mit eigenen Zugängen.",
            "**Abfragen bei der Anmeldung** – Vorkenntnisse, Leihmaterial, Einverständnis bei Minderjährigen.",
          ],
        },
      ],
    },
    {
      h2: "Lohnt sich die Bezahlfunktion?",
      blocks: [
        {
          p: "Fast immer. Wer bei der Buchung bezahlt, kommt – und du musst niemandem hinterherlaufen. Üblich sind Karte, PayPal, Apple Pay und Google Pay; je nach Zahlungsanbieter auch Lastschrift. Der Zahlungsanbieter berechnet dafür eine Gebühr pro Zahlung, die du in deiner Kalkulation berücksichtigen solltest. Sie fällt bei jedem System an, auch bei Abos, die mit „keine Gebühr pro Buchung“ werben.",
        },
        {
          tip: "Rechnung zum Selbsteinsetzen: Wie viele Plätze bleiben im Monat leer, weil jemand angemeldet war und nicht kam? Multiplizier das mit deinem Kurspreis. Das ist der Betrag, den dir die Vorab-Zahlung zurückholt – die Zahlungsgebühr ist dagegen meist klein.",
        },
        {
          p: "Leg vorher fest, was bei einer Absage passiert: Geld zurück bis zu einer Frist, danach Gutschrift oder Verfall. Diese Regeln gehören in deine Teilnahmebedingungen – lass sie prüfen, bevor du online gehst.",
        },
      ],
    },
    {
      h2: "Kurs-Abo oder eigene Lösung?",
      blocks: [
        {
          table: {
            head: ["Weg", "Passt, wenn …", "Grenzen"],
            rows: [
              ["Allgemeines Termin-Tool", "du wenige Workshops im Jahr anbietest", "Karten, Wartelisten und Kursreihen oft nur eingeschränkt"],
              ["Spezial-Abo für Studios", "du ein Yoga-, Pilates- oder Fitnessstudio mit üblichem Ablauf führst", "Aussehen und Ablauf gibt der Anbieter vor; Preis steigt je nach Tarif mit Kursleitern oder Buchungen"],
              ["Eigenes Buchungssystem", "dein Angebot nicht ins Raster passt oder du Kurse, Einzeltermine und Website aus einem Guss willst", "höhere Anfangsinvestition, zwei bis vier Wochen bis zum Start"],
            ],
          },
        },
        {
          p: "Die ehrliche Empfehlung: Für ein klassisches Studio ist ein Spezial-Abo meist der schnellere und günstigere Weg – die Anbieter nennen Einstiegspreise im niedrigen zweistelligen Bereich pro Monat. Eine eigene Lösung lohnt sich für Fälle wie diese: eine Sprach- oder Musikschule mit Einstufung und Lehrerzuteilung, eine Kochschule mit Firmenbuchungen, Erste-Hilfe-Kurse mit Bescheinigung, Kurse in mehreren Sprachen oder ein Betrieb, der Kurse und Einzeltermine im selben Kalender führt.",
        },
      ],
    },
    {
      h2: "Was kostet ein eigenes Buchungssystem für Kurse?",
      blocks: [
        { p: "Die Stufen sind dieselben wie im [Preisrechner](/preisrechner):" },
        {
          table: {
            head: ["Stufe", "Kaufen (einmalig)", "Mieten (pro Monat)", "Enthalten"],
            rows: [
              ["Buchung Start", "ab 2.200 €", "ab 239 €", "Angebote mit Dauer und Preis, Kalender, Bestätigung per Mail & WhatsApp"],
              ["Buchung Pro", "ab 3.900 €", "ab 309 €", "+ Kundenkonto, Anzahlung & Stornoregeln, Erinnerungen, Warteliste"],
              ["Team & Standorte", "ab 6.400 €", "ab 419 €", "+ Räume, Geräte, Standorte, Schichtplan"],
            ],
            caption: "Endpreise nach § 19 UStG. Zusatz Online-Zahlung: 890 €. Kauf: zusätzlich Hosting & Wartung ab 49 € oder Betrieb & Support ab 149 € im Monat. Miete: 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit.",
          },
        },
        {
          p: "Die Kurslogik – Plätze je Termin, Kursreihen, Karten – bauen wir auf der Stufe Pro auf. Den genauen Umfang legen wir nach dem klickbaren Prototyp fest; dann gilt ein Festpreis.",
        },
      ],
    },
    {
      h2: "Checkliste: Das solltest du vor dem Start klären",
      blocks: [
        {
          ul: [
            "Welche Angebote gibt es – offene Stunden, feste Kursreihen, Workshops, Einzeltermine?",
            "Wie viele Plätze je Kurs, und gibt es eine Mindestteilnehmerzahl?",
            "Welche Preise und Karten: Einzelticket, Reihe, 10er-Karte, Mitgliedschaft, Ermäßigung?",
            "Bis wann kann kostenlos storniert werden, und was passiert danach?",
            "Welche Zahlungsarten sollen möglich sein?",
            "Brauchen Teilnehmer eine Rechnung auf eine Firma?",
            "Wer sieht Teilnehmerlisten, wer darf Kurse anlegen?",
            "Welche Angaben brauchst du wirklich bei der Anmeldung – und welche nicht?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Welches Online-Buchungssystem eignet sich für Kurse?",
      a: "Eines, das Plätze je Termin, Wartelisten und Kursreihen kennt. Für Studios mit üblichem Ablauf sind Spezial-Abos gut geeignet. Passt dein Angebot nicht ins Raster, ist ein eigenes System auf deiner Website die Alternative.",
    },
    {
      q: "Kann man Kurse online direkt bezahlen lassen?",
      a: "Ja. Mit der Online-Zahlung zahlen Teilnehmer bei der Buchung per Karte, PayPal, Apple Pay oder Google Pay. Bei uns ist das ein Zusatz für 890 €, dazu kommen die Gebühren des Zahlungsanbieters.",
    },
    {
      q: "Gibt es ein Buchungssystem für Kurse kostenlos?",
      a: "Einige Anbieter haben kostenlose Einstiegstarife, meist mit Grenzen bei Buchungen, Funktionen oder Zahlung. Zum Testen reicht das oft – prüf vorher, ob die Bezahlfunktion enthalten ist.",
    },
    {
      q: "Funktionieren 10er-Karten und Mitgliedschaften?",
      a: "Ja, das lässt sich abbilden. Bei einer eigenen Lösung legen wir im Prototyp fest, wie Karten verkauft, eingelöst und verlängert werden.",
    },
    {
      q: "Was kostet ein eigenes Buchungssystem für Kurse?",
      a: "Ab 2.200 € einmalig oder ab 239 € im Monat zur Miete. Mit Kundenkonto, Stornoregeln und Warteliste ab 3.900 € oder ab 309 € im Monat. Die Online-Zahlung kostet als Zusatz 890 €.",
    },
    {
      q: "Wie schnell ist das System live?",
      a: "Die Stufe Start in zwei bis drei Wochen, die Stufe Pro in drei bis vier Wochen.",
    },
  ],
};
