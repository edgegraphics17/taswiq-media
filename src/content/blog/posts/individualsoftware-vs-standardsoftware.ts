import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "individualsoftware-vs-standardsoftware",
  category: "software",
  title: "Individualsoftware vs. Standardsoftware: Beispiele und eine ehrliche Entscheidungshilfe",
  seoTitle: "Individualsoftware vs. Standardsoftware: Beispiele & Test",
  description: "Individualsoftware vs. Standardsoftware: Unterschiede, sechs Beispiele aus kleinen Betrieben, ein 7-Fragen-Test und eine Kostenrechnung über fünf Jahre.",
  keywords: ["Individualsoftware vs Standardsoftware", "Individualsoftware Beispiele", "Standardsoftware Vorteile Nachteile", "Individualsoftware Vorteile", "Make or Buy Software"],
  date: "2026-10-08",
  page: "individualsoftware",
  intro:
    "Individualsoftware vs. Standardsoftware ist keine Glaubensfrage: Standardsoftware ist richtig für alles, was in jedem Betrieb gleich läuft – Buchhaltung, E-Mail, Lohn. Individualsoftware lohnt sich für den einen Ablauf, mit dem du Geld verdienst und der bei dir anders läuft als bei anderen. Die meisten kleinen und mittleren Betriebe fahren am besten mit beidem: Standard für die Pflicht, eine eigene Lösung für den Kernprozess.",
  takeaways: [
    "Standardsoftware: schnell, günstig im Einstieg, aber du passt dich dem Programm an.",
    "Individualsoftware: passt zu deinem Ablauf und gehört dir, kostet aber mehr am Anfang.",
    "Die Regel: Standard für alles Austauschbare, individuell für das, was dich von anderen unterscheidet.",
    "Richtwerte: ein Kernprozess ab 10.900 € oder ab 599 € im Monat zur Miete.",
  ],
  sections: [
    {
      h2: "Was ist der Unterschied zwischen Individualsoftware und Standardsoftware?",
      blocks: [
        {
          p: "**Standardsoftware** wird einmal entwickelt und an viele verkauft – als Programm oder als Abo im Browser. Du bekommst, was alle bekommen, und stellst ein, was der Hersteller einstellbar gemacht hat. **Individualsoftware** wird für genau einen Betrieb gebaut: Sie bildet deinen Ablauf ab, heißt wie du willst und kann, was du brauchst – nicht mehr und nicht weniger.",
        },
        {
          table: {
            head: ["", "Standardsoftware", "Individualsoftware"],
            rows: [
              ["Start", "sofort bis wenige Tage", "6 bis 14 Wochen, je nach Umfang"],
              ["Kosten am Anfang", "niedrig", "höher – oder Miete ohne Anzahlung"],
              ["Kosten auf Dauer", "monatlich, oft pro Nutzer, steigen mit dem Team", "fester Betrieb, unabhängig von der Nutzerzahl"],
              ["Passform", "du arbeitest, wie das Programm es vorsieht", "das Programm arbeitet, wie du es vorsiehst"],
              ["Weiterentwicklung", "bestimmt der Hersteller", "bestimmst du"],
              ["Daten und Code", "liegen beim Anbieter", "gehören dir"],
              ["Risiko", "Preiserhöhung, Funktion fällt weg, Anbieter stellt ein", "Abhängigkeit vom Entwickler – deshalb Quellcode und Dokumentation verlangen"],
            ],
          },
        },
      ],
    },
    {
      h2: "Wann ist Standardsoftware die bessere Wahl?",
      blocks: [
        {
          ul: [
            "Der Ablauf ist **bei allen gleich** oder gesetzlich vorgegeben: Buchhaltung, Lohn, Kasse, E-Mail, Kalender.",
            "Du willst **nächste Woche** arbeiten und nicht in zwei Monaten.",
            "Du weißt noch nicht genau, wie dein Ablauf aussehen soll – dann hilft ein Standardprogramm beim Herausfinden.",
            "Das Programm deckt **80 % und mehr** ab, und der Rest stört nicht.",
          ],
        },
        {
          p: "Wer hier individuell bauen lässt, bezahlt für etwas, das es fertig gibt. Ein seriöser Entwickler sagt dir das auch.",
        },
      ],
    },
    {
      h2: "Wann lohnt sich Individualsoftware?",
      blocks: [
        {
          ul: [
            "Du nutzt **drei Programme und eine Excel-Liste** für einen Ablauf und tippst Daten mehrfach ab.",
            "Die Abo-Kosten steigen mit jedem Mitarbeiter, obwohl ihr nur einen Bruchteil der Funktionen nutzt.",
            "Dein Ablauf ist dein **Vorteil** – schneller im Angebot, anders im Service – und kein Programm bildet ihn ab.",
            "Kunden sollen selbst etwas tun können: buchen, bestellen, Unterlagen hochladen, Status sehen.",
            "Du brauchst Sprachen, Rollen oder Regeln, die im Standard nicht vorgesehen sind.",
          ],
        },
        {
          p: "Wie wir solche Lösungen bauen – mit Workshop, klickbarem Prototyp und Festpreis – steht auf der Seite [Individualsoftware für den Mittelstand](/leistungen/individualsoftware-mittelstand).",
        },
      ],
    },
    {
      h2: "Individualsoftware-Beispiele aus kleinen Betrieben",
      blocks: [
        {
          table: {
            head: ["Betrieb", "Standard wäre", "Individuell gebaut", "Warum"],
            rows: [
              ["Bäckerei", "Liefer-Plattform mit Abgabe pro Bestellung", "Eigenes Bestellsystem mit Küchen-Board", "Keine Provision, eigene Kundendaten, drei Sprachen"],
              ["Friseursalon", "Buchungs-Marktplatz", "Eigene Website mit Buchung", "Eigene Marke, kein Vergleich mit dem Salon nebenan"],
              ["Beratung für Anträge", "Formulare und E-Mail", "Web-App mit Upload, Checkliste und Erklärungen", "Nutzer in neun Sprachen, Ablauf gibt es nicht von der Stange"],
              ["Handwerksbetrieb", "Rechnungsprogramm", "Anfrage-Formular mit Angebotsrechner davor", "Die Lücke liegt vor dem Auftrag, nicht in der Rechnung"],
              ["Hausverwaltung", "Verwalter-Software", "Mieterportal für Meldungen und Dokumente", "Weniger Anrufe, Status für alle sichtbar"],
              ["Kanzlei", "E-Mail-Anhänge", "Mandantenportal mit Beleg-Upload", "Unterlagen vollständig, ohne Nachfragen"],
            ],
          },
        },
        {
          p: "Die meisten dieser Fälle kannst du selbst ausprobieren: In unseren [Software-Demos](/demo) klickst du dich durch Bestellsystem, Terminbuchung, Handwerker-Software, Makler-Portal und Mandantenportal – jeweils aus Sicht der Kunden und des Betriebs.",
        },
      ],
    },
    {
      h2: "Was kostet das im Vergleich?",
      blocks: [
        {
          p: "Eine Rechnung zum Selbsteinsetzen – trag deine eigenen Zahlen ein. Angenommen, dein Team hat acht Personen und ein Standardprogramm kostet 60 € pro Person und Monat:",
        },
        {
          table: {
            head: ["Weg", "Rechnung", "Summe nach 5 Jahren"],
            rows: [
              ["Standardsoftware (Annahme)", "8 Personen × 60 € × 60 Monate", "28.800 €"],
              ["Individualsoftware, ein Kernprozess, gekauft", "10.900 € + 60 × 149 € Betrieb & Support", "19.840 €"],
              ["Individualsoftware, ein Kernprozess, gemietet", "60 × 599 €", "35.940 €"],
            ],
            caption: "Die 60 € pro Person sind eine Annahme für die Rechnung, kein Marktpreis. Individualsoftware: Endpreise nach § 19 UStG, Einstiegspreise.",
          },
        },
        {
          p: "Die Rechnung kippt mit der Teamgröße: Bei drei Personen ist das Standardprogramm klar günstiger, bei fünfzehn die eigene Lösung. Was in der Tabelle fehlt, ist der wichtigere Posten – die Stunden, die dein Team heute mit Abtippen und Suchen verbringt. Die genaue Aufstellung findest du im Ratgeber [Was kostet Individualsoftware?](/blog/individualsoftware-mittelstand-kosten) und im [Preisrechner](/preisrechner).",
        },
      ],
    },
    {
      h2: "Der 7-Fragen-Test",
      blocks: [
        { p: "Beantworte jede Frage mit Ja oder Nein:" },
        {
          ol: [
            "Verdienst du mit diesem Ablauf direkt Geld?",
            "Läuft er bei dir spürbar anders als bei Mitbewerbern?",
            "Nutzt ihr dafür heute mehr als zwei Programme oder Listen?",
            "Werden Daten von Hand von einem System ins andere übertragen?",
            "Sollen Kunden selbst etwas erledigen können?",
            "Steigen deine Abo-Kosten mit jedem neuen Mitarbeiter?",
            "Hast du ein Standardprogramm getestet und bist an einer festen Grenze hängen geblieben?",
          ],
        },
        {
          tip: "Bis zwei Ja: Bleib bei Standardsoftware. Drei bis vier: Prüf eine Erweiterung oder Schnittstelle zu deinem bestehenden Programm. Fünf und mehr: Lass dir einen Prototyp für eine eigene Lösung zeigen.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was sind Beispiele für Individualsoftware?",
      a: "Ein eigenes Bestellsystem für eine Bäckerei, ein Buchungssystem auf der Website eines Salons, ein Mandanten- oder Mieterportal, ein Angebotsrechner für einen Handwerksbetrieb oder eine Web-App, die einen ganzen Ablauf von der Anfrage bis zur Rechnung abbildet.",
    },
    {
      q: "Ist Individualsoftware immer teurer als Standardsoftware?",
      a: "Am Anfang ja. Auf mehrere Jahre gerechnet hängt es von der Zahl der Nutzer und vom Abo-Preis ab – bei größeren Teams ist die eigene Lösung oft günstiger, bei zwei bis drei Personen fast nie.",
    },
    {
      q: "Kann ich Standardsoftware und Individualsoftware kombinieren?",
      a: "Ja, das ist der häufigste Fall. Die Buchhaltung bleibt im Standardprogramm, die eigene Lösung übernimmt den Kernprozess und übergibt die Daten über eine Schnittstelle. Schnittstellen kosten als Zusatz 1.490 €.",
    },
    {
      q: "Was passiert, wenn der Entwickler nicht mehr verfügbar ist?",
      a: "Deshalb gehören Quellcode und Dokumentation zum Lieferumfang. Beim Kauf gehört dir beides, sodass ein anderer Entwickler die Software weiterführen kann.",
    },
    {
      q: "Wie lange dauert die Entwicklung?",
      a: "Ein Kernprozess ist in sechs bis zehn Wochen produktiv, mehrere Prozesse in zehn bis vierzehn Wochen. Größere Plattformen gehen in Etappen live.",
    },
    {
      q: "Kann ich Individualsoftware mieten?",
      a: "Ja. Ein Kernprozess kostet zur Miete ab 599 € im Monat, inklusive Hosting, Wartung, Support und Updates. Die ersten drei Monate sind Testzeit, danach gelten zwölf Monate Mindestlaufzeit.",
    },
  ],
};
