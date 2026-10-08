import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "website-erstellen-lassen-monatliche-kosten",
  category: "ratgeber",
  title: "Website erstellen lassen: monatliche Kosten, Miete oder Kauf?",
  seoTitle: "Website erstellen lassen: monatliche Kosten im Überblick",
  description: "Website erstellen lassen – monatliche Kosten ehrlich gerechnet: laufende Kosten nach dem Kauf, Preis einer Miet-Website und der 3-Jahres-Vergleich.",
  keywords: ["Website erstellen lassen monatliche Kosten", "Website mieten", "Website Abo", "laufende Kosten Website", "Website mieten oder kaufen"],
  date: "2026-10-08",
  page: "website",
  intro:
    "Wenn du eine Website erstellen lässt, liegen die monatlichen Kosten nach einem Kauf bei uns ab 49 € für Hosting und Wartung. Mietest du die Website, zahlst du keine Anzahlung, sondern ab 99 € im Monat – Erstellung, Hosting und Wartung sind darin enthalten. Über drei Jahre ist der Kauf günstiger, die Miete schont dafür dein Konto am Anfang. Dieser Ratgeber rechnet beide Wege durch und zeigt, worauf du bei Miet-Angeboten achten solltest.",
  takeaways: [
    "Jede Website hat laufende Kosten: Domain, Hosting, Sicherheitsupdates, Pflege.",
    "Kauf: einmalig ab 1.190 € plus Hosting & Wartung ab 49 € im Monat.",
    "Miete: ab 99 € im Monat ohne Anzahlung, 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit.",
    "Bei Miet-Angeboten zählen Laufzeit, Eigentum und was nach Vertragsende mit der Website passiert.",
  ],
  sections: [
    {
      h2: "Welche monatlichen Kosten hat eine Website überhaupt?",
      blocks: [
        { p: "Egal ob gekauft oder gemietet – diese Posten fallen immer an. Die Frage ist nur, wer sie bezahlt und wer sich darum kümmert:" },
        {
          table: {
            head: ["Posten", "Wofür", "Wer kümmert sich"],
            rows: [
              ["Domain", "deine Adresse im Netz", "du oder dein Anbieter"],
              ["Hosting und SSL", "der Server, auf dem die Seite liegt, verschlüsselt", "Anbieter"],
              ["Backups und Sicherheitsupdates", "damit die Seite nach einem Fehler oder Angriff wieder läuft", "Anbieter – oder niemand, wenn es nicht vereinbart ist"],
              ["Pflege und Änderungen", "neue Preise, Fotos, Öffnungszeiten, Texte", "du selbst im CMS oder der Anbieter"],
              ["Zusatzdienste", "Buchung, Newsletter, Bewertungs-Widgets", "oft eigene Abos"],
            ],
          },
        },
        {
          p: "Bei uns sind Hosting, SSL, Backups und Sicherheitsupdates ab 49 € im Monat enthalten, mit Support und kleinen Änderungen ab 149 € im Monat. Was die Erstellung selbst kostet, steht auf der Seite [Website erstellen lassen](/leistungen/website-erstellen-lassen).",
        },
      ],
    },
    {
      h2: "Was kostet eine Website zur Miete oder zum Kauf?",
      blocks: [
        { p: "Dieselbe Website, zwei Wege. Die Zahlen stimmen mit dem [Preisrechner](/preisrechner) überein:" },
        {
          table: {
            head: ["Stufe", "Kaufen (einmalig)", "Mieten (pro Monat)", "Für wen"],
            rows: [
              ["One-Pager", "ab 1.190 €", "ab 99 €", "Schneller, sauberer Auftritt auf einer Seite"],
              ["Business-Website", "ab 1.990 €", "ab 129 €", "Bis 8 Seiten, CMS zum Selbst-Ändern, Anfrage-Funnel, SEO-Basis"],
              ["Website Pro", "ab 3.490 €", "ab 189 €", "Mehrsprachig, Blog, Landingpages je Suchbegriff, Tracking"],
            ],
            caption: "Endpreise nach § 19 UStG. Kauf: zusätzlich Hosting & Wartung ab 49 € im Monat. Miete: 0 € Anzahlung, 3 Monate Testzeit (monatlich kündbar), danach 12 Monate Mindestlaufzeit.",
          },
        },
      ],
    },
    {
      h2: "Was ist über drei Jahre günstiger?",
      blocks: [
        { p: "Die Rechnung für die Business-Website, jeweils mit den Einstiegspreisen:" },
        {
          table: {
            head: ["Weg", "Rechnung", "Summe nach 36 Monaten"],
            rows: [
              ["Kaufen", "1.990 € + 36 × 49 € Hosting & Wartung", "3.754 €"],
              ["Mieten", "36 × 129 €", "4.644 €"],
            ],
            caption: "Unterschied nach drei Jahren: 890 € zugunsten des Kaufs.",
          },
        },
        {
          p: "Der Kauf ist auf Dauer günstiger, und die Website gehört dir. Die Miete kostet über drei Jahre rund 890 € mehr – dafür zahlst du am ersten Tag 129 € statt 1.990 € und kannst in den ersten drei Monaten monatlich kündigen. Für einen Betrieb, der gerade eröffnet oder die Rücklagen für Ware und Einrichtung braucht, ist das oft der bessere Weg.",
        },
        {
          tip: "Faustregel: Wenn du den Einmalpreis ohne Bauchschmerzen zahlen kannst, kauf. Wenn die Website dir schon Anfragen bringen soll, bevor du sie bezahlt hast, miete – ein späterer Kauf ist möglich.",
        },
      ],
    },
    {
      h2: "Worauf solltest du bei Miet-Angeboten achten?",
      blocks: [
        {
          p: "Miet-Websites gibt es von vielen Anbietern, mit sehr unterschiedlichen Bedingungen. Der Monatspreis sagt wenig – diese Punkte entscheiden:",
        },
        {
          ul: [
            "**Mindestlaufzeit** – zwölf Monate sind üblich, es gibt aber auch Verträge über drei Jahre. Rechne den Monatspreis immer auf die ganze Laufzeit hoch.",
            "**Einrichtungsgebühr** – kommt bei manchen Angeboten zum Monatspreis dazu.",
            "**Eigentum** – was passiert nach Vertragsende? Bekommst du Texte, Bilder und die Domain? Kannst du die Website übernehmen?",
            "**Domain** – sie sollte auf deinen Namen registriert sein, nicht auf den des Anbieters.",
            "**Änderungen** – wie viele sind enthalten, und was kostet jede weitere?",
            "**Baukasten oder eigene Entwicklung** – ein Baukasten-Abo, das ein Dienstleister für dich einrichtet, ist etwas anderes als eine eigens gebaute Website.",
            "**Preisanpassung** – darf der Anbieter den Preis während der Laufzeit erhöhen?",
          ],
        },
        {
          p: "Bei unserer Miete gehören deine Daten dir, und du kannst die Website später kaufen. Die Bedingungen stehen offen auf der Seite – keine Einrichtungsgebühr, drei Monate Testzeit, danach zwölf Monate Mindestlaufzeit.",
        },
      ],
    },
    {
      h2: "Und ein Baukasten für ein paar Euro im Monat?",
      blocks: [
        {
          p: "Ist eine echte Option, wenn du Zeit hast und die Seite vor allem eine digitale Visitenkarte sein soll. Du zahlst wenig, baust und pflegst aber selbst – inklusive Texten, Bildern, Rechtstexten und Suchmaschinen-Grundlagen. Sobald die Website Anfragen bringen, mehrere Sprachen sprechen oder bei Google für bestimmte Begriffe gefunden werden soll, kostet der Baukasten vor allem deine Stunden. Eine ausführliche Übersicht aller Preisstufen findest du im Ratgeber [Was kostet eine Website?](/blog/was-kostet-eine-website).",
        },
      ],
    },
    {
      h2: "Checkliste: Diese Fragen vor der Unterschrift klären",
      blocks: [
        {
          ul: [
            "Was kostet die Website über die gesamte Mindestlaufzeit, inklusive Einrichtung?",
            "Was ist im Monatspreis enthalten – Hosting, Backups, Updates, Änderungen, Support?",
            "Auf wen ist die Domain registriert?",
            "Was bekommst du bei Vertragsende, und in welchem Format?",
            "Kannst du Texte und Bilder selbst ändern?",
            "Wie schnell reagiert der Anbieter, wenn die Seite nicht erreichbar ist?",
            "Gibt es eine Testzeit oder ein Sonderkündigungsrecht?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was kostet eine Website monatlich?",
      a: "Nach einem Kauf bei uns ab 49 € im Monat für Hosting, SSL, Backups und Sicherheitsupdates, mit Support und kleinen Änderungen ab 149 €. Zur Miete ab 99 € im Monat für den One-Pager, ab 129 € für die Business-Website und ab 189 € für die Website Pro.",
    },
    {
      q: "Ist eine Website zur Miete teurer als ein Kauf?",
      a: "Über mehrere Jahre ja. Bei der Business-Website liegt der Unterschied nach drei Jahren bei rund 890 €. Dafür entfällt der Einmalpreis am Anfang, und die ersten drei Monate sind monatlich kündbar.",
    },
    {
      q: "Wem gehört eine gemietete Website?",
      a: "Das regelt der Vertrag – frag vor der Unterschrift nach. Bei uns gehören dir deine Daten und Inhalte, und du kannst die Website später kaufen.",
    },
    {
      q: "Kann ich von der Miete zum Kauf wechseln?",
      a: "Ja, ein späterer Kauf ist möglich. Die Bedingungen dafür nennen wir dir im Angebot.",
    },
    {
      q: "Gibt es versteckte Kosten?",
      a: "Bei uns nicht: keine Einrichtungsgebühr, Festpreis nach dem Entwurf. Zusätze wie weitere Sprachen (690 €) oder Texte (490 €) stehen mit Preis im Preisrechner. Externe Dienste, die du selbst buchst, kommen dazu.",
    },
    {
      q: "Wie schnell ist die Website online?",
      a: "Ein One-Pager in etwa einer Woche, eine Business-Website in zwei bis vier Wochen, eine Website Pro in vier bis sechs Wochen.",
    },
  ],
};
