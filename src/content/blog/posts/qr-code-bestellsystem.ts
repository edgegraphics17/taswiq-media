import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "qr-code-bestellsystem",
  category: "branchen",
  title: "QR-Code-Bestellsystem für Restaurants: Kosten, kostenlose Varianten und wann sich eine eigene Lösung lohnt",
  seoTitle: "QR-Code-Bestellsystem: Kosten, Anbieter, eigene Lösung",
  description: "QR-Code-Bestellsystem für Restaurants: Was es kostet, was kostenlos geht, Abo oder eigene Lösung im 3-Jahres-Vergleich – mit Rechnung und Checkliste.",
  keywords: ["QR Code Bestellsystem", "QR-Code-Bestellsystem Restaurant", "QR Code Bestellsystem kostenlos", "Tischbestellung per QR-Code", "digitale Speisekarte mit Bestellfunktion"],
  date: "2026-10-08",
  page: "bestellsystem",
  intro:
    "Ein QR-Code-Bestellsystem lässt deine Gäste am Tisch, an der Theke oder von zu Hause mit dem eigenen Handy bestellen: Code scannen, Speisekarte öffnen, bestellen – die Bestellung landet ohne Umweg in Küche oder Bar. Fertige Abo-Lösungen kosten nach den Preisseiten der Anbieter meist zwischen 30 und 100 € netto im Monat, eine eigene Lösung gibt es einmalig ab 2.900 € oder zur Miete ab 269 € im Monat. Rein nach Preis gewinnt fast immer das Abo – dieser Ratgeber zeigt, wann die eigene Lösung trotzdem die bessere Wahl ist.",
  takeaways: [
    "Der QR-Code selbst kostet nichts – er ist nur ein Link. Geld kostet das System dahinter: Speisekarte, Bestellannahme, Küchenanzeige, Zahlung.",
    "Drei Stufen: Speisekarte zum Ansehen, Bestellen per Handy, Bestellen und Bezahlen am Tisch.",
    "Abo-Lösungen liegen laut Anbieterseiten meist bei 30–100 € netto im Monat, eine eigene Lösung bei einmalig ab 2.900 € oder ab 269 € Miete.",
    "Eine eigene Lösung lohnt sich, wenn Tisch, Abholung und Lieferung in einem System laufen sollen – unter deiner Marke und mit deinen Abläufen.",
  ],
  sections: [
    {
      h2: "Was ist ein QR-Code-Bestellsystem – und was ist nur eine digitale Speisekarte?",
      blocks: [
        {
          p: "Unter dem Begriff werden drei verschiedene Dinge verkauft. Bevor du Preise vergleichst, kläre, welche Stufe du brauchst:",
        },
        {
          table: {
            head: ["Stufe", "Was der Gast macht", "Was bei dir ankommt"],
            rows: [
              ["1 · Speisekarte per QR-Code", "Scannt und liest die Karte am Handy", "Nichts – bestellt wird weiter beim Service"],
              ["2 · Bestellen per QR-Code", "Wählt Gerichte, Extras und schickt die Bestellung ab", "Bestellung mit Tischnummer oder Abholzeit auf Tablet, Bon oder Küchen-Board"],
              ["3 · Bestellen und Bezahlen", "Bestellt und zahlt direkt am Handy", "Bezahlte Bestellung, kein Kassieren am Tisch"],
            ],
          },
        },
        {
          p: "Stufe 1 ist eine Website oder ein PDF hinter einem Code. Erst ab Stufe 2 sprichst du von einem Bestellsystem. Wenn du Bestellungen ohne Abgabe pro Bestellung annehmen willst, ist unser [Bestellsystem ohne Provision](/leistungen/bestellsystem-ohne-provision) dafür gebaut; den Überblick für Restaurants, Cafés und Lieferdienste findest du unter [Software für die Gastronomie](/leistungen/software-gastronomie).",
        },
      ],
    },
    {
      h2: "Wie läuft eine Bestellung per QR-Code ab?",
      blocks: [
        {
          ol: [
            "Der Gast scannt den Code – am Tisch, an der Theke, auf dem Flyer oder im Schaufenster. Eine App muss er nicht installieren.",
            "Die Speisekarte öffnet sich im Browser, mit Fotos, Varianten, Extras und Allergenen.",
            "Er legt Gerichte in den Warenkorb und schickt die Bestellung ab. Steht der Code auf einem Tisch, ist die Tischnummer schon hinterlegt.",
            "In Küche oder Bar erscheint die Bestellung auf einem Tablet – mit Signalton, damit sie im Betrieb niemand übersieht.",
            "Bezahlt wird je nach Einstellung online oder wie gewohnt beim Service.",
          ],
        },
        {
          tip: "Der Code ersetzt nicht den Service, sondern die Wege: Bestellung aufnehmen, zur Kasse laufen, eintippen. Die Zeit bleibt für das, was Gäste wirklich merken – Empfehlungen, Nachfragen, Abräumen.",
        },
      ],
    },
    {
      h2: "Was kostet ein QR-Code-Bestellsystem?",
      blocks: [
        {
          p: "Fertige Abo-Lösungen werben fast alle mit einem Monatspreis und „0 % Provision“. Wir haben am 8. Oktober 2026 die Preisseiten von drei deutschen Anbietern nachgelesen: KwikOrder nennt 30 bis 70 € netto im Monat, Bistrio 49 € netto im Monat plus 299 € Einrichtung, MeineBestellseite 99 € netto im Monat für den Gastro-Tarif. Dazu kommen jeweils die Gebühren des Zahlungsanbieters. Die Konditionen ändern sich – prüfe sie vor einer Entscheidung direkt beim Anbieter, und achte darauf, ob die Tischbestellung im gewählten Tarif enthalten ist.",
        },
        { p: "Eine eigene Lösung kannst du kaufen oder mieten. Die Zahlen sind dieselben wie in unserem [Preisrechner](/preisrechner):" },
        {
          table: {
            head: ["Stufe", "Kaufen (einmalig)", "Mieten (pro Monat)", "Für wen"],
            rows: [
              ["Bestellsystem Start", "ab 2.900 €", "ab 269 €", "Bestellen per QR-Code zur Abholung, Zahlung vor Ort"],
              ["Bestellsystem Pro", "ab 4.900 €", "ab 349 €", "+ Online-Zahlung, Küchen-Board mit Signalton, Liefergebiete, Gutscheine"],
              ["Mehrere Standorte", "ab 7.900 €", "ab 479 €", "Filialen, Rollen, zentrale Auswertung"],
            ],
            caption: "Endpreise nach § 19 UStG. Kauf: zusätzlich Hosting & Wartung ab 49 € oder Betrieb & Support ab 149 € im Monat. Miete: Hosting, Wartung, Support und Updates inklusive, 3 Monate Testzeit, danach 12 Monate Mindestlaufzeit.",
          },
        },
        {
          p: "Die Bestellung am Tisch – ein eigener Code je Tisch, die Tischnummer auf dem Küchen-Board – bauen wir auf der Stufe Pro auf. Den genauen Umfang legen wir nach dem klickbaren Prototyp fest; dann gilt ein Festpreis. Eine Provision pro Bestellung gibt es nicht, weitere Sprachen kosten als Zusatz 690 €.",
        },
      ],
    },
    {
      h2: "Abo oder eigene Lösung: Was kostet das über drei Jahre?",
      blocks: [
        { p: "Die ehrliche Rechnung, ohne Zahlungsgebühren (die fallen bei beiden Wegen an):" },
        {
          table: {
            head: ["Weg", "Rechnung", "Summe nach 36 Monaten"],
            rows: [
              ["Abo-Lösung, oberes Ende", "36 × 99 € netto", "3.564 € netto"],
              ["Eigene Lösung Pro, gekauft", "4.900 € + 36 × 49 € Hosting & Wartung", "6.664 €"],
              ["Eigene Lösung Pro, gekauft mit Betrieb & Support", "4.900 € + 36 × 149 €", "10.264 €"],
              ["Eigene Lösung Pro, gemietet", "36 × 349 €", "12.564 €"],
            ],
            caption: "Abo-Preis laut Anbieterseite vom 08.10.2026, zuzüglich Umsatzsteuer und je nach Anbieter Einrichtung. Eigene Lösung: Endpreise nach § 19 UStG.",
          },
        },
        {
          p: "Das Abo ist klar günstiger. Wenn dir eine Standard-Bestellseite reicht, nimm sie – das ist kein schlechter Rat, sondern die richtige Reihenfolge. Die eigene Lösung rechnet sich nicht über den Preis, sondern über das, was das Abo nicht kann oder nicht darf.",
        },
      ],
    },
    {
      h2: "Wann lohnt sich eine eigene Lösung?",
      blocks: [
        {
          ul: [
            "**Ein System statt drei** – Tisch, Abholung und Lieferung laufen auf dasselbe Küchen-Board, mit einer Speisekarte, die du einmal pflegst.",
            "**Deine Abläufe** – Gänge nacheinander abrufen, Getränke an die Bar und Speisen in die Küche, Mittagskarte nur bis 14 Uhr, Terrasse nur bei gutem Wetter bestellbar.",
            "**Deine Marke** – die Bestellseite sieht aus wie dein Restaurant, liegt auf deiner Adresse und führt keinen fremden Namen.",
            "**Sprachen** – Karte und Bestellweg in den Sprachen deiner Gäste, nicht nur Deutsch und Englisch.",
            "**Kundendaten und Auswertung** – du siehst, was wann bestellt wird, und kannst Stammgäste selbst ansprechen.",
            "**Du zahlst heute Provision** – wenn ein großer Teil deiner Bestellungen über eine Lieferplattform läuft, sieht die Rechnung anders aus. Die steht im Ratgeber [Eigenes Bestellsystem statt Lieferando](/blog/eigenes-bestellsystem-statt-lieferando).",
          ],
        },
        {
          p: "Zum Ausprobieren: In unserer [Bestellsystem-Demo](/demo/restaurant) läuft ein eigenes Bestellsystem mit Speisekarte samt Varianten, Abholung und Lieferung und einem Küchen-Board, in dem jede Bestellung sofort erscheint. Preise, Artikel und „ausverkauft“ ändert das Team selbst.",
        },
      ],
    },
    {
      h2: "Gibt es ein QR-Code-Bestellsystem kostenlos?",
      blocks: [
        {
          p: "Den QR-Code ja: Er ist nur ein Link als Bild, und kostenlose Generatoren gibt es viele. Auch eine Speisekarte zum Ansehen (Stufe 1) bekommst du ohne Kosten hin, zum Beispiel als Seite auf deiner Website. Achte bei Generatoren darauf, dass der Code direkt auf deine Adresse zeigt und nicht über einen Kurzlink des Anbieters läuft – sonst funktionieren deine gedruckten Tischaufsteller nur, solange es diesen Dienst gibt.",
        },
        {
          p: "Kostenlose Tarife für echte Bestellsysteme gibt es ebenfalls. Lies vor dem Start nach, woran der Anbieter dann verdient: an Zahlungsgebühren, an einer Begrenzung der Bestellungen oder Tische, an Werbung auf deiner Bestellseite oder an einem späteren Tarifwechsel. Zum Ausprobieren, ob deine Gäste überhaupt per Handy bestellen, ist ein kostenloser Tarif ein guter Anfang.",
        },
      ],
    },
    {
      h2: "Checkliste: Das solltest du vor dem Start klären",
      blocks: [
        {
          ul: [
            "Welche Stufe brauchst du – nur Karte, Bestellen oder Bestellen und Bezahlen?",
            "Wo stehen die Codes: je Tisch, an der Theke, auf Flyern, im Schaufenster?",
            "Wer sieht die Bestellung – Küche, Bar oder beide? Auf welchem Gerät, und was passiert, wenn das WLAN ausfällt?",
            "Wie kommen die Bestellungen in deine Kasse? Sprich das vorab mit deinem Kassenanbieter und deinem Steuerberater ab.",
            "Zahlung online, beim Service oder beides? Wie läuft Trinkgeld?",
            "Sind Allergene und Zusatzstoffe für jedes Gericht gepflegt?",
            "Was passiert, wenn ein Gericht aus ist – kann das Team es mit einem Tipp sperren?",
            "Bleibt die gedruckte Karte für Gäste, die nicht scannen wollen?",
            "Reicht das WLAN oder Mobilfunknetz an jedem Tisch, auch auf der Terrasse?",
            "Wem gehören die Kundendaten, und wie kommst du an sie, wenn du den Anbieter wechselst?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Brauchen meine Gäste eine App für die Bestellung per QR-Code?",
      a: "Nein. Die Handy-Kamera öffnet nach dem Scannen die Bestellseite im Browser. Stammgäste können sich die Seite wie eine App auf den Startbildschirm legen – ohne App-Store.",
    },
    {
      q: "Was kostet ein QR-Code-Bestellsystem im Monat?",
      a: "Fertige Abo-Lösungen liegen laut den Preisseiten der Anbieter meist bei 30 bis 100 € netto im Monat, teils plus einmalige Einrichtung. Eine eigene Lösung kostet zur Miete ab 269 € im Monat oder einmalig ab 2.900 € plus Hosting und Wartung ab 49 € im Monat.",
    },
    {
      q: "Ist ein kostenloses QR-Code-Bestellsystem eine gute Idee?",
      a: "Zum Testen ja. Prüfe vorher, woran der Anbieter verdient – Zahlungsgebühren, Begrenzungen, Werbung – und ob die Codes direkt auf deine eigene Adresse zeigen, damit gedruckte Aufsteller bei einem Wechsel weiter funktionieren.",
    },
    {
      q: "Funktioniert das mit meiner Kasse?",
      a: "Unser Bestellsystem arbeitet eigenständig, du brauchst nur ein Tablet in Küche oder an der Theke. Eine Anbindung an deine Kasse ist als Zusatz möglich, wenn dein Kassenanbieter eine Schnittstelle bereitstellt – das prüfen wir vor dem Angebot.",
    },
    {
      q: "Fällt eine Provision pro Bestellung an?",
      a: "Bei einem eigenen Bestellsystem nicht. Bei Online-Zahlung kommen nur die Gebühren des Zahlungsanbieters dazu. Auch viele Abo-Anbieter werben mit 0 % Provision – der Unterschied liegt dann im Monatspreis und im Umfang.",
    },
    {
      q: "Wie lange dauert es, bis ein eigenes QR-Code-Bestellsystem läuft?",
      a: "Die Stufe Start ist in der Regel in zwei bis drei Wochen live, die Stufe Pro in drei bis vier Wochen. Vorher siehst du einen klickbaren Prototyp und bekommst einen Festpreis.",
    },
  ],
};
