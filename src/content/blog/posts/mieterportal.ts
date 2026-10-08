import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "mieterportal",
  category: "branchen",
  title: "Mieterportal für Hausverwaltungen und private Vermieter: Funktionen, Kosten, Entscheidung",
  seoTitle: "Mieterportal: Funktionen, Kosten & wann es sich lohnt",
  description: "Mieterportal für Hausverwaltungen und private Vermieter: was es kann, wann Standardsoftware reicht und was ein eigenes Portal je Einheit kostet.",
  keywords: ["Mieterportal", "Mieterportal Hausverwaltung", "Software Hausverwaltung für private Vermieter", "Mieter App", "Schadensmeldung online"],
  date: "2026-10-08",
  page: "immobilien",
  intro:
    "Ein Mieterportal ist ein geschützter Bereich, in dem Mieter Schäden melden, Dokumente abrufen, Zählerstände durchgeben und den Stand ihres Anliegens sehen – ohne anzurufen. Private Vermieter mit wenigen Wohnungen brauchen dafür kein eigenes Portal: Gängige Vermieter-Software bringt eines mit oder es geht ohne. Für Hausverwaltungen lohnt sich ein eigenes Mieterportal, sobald Telefon und Postfach den Tag bestimmen – es kostet einmalig ab 7.400 € oder ab 459 € im Monat zur Miete.",
  takeaways: [
    "Ein Mieterportal spart vor allem eines: Rückfragen. Jede Meldung hat einen Status, den alle sehen.",
    "Private Vermieter: erst prüfen, ob die vorhandene Vermieter-Software ein Portal im Tarif hat.",
    "Hausverwaltungen: Rechne die Kosten pro Einheit und Monat – bei 300 Einheiten liegt die Miete bei rund 1,53 € je Einheit.",
    "Ein Portal ersetzt nicht die Abrechnungssoftware, sondern den Kanal zum Mieter.",
  ],
  sections: [
    {
      h2: "Was ist ein Mieterportal – und was kann es?",
      blocks: [
        {
          ul: [
            "**Schadensmeldung mit Foto** – der Mieter wählt Raum und Art des Schadens, lädt Bilder hoch und bekommt eine Vorgangsnummer.",
            "**Status für jede Meldung** – eingegangen, beauftragt, Termin, erledigt. Der Mieter schaut nach, statt anzurufen.",
            "**Dokumente** – Mietvertrag, Hausordnung, Nebenkostenabrechnung, Bescheinigungen zum Herunterladen.",
            "**Zählerstände** – mit Foto und Datum, zum Stichtag per Erinnerung.",
            "**Mitteilungen ans Haus** – Wasser abgestellt, Treppenhausreinigung, Handwerkertermin.",
            "**Formulare** – Untervermietung, Tierhaltung, Schlüsselbestellung, Wohnungsgeberbestätigung.",
            "**Mehrere Sprachen** – damit auch Mieter melden, die sich am Telefon schwertun.",
          ],
        },
        {
          p: "Für die Verwaltung entsteht daraus eine Liste aller Vorgänge mit Zuständigkeit und Frist. Wie sich das in eine Lösung für Makler und Verwalter einfügt, zeigt die Seite [Software für Immobilien](/leistungen/software-immobilien).",
        },
      ],
    },
    {
      h2: "Wann reicht die Standardsoftware?",
      blocks: [
        {
          p: "Für **private Vermieter** fast immer. Vermieter-Programme für wenige Einheiten kosten nach den Preislisten der Anbieter oft nur einen einstelligen bis niedrigen zweistelligen Betrag im Monat, manche Einstiegstarife sind kostenlos. Wichtiger als das Portal sind dort Mieteingang, Nebenkostenabrechnung und die Unterlagen für die Steuer. Achte beim Vergleich darauf, in welchem Tarif das Mieterportal enthalten ist – häufig erst in den höheren.",
        },
        {
          p: "Auch für **Hausverwaltungen** gilt: Bietet deine Verwalter-Software ein Portal, das deine Mieter annehmen und das zu deinem Ablauf passt, nimm es. Ein System ist besser als zwei.",
        },
      ],
    },
    {
      h2: "Wann lohnt sich ein eigenes Mieterportal?",
      blocks: [
        {
          table: {
            head: ["Situation", "Standard-Portal", "Eigenes Portal"],
            rows: [
              ["Deine Verwalter-Software hat kein Portal oder nur gegen hohen Aufpreis je Einheit", "–", "passt"],
              ["Du willst unter eigenem Namen auftreten, nicht unter dem des Software-Herstellers", "eingeschränkt", "passt"],
              ["Handwerker sollen Aufträge direkt sehen und Termine zurückmelden", "selten", "passt"],
              ["Eigentümer sollen den Stand ihrer Objekte einsehen", "je nach Software", "passt"],
              ["Mieter sprechen viele Sprachen", "meist Deutsch und Englisch", "frei wählbar"],
              ["Du verwaltest zehn Wohnungen", "passt", "zu groß"],
            ],
          },
        },
        {
          p: "Wie ein mehrsprachiges Portal mit Upload und Checkliste aussieht, zeigt unsere Web-App [Antragsbruder](/portfolio): Nutzer laden Unterlagen hoch und sehen, was noch fehlt – in neun Sprachen.",
        },
      ],
    },
    {
      h2: "Was kostet ein eigenes Mieterportal?",
      blocks: [
        { p: "Die Richtwerte sind dieselben wie im [Preisrechner](/preisrechner):" },
        {
          table: {
            head: ["Stufe", "Kaufen (einmalig)", "Mieten (pro Monat)", "Enthalten"],
            rows: [
              ["Kundenportal", "ab 7.400 €", "ab 459 €", "Login, Dokumente & Upload, Status & Nachrichten am Vorgang, Rollen für Mieter und Team"],
              ["Portal mit Workflows", "ab 12.900 €", "ab 689 €", "+ Formulare & Freigaben, frei definierbare Rollen (z. B. Handwerker, Eigentümer), Automationen & Erinnerungen"],
            ],
            caption: "Endpreise nach § 19 UStG. Kauf: zusätzlich Betrieb & Support ab 149 € im Monat. Miete: Hosting, Wartung, Support und Updates inklusive, 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit. Zusätze: Schnittstelle zur Verwalter-Software 1.490 €, weitere Sprachen 690 €, Datenübernahme 990 €.",
          },
        },
        { p: "Entscheidend ist der Preis je Einheit. Die Miete der ersten Stufe, verteilt auf deinen Bestand:" },
        {
          table: {
            head: ["Verwaltete Einheiten", "459 € Miete je Einheit und Monat"],
            rows: [
              ["100", "4,59 €"],
              ["300", "1,53 €"],
              ["600", "rund 0,77 €"],
              ["1.000", "rund 0,46 €"],
            ],
          },
        },
        {
          tip: "Gegenrechnung: Wie viele Anrufe und E-Mails zu Schäden, Dokumenten und „Wie ist der Stand?“ bekommt deine Verwaltung pro Woche? Rechne mit den Minuten, die jede Rückfrage wirklich kostet – inklusive Suchen und Rückruf. Diese Stunden sind der Wert des Portals.",
        },
      ],
    },
    {
      h2: "Wie bringst du Mieter dazu, das Portal zu nutzen?",
      blocks: [
        {
          ol: [
            "**Ohne App-Store starten.** Ein Link oder QR-Code im Hausflur reicht; die Seite lässt sich auf den Startbildschirm legen.",
            "**Einladung mit persönlichem Zugang** per Brief oder E-Mail, nicht „registrieren Sie sich selbst“.",
            "**Einen echten Vorteil geben.** Die Nebenkostenabrechnung und Bescheinigungen gibt es zuerst im Portal.",
            "**Am Telefon darauf verweisen** – freundlich, mit dem Angebot, die Meldung gemeinsam anzulegen.",
            "**Telefon und Papier bleiben möglich.** Nicht jeder Mieter hat ein Smartphone; das Team trägt solche Meldungen selbst ein.",
          ],
        },
      ],
    },
    {
      h2: "Checkliste vor dem Start",
      blocks: [
        {
          ul: [
            "Was sind die fünf häufigsten Anliegen deiner Mieter?",
            "Bietet deine Verwalter-Software ein Portal oder eine Schnittstelle?",
            "Wer bearbeitet welche Meldung, und in welcher Frist?",
            "Sollen Handwerker und Eigentümer eigene Zugänge bekommen?",
            "Welche Dokumente dürfen im Portal liegen, und wie lange?",
            "Wo liegen die Daten, und gibt es einen Vertrag zur Auftragsverarbeitung?",
            "In welchen Sprachen brauchst du das Portal?",
            "Wie kommen die Mieter-Stammdaten ins System – Import oder Schnittstelle?",
          ],
        },
        {
          p: "Weitere Bausteine für Makler und Verwalter beschreibt der Ratgeber [Software für Makler und Hausverwaltungen](/blog/software-fuer-makler-und-hausverwaltungen).",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was ist ein Mieterportal?",
      a: "Ein geschützter Online-Bereich für Mieter: Schäden melden, Dokumente abrufen, Zählerstände durchgeben und den Stand der eigenen Anliegen sehen. Die Verwaltung bekommt alle Vorgänge in einer Liste mit Zuständigkeit und Status.",
    },
    {
      q: "Brauche ich als privater Vermieter ein Mieterportal?",
      a: "Bei wenigen Wohnungen in der Regel nicht. Eine Vermieter-Software für Mieteingang und Nebenkostenabrechnung ist wichtiger; manche enthalten ein einfaches Portal. Ein eigenes Portal lohnt sich erst bei größeren Beständen.",
    },
    {
      q: "Was kostet ein eigenes Mieterportal?",
      a: "Einmalig ab 7.400 € oder ab 459 € im Monat zur Miete. Mit Formularen, Freigaben und eigenen Rollen für Handwerker und Eigentümer ab 12.900 € oder ab 689 € im Monat.",
    },
    {
      q: "Lässt sich das Portal mit meiner Hausverwaltungssoftware verbinden?",
      a: "Wenn deine Software eine Schnittstelle oder einen Datenexport anbietet, ja. Die Schnittstelle kostet als Zusatz 1.490 €; wir prüfen das vor dem Angebot.",
    },
    {
      q: "Müssen Mieter eine App installieren?",
      a: "Nein. Das Portal läuft im Browser auf jedem Handy und lässt sich wie eine App auf den Startbildschirm legen – ohne App-Store.",
    },
    {
      q: "Wie lange dauert es, bis das Portal läuft?",
      a: "Ein Kundenportal ist in fünf bis sechs Wochen live, ein Portal mit Workflows in sechs bis acht Wochen. Vorher siehst du einen klickbaren Prototyp und bekommst einen Festpreis.",
    },
  ],
};
