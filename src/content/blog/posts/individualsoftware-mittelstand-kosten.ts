import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "individualsoftware-mittelstand-kosten",
  category: "software",
  title: "Individualsoftware für den Mittelstand: Kosten, Ablauf und wann sie sich lohnt",
  seoTitle: "Individualsoftware: Kosten, Ablauf & wann sie sich lohnt",
  description: "Was kostet individuelle Software 2026? Richtpreise, Kostentreiber, Ablauf vom Workshop bis zum Betrieb und eine Checkliste, ob sich eigene Software lohnt.",
  keywords: ["Individualsoftware Kosten", "Individualsoftware Mittelstand", "Software entwickeln lassen", "Softwareentwicklung KMU", "eigene Software Unternehmen"],
  date: "2026-09-27",
  page: "individualsoftware",
  intro:
    "„Gibt es dafür nicht schon eine Software?“ – meistens ja. Und trotzdem arbeiten viele mittelständische Betriebe mit fünf Tools, drei Excel-Listen und einem Kollegen, der als einziger weiß, wie alles zusammenhängt. Individuelle Software ist dann sinnvoll, wenn dein Ablauf dein Wettbewerbsvorteil ist – oder wenn Standard-Tools mehr Arbeit machen, als sie sparen.",
  takeaways: [
    "Richtwerte: ein Kernprozess ab ca. 10.900 €, mehrere Prozesse ab ca. 18.900 €.",
    "Die größten Kostentreiber sind Schnittstellen, Rollen und unklare Anforderungen.",
    "Ein klickbarer Prototyp vor der Entwicklung spart das meiste Geld.",
    "Mit KI-gestützter Entwicklung sind Projekte heute deutlich schneller fertig als noch vor wenigen Jahren.",
  ],
  sections: [
    {
      h2: "Wann sich eigene Software lohnt – die Checkliste",
      blocks: [
        { p: "Wenn du drei oder mehr Punkte mit Ja beantwortest, lohnt sich ein genauerer Blick:" },
        {
          ul: [
            "Ihr pflegt dieselben Daten in mehreren Tools oder Listen.",
            "Ein wichtiger Ablauf hängt am Wissen einer einzigen Person.",
            "Ihr zahlt für viele Nutzer-Lizenzen, von denen jeder nur einen Bruchteil nutzt.",
            "Standard-Software zwingt euch zu Umwegen, die jeden Tag Zeit kosten.",
            "Kunden fragen regelmäßig nach einem Status, den ihr manuell heraussuchen müsst.",
            "Ihr wollt wachsen, ohne proportional mehr Verwaltung einzustellen.",
          ],
        },
      ],
    },
    {
      h2: "Was kostet Individualsoftware?",
      blocks: [
        { p: "Seriöse Preise gibt es erst nach einem Workshop. Als Orientierung helfen diese Richtwerte aus unserem [Preisrechner](/preisrechner):" },
        {
          table: {
            head: ["Umfang", "Richtpreis einmalig", "Beispiel"],
            rows: [
              ["Dashboard", "ab 4.900 €", "Kennzahlen aus 2–3 Quellen an einem Ort"],
              ["Kundenportal", "ab 7.400 €", "Login, Dokumente, Status, Nachrichten"],
              ["Ein Kernprozess", "ab 10.900 €", "Auftrag → Einsatz → Rechnung"],
              ["Mehrere Prozesse", "ab 18.900 €", "Rollen & Rechte, Schnittstellen, Admin"],
              ["Plattform", "ab 29.900 €", "Mehrere Abteilungen oder Standorte"],
            ],
            caption: "Endpreise nach § 19 UStG. Hosting & Wartung ab 49 €, Betrieb & Support ab 149 € im Monat.",
          },
        },
      ],
    },
    {
      h2: "Die fünf größten Kostentreiber",
      blocks: [
        {
          ol: [
            "**Schnittstellen**: Jede Anbindung an Kasse, ERP, DATEV oder CRM braucht Abstimmung und Tests.",
            "**Rollen und Rechte**: Wer darf was sehen und ändern? Je feiner, desto aufwendiger.",
            "**Unklare Anforderungen**: Das teuerste Wort in der Softwareentwicklung ist „ach, und außerdem …“ in Woche sechs.",
            "**Datenübernahme**: Alte Excel-Listen sind selten so sauber, wie alle denken.",
            "**Sonderfälle**: 80 % der Fälle sind schnell gebaut, die letzten 20 % kosten oft genauso viel.",
          ],
        },
        { tip: "Unser Rat: Starte mit dem Kernprozess, der am meisten Zeit kostet. Baue Sonderfälle erst, wenn sie im echten Betrieb wirklich auftauchen." },
      ],
    },
    {
      h2: "Der Ablauf bei uns",
      blocks: [
        {
          ol: [
            "**Workshop (1–2 Termine)**: Wir schauen uns den Ablauf an, nicht die Wunschliste. Ergebnis: Prozessbild und Prioritäten.",
            "**Klickbarer Prototyp in 7 Tagen**: Du klickst dich durch, bevor programmiert wird. Änderungen kosten hier fast nichts.",
            "**Festpreis-Angebot**: Auf Basis des Prototyps, aufgeteilt in Etappen.",
            "**Entwicklung in Etappen**: Jede Etappe ist nutzbar. Du siehst alle ein bis zwei Wochen den Stand.",
            "**Einführung und Betrieb**: Schulung, Monitoring, Updates, Weiterentwicklung.",
          ],
        },
        {
          p: "Warum das heute schneller geht als früher, erklären wir im Beitrag [Software mit KI entwickeln](/blog/software-mit-ki-entwickeln).",
        },
      ],
    },
    {
      h2: "Wem gehört die Software?",
      blocks: [
        {
          p: "Bei uns dir. Du bekommst den Quellcode, die Zugänge zu Hosting und Datenbank und eine Dokumentation. Wenn du später mit einem anderen Team weiterarbeiten willst, kannst du das. Wir setzen auf verbreitete Technologien wie Next.js, TypeScript und PostgreSQL – damit du nicht von uns abhängig bist.",
        },
      ],
    },
    {
      h2: "Individualsoftware oder Standard-Software anpassen?",
      blocks: [
        {
          p: "Viele Betriebe versuchen zuerst, eine Standard-Software mit Plugins, Zusatzfeldern und Workarounds passend zu machen. Das funktioniert eine Weile. Irgendwann kostet das Drumherum mehr als die Software selbst: Zusatzlizenzen, Beraterstunden, manuelle Nacharbeit. Ein guter Indikator: Wenn dein Team regelmäßig Daten aus einem Tool exportiert, in Excel bearbeitet und in ein anderes importiert, ist das ein Prozess, der in eigene Software gehört.",
        },
        {
          table: {
            head: ["", "Standard-Software", "Individualsoftware"],
            rows: [
              ["Start", "sofort", "Wochen"],
              ["Passung", "Durchschnitt aller Kunden", "genau dein Ablauf"],
              ["Kosten", "laufend pro Nutzer", "einmalig + Betrieb"],
              ["Änderungen", "Roadmap des Anbieters", "wenn du sie brauchst"],
              ["Daten", "beim Anbieter", "bei dir"],
            ],
          },
        },
      ],
    },
    {
      h2: "Worauf du bei einem Software-Partner achten solltest",
      blocks: [
        {
          ul: [
            "**Er fragt nach deinem Ablauf**, nicht nach deiner Feature-Liste.",
            "**Er zeigt früh etwas Klickbares**, statt monatelang Konzepte zu schreiben.",
            "**Er nennt einen Festpreis pro Etappe** – nach dem Prototyp, nicht vor dem ersten Gespräch.",
            "**Du bekommst den Quellcode** und Zugänge zu allem.",
            "**Er setzt auf verbreitete Technologien**, damit du nicht von einer einzigen Agentur abhängig bist.",
            "**Er redet über Betrieb**: Wer kümmert sich um Updates, Sicherheit und Backups, wenn das Projekt fertig ist?",
          ],
        },
      ],
    },
    {
      h2: "Förderung für Digitalisierungsprojekte",
      blocks: [
        {
          p: "Je nach Bundesland und Programm gibt es Förderungen für Digitalisierungsprojekte kleiner und mittlerer Unternehmen. Die Bedingungen ändern sich regelmäßig. Frag bei deiner IHK, deiner Hausbank oder der Wirtschaftsförderung deiner Region nach aktuellen Programmen – und zwar bevor du einen Auftrag vergibst, denn viele Programme verlangen einen Antrag vor Projektbeginn.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Ist Individualsoftware nicht viel teurer als ein Abo?",
      a: "Kurzfristig ja, langfristig oft nicht – besonders bei vielen Nutzern. Wir haben das im Beitrag „SaaS-Abo oder eigene Software“ über fünf Jahre durchgerechnet.",
    },
    {
      q: "Wie lange dauert ein Projekt?",
      a: "Ein Kernprozess ist oft in sechs bis zehn Wochen produktiv. Größere Plattformen entstehen in Etappen über mehrere Monate.",
    },
    {
      q: "Was, wenn sich unsere Anforderungen ändern?",
      a: "Das ist normal. Mit dem Weiterentwicklungs-Paket bauen wir jeden Monat neue Funktionen – planbar und ohne neues Großprojekt.",
    },
  ],
};
