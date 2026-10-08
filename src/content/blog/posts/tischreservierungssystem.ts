import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "tischreservierungssystem",
  category: "branchen",
  title: "Tischreservierungssystem: Plattform, Abo oder eigenes System für dein Restaurant?",
  seoTitle: "Tischreservierungssystem: Plattform oder eigenes System?",
  description: "Tischreservierungssystem für Restaurants: drei Wege im Vergleich, Monatspreis oder Gebühr pro Gast, Schutz vor No-Shows, Kosten und eine Checkliste.",
  keywords: ["Tischreservierungssystem", "Reservierungssystem Restaurant", "Online-Tischreservierung", "Tischreservierung Software", "No-Show Restaurant"],
  date: "2026-10-08",
  page: "gastro",
  intro:
    "Ein Tischreservierungssystem nimmt Reservierungen rund um die Uhr online an, prüft selbst, ob ein Tisch frei ist, und erinnert die Gäste an ihren Termin. Es gibt drei Wege: ein Reservierungsportal, das neue Gäste bringt und pro Gast kostet, ein Abo mit festem Monatspreis oder ein eigenes System auf deiner Website. Für die meisten Restaurants ist ein Abo der richtige Start – ein eigenes System lohnt sich, wenn Reservierung, Bestellung und Website zusammenlaufen sollen.",
  takeaways: [
    "Zwei Preismodelle: fester Monatspreis oder Gebühr pro vermitteltem Gast – manchmal beides.",
    "Gebühren pro Gast lohnen sich nur, wenn die Plattform dir wirklich neue Gäste bringt.",
    "Gegen No-Shows helfen Erinnerung, einfache Absage per Link und bei großen Gruppen eine Anzahlung.",
    "Eigenes System: einmalig ab 2.200 € oder ab 239 € im Monat zur Miete, ohne Gebühr pro Gast.",
  ],
  sections: [
    {
      h2: "Was macht ein Tischreservierungssystem?",
      blocks: [
        {
          p: "Es ersetzt das Reservierungsbuch und einen großen Teil der Anrufe. Der Gast wählt Tag, Uhrzeit und Personenzahl, das System kennt deine Tische und Sitzzeiten und sagt sofort zu oder schlägt eine andere Zeit vor. Du siehst den Abend auf einem Tablet: wer kommt wann, mit wie vielen, mit welchem Hinweis.",
        },
        {
          p: "Die Reservierung ist ein Baustein unter mehreren. Was für Restaurants, Cafés und Lieferdienste noch dazugehört, zeigt die Seite [Software für die Gastronomie](/leistungen/software-gastronomie).",
        },
      ],
    },
    {
      h2: "Welche drei Wege gibt es?",
      blocks: [
        {
          table: {
            head: ["Weg", "Bringt neue Gäste", "Kosten", "Passt, wenn …"],
            rows: [
              ["Reservierungsportal", "ja, über Portal und App", "häufig Gebühr pro Gast, teils plus Grundgebühr", "du neu bist, Touristen ansprichst oder schwache Tage füllen willst"],
              ["Reservierungs-Abo", "nein", "fester Monatspreis, je nach Tarif und Funktionen", "du Stammgäste und ein Google-Profil hast und nur die Annahme lösen willst"],
              ["Eigenes System auf deiner Website", "nein", "einmalig oder Miete, keine Gebühr pro Gast", "du Reservierung, Bestellung und Website unter einer Marke willst oder besondere Regeln hast"],
            ],
            caption: "Preise und Modelle der Anbieter ändern sich häufig – prüfe sie vor einer Entscheidung direkt beim Anbieter und achte darauf, ob netto oder brutto.",
          },
        },
      ],
    },
    {
      h2: "Monatspreis oder Gebühr pro Gast – was ist günstiger?",
      blocks: [
        {
          p: "Das hängt nur von einer Zahl ab: wie viele Gäste im Monat online reservieren. Die Rechnung zum Selbsteinsetzen:",
        },
        {
          ol: [
            "Zähl die Gäste, die im letzten Monat über das Portal reserviert haben.",
            "Multiplizier sie mit der Gebühr pro Gast aus deinem Vertrag.",
            "Vergleich das Ergebnis mit dem festen Monatspreis eines Abos oder der Miete eines eigenen Systems.",
          ],
        },
        {
          table: {
            head: ["Online-Gäste im Monat", "bei 1 € pro Gast", "bei 2 € pro Gast"],
            rows: [
              ["100", "100 €", "200 €"],
              ["300", "300 €", "600 €"],
              ["600", "600 €", "1.200 €"],
            ],
            caption: "Rechenbeispiel mit angenommenen Gebühren – setz die Werte aus deinem eigenen Vertrag ein.",
          },
        },
        {
          p: "Die zweite Frage ist die wichtigere: Wie viele dieser Gäste wären ohnehin gekommen und haben nur den bequemsten Knopf gedrückt? Für Stammgäste eine Vermittlungsgebühr zu zahlen, ist teuer. Leg deshalb den Reservieren-Button in deinem Google-Profil und auf deiner Website immer auf deine eigene Reservierung.",
        },
      ],
    },
    {
      h2: "Was muss ein Reservierungssystem können?",
      blocks: [
        {
          ul: [
            "**Tische, Bereiche und Sitzzeiten** – innen, Terrasse, Nebenraum; zwei Stunden am Abend, neunzig Minuten am Mittag.",
            "**Zusammenlegen von Tischen** für größere Gruppen.",
            "**Öffnungszeiten, Ruhetage, Feiertage und Sperrzeiten** – selbst änderbar.",
            "**Sofortige Bestätigung** und eine Erinnerung am Tag vorher.",
            "**Absage und Änderung per Link** – je einfacher, desto weniger leere Tische.",
            "**Hinweise des Gastes** – Kinderstuhl, Allergie, Anlass.",
            "**Anzahlung oder Kartengarantie** für große Gruppen und besondere Abende.",
            "**Warteliste** für ausgebuchte Zeiten.",
            "**Reservierung aus Google, Instagram und per QR-Code** – ohne Umweg über ein Portal.",
            "**Mehrere Sprachen**, wenn Touristen zu deinen Gästen gehören.",
          ],
        },
        {
          tip: "No-Shows senkst du in dieser Reihenfolge: Erinnerung mit Absage-Link, dann Rückbestätigung bei großen Gruppen, erst danach eine Anzahlung. Viele Gäste sagen nicht ab, weil es umständlich ist – nicht aus bösem Willen.",
        },
      ],
    },
    {
      h2: "Was kostet ein eigenes Tischreservierungssystem?",
      blocks: [
        {
          p: "Technisch ist eine Tischreservierung ein Buchungssystem: Statt Mitarbeitern werden Tische und Bereiche belegt. Die Preise entsprechen deshalb den Stufen im [Preisrechner](/preisrechner):",
        },
        {
          table: {
            head: ["Stufe", "Kaufen (einmalig)", "Mieten (pro Monat)", "Enthalten"],
            rows: [
              ["Buchung Start", "ab 2.200 €", "ab 239 €", "Online-Reservierung, Kalender, Bestätigung per Mail & WhatsApp, Schutz vor Doppelbuchung"],
              ["Buchung Pro", "ab 3.900 €", "ab 309 €", "+ Gästekonto, Anzahlung & Stornoregeln, Erinnerungen, Warteliste"],
              ["Team & Standorte", "ab 6.400 €", "ab 419 €", "+ Räume und Bereiche, mehrere Standorte"],
            ],
            caption: "Endpreise nach § 19 UStG. Kauf: zusätzlich Hosting & Wartung ab 49 € oder Betrieb & Support ab 149 € im Monat. Miete: Hosting, Wartung, Support und Updates inklusive, 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit.",
          },
        },
        {
          p: "Wie dein Tischplan abgebildet wird – Sitzzeiten, Zusammenlegen, Bereiche – legen wir nach dem klickbaren Prototyp fest; dann gilt ein Festpreis. Sinnvoll wird das eigene System vor allem zusammen mit einem [Bestellsystem ohne Provision](/leistungen/bestellsystem-ohne-provision): eine Website, eine Speisekarte, Reservieren und Bestellen an einem Ort. Wer am Tisch per Handy bestellen lassen will, findet die Details im Ratgeber zum [QR-Code-Bestellsystem](/blog/qr-code-bestellsystem).",
        },
      ],
    },
    {
      h2: "Checkliste: Das solltest du vor der Entscheidung klären",
      blocks: [
        {
          ul: [
            "Wie viele Reservierungen kommen heute per Telefon, Portal, Nachricht und spontan?",
            "Wie viele Gäste bringt dir ein Portal, die dich sonst nicht gefunden hätten?",
            "Wie viele No-Shows hast du pro Woche, und an welchen Tagen?",
            "Welche Sitzzeiten gelten mittags und abends?",
            "Wie viele Tische hältst du für Laufkundschaft frei?",
            "Wer nimmt Reservierungen an, wenn das Tablet ausfällt?",
            "Kannst du deine Gästedaten exportieren, wenn du den Anbieter wechselst?",
            "Welche Laufzeit und Kündigungsfrist hat der Vertrag?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was kostet ein Tischreservierungssystem?",
      a: "Abos haben einen festen Monatspreis, der je nach Anbieter und Tarif stark schwankt; Portale rechnen häufig pro vermitteltem Gast ab. Ein eigenes System kostet einmalig ab 2.200 € oder ab 239 € im Monat zur Miete, ohne Gebühr pro Gast.",
    },
    {
      q: "Gibt es ein kostenloses Reservierungssystem für Restaurants?",
      a: "Einige Anbieter haben kostenlose Einstiegstarife, meist mit Grenzen bei Reservierungen oder Funktionen. Für ein kleines Café kann das reichen. Prüf, ob Erinnerungen und der Export deiner Gästedaten enthalten sind.",
    },
    {
      q: "Wie verhindere ich No-Shows?",
      a: "Mit einer Erinnerung am Tag vorher, einer Absage per Link und – bei großen Gruppen oder besonderen Abenden – einer Anzahlung oder Kartengarantie. Die Anzahlung ist bei uns ab der Stufe Pro enthalten.",
    },
    {
      q: "Brauche ich ein Reservierungsportal, um gefunden zu werden?",
      a: "Nicht zwingend. Viele Gäste suchen direkt bei Google. Ein gepflegtes Google-Profil mit Reservieren-Button, der auf deine eigene Seite führt, deckt einen großen Teil ab. Ein Portal kann zusätzlich sinnvoll sein, wenn es dir messbar neue Gäste bringt.",
    },
    {
      q: "Kann ich Reservierung und Online-Bestellung in einem System haben?",
      a: "Ja. Bei einer eigenen Lösung laufen Reservierung und Bestellung über dieselbe Website und dieselbe Speisekarte. Den Umfang legen wir im Prototyp fest.",
    },
    {
      q: "Wie schnell ist ein eigenes Reservierungssystem live?",
      a: "Die Stufe Start in zwei bis drei Wochen, die Stufe Pro in drei bis vier Wochen.",
    },
  ],
};
