import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "ki-software-entwickeln-lassen",
  category: "ki",
  title: "KI-Software entwickeln lassen: Was sinnvoll ist, was es kostet und wie ein Projekt abläuft",
  seoTitle: "KI-Software entwickeln lassen: Kosten, Beispiele, Ablauf",
  description: "KI-Software entwickeln lassen: fünf sinnvolle Einsatzfälle, ehrliche Grenzen, Ablauf in vier Schritten und Kosten – einzelne Workflows ab 590 €.",
  keywords: ["KI Software entwickeln lassen", "KI Anwendung entwickeln lassen", "KI Software Kosten", "Software mit KI Funktionen", "KI Entwicklung Agentur"],
  date: "2026-10-08",
  page: "ki",
  intro:
    "KI-Software entwickeln lassen heißt in den meisten Fällen nicht, ein eigenes KI-Modell zu trainieren. Es heißt: eine normale Software bauen – ein Portal, ein Auftragssystem, ein Postfach – und ein vorhandenes Sprachmodell an genau einer Stelle einsetzen, an der es Arbeit abnimmt. Zum Beispiel Belege auslesen, Anfragen sortieren oder Antworten vorschlagen. Ein einzelner KI-Workflow kostet bei uns ab 590 €, eine KI-Funktion in einem bestehenden System 1.490 €, eine Software mit KI als festem Bestandteil ab 3.900 €.",
  takeaways: [
    "Fast immer wird ein vorhandenes Sprachmodell eingebunden, nicht ein eigenes trainiert.",
    "KI lohnt sich bei Text, Dokumenten und Sprache in großer Menge – nicht bei Rechnen und festen Regeln.",
    "Jede KI-Funktion braucht eine Kontrolle: Freigabe durch einen Menschen oder klare Prüfregeln.",
    "Kosten: Workflow ab 590 €, KI-Funktion im System 1.490 €, Software mit KI ab 3.900 € – plus Verbrauch je Nutzung.",
  ],
  sections: [
    {
      h2: "Was bedeutet es, KI-Software entwickeln zu lassen?",
      blocks: [
        {
          p: "Es gibt drei Stufen, und sie unterscheiden sich um Größenordnungen im Aufwand:",
        },
        {
          table: {
            head: ["Stufe", "Was gebaut wird", "Beispiel", "Aufwand"],
            rows: [
              ["KI-Workflow", "Ein Ablauf in deinen bestehenden Werkzeugen", "Eingehende Mails werden sortiert, eine Antwort wird vorgeschlagen", "Tage bis zwei Wochen"],
              ["KI-Funktion in einer Software", "Ein Baustein in einem Portal oder System", "Beleg-Upload liest Lieferant, Datum und Betrag aus", "wenige Wochen, zusammen mit der Software"],
              ["Eigenes Modell", "Training oder Feinabstimmung auf eigenen Daten", "Erkennung sehr spezieller Bilder oder Fachtexte", "Monate, braucht viele saubere Daten"],
            ],
          },
        },
        {
          p: "Für kleine und mittlere Unternehmen sind die ersten beiden Stufen fast immer die richtigen. Ein eigenes Modell lohnt sich nur, wenn die vorhandenen Modelle die Aufgabe nachweislich nicht lösen – das prüft man zuerst mit einem Test, nicht mit einem Projekt.",
        },
      ],
    },
    {
      h2: "Wo bringt KI in einer Software wirklich etwas?",
      blocks: [
        {
          ul: [
            "**Dokumente auslesen:** Belege, Lieferscheine, Verträge – Daten landen in Feldern statt in einem PDF.",
            "**Eingänge sortieren:** Mails und Formulare werden einem Vorgang, einer Person und einer Dringlichkeit zugeordnet.",
            "**Antworten vorschlagen:** Entwurf im Ton deines Betriebs, ein Mensch gibt frei.",
            "**Telefon annehmen:** Anliegen aufnehmen, Termin anbieten, weiterleiten.",
            "**Suchen in eigenen Unterlagen:** Fragen an Handbücher, Angebote oder Akten in normaler Sprache.",
          ],
        },
        {
          p: "Den Beleg-Upload mit KI kannst du in unserer [Mandantenportal-Demo](/demo/steuerkanzlei) ausprobieren. Zehn weitere Beispiele aus dem Alltag stehen im Ratgeber [KI-Automatisierung im Mittelstand](/blog/ki-automatisierung-mittelstand).",
        },
      ],
    },
    {
      h2: "Wo solltest du keine KI einsetzen?",
      blocks: [
        {
          ul: [
            "**Rechnen und Abrechnen.** Preise, Steuern und Summen gehören in feste Formeln.",
            "**Regeln ohne Ausnahme.** Was sich als Wenn-dann beschreiben lässt, ist als normaler Code billiger und zuverlässiger.",
            "**Entscheidungen mit Folgen.** Zusagen, Kündigungen, Diagnosen: Die KI bereitet vor, ein Mensch entscheidet.",
            "**Aufgaben mit wenigen Fällen.** Zehn Vorgänge im Monat automatisiert man nicht.",
          ],
        },
        {
          tip: "Faustregel für das erste Gespräch mit einer Agentur: Frag, an welcher Stelle keine KI eingesetzt wird und warum. Wer überall KI vorschlägt, hat den Ablauf nicht verstanden.",
        },
      ],
    },
    {
      h2: "Wie läuft ein KI-Software-Projekt ab?",
      blocks: [
        {
          ol: [
            "**Eine Aufgabe wählen.** Die mit dem größten Zeitgewinn und dem kleinsten Risiko, nicht die spannendste.",
            "**Mit echten Beispielen testen.** Zwanzig bis fünfzig echte Fälle zeigen, wie gut das Modell die Aufgabe löst – bevor etwas gebaut wird.",
            "**Mit Freigabe live gehen.** Die KI schlägt vor, ein Mensch bestätigt. Fehler werden protokolliert.",
            "**Ausbauen, was sich bewährt.** Erst wenn die Trefferquote stimmt, läuft ein Schritt ohne Freigabe.",
          ],
        },
        {
          p: "Die Software um die KI herum – Anmeldung, Rollen, Oberfläche, Schnittstellen – ist klassische Entwicklung und macht den größeren Teil der Arbeit aus. Dass wir dabei selbst mit KI entwickeln, verkürzt die Bauzeit; wie das funktioniert, erklärt der Ratgeber [Software mit KI entwickeln](/blog/software-mit-ki-entwickeln).",
        },
      ],
    },
    {
      h2: "Was kostet es, KI-Software entwickeln zu lassen?",
      blocks: [
        {
          table: {
            head: ["Umfang", "Preis", "Läuft nach"],
            rows: [
              ["Workflow: Antwortentwürfe auf Bewertungen", "590 € einmalig oder ab 69 € im Monat zur Miete", "1 Woche"],
              ["Workflow: Anfragen sortieren und beantworten", "990 € einmalig oder ab 89 € im Monat zur Miete", "1–2 Wochen"],
              ["KI-Telefonassistent", "1.490 € einmalig oder ab 109 € im Monat zur Miete", "2 Wochen"],
              ["KI-Funktion in einem bestehenden System", "1.490 € als Zusatz", "mit dem System"],
              ["Web-App oder Portal mit KI-Funktion", "ab 3.900 € einmalig oder ab 309 € im Monat zur Miete", "3–8 Wochen"],
              ["Individualsoftware mit KI im Kernprozess", "ab 10.900 € einmalig oder ab 599 € im Monat zur Miete", "nach Umfang"],
            ],
            caption: "Endpreise nach § 19 UStG. Dazu kommt der Verbrauch des Sprachmodells je Nutzung – wir schätzen ihn vorab für dein Aufkommen.",
          },
        },
        {
          p: "Zwei Kostenarten werden oft vergessen: der laufende Verbrauch des Modells und die Pflege, wenn sich deine Abläufe ändern. Beides gehört ins Angebot. Deinen Rahmen bekommst du im [Preisrechner](/preisrechner), den Überblick über alle Workflows auf der Seite [KI-Automatisierung für Unternehmen](/leistungen/ki-automatisierung-unternehmen).",
        },
      ],
    },
    {
      h2: "Checkliste: sechs Fragen an jede Agentur",
      blocks: [
        {
          ul: [
            "Welches Modell wird eingesetzt, und wo werden meine Daten verarbeitet?",
            "Werden meine Daten zum Training verwendet?",
            "Wie wird gemessen, ob die KI richtig liegt?",
            "Was passiert, wenn sie falsch liegt – wer bemerkt es?",
            "Was kostet der Betrieb im Monat bei meinem Aufkommen?",
            "Gehören mir Quellcode, Daten und Einstellungen?",
          ],
        },
      ],
    },
  ],
  faq: [
    {
      q: "Brauche ich für KI-Software eigene Trainingsdaten?",
      a: "Meist nicht. Vorhandene Sprachmodelle lösen Aufgaben wie Auslesen, Sortieren und Formulieren ohne Training. Gebraucht werden Beispiele aus deinem Alltag zum Testen und dein Wissen: Leistungen, Regeln, Tonfall.",
    },
    {
      q: "Was kostet KI-Software im laufenden Betrieb?",
      a: "Zwei Posten: Betrieb und Wartung der Software sowie der Verbrauch des Sprachmodells je Nutzung. Bei Miete ist der Betrieb enthalten. Den Verbrauch schätzen wir vorab anhand deiner Mengen.",
    },
    {
      q: "Wie lange dauert die Entwicklung?",
      a: "Ein einzelner Workflow läuft nach ein bis zwei Wochen. Eine Web-App mit KI-Funktion braucht drei bis acht Wochen. Vorher bekommst du einen klickbaren Prototyp und einen Festpreis.",
    },
    {
      q: "Sind meine Daten sicher?",
      a: "Das hängt von der Einrichtung ab: Vertrag zur Auftragsverarbeitung, Verarbeitung in der EU, wo es möglich ist, kein Training mit deinen Daten und Zugriff nur für berechtigte Personen. Diese Punkte legen wir vor dem Start schriftlich fest.",
    },
    {
      q: "Kann KI in meine bestehende Software eingebaut werden?",
      a: "Ja, wenn die Software eine Schnittstelle hat oder wir sie gebaut haben. Eine KI-Funktion als Zusatz kostet 1.490 €, eine Schnittstelle zu fremder Software ebenfalls 1.490 €.",
    },
  ],
};
