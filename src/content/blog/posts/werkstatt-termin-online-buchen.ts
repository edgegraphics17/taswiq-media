import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "werkstatt-termin-online-buchen",
  category: "branchen",
  title: "Werkstatt-Termin online buchen: So richtest du die Online-Terminbuchung in deiner Kfz-Werkstatt ein",
  seoTitle: "Werkstatt-Termin online buchen: Leitfaden für Werkstätten",
  description: "Werkstatt-Termin online buchen: So bietest du als Kfz-Werkstatt Online-Termine an – drei Wege, nötige Funktionen, Kosten und Checkliste für den Start.",
  keywords: ["Werkstatt Termin online buchen", "Online-Terminbuchung Kfz-Werkstatt", "Werkstatt Terminplaner online", "Werkstatt Software Terminbuchung", "Reifenwechsel Termin online"],
  date: "2026-10-08",
  page: "automotive",
  intro:
    "„Werkstatt Termin online buchen“ tippen Autofahrer ein, wenn die Werkstatt schon geschlossen hat oder niemand ans Telefon geht. Wer dann einen Termin anbietet, bekommt den Auftrag. Als Werkstatt hast du drei Wege: das Online-Modul deiner Werkstattsoftware, ein Terminbuchungs-Abo oder ein eigenes Buchungssystem auf deiner Website – das gibt es einmalig ab 2.200 € oder ab 239 € im Monat zur Miete. Dieser Leitfaden zeigt, welcher Weg wann passt und was die Buchung können muss.",
  takeaways: [
    "Kunden buchen abends und am Wochenende – genau dann, wenn in der Werkstatt niemand abhebt.",
    "Frag zuerst deinen Werkstattsoftware-Anbieter nach einem Online-Modul: Ein Kalender ist besser als zwei.",
    "Entscheidend sind Dauer je Leistung, Bühnen als Ressource und die richtigen Fragen zum Fahrzeug.",
    "Reifensaison zuerst: Der Räderwechsel ist die einfachste Leistung für den Einstieg.",
  ],
  sections: [
    {
      h2: "Warum lohnt sich die Online-Terminbuchung für Werkstätten?",
      blocks: [
        {
          ul: [
            "**Du bist erreichbar, wenn du nicht erreichbar bist** – unter dem Auto, in der Mittagspause, nach Feierabend.",
            "**Weniger Telefon in der Annahme** – Standardtermine wie Räderwechsel, Inspektion und HU-Vorbereitung buchen sich selbst.",
            "**Bessere Vorbereitung** – Kennzeichen, Modell, Kilometerstand und Anliegen liegen vor, bevor das Auto auf dem Hof steht.",
            "**Weniger vergessene Termine** – durch Erinnerung am Vortag.",
            "**Sichtbar bei Google** – ein Termin-Button im Google-Profil führt direkt in deinen Kalender.",
          ],
        },
        {
          p: "Wie sich die Buchung in eine Lösung für Autohäuser, Werkstätten und Fahrschulen einfügt, zeigt die Seite [Software für Autohaus und Fahrschule](/leistungen/software-autohaus-fahrschule).",
        },
      ],
    },
    {
      h2: "Welche drei Wege gibt es?",
      blocks: [
        {
          table: {
            head: ["Weg", "Stärke", "Grenzen"],
            rows: [
              ["Online-Modul deiner Werkstattsoftware", "Termin landet direkt in der Werkstattplanung, Auftrag kann vorbereitet werden", "nicht jede Software bietet es; teils kommt nur eine Anfrage an, die du von Hand einträgst"],
              ["Terminbuchungs-Abo", "schnell eingerichtet, Buchung über Website und Google", "eigener Kalender neben der Werkstattplanung – Abgleich klären"],
              ["Eigenes Buchungssystem auf deiner Website", "deine Marke, deine Fragen, deine Regeln; keine Kosten pro Mitarbeiter oder Buchung", "höhere Anfangsinvestition; Anbindung an die Werkstattsoftware muss geplant werden"],
            ],
          },
        },
        {
          p: "Die ehrliche Reihenfolge: erst den Anbieter deiner Werkstattsoftware fragen. Gibt es ein Modul, das echte Termine anlegt und zu deiner Website passt, nimm es. Ein eigenes System lohnt sich, wenn das Modul fehlt oder nur Anfragen liefert, wenn du mehrere Standorte unter einer Marke führst oder wenn Website und Buchung zusammen neu entstehen sollen.",
        },
      ],
    },
    {
      h2: "Was muss die Buchung in einer Werkstatt können?",
      blocks: [
        {
          table: {
            head: ["Funktion", "Warum sie in der Werkstatt wichtig ist"],
            rows: [
              ["Leistungen mit fester Dauer", "Räderwechsel, Inspektion, Ölservice, Klimaservice – jede mit eigener Zeit"],
              ["„Problem beschreiben“ als eigene Option", "für alles Unklare: kurzer Diagnose-Termin statt falscher Zeitschätzung"],
              ["Bühnen und Plätze als Ressource", "ein Termin belegt Mechaniker und Bühne; ohne das gibt es Doppelbelegungen"],
              ["Fahrzeugdaten bei der Buchung", "Kennzeichen, Marke, Modell, Kilometerstand; bei Rädern: eingelagert oder mitgebracht"],
              ["Bringen und Abholen", "Abgabezeit getrennt von der Arbeitszeit, auf Wunsch Ersatzwagen oder Warten vor Ort"],
              ["Erinnerung und Absage per Link", "freie Bühnen lassen sich neu vergeben"],
              ["Puffer und Sperrzeiten", "für Notfälle, Teilelieferung, Prüftermine im Haus"],
              ["Saisonkalender", "eigene Zeitfenster für die Räderwechsel-Wochen"],
            ],
          },
        },
        {
          tip: "Starte mit zwei bis vier Leistungen, die immer gleich lange dauern. Der Räderwechsel ist der beste Einstieg: klare Dauer, hoher Andrang, und in der Saison steht das Telefon sonst nicht still.",
        },
      ],
    },
    {
      h2: "Was kostet das?",
      blocks: [
        {
          p: "Terminbuchungs-Abos und Module rechnen meist monatlich ab, je nach Anbieter und Zahl der Nutzer – frag das Angebot direkt an. Ein eigenes System kostet so viel wie im [Preisrechner](/preisrechner):",
        },
        {
          table: {
            head: ["Stufe", "Kaufen (einmalig)", "Mieten (pro Monat)", "Für wen"],
            rows: [
              ["Buchung Start", "ab 2.200 €", "ab 239 €", "Kleine Werkstatt: Leistungen, Kalender, Bestätigung per Mail & WhatsApp"],
              ["Buchung Pro", "ab 3.900 €", "ab 309 €", "+ Kundenkonto, Anzahlung, Erinnerungen, Warteliste"],
              ["Team & Standorte", "ab 6.400 €", "ab 419 €", "Mehrere Mechaniker, Bühnen oder Filialen, Schichtplan & Urlaub"],
            ],
            caption: "Endpreise nach § 19 UStG. Kauf: zusätzlich Hosting & Wartung ab 49 € oder Betrieb & Support ab 149 € im Monat. Miete: Hosting, Wartung, Support und Updates inklusive, 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit.",
          },
        },
        {
          p: "Passende Zusätze: Schnittstelle zur Werkstattsoftware 1.490 € (wenn der Anbieter eine bereitstellt), KI-Telefonassistent, der Anrufe annimmt und Termine einträgt, 1.490 €, Einrichtung des Google-Profils mit Termin-Button 190 €.",
        },
        {
          tip: "Rechnung zum Selbsteinsetzen: 239 € Miete im Monat. Was bleibt bei dir von einem Räderwechsel oder einer Inspektion hängen? Teil 239 € durch diesen Betrag – so viele zusätzliche Aufträge im Monat muss die Buchung bringen. Meist ist das eine Handvoll.",
        },
      ],
    },
    {
      h2: "Wie führst du die Online-Buchung ein?",
      blocks: [
        {
          ol: [
            "**Leistungen und Zeiten festlegen** – lieber großzügig als zu knapp.",
            "**Kapazität begrenzen.** Gib am Anfang nur einen Teil des Tages online frei und behalte Puffer für Stammkunden und Notfälle.",
            "**Überall verlinken** – Website, Google-Profil, Rechnung, Terminzettel, Ansage auf dem Anrufbeantworter.",
            "**Team einweisen** – wer schaut wann in die Buchungen, wer bestellt Teile vor?",
            "**Nach vier Wochen nachstellen** – Zeiten, Fragen und freigegebene Fenster anpassen.",
          ],
        },
        {
          p: "Mehr Bausteine für Autohäuser, Werkstätten und Fahrschulen findest du im Ratgeber [Digitalisierung für Autohaus und Fahrschule](/blog/digitalisierung-autohaus-fahrschule).",
        },
      ],
    },
    {
      h2: "Checkliste vor dem Start",
      blocks: [
        {
          ul: [
            "Hat deine Werkstattsoftware ein Online-Modul oder eine Schnittstelle?",
            "Welche Leistungen sind online buchbar, und wie lange dauern sie wirklich?",
            "Wie viele Bühnen und Mechaniker stehen wann zur Verfügung?",
            "Welche Fahrzeugdaten brauchst du vorab?",
            "Wie gehst du mit Terminen um, bei denen Teile bestellt werden müssen?",
            "Bietest du Ersatzwagen, Hol- und Bringservice oder Warten vor Ort an?",
            "Wer bestätigt Sonderfälle, und wie schnell?",
            "Welche Zeiten bleiben für Laufkundschaft und Notfälle frei?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Wie kann ich als Werkstatt Online-Termine anbieten?",
      a: "Über das Online-Modul deiner Werkstattsoftware, ein Terminbuchungs-Abo oder ein eigenes Buchungssystem auf deiner Website. Frag zuerst deinen Software-Anbieter; fehlt dort ein passendes Modul, ist ein eigenes System die Alternative.",
    },
    {
      q: "Was kostet eine Online-Terminbuchung für die Werkstatt?",
      a: "Ein eigenes System einmalig ab 2.200 € oder ab 239 € im Monat zur Miete. Mit mehreren Mechanikern, Bühnen oder Filialen ab 6.400 € oder ab 419 € im Monat.",
    },
    {
      q: "Lässt sich die Buchung mit meiner Werkstattsoftware verbinden?",
      a: "Wenn dein Anbieter eine Schnittstelle bereitstellt, ja – das kostet als Zusatz 1.490 € und wird vor dem Angebot geprüft. Ohne Schnittstelle laufen die Buchungen in einem eigenen Kalender mit Benachrichtigung.",
    },
    {
      q: "Was ist, wenn Kunden die falsche Leistung buchen?",
      a: "Dafür gibt es die Option „Problem beschreiben“ mit einem kurzen Diagnose-Termin. Außerdem siehst du jede Buchung vorab und kannst den Kunden zurückrufen, bevor das Auto kommt.",
    },
    {
      q: "Können Kunden weiterhin anrufen?",
      a: "Ja. Die Online-Buchung nimmt dir die Standardtermine ab, das Telefon bleibt für alles andere. Wer mag, lässt Anrufe außerhalb der Zeiten von einem KI-Telefonassistenten annehmen, der Termine direkt einträgt.",
    },
    {
      q: "Wie schnell ist die Buchung live?",
      a: "Die Stufe Start in zwei bis drei Wochen – rechtzeitig vor der nächsten Reifensaison, wenn du früh genug anfängst.",
    },
  ],
};
