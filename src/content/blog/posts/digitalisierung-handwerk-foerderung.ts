import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "digitalisierung-handwerk-foerderung",
  category: "ratgeber",
  title: "Digitalisierung im Handwerk: Förderung für Software und Website – was im Oktober 2026 noch läuft",
  seoTitle: "Digitalisierung Handwerk: Förderung 2026 im Überblick",
  description: "Digitalisierung im Handwerk und in der Gastronomie: Förderung, am 08.10.2026 bei den Förderstellen nachgelesen – mit Quellen, Fristen und Ablauf.",
  keywords: ["Digitalisierung Handwerk Förderung", "Förderung Digitalisierung 2026", "Förderung Software Handwerk", "Digitalbonus", "Förderung Digitalisierung Gastronomie"],
  date: "2026-10-08",
  page: "handwerk",
  intro:
    "Für die Digitalisierung im Handwerk gibt es Förderung – aber kein einzelnes Bundesprogramm, das jedem Betrieb einen Zuschuss für Software zahlt. Stand 8. Oktober 2026 haben wir bei den Förderstellen selbst drei Bausteine nachgelesen: den Zuschuss des BAFA für Unternehmensberatung, den ERP-Förderkredit Digitalisierung der KfW und Landesprogramme wie den Digitalbonus Bayern. Was du bekommst, hängt vor allem von deinem Bundesland ab. Die wichtigste Regel gilt überall: erst beantragen, dann beauftragen.",
  takeaways: [
    "Zuschüsse für Software und Websites kommen vor allem von den Bundesländern – und sind dort oft begrenzt oder kontingentiert.",
    "Vom Bund: Zuschuss für Beratung (BAFA) und zinsgünstiger Kredit (KfW), beides vor Beginn zu beantragen.",
    "Wer vor der Bewilligung einen Auftrag unterschreibt, verliert in der Regel die Förderung.",
    "Wir sind keine Fördermittelberater: Den Antrag stellst du selbst – wir liefern das Angebot mit Leistungsbeschreibung dafür.",
  ],
  sections: [
    {
      h2: "Welche Förderung für Digitalisierung gibt es im Handwerk?",
      blocks: [
        {
          p: "Alle Angaben in dieser Tabelle stammen von den Seiten der Förderstellen, abgerufen am 8. Oktober 2026. Förderprogramme ändern sich schnell, Mittel können ausgeschöpft sein – prüf den Stand immer selbst an der Quelle.",
        },
        {
          table: {
            head: ["Programm", "Art", "Was gefördert wird", "Stand laut Förderstelle"],
            rows: [
              ["Förderung von Unternehmensberatungen für KMU (BAFA)", "Zuschuss", "Beratung zu wirtschaftlichen, finanziellen, personellen und organisatorischen Fragen – keine Software", "Richtlinie gilt bis 31.12.2026; höchstens fünf Beratungen je Unternehmen, zwei pro Jahr"],
              ["ERP-Förderkredit Digitalisierung (KfW, Nr. 511/512)", "Kredit", "Digitalisierungsvorhaben einschließlich Investitionen und laufender Kosten", "Wird angeboten; Antrag über die Hausbank oder einen anderen Finanzierungspartner"],
              ["Digitalbonus Bayern", "Zuschuss (Land)", "Digitalisierung von Produkten, Prozessen und Dienstleistungen, IT-Sicherheit", "Laufzeit bis 31.12.2027; monatliches Kontingent; nur kleine Unternehmen der gewerblichen Wirtschaft"],
              ["Mittelstand Innovativ & Digital (NRW)", "Zuschuss (Land)", "Programmlinien MID-Gutscheine, MID-Assistent/in, MID-Digitale Sicherheit", "Seit 01.01.2026 betreut die NRW.BANK neue Vorhaben; ob Anträge gerade möglich sind, sagt die Programmseite nicht – dort nachfragen"],
            ],
            caption: "Quellen: bafa.de, kfw.de, digitalbonus.bayern, mittelstand-innovativ-digital.nrw – jeweils abgerufen am 08.10.2026.",
          },
        },
        {
          p: "Viele suchen noch nach den früheren Bundesprogrammen „go-digital“ und „Digital Jetzt“. Die offizielle Programmseite zu go-digital konnten wir beim Schreiben nicht abrufen; mehrere Fachportale berichten, dass beide Programme beendet sind und es keinen direkten Nachfolger gibt. Plane nicht mit ihnen, solange du es nicht beim Bundeswirtschaftsministerium bestätigt bekommst.",
        },
      ],
    },
    {
      h2: "Was heißt das für die einzelnen Programme?",
      blocks: [
        {
          p: "**BAFA-Beratungsförderung:** Bezuschusst wird die Beratung, nicht das Programm selbst. Sinnvoll ist das, wenn du vor einer größeren Investition klären willst, welche Abläufe du überhaupt digitalisieren solltest. Der Antrag läuft über ein Online-Portal. Mit der Beratung darfst du erst beginnen, wenn das Informationsschreiben vorliegt – und schon der Abschluss des Beratungsvertrags zählt als Beginn. Der Berater muss die Anforderungen der Richtlinie erfüllen.",
        },
        {
          p: "**KfW-Förderkredit:** Kein Zuschuss, sondern ein Kredit. Du beantragst ihn nicht bei der KfW, sondern über deine Hausbank oder einen anderen Finanzierungspartner, und zwar vor Beginn des Vorhabens. Einen Mindestbetrag nennt die KfW nicht. Für die Basisstufe verlangt sie vorab ihren Digitalisierungs-Check. Für kleine Vorhaben ist der Weg über die Bank oft aufwendig – frag deine Bank, ab welcher Summe sie ihn begleitet.",
        },
        {
          p: "**Landesprogramme:** Hier liegen die echten Zuschüsse für Software, Websites mit Funktion und IT-Sicherheit. Die Bedingungen unterscheiden sich stark. Beim Digitalbonus Bayern zum Beispiel muss das Unternehmen den Antrag selbst stellen – eine Beantragung durch Dienstleister ist laut Programmseite nicht zulässig – und braucht dafür ein ELSTER-Unternehmenskonto. Pro Monat wird ein Kontingent freigegeben.",
        },
      ],
    },
    {
      h2: "Wie findest du die Förderung für dein Bundesland?",
      blocks: [
        {
          ol: [
            "**Förderdatenbank des Bundes** (foerderdatenbank.de): nach „Digitalisierung“ suchen und auf dein Bundesland und „Unternehmen“ filtern.",
            "**Landesförderbank oder Landesportal** deines Bundeslands: dort stehen Fördersätze, Höchstbeträge und ob gerade Mittel verfügbar sind.",
            "**Betriebsberatung deiner Handwerkskammer** oder – für Gastronomen – die IHK: Die Beraterinnen und Berater kennen die Programme vor Ort und wissen, welche gerade offen sind.",
            "**Programmseite gründlich lesen:** Wer ist antragsberechtigt, was ist ausgeschlossen, welche Unterlagen werden verlangt?",
          ],
        },
        {
          tip: "Achte auf das Datum jeder Übersicht, die du liest – auch dieser. Viele Ratgeber im Netz beschreiben Programme, die längst beendet sind. Verbindlich ist nur, was die Förderstelle selbst schreibt.",
        },
      ],
    },
    {
      h2: "Was wird typischerweise gefördert – und was nicht?",
      blocks: [
        {
          table: {
            head: ["Häufig förderfähig (je nach Programm)", "Häufig ausgeschlossen"],
            rows: [
              ["Software, die einen Ablauf digitalisiert: Auftragsabwicklung, Buchung, Bestellung, Kundenportal", "Reine Werbe-Website ohne Funktion"],
              ["IT-Sicherheit: Backups, Zugriffsschutz, Schulung", "Ersatz vorhandener Geräte ohne neuen Nutzen"],
              ["Einführung, Einrichtung und Schulung", "Laufende Kosten wie Miete oder Abo – nicht überall, aber oft"],
              ["Individuelle Entwicklung und Schnittstellen", "Alles, was vor der Bewilligung beauftragt wurde"],
            ],
            caption: "Allgemeine Orientierung, keine Zusage. Maßgeblich ist die Richtlinie des jeweiligen Programms.",
          },
        },
        {
          p: "Wichtig für die Entscheidung zwischen Kauf und Miete: Zuschussprogramme fördern meist einmalige Ausgaben. Wenn du Förderung nutzen willst, sprich das an, bevor du dich für die Miete entscheidest.",
        },
      ],
    },
    {
      h2: "In welcher Reihenfolge gehst du vor?",
      blocks: [
        {
          ol: [
            "**Vorhaben beschreiben** – welcher Ablauf, welches Ziel, welcher Nutzen für den Betrieb.",
            "**Programm auswählen** und Bedingungen prüfen.",
            "**Angebot einholen** – mit klarer Leistungsbeschreibung und Preis, aber ohne Auftrag.",
            "**Antrag stellen** und auf die Bewilligung oder das Informationsschreiben warten.",
            "**Erst dann beauftragen.** Unterschrift, Anzahlung oder Bestellung vorher gelten als vorzeitiger Beginn.",
            "**Umsetzen und alles aufbewahren** – Rechnungen, Zahlungsbelege, Abnahme.",
            "**Verwendungsnachweis einreichen** in der vorgegebenen Frist; erst danach wird ausgezahlt.",
          ],
        },
        {
          p: "Plane die Wartezeit ein: Du gehst in Vorleistung und bekommst den Zuschuss später. Wenn dein Projekt eilig ist, kann ein Start ohne Förderung die bessere Rechnung sein.",
        },
      ],
    },
    {
      h2: "Was kostet ein typisches Vorhaben – und wie helfen wir beim Antrag?",
      blocks: [
        {
          p: "Damit du weißt, über welche Summen du mit der Förderstelle sprichst: Ein Buchungssystem beginnt bei 2.200 €, ein Bestellsystem bei 2.900 €, ein Anfrage-Funnel mit Angebotsgenerator bei 4.900 €, ein Kundenportal bei 7.400 € und ein kompletter Kernprozess bei 10.900 €. Den Umfang stellst du im [Preisrechner](/preisrechner) zusammen. Was für Handwerksbetriebe typisch ist, zeigt die Seite [Software für Handwerk und Dienstleister](/leistungen/software-handwerk-dienstleister), für Restaurants und Bäckereien die Seite [Software für die Gastronomie](/leistungen/software-gastronomie).",
        },
        {
          p: "Wir sind keine Fördermittelberater und stellen keine Anträge. Was wir beitragen: ein Angebot mit sauberer Leistungsbeschreibung, Zeitplan und Festpreis, das du dem Antrag beilegen kannst – und wir beginnen erst, wenn du die Bewilligung hast. Unsere Preise sind Endpreise nach § 19 UStG, also ohne ausgewiesene Umsatzsteuer; klär mit der Förderstelle, welche Bemessungsgrundlage für dich gilt.",
        },
        {
          p: "Ob sich eine eigene Lösung überhaupt lohnt oder ein Standardprogramm reicht, beantwortet der Ratgeber [Handwerkersoftware für Kleinbetriebe](/blog/handwerkersoftware-kleinbetriebe).",
        },
      ],
    },
    {
      h2: "Checkliste: Das brauchst du für den Antrag",
      blocks: [
        {
          ul: [
            "Kurze Beschreibung des Vorhabens und des erwarteten Nutzens",
            "Angaben zum Betrieb: Mitarbeiterzahl, Umsatz, Gründungsjahr",
            "Ein oder mehrere Angebote mit Leistungsbeschreibung",
            "Erklärung zu bereits erhaltenen Beihilfen (De-minimis), wenn das Programm sie verlangt",
            "Zugang zum Antragsportal – je nach Programm zum Beispiel ein ELSTER-Unternehmenskonto",
            "Zeitplan: Beginn erst nach Bewilligung",
            "Ein Ordner für Rechnungen und Zahlungsbelege",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Welche Förderung gibt es 2026 für die Digitalisierung im Handwerk?",
      a: "Stand 8. Oktober 2026: vom Bund den BAFA-Zuschuss für Unternehmensberatung (Richtlinie bis 31.12.2026) und den ERP-Förderkredit Digitalisierung der KfW, dazu Zuschussprogramme der Bundesländer, etwa den Digitalbonus Bayern (Laufzeit bis 31.12.2027). Welche Programme für dich gelten, hängt vom Bundesland ab.",
    },
    {
      q: "Gibt es go-digital noch?",
      a: "Wir konnten die offizielle Programmseite beim Schreiben nicht abrufen. Fachportale berichten, das Programm sei beendet und habe keinen direkten Nachfolger. Verlass dich nicht darauf und frag im Zweifel beim Bundeswirtschaftsministerium nach.",
    },
    {
      q: "Kann ich Förderung beantragen, wenn ich schon beauftragt habe?",
      a: "In der Regel nein. Bei BAFA und KfW muss der Antrag vor Beginn gestellt werden, und auch Landesprogramme schließen einen vorzeitigen Beginn meist aus. Schon ein unterschriebener Vertrag kann als Beginn zählen.",
    },
    {
      q: "Wird auch eine Website gefördert?",
      a: "Eine reine Werbe-Website meist nicht. Eine Website mit Funktion – Buchung, Bestellung, Kundenbereich – kann je nach Landesprogramm als Digitalisierung von Prozessen förderfähig sein. Das entscheidet die Richtlinie des jeweiligen Programms.",
    },
    {
      q: "Gilt die Förderung auch für Gastronomie und andere Branchen?",
      a: "Die meisten Programme richten sich an kleine und mittlere Unternehmen allgemein, nicht nur ans Handwerk. Einzelne Landesprogramme beschränken sich auf die gewerbliche Wirtschaft oder schließen bestimmte Gruppen aus – lies die Antragsberechtigung genau.",
    },
    {
      q: "Stellt ihr den Förderantrag für mich?",
      a: "Nein. Wir sind keine Fördermittelberater, und manche Programme verlangen ausdrücklich, dass das Unternehmen selbst beantragt. Du bekommst von uns ein Angebot mit Leistungsbeschreibung und Festpreis für deinen Antrag, und wir starten erst nach deiner Bewilligung.",
    },
  ],
};
