import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "software-entwickeln-lassen-kosten",
  category: "software",
  title: "Software und App entwickeln lassen: Was kostet das wirklich?",
  seoTitle: "Software entwickeln lassen: Kosten mit echten Preisen",
  description: "Software entwickeln lassen – Kosten nach Projekttyp: vom Buchungssystem ab 2.200 € bis zur Plattform ab 29.900 €, laufende Kosten und Checkliste.",
  keywords: ["Software entwickeln lassen Kosten", "App entwickeln lassen Kosten", "Softwareentwicklung Kosten", "Web-App Kosten", "Software Festpreis"],
  date: "2026-10-08",
  page: "individualsoftware",
  intro:
    "Software entwickeln lassen kostet bei uns zwischen 2.200 € für ein Buchungssystem und rund 29.900 € für eine Plattform mit mehreren Abteilungen – als Festpreis, den du vor dem Start kennst. Eine Web-App für den Homescreen beginnt bei 3.900 €, eine native App für App Store und Google Play bei 9.900 €. Was den Preis bestimmt, ist nicht die Zahl der Bildschirme, sondern die Zahl der Abläufe, Rollen und Schnittstellen. Hier findest du alle Richtwerte in einer Tabelle, die laufenden Kosten und eine Checkliste, mit der du Angebote vergleichen kannst.",
  takeaways: [
    "Kleine Systeme (Buchung, Bestellung) ab 2.200 €, Web-App ab 3.900 €, Kundenportal ab 7.400 €.",
    "Ein kompletter Kernprozess ab 10.900 €, mehrere Prozesse ab 18.900 €, Plattform ab 29.900 €.",
    "Laufend: Hosting & Wartung ab 49 €, Betrieb & Support ab 149 € im Monat.",
    "Alles gibt es auch zur Miete – ohne Anzahlung, mit drei Monaten Testzeit.",
  ],
  sections: [
    {
      h2: "Was kostet welche Art von Software?",
      blocks: [
        { p: "Die Richtwerte sind dieselben, mit denen unser [Preisrechner](/preisrechner) rechnet. Dort kannst du Umfang und Zusätze selbst zusammenstellen:" },
        {
          table: {
            head: ["Projekt", "Kaufen (einmalig)", "Mieten (pro Monat)", "Was du bekommst"],
            rows: [
              ["Buchungssystem", "ab 2.200 €", "ab 239 €", "Leistungen, Kalender, Bestätigung per Mail & WhatsApp"],
              ["Bestellsystem", "ab 2.900 €", "ab 269 €", "Speisekarte, Abholung & Lieferung, Bestell-Dashboard"],
              ["Web-App für den Homescreen", "ab 3.900 €", "ab 309 €", "Login, Kundenkonto, Push – ohne App Store"],
              ["Dashboard", "ab 4.900 €", "ab 349 €", "Kennzahlen aus 2–3 Quellen, täglich aktuell"],
              ["Kundenportal", "ab 7.400 €", "ab 459 €", "Dokumente, Status, Nachrichten"],
              ["Native App", "ab 9.900 €", "ab 559 €", "App Store & Google Play, Offline, Push"],
              ["Ein Kernprozess", "ab 10.900 €", "ab 599 €", "z. B. Auftrag → Einsatz → Rechnung als eigenes System"],
              ["Mehrere Prozesse", "ab 18.900 €", "ab 939 €", "Rollen & Rechte, Schnittstellen, Admin-Bereich"],
              ["Plattform", "ab 29.900 €", "ab 1.389 €", "Mehrere Abteilungen oder Standorte, eigene Module"],
            ],
            caption: "Endpreise nach § 19 UStG. Kauf: zusätzlich Hosting & Wartung ab 49 € oder Betrieb & Support ab 149 € im Monat. Miete: Hosting, Wartung, Support und Updates inklusive, 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit.",
          },
        },
        {
          p: "Wie ein Projekt abläuft – Workshop, klickbarer Prototyp, Festpreis, Start – steht auf der Seite [Individualsoftware für den Mittelstand](/leistungen/individualsoftware-mittelstand).",
        },
      ],
    },
    {
      h2: "Was treibt den Preis – und was nicht?",
      blocks: [
        {
          table: {
            head: ["Treibt den Preis", "Warum"],
            rows: [
              ["Zahl der Abläufe", "Jeder Ablauf (Anfrage, Auftrag, Rechnung …) braucht eigene Regeln, Zustände und Tests"],
              ["Rollen und Rechte", "Wer darf was sehen und ändern? Jede Rolle vervielfacht die Fälle"],
              ["Schnittstellen", "Kasse, DATEV, CRM, Warenwirtschaft – jede Anbindung hängt vom anderen System ab"],
              ["Datenübernahme", "Alte Daten sind selten sauber; aufräumen kostet Zeit"],
              ["Zahlung", "Online-Zahlung braucht Absicherung, Erstattungen, Belege"],
              ["Unklare Anforderungen", "Was nicht geklärt ist, wird teuer – deshalb erst der Prototyp"],
            ],
          },
        },
        {
          p: "Was den Preis kaum treibt: die Zahl der Bildschirme, die Farbe, ob es „App“ oder „Software“ heißt. Und oft überschätzt: die native App. Viele Vorhaben kommen mit einer Web-App aus, die sich wie eine App anfühlt – den Unterschied erklärt der Ratgeber [Web-App oder native App?](/blog/web-app-oder-native-app).",
        },
      ],
    },
    {
      h2: "Was kosten die Zusätze?",
      blocks: [
        {
          table: {
            head: ["Zusatz", "Preis (einmalig)", "Wofür"],
            rows: [
              ["Online-Zahlung", "890 €", "Karte, PayPal, Apple Pay, Google Pay"],
              ["Schnittstellen", "1.490 €", "Kasse, DATEV, CRM, ERP oder Warenwirtschaft"],
              ["KI-Funktion", "1.490 €", "Chat, Dokumente auslesen, Texte vorschlagen"],
              ["WhatsApp-Benachrichtigungen", "590 €", "Bestätigungen und Status automatisch"],
              ["Mehrsprachig", "690 €", "z. B. Deutsch, Englisch, Arabisch, Türkisch"],
              ["Datenübernahme", "990 €", "Aus Excel, Papierlisten oder dem Altsystem"],
            ],
          },
        },
      ],
    },
    {
      h2: "Welche laufenden Kosten kommen dazu?",
      blocks: [
        {
          p: "Software ist nach dem Start nicht fertig – sie läuft auf einem Server, braucht Sicherheitsupdates und irgendwann eine kleine Änderung. Nach einem Kauf zahlst du dafür ab 49 € im Monat (Hosting & Wartung) oder ab 149 € im Monat (Betrieb & Support mit kleinen Änderungen). Dazu kommen Gebühren von Diensten, die du selbst nutzt, zum Beispiel des Zahlungsanbieters.",
        },
        {
          tip: "Rechne jedes Angebot auf drei Jahre hoch: Einmalpreis plus 36 Monate Betrieb. Beispiel Kundenportal: 7.400 € + 36 × 149 € = 12.764 €. Zur Miete: 36 × 459 € = 16.524 €. Der Kauf ist günstiger, die Miete braucht kein Startkapital.",
        },
      ],
    },
    {
      h2: "Festpreis oder Abrechnung nach Aufwand?",
      blocks: [
        {
          p: "Viele Entwickler rechnen nach Stunden ab. Das ist fair, wenn niemand weiß, was gebaut werden soll – das Risiko liegt dann aber bei dir. Ein **Festpreis** dreht das um, setzt aber voraus, dass der Umfang vorher klar ist. Wir lösen das so: Erst ein Workshop und ein klickbarer Prototyp, an dem du siehst, was du bekommst. Danach gilt ein Festpreis für genau diesen Umfang. Änderungen, die später dazukommen, werden einzeln angeboten.",
        },
      ],
    },
    {
      h2: "Wie kannst du Kosten senken, ohne am Falschen zu sparen?",
      blocks: [
        {
          ul: [
            "**Mit einem Ablauf starten** – dem, der am meisten Zeit oder Umsatz kostet. Der Rest folgt, wenn der erste läuft.",
            "**Web-App statt nativer App**, solange du keine Offline-Funktion oder Gerätezugriffe brauchst.",
            "**Standard nutzen, wo er reicht** – Buchhaltung und E-Mail bleiben im Standardprogramm. Die Abwägung steht im Ratgeber [Individualsoftware vs. Standardsoftware](/blog/individualsoftware-vs-standardsoftware).",
            "**Inhalte selbst liefern** – Texte, Fotos, Preislisten, Beispieldaten.",
            "**Einen Ansprechpartner benennen**, der entscheiden darf. Nichts verzögert Projekte so sehr wie offene Fragen.",
          ],
        },
        {
          p: "Am Falschen sparst du bei Tests, Backups und Dokumentation. Die merkst du erst, wenn sie fehlen.",
        },
      ],
    },
    {
      h2: "Checkliste: So vergleichst du Angebote",
      blocks: [
        {
          ul: [
            "Ist es ein Festpreis oder eine Schätzung? Was passiert, wenn es länger dauert?",
            "Ist der Umfang so beschrieben, dass du ihn abhaken kannst?",
            "Siehst du vor dem Auftrag einen Prototyp oder Entwurf?",
            "Gehören dir Quellcode, Daten und Dokumentation?",
            "Was kosten Hosting, Wartung und Support pro Monat – und was ist darin enthalten?",
            "Wo liegen die Daten? Innerhalb der EU?",
            "Wer hilft, wenn nach dem Start etwas nicht funktioniert, und wie schnell?",
            "Gibt es Referenzen, die du selbst ausprobieren kannst?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was kostet es, eine Software entwickeln zu lassen?",
      a: "Je nach Umfang: kleine Systeme wie Buchung oder Bestellung ab 2.200 € bzw. 2.900 €, ein Kundenportal ab 7.400 €, ein kompletter Kernprozess ab 10.900 €, mehrere Prozesse ab 18.900 € und eine Plattform ab 29.900 €.",
    },
    {
      q: "Was kostet es, eine App entwickeln zu lassen?",
      a: "Eine Web-App, die sich auf dem Homescreen wie eine App verhält, beginnt bei 3.900 €. Eine native App für App Store und Google Play beginnt bei 9.900 €.",
    },
    {
      q: "Kann ich Software auch mieten statt kaufen?",
      a: "Ja. Jedes System gibt es auch zur Miete, zum Beispiel ein Kundenportal ab 459 € im Monat. Hosting, Wartung, Support und Updates sind enthalten. Die ersten drei Monate sind Testzeit und monatlich kündbar, danach gelten zwölf Monate Mindestlaufzeit.",
    },
    {
      q: "Warum unterscheiden sich Angebote für dieselbe Software so stark?",
      a: "Weil sie selten dasselbe meinen. Ein Angebot enthält Tests, Dokumentation und Betrieb, ein anderes nur die Programmierung. Vergleiche Umfang, Eigentum am Code und die Kosten über drei Jahre – nicht nur die Summe unten rechts.",
    },
    {
      q: "Wie lange dauert die Entwicklung?",
      a: "Ein Buchungs- oder Bestellsystem zwei bis vier Wochen, eine Web-App drei bis vier Wochen, ein Kundenportal fünf bis sechs Wochen, ein Kernprozess sechs bis zehn Wochen.",
    },
    {
      q: "Wem gehört die Software am Ende?",
      a: "Beim Kauf dir – mit Quellcode und Dokumentation. Bei der Miete gehören dir die Daten, und ein späterer Kauf ist möglich.",
    },
  ],
};
