import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "treatwell-alternative",
  category: "branchen",
  title: "Treatwell-Alternative: Wann sich ein eigenes Buchungssystem für deinen Salon lohnt",
  seoTitle: "Treatwell-Alternative: eigenes Buchungssystem für Salons",
  description: "Treatwell-Alternative gesucht? Drei Wege im Vergleich, eine Rechnung zum Selbsteinsetzen und ein Plan, wie du Stammkunden auf deine eigene Buchung holst.",
  keywords: ["Treatwell Alternative", "Buchungssystem Friseur ohne Provision", "Alternative zu Treatwell", "eigenes Buchungssystem Salon", "Online-Terminbuchung Friseur"],
  date: "2026-10-08",
  page: "beauty",
  intro:
    "Eine Treatwell-Alternative ist entweder eine andere Buchungssoftware im Abo oder ein eigenes Buchungssystem auf deiner Website. Der Unterschied: Ein Marktplatz bringt dir neue Kundinnen und Kunden und verlangt dafür eine Provision, ein eigenes System bringt keine Reichweite, kostet aber auch nichts pro Buchung. Für Salons mit vielen Stammkunden lohnt sich die eigene Buchung meist schnell – ein eigenes System gibt es einmalig ab 2.200 € oder ab 239 € im Monat zur Miete.",
  takeaways: [
    "Marktplatz und eigenes System lösen zwei verschiedene Aufgaben: Reichweite und Terminverwaltung.",
    "Laut Treatwell fällt Provision nur bei der ersten Buchung eines Kunden an – Folgebuchungen sind provisionsfrei.",
    "Entscheidend ist dein Anteil an Stammkunden und wie viele Neukunden wirklich über die Plattform kommen.",
    "Du musst dich nicht entscheiden: Viele Salons nutzen beides und lenken Stammkunden auf die eigene Buchung.",
  ],
  sections: [
    {
      h2: "Warum suchen Salons eine Alternative zu Treatwell?",
      blocks: [
        {
          p: "Meist aus einem von vier Gründen: Die Kosten pro Neukunde fühlen sich hoch an. Der eigene Salon steht in der App direkt neben der Konkurrenz. Kundendaten und Bewertungen liegen auf einer fremden Plattform. Oder der Salon ist längst ausgebucht und braucht keine Vermittlung mehr, sondern nur noch einen Kalender, der Buchungen annimmt.",
        },
        {
          p: "Keiner dieser Gründe macht einen Marktplatz schlecht. Er ist ein Werbekanal – und Werbekanäle bewertet man danach, was ein neuer Kunde kostet und wie oft er wiederkommt.",
        },
      ],
    },
    {
      h2: "Was kostet Treatwell?",
      blocks: [
        {
          p: "Treatwell schreibt auf der eigenen Partnerseite (abgerufen am 8. Oktober 2026), dass eine Provision „nur bei der ersten Buchung eines Kunden“ erhoben wird und alle nachfolgenden Buchungen provisionsfrei sind. Die Höhe der Provision und weitere Gebühren nennt die Seite dort nicht; sie stehen in den Tarifen, die dir Treatwell anbietet. In Vergleichsportalen findest du unterschiedliche Zahlen – verlass dich auf dein eigenes Angebot oder deine Abrechnung.",
        },
        {
          tip: "Schau in deine letzten drei Abrechnungen: Wie viele Buchungen waren echte Neukunden? Wie viele davon sind ein zweites Mal gekommen? Das sind die zwei Zahlen, die du für die Entscheidung brauchst.",
        },
      ],
    },
    {
      h2: "Welche Alternativen gibt es?",
      blocks: [
        {
          table: {
            head: ["Weg", "Bringt neue Kunden", "Kosten", "Kundendaten", "Passt, wenn …"],
            rows: [
              ["Marktplatz (z. B. Treatwell)", "ja, über App und Plattform", "Provision und je nach Tarif Grundgebühr", "bei der Plattform", "du neu bist oder freie Zeiten füllen willst"],
              ["Buchungssoftware im Abo", "nein", "monatlich, oft je Mitarbeiter", "beim Anbieter, exportierbar je nach Tarif", "du schnell eine Buchung ohne eigene Website-Arbeit willst"],
              ["Eigenes Buchungssystem", "nein – Kunden kommen über Google, Instagram und Empfehlung", "einmalig oder Miete, keine Provision", "bei dir", "du viele Stammkunden hast und unter eigener Marke auftreten willst"],
            ],
          },
        },
        {
          p: "Wie ein eigenes System für Salons aussieht, zeigt die Seite [Buchungssystem für Friseur und Beauty](/leistungen/buchungssystem-friseur-beauty).",
        },
      ],
    },
    {
      h2: "Rechnung: Ab wann lohnt sich das eigene System?",
      blocks: [
        { p: "Setz deine eigenen Zahlen ein. So gehst du vor:" },
        {
          ol: [
            "Nimm die Summe, die du im letzten Jahr an Provision und Grundgebühren an die Plattform gezahlt hast.",
            "Teil sie durch zwölf – das ist dein Monatswert.",
            "Vergleich ihn mit den Kosten des eigenen Systems: Miete ab 239 € im Monat, oder Kauf ab 2.200 € plus Hosting & Wartung ab 49 € im Monat.",
            "Zieh ab, was dir ohne Plattform an Neukunden fehlen würde – ehrlich geschätzt.",
          ],
        },
        {
          table: {
            head: ["Eigenes System", "Rechnung", "Kosten im ersten Jahr"],
            rows: [
              ["Buchung Start, gekauft", "2.200 € + 12 × 49 €", "2.788 €"],
              ["Buchung Start, gemietet", "12 × 239 €", "2.868 €"],
              ["Buchung Pro, gekauft", "3.900 € + 12 × 49 €", "4.488 €"],
              ["Buchung Pro, gemietet", "12 × 309 €", "3.708 €"],
            ],
            caption: "Endpreise nach § 19 UStG. Ab dem zweiten Jahr kostet ein gekauftes System nur noch den Betrieb: ab 588 € im Jahr.",
          },
        },
        {
          p: "Ein Beispiel mit angenommenen Zahlen: Zahlst du im Schnitt 300 € im Monat an eine Plattform, sind das 3.600 € im Jahr. Ein gekauftes System der Stufe Start hat sich dann nach rund neun Monaten bezahlt – wenn deine Stammkunden mitziehen.",
        },
      ],
    },
    {
      h2: "Was sollte ein eigenes Buchungssystem können?",
      blocks: [
        {
          ul: [
            "Leistungen mit Dauer und Preis, auch Kombinationen wie Schneiden und Färben.",
            "Auswahl der Mitarbeiterin oder des Mitarbeiters – oder „egal, wer frei ist“.",
            "Schutz vor Doppelbuchungen, auch wenn zwei Personen gleichzeitig buchen.",
            "Bestätigung per Mail und WhatsApp, Erinnerung vor dem Termin.",
            "Anzahlung und Stornoregeln für lange oder teure Termine.",
            "Warteliste, die frei gewordene Termine wieder füllt.",
            "Buchung direkt aus Google-Profil und Instagram-Bio.",
          ],
        },
        {
          p: "Für den [OMED Friseursalon in Aachen-Burtscheid](/portfolio) haben wir das gebaut: eigene Website mit mehrstufiger Buchung, Kalender und Zeitfenstern – zwei Buchungen zur selben Zeit sind auf Datenbank-Ebene ausgeschlossen. Die Preise aller Stufen stehen im [Preisrechner](/preisrechner), die Hintergründe im Ratgeber [Buchungssystem für Friseure ohne Provision](/blog/buchungssystem-friseur-ohne-provision).",
        },
      ],
    },
    {
      h2: "Wie wechselst du, ohne Kunden zu verlieren?",
      blocks: [
        {
          ol: [
            "**Parallel starten.** Das eigene System geht live, das Plattform-Profil bleibt erst einmal bestehen.",
            "**Stammkunden umlenken.** QR-Code am Spiegel und an der Kasse, Link in der Terminbestätigung, Hinweis beim Bezahlen: „Nächstes Mal direkt bei uns buchen.“",
            "**Google und Instagram umstellen.** Der Buchen-Button im Google-Profil und der Link in der Bio zeigen auf deine eigene Buchung.",
            "**Drei Monate messen.** Wie viele Buchungen kommen noch über die Plattform, wie viele davon sind neu?",
            "**Dann entscheiden.** Plattform behalten als Neukunden-Kanal, Tarif anpassen oder kündigen. Prüf vorher Kündigungsfrist und was mit deinen Bewertungen passiert.",
          ],
        },
      ],
    },
    {
      h2: "Checkliste vor dem Wechsel",
      blocks: [
        {
          ul: [
            "Wie hoch ist dein Anteil an Stammkunden?",
            "Wie viele echte Neukunden bringt die Plattform im Monat – und wie viele kommen wieder?",
            "Welche Kündigungsfrist hat dein Vertrag?",
            "Kannst du deine Kundendaten und Termine exportieren?",
            "Hast du ein gepflegtes Google-Profil mit Bewertungen?",
            "Wer im Team pflegt Leistungen, Preise und Arbeitszeiten im neuen System?",
            "Brauchst du Anzahlungen gegen Nichterscheinen?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Was ist die beste Treatwell-Alternative?",
      a: "Das hängt davon ab, was du brauchst. Suchst du Reichweite, ist ein anderer Marktplatz die Alternative. Suchst du eine Buchung ohne Provision für deine Stammkunden, ist es eine Buchungssoftware im Abo oder ein eigenes System auf deiner Website.",
    },
    {
      q: "Verliere ich Neukunden, wenn ich die Plattform verlasse?",
      a: "Die, die dich nur dort gefunden hätten, ja. Deshalb lohnt sich der Parallelbetrieb: Stammkunden buchen direkt, die Plattform bleibt als Neukunden-Kanal – bis deine eigenen Zahlen zeigen, ob du sie noch brauchst.",
    },
    {
      q: "Kann ich Treatwell und ein eigenes Buchungssystem gleichzeitig nutzen?",
      a: "Technisch ja. Du musst dann darauf achten, dass Termine nicht doppelt vergeben werden – entweder durch einen Kalenderabgleich oder indem du auf der Plattform nur bestimmte Zeiten freigibst. Prüf auch, was dein Vertrag dazu sagt.",
    },
    {
      q: "Was kostet ein eigenes Buchungssystem für einen Salon?",
      a: "Buchung Start einmalig ab 2.200 € oder ab 239 € im Monat zur Miete, Buchung Pro mit Kundenkonto, Anzahlung, Erinnerungen und Warteliste ab 3.900 € oder ab 309 € im Monat. Eine Provision pro Buchung gibt es nicht.",
    },
    {
      q: "Kann ich meine Kundendaten mitnehmen?",
      a: "Das hängt vom Export deiner bisherigen Lösung ab. Die Übernahme in das neue System kostet bei uns als Zusatz 990 €.",
    },
    {
      q: "Wie schnell ist das eigene Buchungssystem live?",
      a: "Die Stufe Start in zwei bis drei Wochen, die Stufe Pro in drei bis vier Wochen. Vorher siehst du einen klickbaren Prototyp und bekommst einen Festpreis.",
    },
  ],
};
