import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "eigenes-bestellsystem-statt-lieferando",
  category: "branchen",
  title: "Eigenes Bestellsystem statt Lieferando & Co.: Was es kostet und ab wann es sich rechnet",
  description: "Provision oder eigenes Bestellsystem? Kosten, Funktionen und eine einfache Break-even-Rechnung für Restaurants, Imbisse und Bäckereien.",
  keywords: ["eigenes Bestellsystem Restaurant", "Bestellsystem ohne Provision", "Alternative zu Lieferando", "Online-Bestellsystem Gastronomie", "Wolt Alternative"],
  date: "2026-09-27",
  page: "bestellsystem",
  intro:
    "Lieferplattformen bringen Reichweite, aber sie verdienen an jeder Bestellung mit – auch an Stammkunden, die dich ohnehin kennen. Ein eigenes Bestellsystem dreht das um: Die Bestellung läuft über deine Website, das Geld landet direkt bei dir, und die Kundendaten gehören dir. In diesem Ratgeber rechnen wir durch, was ein eigenes System kostet, was es können muss und ab welchem Umsatz es sich lohnt.",
  takeaways: [
    "Plattformen sind gut für Neukunden – für Stammkunden sind sie teuer.",
    "Ein eigenes Bestellsystem kostet einmalig ab ca. 3.900 € plus Betrieb ab 49 €/Monat.",
    "Die Rechnung ist einfach: gesparte Provision pro Monat gegen Betriebskosten.",
    "Am besten fährst du zweigleisig: Plattform für die Reichweite, eigenes System für alle, die wiederkommen.",
  ],
  sections: [
    {
      h2: "Warum Provision auf Dauer das teuerste Modell ist",
      blocks: [
        {
          p: "Die großen Lieferplattformen rechnen je nach Modell mit einer Provision pro Bestellung. Wie hoch sie ausfällt, hängt davon ab, ob du selbst lieferst oder die Plattform liefert – und sie liegt häufig im **zweistelligen Prozentbereich**. Prüfe die aktuellen Konditionen in deinem Vertrag; sie ändern sich regelmäßig.",
        },
        {
          p: "Das Problem ist nicht die Provision an sich, sondern **worauf** sie anfällt. Die Plattform bringt dir einen Gast. Bestellt dieser Gast danach jede Woche wieder, zahlst du trotzdem jedes Mal. Nach einem Jahr hast du für einen einzigen Neukunden oft mehr bezahlt als für eine komplette Werbekampagne.",
        },
        {
          p: "Dazu kommt: Die Kundendaten liegen bei der Plattform. Du kannst deinen Stammgästen keinen Gutschein schicken, keine Mittagskarte ankündigen und nicht sehen, wer seit Wochen nicht mehr bestellt hat.",
        },
      ],
    },
    {
      h2: "Was ein eigenes Bestellsystem können muss",
      blocks: [
        { p: "Ein gutes System ist für deine Gäste mindestens so bequem wie die Plattform-App. Diese Funktionen gehören dazu:" },
        {
          ul: [
            "**Speisekarte mit Varianten und Extras** – z. B. „mit Käse +0,50 €“, Allergene, Ausverkauft-Schalter.",
            "**Warenkorb, Abholung und Lieferung** – mit Liefergebieten, Mindestbestellwert und Liefergebühr.",
            "**Online-Zahlung** – Karte, PayPal, Apple Pay und Google Pay. Barzahlung bleibt optional.",
            "**Küchen-Ansicht auf dem Tablet** – neue Bestellungen mit Signalton, Status per Fingertipp.",
            "**Bestellstatus für den Gast** – „in Zubereitung“, „unterwegs“, ohne dass jemand anrufen muss.",
            "**Öffnungszeiten-Logik** – außerhalb der Zeiten Vorbestellung oder klarer Hinweis.",
            "**Mehrsprachigkeit** – gerade in Innenstädten ein echter Umsatzhebel.",
          ],
        },
        {
          p: "Genau so haben wir das Bestellsystem für die [Bäckerei Daron Brot II in Aachen](/portfolio) gebaut: Deutsch, Englisch und Arabisch, Küchen-Board fürs iPad, Bestellstatus per Link und ein Dashboard für Öffnungszeiten, Preise und Artikel.",
        },
      ],
    },
    {
      h2: "Was kostet ein eigenes Bestellsystem?",
      blocks: [
        { p: "Die Kosten hängen vom Umfang ab. Diese Richtwerte nutzen wir auch in unserem [Preisrechner](/preisrechner):" },
        {
          table: {
            head: ["Paket", "Einmalig", "Enthalten"],
            rows: [
              ["Bestellsystem Start", "ab 3.900 €", "Speisekarte, Warenkorb, Abholung & Lieferung, Bestell-Dashboard"],
              ["Bestellsystem Pro", "ab 6.900 €", "+ Online-Zahlung, Küchen-Display, Liefergebiete, Gutscheine"],
              ["Mehrere Standorte", "ab 10.900 €", "Filialen, Rollen, zentrales Reporting"],
            ],
            caption: "Endpreise nach § 19 UStG. Hosting & Wartung ab 49 €, Betrieb & Support ab 149 € im Monat.",
          },
        },
        {
          p: "Dazu kommen die Gebühren des Zahlungsanbieters für Online-Zahlungen. Sie sind in der Regel deutlich niedriger als eine Plattform-Provision, weil sie nur die Transaktion abdecken – nicht Reichweite und Vermittlung.",
        },
      ],
    },
    {
      h2: "Die Break-even-Rechnung in drei Schritten",
      blocks: [
        {
          ol: [
            "**Monatlicher Plattform-Umsatz von Stammkunden schätzen.** Wie viel deines Plattform-Umsatzes kommt von Gästen, die mehr als einmal bestellen? Oft ist das der größere Teil.",
            "**Gesparte Provision berechnen.** Diesen Umsatz mal deinen Provisionssatz. Das ist das Geld, das du jeden Monat zurückholen kannst, wenn diese Gäste direkt bestellen.",
            "**Gegen die Kosten stellen.** Einmalige Investition plus Betrieb im Monat. Teile die Investition durch die monatliche Ersparnis – das ist deine Amortisationszeit in Monaten.",
          ],
        },
        {
          tip: "Beispiel: 6.000 € Stammkunden-Umsatz im Monat über die Plattform, davon wandern die Hälfte zum eigenen System. Bei einer angenommenen Provision von 15 % sparst du 450 € im Monat. Ein System für 6.900 € plus 149 € Betrieb hat sich dann nach rund 23 Monaten bezahlt – und spart danach jeden Monat weiter.",
        },
      ],
    },
    {
      h2: "So holst du deine Gäste auf das eigene System",
      blocks: [
        {
          ul: [
            "**Flyer in jede Plattform-Tüte**: „Direkt bestellen und 10 % sparen“ mit QR-Code.",
            "**Google-Unternehmensprofil**: Der Button „Online bestellen“ zeigt auf deine eigene Seite.",
            "**Treuevorteil**: Jede zehnte Bestellung gratis – das kann nur dein System, nicht die Plattform.",
            "**Social Media & Reels**: Gutes Food-Video verkauft. Unsere [Reels aus der Gastronomie](/portfolio) zeigen, wie das aussieht.",
            "**WhatsApp-Benachrichtigung**: Bestellbestätigung und Status direkt aufs Handy – das schafft Vertrauen.",
          ],
        },
      ],
    },
    {
      h2: "Wann sich ein eigenes System (noch) nicht lohnt",
      blocks: [
        {
          p: "Ehrlich gesagt: Wenn du fast nur Laufkundschaft hast und kaum wiederkehrende Bestellungen, bringt dir das eigene System wenig. Dann ist eine starke [Website mit Speisekarte](/leistungen/website-erstellen-lassen) und gutem Google-Profil der bessere erste Schritt. Sobald du merkst, dass dieselben Namen immer wieder auf den Bons stehen, ist es Zeit für das eigene System.",
        },
      ],
    },
    {
      h2: "Checkliste vor dem Start",
      blocks: [
        {
          ul: [
            "Aktuelle Speisekarte mit Preisen, Varianten und Allergenen",
            "Liefergebiete, Mindestbestellwert und Liefergebühr",
            "Öffnungs- und Küchenzeiten, auch für Feiertage",
            "Zahlungsarten und Konto für Online-Zahlungen",
            "Wer nimmt Bestellungen an – Tablet in der Küche, an der Theke oder beides?",
            "Fotos der wichtigsten Gerichte – Bilder verkaufen online am stärksten",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Muss ich die Lieferplattform kündigen, wenn ich ein eigenes Bestellsystem habe?",
      a: "Nein. Die meisten Betriebe fahren zweigleisig: Die Plattform bringt neue Gäste, das eigene System hält die Stammkunden. Mit der Zeit verschiebt sich der Umsatz zum eigenen System.",
    },
    {
      q: "Wie lange dauert die Umsetzung?",
      a: "Ein Bestellsystem Start ist in der Regel in drei bis vier Wochen live. Den klickbaren Prototyp siehst du nach etwa sieben Tagen.",
    },
    {
      q: "Wem gehören die Daten und der Code?",
      a: "Dir. Kundendaten liegen in einer Datenbank in der EU, und du bekommst auf Wunsch den kompletten Quellcode.",
    },
    {
      q: "Kann ich Preise und Artikel selbst ändern?",
      a: "Ja. Über das Dashboard änderst du Preise, Artikel, Öffnungszeiten und Ausverkauft-Status selbst – ohne uns anrufen zu müssen.",
    },
  ],
};
