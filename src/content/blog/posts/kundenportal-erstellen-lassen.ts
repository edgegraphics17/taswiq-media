import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "kundenportal-erstellen-lassen",
  category: "software",
  title: "Kundenportal erstellen lassen: Funktionen, Kosten und Ablauf",
  seoTitle: "Kundenportal erstellen lassen: Funktionen, Kosten, Ablauf",
  description: "Kundenportal erstellen lassen: welche Funktionen du wirklich brauchst, was es kostet (ab 7.400 € oder zur Miete), wie das Projekt abläuft – mit Checkliste.",
  keywords: ["Kundenportal erstellen lassen", "Kundenportal entwickeln lassen", "Kundenportal Kosten", "Self-Service-Portal", "Kundenbereich mit Login"],
  date: "2026-10-08",
  page: "webapp",
  intro:
    "Ein Kundenportal erstellen lassen heißt: Deine Kunden bekommen einen eigenen Bereich mit Login, in dem sie Unterlagen hochladen, den Stand ihres Auftrags sehen und dir schreiben – statt anzurufen oder E-Mails mit Anhängen zu schicken. Bei uns kostet ein Kundenportal einmalig ab 7.400 € oder ab 459 € im Monat zur Miete und ist in fünf bis sechs Wochen live. Mit Formularen, Freigaben und frei definierbaren Rollen liegt es bei 12.900 € oder 689 € im Monat.",
  takeaways: [
    "Ein Portal lohnt sich, wenn dieselben Fragen immer wiederkommen: „Ist es angekommen? Was fehlt noch? Wie ist der Stand?“",
    "Starte mit drei Funktionen: Dokumente, Status, Nachrichten. Alles andere kommt später.",
    "Kosten: ab 7.400 € oder ab 459 € im Monat; mit Workflows ab 12.900 € oder ab 689 € im Monat.",
    "Der Preis hängt an Rollen, Abläufen und Schnittstellen – nicht an der Zahl der Kunden.",
  ],
  sections: [
    {
      h2: "Was ist ein Kundenportal – und wann brauchst du eines?",
      blocks: [
        {
          p: "Ein Kundenportal ist eine Web-Anwendung mit Login, in der jeder Kunde nur seine eigenen Vorgänge sieht. Es lohnt sich, sobald drei Dinge zusammenkommen: Du arbeitest über Wochen oder Monate mit demselben Kunden, du brauchst Unterlagen von ihm, und er will wissen, wie weit du bist.",
        },
        {
          ul: [
            "Kanzleien und Beratungen: Belege, Verträge, Bescheide, Fristen.",
            "Hausverwaltungen: Schadensmeldungen, Abrechnungen, Mitteilungen.",
            "Handwerk und Dienstleister: Angebot, Termin, Fotos, Abnahme, Rechnung.",
            "Agenturen: Entwürfe, Freigaben, Rückmeldungen.",
            "Schulen und Coaches: Material, Termine, Fortschritt.",
          ],
        },
        {
          p: "Wie wir solche Anwendungen bauen, steht auf der Seite [Web-App-Entwicklung](/leistungen/web-app-entwicklung).",
        },
      ],
    },
    {
      h2: "Welche Funktionen braucht ein Kundenportal?",
      blocks: [
        {
          table: {
            head: ["Funktion", "Pflicht zum Start", "Kann später kommen"],
            rows: [
              ["Login und Kundenkonto", "ja", ""],
              ["Dokumente und Upload mit Checkliste („das fehlt noch“)", "ja", ""],
              ["Status je Vorgang", "ja", ""],
              ["Nachrichten am Vorgang statt E-Mail", "ja", ""],
              ["Benachrichtigung per Mail oder Push", "ja", ""],
              ["Formulare und Freigaben", "", "ja"],
              ["Weitere Rollen (Partner, Subunternehmer, Mitarbeiter des Kunden)", "", "ja"],
              ["Automatische Erinnerungen und Fristen", "", "ja"],
              ["Online-Zahlung, Rechnungen", "", "ja"],
              ["Schnittstelle zu deiner Branchensoftware", "", "ja"],
              ["KI-Funktion: Dokumente auslesen, Fragen beantworten", "", "ja"],
            ],
          },
        },
        {
          tip: "Die häufigste Ursache für teure Portale ist ein zu großer erster Wurf. Bau zuerst, was die meisten Rückfragen erspart, und sieh dir vier Wochen lang an, wie deine Kunden es wirklich nutzen.",
        },
      ],
    },
    {
      h2: "Was kostet es, ein Kundenportal erstellen zu lassen?",
      blocks: [
        { p: "Die Stufen sind dieselben wie im [Preisrechner](/preisrechner):" },
        {
          table: {
            head: ["Stufe", "Kaufen (einmalig)", "Mieten (pro Monat)", "Enthalten", "Live in"],
            rows: [
              ["Web-App", "ab 3.900 €", "ab 309 €", "Login, Kundenkonto, App auf dem Homescreen, Push-Nachrichten", "3–4 Wochen"],
              ["Kundenportal", "ab 7.400 €", "ab 459 €", "+ Dokumente & Upload mit Checkliste, Status & Nachrichten, Rollen für Kunde und Team", "5–6 Wochen"],
              ["Portal mit Workflows", "ab 12.900 €", "ab 689 €", "+ Formulare & Freigaben, frei definierbare Rollen, Automationen & Erinnerungen", "6–8 Wochen"],
            ],
            caption: "Endpreise nach § 19 UStG. Kauf: zusätzlich Betrieb & Support ab 149 € im Monat. Miete: Hosting, Wartung, Support und Updates inklusive, 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit.",
          },
        },
        {
          table: {
            head: ["Zusatz", "Preis (einmalig)"],
            rows: [
              ["Online-Zahlung", "890 €"],
              ["Schnittstellen (z. B. DATEV, CRM, ERP)", "1.490 €"],
              ["KI-Funktion", "1.490 €"],
              ["Mehrsprachig", "690 €"],
              ["WhatsApp-Benachrichtigungen", "590 €"],
              ["Datenübernahme", "990 €"],
            ],
          },
        },
        {
          p: "Über drei Jahre gerechnet: Kauf 7.400 € + 36 × 149 € = 12.764 €, Miete 36 × 459 € = 16.524 €. Der Kauf ist günstiger, die Miete braucht kein Startkapital und lässt sich in den ersten drei Monaten monatlich kündigen.",
        },
      ],
    },
    {
      h2: "Fertige Portal-Software oder eigenes Portal?",
      blocks: [
        {
          p: "Es gibt fertige Portal-Lösungen im Abo, oft als Teil einer Branchensoftware. Wenn deine Software ein Portal mitbringt, das zu deinem Ablauf passt, ist das der schnellste Weg. Ein eigenes Portal lohnt sich, wenn dein Ablauf anders ist als der Standard, wenn das Portal unter deiner Marke und in den Sprachen deiner Kunden laufen soll oder wenn die Abo-Kosten mit jedem Nutzer steigen. Die Abwägung im Detail steht im Ratgeber [Individualsoftware vs. Standardsoftware](/blog/individualsoftware-vs-standardsoftware).",
        },
        {
          p: "Ein Beispiel aus einem echten Projekt ist [Antragsbruder](/portfolio): Nutzer laden Briefe und Unterlagen hoch, bekommen erklärt, was verlangt wird, und sehen per Checkliste, was noch fehlt – im Browser, in neun Sprachen, ohne App Store.",
        },
      ],
    },
    {
      h2: "Wie läuft das Projekt ab?",
      blocks: [
        {
          ol: [
            "**Gespräch und Workshop** – welche Vorgänge, welche Unterlagen, welche Rollen? Du bringst zwei bis drei echte Fälle mit.",
            "**Klickbarer Prototyp** – du klickst dich durch das Portal, bevor eine Zeile produktiver Code entsteht.",
            "**Festpreis** – für genau den Umfang, den du im Prototyp gesehen hast.",
            "**Entwicklung in Etappen** – du siehst jede Woche den Stand auf einer Testadresse.",
            "**Test mit echten Kunden** – drei bis fünf Kunden probieren es aus, wir stellen nach.",
            "**Start und Einladung** – jeder Kunde bekommt einen persönlichen Zugang.",
            "**Betrieb** – Hosting, Backups, Updates und Support laufen weiter.",
          ],
        },
      ],
    },
    {
      h2: "Was ist bei Sicherheit und Datenschutz wichtig?",
      blocks: [
        {
          ul: [
            "Jeder Kunde sieht ausschließlich seine eigenen Daten – technisch erzwungen, nicht nur ausgeblendet.",
            "Verschlüsselte Übertragung und Datenbank in der EU.",
            "Rollen und Rechte im Team: nicht jeder muss alles sehen.",
            "Regelmäßige Backups und ein Plan, wie sie zurückgespielt werden.",
            "Ein Vertrag zur Auftragsverarbeitung mit dem Dienstleister.",
            "Löschfristen: Was passiert mit Unterlagen, wenn der Auftrag abgeschlossen ist?",
          ],
        },
      ],
    },
    {
      h2: "Checkliste: Das solltest du vor dem ersten Gespräch wissen",
      blocks: [
        {
          ul: [
            "Welche drei Rückfragen kommen von Kunden am häufigsten?",
            "Welche Unterlagen brauchst du von jedem Kunden?",
            "Welche Stationen durchläuft ein Vorgang von Anfang bis Ende?",
            "Wer im Team bearbeitet was?",
            "Aus welchem System kommen die Kundendaten heute?",
            "In welchen Sprachen brauchst du das Portal?",
            "Wie viele Kunden sollen im ersten Jahr einen Zugang bekommen?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was kostet es, ein Kundenportal erstellen zu lassen?",
      a: "Ein Kundenportal mit Login, Dokumenten, Status und Nachrichten kostet einmalig ab 7.400 € oder ab 459 € im Monat zur Miete. Mit Formularen, Freigaben und frei definierbaren Rollen ab 12.900 € oder ab 689 € im Monat.",
    },
    {
      q: "Wie lange dauert die Entwicklung eines Kundenportals?",
      a: "Fünf bis sechs Wochen für ein Kundenportal, sechs bis acht Wochen für ein Portal mit Workflows. Vorher siehst du einen klickbaren Prototyp und bekommst einen Festpreis.",
    },
    {
      q: "Brauchen meine Kunden eine App?",
      a: "Nein. Das Portal läuft im Browser und lässt sich auf iPhone und Android wie eine App auf den Startbildschirm legen, mit Push-Nachrichten und ohne App-Store.",
    },
    {
      q: "Kann das Portal an meine bestehende Software angebunden werden?",
      a: "Ja, wenn deine Software eine Schnittstelle anbietet – zum Beispiel DATEV, ein CRM oder eine Warenwirtschaft. Die Schnittstelle kostet als Zusatz 1.490 €.",
    },
    {
      q: "Wem gehören Portal und Daten?",
      a: "Beim Kauf gehören dir Quellcode, Dokumentation und Daten. Bei der Miete gehören dir die Daten, und ein späterer Kauf ist möglich.",
    },
    {
      q: "Kann ich klein anfangen und später erweitern?",
      a: "Ja, das ist der empfohlene Weg. Du startest mit Dokumenten, Status und Nachrichten und ergänzt Formulare, Rollen oder Schnittstellen, wenn du siehst, was deine Kunden nutzen.",
    },
  ],
};
