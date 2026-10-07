import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "saas-abo-oder-eigene-software",
  category: "ratgeber",
  title: "SaaS-Abo oder eigene Software? Die Rechnung über fünf Jahre",
  seoTitle: "SaaS-Abo oder eigene Software? Rechnung über 5 Jahre",
  description: "Monatliche Abo-Software oder einmalig eigene Software? Eine transparente Fünf-Jahres-Rechnung mit Beispielzahlen – und wann welches Modell gewinnt.",
  keywords: ["SaaS oder eigene Software", "eigene Software statt Abo", "Softwarekosten vergleichen", "Lizenzkosten sparen", "Software kaufen oder mieten"],
  date: "2026-09-27",
  page: "individualsoftware",
  intro:
    "Software-Abos sind bequem: kein Projekt, keine Investition, sofort startklar. Über die Jahre summieren sich die Gebühren aber – besonders, wenn sie pro Nutzer oder pro Buchung anfallen. Eigene Software kostet einmalig mehr, danach nur noch den Betrieb. Wann lohnt sich was? Wir rechnen es an einem Beispiel durch.",
  takeaways: [
    "Abos gewinnen bei Standard-Prozessen und wenigen Nutzern.",
    "Eigene Software gewinnt bei vielen Nutzern, Provisionen oder speziellen Abläufen.",
    "Die ehrliche Rechnung vergleicht fünf Jahre, nicht einen Monat.",
    "Nicht vergessen: Kundendaten, Marke und Unabhängigkeit haben auch einen Wert.",
  ],
  sections: [
    {
      h2: "Ein Rechenbeispiel",
      blocks: [
        {
          p: "Angenommen, ein Betrieb mit zwölf Mitarbeitern nutzt ein Abo-Tool für Terminplanung und Kundenverwaltung für 39 € pro Nutzer im Monat. Das sind 468 € im Monat oder rund 28.000 € in fünf Jahren – ohne Preiserhöhungen. Eine eigene Lösung mit ähnlichem Funktionsumfang liegt bei rund 10.900 € einmalig plus 149 € Betrieb im Monat.",
        },
        {
          table: {
            head: ["", "Abo (12 Nutzer à 39 €)", "Eigene Software"],
            rows: [
              ["Einmalig", "0 €", "10.900 €"],
              ["Pro Monat", "468 €", "149 €"],
              ["Nach 1 Jahr", "5.616 €", "12.688 €"],
              ["Nach 3 Jahren", "16.848 €", "16.264 €"],
              ["Nach 5 Jahren", "28.080 €", "19.840 €"],
            ],
            caption: "Vereinfachtes Beispiel ohne Preiserhöhungen, Zinsen oder Weiterentwicklung.",
          },
        },
        {
          p: "In diesem Beispiel liegt der Break-even bei knapp drei Jahren. Mit mehr Nutzern, Provisionen pro Buchung oder jährlichen Preiserhöhungen verschiebt er sich deutlich nach vorn. Mit weniger Nutzern gewinnt das Abo.",
        },
      ],
    },
    {
      h2: "Wann das Abo die bessere Wahl ist",
      blocks: [
        {
          ul: ["Der Prozess ist Standard – E-Mail, Buchhaltung, Videokonferenz.", "Wenige Nutzer, kaum Anpassungsbedarf.", "Du brauchst die Lösung morgen und willst testen."],
        },
      ],
    },
    {
      h2: "Wann eigene Software gewinnt",
      blocks: [
        {
          ul: [
            "**Viele Nutzer** oder Gebühren **pro Transaktion** (z. B. Provision auf Bestellungen oder Buchungen).",
            "Dein Ablauf ist **anders als der Durchschnitt** – und genau das ist dein Vorteil.",
            "Du willst **Kundendaten und Marke** selbst in der Hand haben.",
            "Mehrere Tools sollen zu **einem System** zusammenwachsen.",
          ],
        },
        {
          p: "Das gilt besonders in der Gastronomie und bei Salons: Dort sind es oft nicht Abos, sondern Provisionen, die am meisten kosten. Die Rechnung dafür steht in [Eigenes Bestellsystem statt Lieferando](/blog/eigenes-bestellsystem-statt-lieferando) und [Buchungssystem ohne Provision](/blog/buchungssystem-friseur-ohne-provision).",
        },
      ],
    },
    {
      h2: "Der Mittelweg",
      blocks: [
        {
          p: "Es muss nicht alles oder nichts sein. Oft behalten Betriebe ihre Buchhaltung und E-Mail als Abo und ersetzen nur das Tool, das am meisten kostet oder am wenigsten passt. Eigene Software und Standard-Tools sprechen über Schnittstellen miteinander.",
        },
        { tip: "Unsere Empfehlung: Liste alle Software-Kosten der letzten zwölf Monate auf, inklusive Provisionen. Die größte Position ist dein Startpunkt." },
      ],
    },
    {
      h2: "Versteckte Kosten, die in keiner Rechnung stehen",
      blocks: [
        {
          ul: [
            "**Zeit für Workarounds**: Daten kopieren, Listen abgleichen, Exporte bauen.",
            "**Mehrere Tools für einen Ablauf**: Jedes einzeln günstig, zusammen teuer – und nicht verbunden.",
            "**Preiserhöhungen**: Abo-Preise steigen, und ein Wechsel ist aufwendig.",
            "**Abhängigkeit**: Stellt der Anbieter eine Funktion ein, musst du dich anpassen.",
            "**Kundendaten**: Bei Plattformen gehören die Beziehungen oft eher der Plattform als dir.",
          ],
        },
        {
          p: "Diese Posten sind schwer in Euro zu fassen – aber sie sind real. Schätze sie grob in Stunden pro Woche und multipliziere mit einem internen Stundensatz. Das Ergebnis überrascht oft.",
        },
      ],
    },
    {
      h2: "Die Rechnung für deinen Betrieb in fünf Schritten",
      blocks: [
        {
          ol: [
            "Alle Software-Kosten der letzten zwölf Monate zusammenrechnen – Abos, Lizenzen, Provisionen.",
            "Wöchentliche Zeit für Workarounds schätzen und in Euro umrechnen.",
            "Mit dem [Preisrechner](/preisrechner) einen Rahmen für eine eigene Lösung ermitteln.",
            "Einmalkosten plus Betrieb über fünf Jahre gegen die laufenden Kosten stellen.",
            "Den nicht-finanziellen Wert ergänzen: Daten, Marke, Unabhängigkeit.",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was ist, wenn sich die Anforderungen ändern?",
      a: "Mit einem Weiterentwicklungs-Paket passt sich deine Software monatlich an. Bei Abo-Software musst du warten, ob der Anbieter die Funktion irgendwann baut.",
    },
    {
      q: "Wer kümmert sich um Sicherheit und Updates bei eigener Software?",
      a: "Mit dem Betriebspaket übernehmen wir Hosting, Updates, Backups und Monitoring – vergleichbar mit einem Abo, nur dass die Software dir gehört.",
    },
    {
      q: "Kann ich meine Daten aus der Abo-Software mitnehmen?",
      a: "In den meisten Fällen ja, per Export. Wir prüfen vorab, welche Daten sich übernehmen lassen.",
    },
  ],
};
