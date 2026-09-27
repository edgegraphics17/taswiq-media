import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "buchungssystem-friseur-ohne-provision",
  category: "branchen",
  title: "Buchungssystem für Friseure und Beauty-Salons: Plattform oder eigene Lösung?",
  description: "Buchungsplattform oder eigenes Buchungssystem? Kosten, Kundendaten und Funktionen im Vergleich – für Friseure, Barber, Kosmetik und Studios.",
  keywords: ["Buchungssystem Friseur", "Online Terminbuchung Friseur", "Buchungssystem ohne Provision", "Planity Alternative", "Terminbuchung Kosmetikstudio"],
  date: "2026-09-27",
  page: "beauty",
  intro:
    "Online-Terminbuchung ist im Salon längst Standard. Die Frage ist nur, über wen. Buchungsplattformen sind schnell eingerichtet, kosten aber jeden Monat – pro Mitarbeiter, pro Buchung oder beides. Und deine Kundinnen buchen in einer App, in der auch die Konkurrenz um die Ecke steht. Ein eigenes Buchungssystem kostet einmal, läuft unter deinem Namen und gehört dir.",
  takeaways: [
    "Plattformen: schnell, aber laufende Gebühren und fremde Marke.",
    "Eigenes System: einmalige Investition ab 2.900 €, Betrieb ab 49 €/Monat.",
    "Doppelbuchungen lassen sich technisch auf Datenbank-Ebene ausschließen.",
    "Erinnerungen per WhatsApp oder Mail senken die No-Show-Quote.",
  ],
  sections: [
    {
      h2: "Wie Buchungsplattformen Geld verdienen",
      blocks: [
        {
          p: "Die Modelle unterscheiden sich: Manche Anbieter verlangen eine monatliche Gebühr pro Mitarbeiter oder Kalender, andere eine Provision auf Buchungen, die über ihren Marktplatz kommen, manche beides. Für einen Salon mit drei, vier Mitarbeitern kommt über die Jahre ein beachtlicher Betrag zusammen. Schau in deine Rechnungen der letzten zwölf Monate – das ist die Zahl, gegen die du ein eigenes System rechnen solltest.",
        },
      ],
    },
    {
      h2: "Was ein eigenes Buchungssystem können muss",
      blocks: [
        {
          ul: [
            "**Leistungen mit Dauer und Preis** – z. B. „Waschen, Schneiden, Föhnen · lang · 60 Min.“",
            "**Mitarbeiter-Auswahl** oder „egal wer“",
            "**Freie Zeiten in Echtzeit**, abgeglichen mit Öffnungszeiten und Pausen",
            "**Doppelbuchungs-Schutz** direkt in der Datenbank, nicht nur in der Oberfläche",
            "**Bestätigung und Erinnerung** per Mail oder WhatsApp",
            "**Anzahlung oder Ausfallgebühr** für lange Termine wie Farbe oder Extensions",
            "**Kundenkartei** mit Notizen zu Farbrezepten und Wünschen",
          ],
        },
        {
          p: "Für den [OMED Friseursalon in Aachen-Burtscheid](/portfolio) haben wir genau das gebaut: eigene Website mit mehrstufiger Buchung, Kalender und Zeitfenstern. Zwei Buchungen zur selben Zeit sind auf Datenbank-Ebene ausgeschlossen – nicht nur optisch.",
        },
      ],
    },
    {
      h2: "Vergleich: Plattform vs. eigenes System",
      blocks: [
        {
          table: {
            head: ["", "Buchungsplattform", "Eigenes Buchungssystem"],
            rows: [
              ["Start", "sofort", "3–4 Wochen"],
              ["Kosten", "laufend, oft pro Mitarbeiter oder Buchung", "einmalig ab 2.900 € + Betrieb ab 49 €/Monat"],
              ["Marke", "Plattform-App, Konkurrenz sichtbar", "deine Website, dein Design"],
              ["Kundendaten", "beim Anbieter", "bei dir, in der EU"],
              ["Anpassungen", "was der Anbieter vorsieht", "was dein Salon braucht"],
              ["Neukunden über Marktplatz", "ja", "über Google, Instagram, Empfehlung"],
            ],
          },
        },
      ],
    },
    {
      h2: "Wie Neukunden trotzdem den Weg finden",
      blocks: [
        {
          p: "Der Marktplatz ist das stärkste Argument der Plattformen. Die meisten Salon-Kundinnen finden ihren Friseur aber über Google Maps und Instagram. Deshalb gehören zu einem eigenen System:",
        },
        {
          ul: [
            "Ein gepflegtes **Google-Unternehmensprofil** mit Button „Termin buchen“ auf deine Seite",
            "**Lokales SEO**: „Friseur [Stadtteil]“ als Seitentitel, Leistungen mit Preisen auf der Website",
            "**Bewertungen** aktiv einsammeln – z. B. per Link nach dem Termin",
            "**Reels** aus dem Salon: Vorher-nachher verkauft",
          ],
        },
        { tip: "Wenn du nicht sofort wechseln willst: Starte mit dem eigenen System für Stammkundinnen und lass die Plattform für Neukunden parallel laufen." },
      ],
    },
    {
      h2: "Kosten im Überblick",
      blocks: [
        {
          table: {
            head: ["Paket", "Einmalig", "Enthalten"],
            rows: [
              ["Buchung Start", "ab 2.900 €", "Leistungen, Kalender, Bestätigung per Mail & WhatsApp"],
              ["Buchung Pro", "ab 5.400 €", "+ Kundenkonto, Anzahlung, Erinnerungen, Warteliste"],
              ["Team & Standorte", "ab 8.900 €", "Mehrere Mitarbeiter, Räume oder Filialen, Schichtplan"],
            ],
          },
        },
        { p: "Rechne deinen Salon im [Preisrechner](/preisrechner) durch oder schau dir die Seite [Buchungssystem für Friseure & Beauty](/leistungen/buchungssystem-friseur-beauty) an." },
      ],
    },
    {
      h2: "Checkliste: Das muss dein Buchungssystem können",
      blocks: [
        {
          ul: [
            "Leistungen mit unterschiedlicher Dauer je Haarlänge oder Aufwand",
            "Pufferzeiten zwischen Terminen, z. B. für Einwirkzeit bei Farbe",
            "Mitarbeiter mit eigenen Arbeitszeiten, Urlaub und Pausen",
            "Mindestvorlauf, damit niemand fünf Minuten vorher bucht",
            "Stornierung und Verschiebung per Link – mit klarer Frist",
            "Bestätigung und Erinnerung per Mail oder WhatsApp",
            "Datenschutzkonforme Speicherung in der EU und Löschkonzept",
            "Export aller Termine und Kunden – deine Daten, jederzeit",
          ],
        },
      ],
    },
    {
      h2: "No-Shows reduzieren: was in der Praxis wirkt",
      blocks: [
        {
          p: "Ein leerer Stuhl kostet doppelt: Umsatz und Zeit, die du nicht mehr füllen kannst. Diese Maßnahmen wirken erfahrungsgemäß am meisten:",
        },
        {
          ol: [
            "**Erinnerung 24 Stunden vorher** mit Link zum Verschieben – wer verschieben kann, sagt nicht einfach ab.",
            "**Anzahlung für lange Termine** wie Farbe, Strähnen oder Extensions.",
            "**Warteliste**: Wird ein Termin frei, bekommt die nächste Kundin automatisch Bescheid.",
            "**Klare Regeln** auf der Buchungsseite – freundlich formuliert, aber eindeutig.",
          ],
        },
      ],
    },
    {
      h2: "So läuft der Wechsel ab",
      blocks: [
        {
          p: "Der Umstieg von einer Plattform muss nicht hart sein. Wir bauen das neue System, übernehmen Leistungen, Preise und – soweit exportierbar – Kunden und zukünftige Termine. Ein paar Wochen laufen beide Systeme parallel: Neue Buchungen gehen ins eigene System, bestehende Termine bleiben, wo sie sind. Danach verlinkst du im Google-Profil und auf Instagram nur noch deine eigene Buchungsseite.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Kann ich meine bestehenden Termine übernehmen?",
      a: "Ja. Wir übernehmen Kunden und zukünftige Termine per Export aus dem alten System, soweit der Anbieter einen Export erlaubt.",
    },
    {
      q: "Funktioniert das auch für Kosmetik, Physio und Studios?",
      a: "Ja. Leistungen, Räume, Geräte und Mitarbeiter lassen sich frei kombinieren – auch Kurse mit mehreren Teilnehmern.",
    },
    {
      q: "Was passiert, wenn das System ausfällt?",
      a: "Mit dem Betriebspaket überwachen wir das System rund um die Uhr. Backups laufen täglich, und du kannst Termine jederzeit exportieren.",
    },
  ],
};
