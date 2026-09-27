import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "web-app-oder-native-app",
  category: "software",
  title: "Web-App oder native App? Der Entscheidungsleitfaden für KMU",
  description: "Web-App, Progressive Web App oder App Store? Kosten, Funktionen und Grenzen im Vergleich – mit klarer Empfehlung für kleine und mittlere Unternehmen.",
  keywords: ["Web-App oder App", "Progressive Web App Kosten", "App entwickeln lassen Kosten", "Web-App Entwicklung", "App für Unternehmen"],
  date: "2026-09-27",
  page: "webapp",
  intro:
    "„Wir brauchen eine App“ ist einer der häufigsten Sätze im Erstgespräch. Oft steckt dahinter der Wunsch, dass Kunden oder Mitarbeiter etwas bequem auf dem Handy erledigen können. Dafür muss es nicht immer eine App aus dem App Store sein. Dieser Leitfaden hilft dir bei der Entscheidung.",
  takeaways: [
    "Eine Web-App läuft im Browser und lässt sich auf den Homescreen legen – ohne Store.",
    "Für Buchung, Bestellung, Portale und interne Tools reicht sie in den meisten Fällen.",
    "Native Apps lohnen sich bei Offline-Pflicht, tiefer Geräteintegration oder Store-Präsenz.",
    "Web-App ab 4.900 €, native App ab 12.900 € (Richtwerte).",
  ],
  sections: [
    {
      h2: "Die drei Optionen in einem Satz",
      blocks: [
        {
          ul: [
            "**Web-App**: Software im Browser, funktioniert auf jedem Gerät, ein Link genügt.",
            "**Progressive Web App (PWA)**: eine Web-App, die sich wie eine App auf den Homescreen legen lässt, Push-Nachrichten schickt und teilweise offline funktioniert.",
            "**Native App**: eigene App für iOS und Android, verteilt über App Store und Google Play.",
          ],
        },
      ],
    },
    {
      h2: "Vergleich auf einen Blick",
      blocks: [
        {
          table: {
            head: ["Kriterium", "Web-App / PWA", "Native App"],
            rows: [
              ["Kosten (Richtwert)", "ab 4.900 €", "ab 12.900 €"],
              ["Zeit bis zum Start", "Wochen", "Wochen plus Store-Freigabe"],
              ["Updates", "sofort für alle", "über Store-Update"],
              ["Push-Nachrichten", "ja", "ja"],
              ["Offline", "eingeschränkt", "vollständig"],
              ["Kamera, GPS", "ja", "ja, tiefer integriert"],
              ["Auffindbar über Google", "ja", "nein"],
              ["Store-Präsenz", "nein", "ja"],
            ],
          },
        },
      ],
    },
    {
      h2: "Wann die Web-App die bessere Wahl ist",
      blocks: [
        {
          ul: [
            "Kunden buchen, bestellen oder laden Dokumente hoch – z. B. ein [Buchungssystem](/leistungen/online-buchungssystem) oder ein Kundenportal.",
            "Mitarbeiter nutzen die Software im Büro **und** unterwegs.",
            "Du willst über Google gefunden werden.",
            "Du willst schnell starten und oft verbessern.",
          ],
        },
        {
          p: "Die Web-App [Antragsbruder](/portfolio) ist ein gutes Beispiel: Nutzer laden Unterlagen hoch, nutzen Rechner und verwalten ihr Konto – im Browser, in neun Sprachen, ohne App Store.",
        },
      ],
    },
    {
      h2: "Wann sich eine native App lohnt",
      blocks: [
        {
          ul: [
            "Die App muss **zuverlässig offline** funktionieren, z. B. in Tiefgaragen, Kellern oder auf dem Land.",
            "Du brauchst **tiefe Geräteintegration** wie Bluetooth-Geräte, Hintergrund-Standort oder NFC.",
            "Deine Zielgruppe erwartet dich **im App Store**, etwa bei Treue-Apps großer Filialketten.",
          ],
        },
        {
          tip: "Beliebter Weg: mit einer Web-App starten, Nutzung messen und erst dann in eine native App investieren, wenn die Zahlen es rechtfertigen. Der Großteil der Logik lässt sich weiterverwenden.",
        },
      ],
    },
    {
      h2: "Kosten über drei Jahre",
      blocks: [
        {
          p: "Bei der Entscheidung zählt nicht nur der Preis für die Entwicklung. Native Apps brauchen regelmäßige Anpassungen an neue iOS- und Android-Versionen, Store-Richtlinien und Geräte. Eine Web-App wird zentral aktualisiert und läuft auf allen Geräten gleich. Für die meisten KMU sind die laufenden Kosten einer Web-App deshalb deutlich niedriger.",
        },
      ],
    },
    {
      h2: "Checkliste für deine Entscheidung",
      blocks: [
        {
          ol: [
            "Muss die App ohne Internet zuverlässig funktionieren?",
            "Braucht sie Zugriff auf spezielle Hardware wie Bluetooth-Geräte oder NFC?",
            "Erwarten deine Kunden dich im App Store?",
            "Soll die Anwendung auch über Google gefunden werden?",
            "Wie oft willst du Änderungen ausrollen?",
          ],
        },
        {
          p: "Drei Mal Nein bei den ersten drei Fragen? Dann ist eine Web-App fast immer die bessere Wahl. Wie das konkret aussieht, zeigen wir auf der Seite [Web-Apps & Kundenportale](/leistungen/web-app-entwicklung).",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Funktionieren Push-Nachrichten bei Web-Apps auch auf dem iPhone?",
      a: "Ja, wenn die Web-App auf den Homescreen gelegt wurde. Wir zeigen Nutzern beim ersten Besuch, wie das geht.",
    },
    {
      q: "Kann aus einer Web-App später eine native App werden?",
      a: "Ja. Datenbank, Schnittstellen und Geschäftslogik bleiben. Neu entsteht vor allem die Oberfläche für iOS und Android.",
    },
    {
      q: "Brauche ich für eine native App eigene Entwickler-Konten?",
      a: "Ja, bei Apple und Google. Wir helfen bei der Einrichtung, die Konten gehören dir.",
    },
  ],
};
