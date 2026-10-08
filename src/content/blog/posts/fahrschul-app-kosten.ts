import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "fahrschul-app-kosten",
  category: "branchen",
  title: "Fahrschul-App: Kosten, Funktionen und wann sich eine eigene App lohnt",
  seoTitle: "Fahrschul-App: Kosten, Funktionen & wann sie sich lohnt",
  description: "Fahrschul-App Kosten im Überblick: Standard-App im Abo oder eigene App ab 3.900 € bzw. 309 € im Monat. Mit Funktionen, Rechnung und Checkliste.",
  keywords: ["Fahrschul-App Kosten", "Fahrschul App", "App für Fahrschulen", "Fahrstunden online buchen", "Fahrschule Software"],
  date: "2026-10-08",
  page: "automotive",
  intro:
    "Die Kosten einer Fahrschul-App hängen davon ab, ob du eine fertige App im Abo nutzt oder eine eigene bauen lässt. Fertige Lösungen rechnen meist monatlich ab, oft nach Zahl der Fahrlehrer oder Schüler. Eine eigene App unter dem Namen deiner Fahrschule kostet bei uns einmalig ab 3.900 € oder ab 309 € im Monat zur Miete – mit Fahrstundenbuchung, Ausbildungsstand und Zahlung. Sie lohnt sich, wenn Terminabsprachen per WhatsApp und Telefon deine Fahrlehrer täglich Zeit kosten.",
  takeaways: [
    "Zwei Wege: Standard-App im Abo oder eigene App unter deinem Namen.",
    "Die größte Ersparnis liegt in der Fahrstundenbuchung: absagen, nachrücken, erinnern – ohne Telefon.",
    "Eine eigene App kostet ab 3.900 € einmalig oder ab 309 € im Monat, mit mehreren Fahrlehrern ab 6.400 €.",
    "Eine Web-App reicht für fast alle Fahrschulen: Sie läuft auf iPhone und Android, ohne App-Store.",
  ],
  sections: [
    {
      h2: "Was kostet eine Fahrschul-App?",
      blocks: [
        {
          table: {
            head: ["Weg", "Kosten", "Darauf achten"],
            rows: [
              ["Fertige Fahrschul-App im Abo", "monatlich, je nach Anbieter pro Fahrlehrer, pro Schüler oder als Paket – Preis beim Anbieter anfragen", "Was kostet es mit einem Fahrlehrer mehr? Läuft die App unter deinem Namen?"],
              ["Eigene App: Kunden- & Schüler-App", "3.900 € einmalig oder ab 309 € im Monat zur Miete", "Buchung, Absage, Nachrücker, Ausbildungsstand, Zahlung und Guthaben"],
              ["Eigene App für mehrere Fahrlehrer", "ab 6.400 € einmalig oder ab 419 € im Monat zur Miete", "Kalender je Fahrlehrer, Fahrzeuge, Rollen"],
              ["Betriebs-Plattform nach Maß", "ab 10.900 € einmalig oder ab 599 € im Monat zur Miete", "Mehrere Filialen, eigene Abläufe, Schnittstellen"],
            ],
            caption: "TasWiq-Preise sind Endpreise nach § 19 UStG. Bei Kauf kommt der Betrieb ab 49 € im Monat dazu, bei der Miete ist er enthalten. Miete: 3 Monate Testzeit, danach 12 Monate Laufzeit.",
          },
        },
        {
          p: "Die Preise fertiger Apps veröffentlichen viele Anbieter nicht – du bekommst sie auf Anfrage. Frag dabei immer nach dem Preis für deine tatsächliche Zahl an Fahrlehrern und Schülern und nach den Kosten im zweiten Jahr.",
        },
      ],
    },
    {
      h2: "Welche Funktionen braucht eine Fahrschul-App wirklich?",
      blocks: [
        {
          ul: [
            "**Fahrstunden buchen:** Schüler sehen freie Zeiten ihres Fahrlehrers und buchen selbst.",
            "**Absagen und Nachrücken:** Wird eine Stunde frei, bekommt die Warteliste eine Nachricht.",
            "**Erinnerung:** Push-Nachricht am Vortag, damit keine Stunde ausfällt.",
            "**Ausbildungsstand:** Welche Pflichtfahrten sind erledigt, was fehlt bis zur Prüfung?",
            "**Zahlung und Guthaben:** Stunden vorab bezahlen, Guthaben aufladen, Rechnung abrufen.",
            "**Fahrlehrer-Ansicht:** Tagesplan, Schülerliste, Notizen zur letzten Stunde.",
            "**Büro-Ansicht:** Auslastung je Fahrlehrer und Fahrzeug, offene Zahlungen.",
          ],
        },
        {
          p: "Theorie-Lernen mit Prüfungsfragen ist ein eigenes Produkt. Dafür gibt es etablierte Lern-Apps, die du nicht nachbauen musst – eine eigene App verlinkt dorthin und kümmert sich um das, was nur deine Fahrschule betrifft: Termine, Ausbildungsstand und Geld.",
        },
      ],
    },
    {
      h2: "Rechnung: Ab wann lohnt sich die eigene App?",
      blocks: [
        { p: "Rechne mit deinen eigenen Zahlen:" },
        {
          ol: [
            "Wie viele Minuten am Tag verbringt ein Fahrlehrer mit Terminabsprachen, Absagen und Nachfragen?",
            "Mal Arbeitstage im Monat, mal Zahl der Fahrlehrer – das sind die Stunden, die nicht im Auto stattfinden.",
            "Wie viele Fahrstunden fallen im Monat aus, weil kurzfristig abgesagt und nicht nachbesetzt wurde?",
            "Bewerte beides mit deinem Preis je Fahrstunde und vergleich die Summe mit der Monatsrate der App.",
          ],
        },
        {
          tip: "Beispiel mit angenommenen Werten: Zwei Fahrlehrer verbringen je 20 Minuten am Tag mit Terminabsprachen, bei 22 Arbeitstagen sind das rund 15 Stunden im Monat. Kommen vier ausgefallene Stunden dazu, die eine Warteliste nachbesetzt hätte, ist die Miete von 309 € schnell eingespielt. Setz deine Werte ein – bei einem Fahrlehrer mit vollem Kalender sieht es anders aus.",
        },
      ],
    },
    {
      h2: "Web-App oder App aus dem Store?",
      blocks: [
        {
          p: "Für Fahrschulen reicht fast immer eine Web-App: Sie wird über einen Link oder QR-Code geöffnet, lässt sich auf dem Startbildschirm ablegen und läuft auf iPhone und Android. Du sparst die Freigabe im App-Store und doppelte Entwicklung. Eine App aus dem Store ist dann sinnvoll, wenn du Funktionen brauchst, die nur dort gehen. Die Unterschiede erklärt der Ratgeber [Web-App oder native App](/blog/web-app-oder-native-app).",
        },
        {
          p: "Wie Buchung, Status und Kundenbereich in einem System zusammenspielen, zeigt unsere [Werkstatt-Demo](/demo/werkstatt) – dasselbe Prinzip, das wir für Fahrschulen mit Fahrstunden, Ausbildungsstand und Zahlungen umsetzen. Mehr dazu auf der Seite [Software für Autohaus, Werkstatt und Fahrschule](/leistungen/software-autohaus-fahrschule).",
        },
      ],
    },
    {
      h2: "Checkliste vor der Entscheidung",
      blocks: [
        {
          ul: [
            "Wie laufen Terminabsprachen heute – und wer macht sie?",
            "Wie viele Stunden fallen im Monat ersatzlos aus?",
            "Soll die App unter dem Namen deiner Fahrschule laufen?",
            "Wie rechnest du ab: je Stunde, Pakete, Guthaben?",
            "Welche Verwaltungssoftware nutzt du, und soll die App Daten dorthin übergeben?",
            "Wer im Büro pflegt Fahrlehrer, Fahrzeuge und Zeiten?",
            "Kannst du deine Schülerdaten exportieren, wenn du den Anbieter wechselst?",
          ],
        },
        {
          p: "Mit diesen Antworten bekommst du im [Preisrechner](/preisrechner) in zwei Minuten einen Kostenrahmen.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was kostet eine eigene Fahrschul-App?",
      a: "Die Kunden- und Schüler-App kostet einmalig 3.900 € oder ab 309 € im Monat zur Miete. Für mehrere Fahrlehrer mit eigenen Kalendern und Fahrzeugen ab 6.400 € oder ab 419 € im Monat. Es gibt keine Gebühr pro Schüler.",
    },
    {
      q: "Brauche ich eine App im App-Store?",
      a: "Meist nicht. Eine Web-App läuft auf jedem Handy, wird per Link geöffnet und kann auf dem Startbildschirm liegen. Das spart Kosten und Wartezeit. Eine Store-App bauen wir, wenn es dafür einen konkreten Grund gibt.",
    },
    {
      q: "Wie lange dauert die Entwicklung?",
      a: "Die Kunden- und Schüler-App ist in vier bis sechs Wochen live. Vorher bekommst du einen klickbaren Prototyp und einen Festpreis.",
    },
    {
      q: "Kann die App mit meiner Fahrschulverwaltung zusammenarbeiten?",
      a: "Wenn die Verwaltungssoftware eine Schnittstelle oder einen Export anbietet, ja. Eine Schnittstelle kostet als Zusatz 1.490 €. Ob das bei deinem Programm möglich ist, klären wir vor dem Angebot.",
    },
    {
      q: "Lohnt sich eine App auch für eine kleine Fahrschule?",
      a: "Wenn ein Fahrlehrer seinen Kalender allein im Griff hat: selten. Mit zwei oder mehr Fahrlehrern, Warteliste und Vorauszahlung rechnet es sich meist. Wer nur die Buchung braucht, startet mit Online-Terminen ab 2.200 € oder ab 239 € im Monat.",
    },
  ],
};
