import { industryPackages, rentPerMonth } from "@/config/packages";
import type { IndustryPageId, ServicePageId } from "@/config/seo-pages";

/**
 * Software-Demos unter /demo/<slug>: je Branche eine Musterfirma mit Kundenansicht und Verwaltung.
 * Hier steht alles, was Übersicht, Info-Panel, Tour und Portfolio über eine Demo wissen müssen;
 * die Apps selbst liegen in src/demos/apps/<slug>.tsx.
 *
 * Alle Firmen, Personen, Adressen und Zahlen sind frei erfunden ("Musterstadt"). Die Demos speichern nichts:
 * Eingaben leben nur im Browser-Tab und sind nach dem Neuladen weg.
 * Sprache: Deutsch (wie Blog und Dashboard) – die englische Website verlinkt hierher.
 */

export type DemoSlug = "restaurant" | "friseur" | "immobilien" | "werkstatt" | "steuerkanzlei" | "handwerk" | "kosmetik" | "sonnenstudio" | "fahrschule";

export interface TourStep {
  /** Ansicht und Bereich, die für diesen Schritt geöffnet werden */
  view: string;
  tab?: string;
  /** Wert von data-tour am hervorgehobenen Element; ohne Ziel erscheint der Schritt mittig */
  target?: string;
  title: string;
  text: string;
}

export interface DemoDef {
  slug: DemoSlug;
  industry: IndustryPageId;
  /** Passende Leistungsseite (/leistungen/…) */
  service: ServicePageId;
  /** Art der Software, z. B. "Bestellsystem" */
  kind: string;
  firm: string;
  firmLine: string;
  /** Überschrift und Kurztext für Übersicht und Info-Panel */
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  image: string;
  /** Paket der Branchenseite, das dem Umfang der Demo entspricht (config/packages.ts → industryPackages) */
  pack: string;
  /**
   * Designsystem der Musterfirma: Farben und Schriften der Kundenseite, `bo` = Verwaltungsansicht
   * (Fläche, Linie, Text, Radius von Flächen/Bedienelementen, Seitenleiste).
   */
  theme: { accent: string; on: string; soft: string; deep: string; display: string; ui: string; /** Farbe des Fokusrahmens, falls die Tiefe dafür nicht taugt */ focus?: string; /** Fläche für Schaltflächen mit weißem Text, wenn der Akzent dafür zu hell ist (WCAG AA) */ cta?: string; bo: { bg: string; line: string; ink: string; r: string; rc: string; side: string; sideInk: string; /** Seitentitel der Verwaltung in Versalien (Display-Schriften, die dafür gezeichnet sind) */ caps?: boolean } };
  views: { id: string; label: string; tab: string }[];
  tour: TourStep[];
  /** Was die Demo zeigt */
  features: { title: string; text: string }[];
  /** Was sich anpassen oder ergänzen lässt */
  options: string[];
  /** Für wen dasselbe Prinzip passt */
  fits: { who: string; how: string }[];
}

export const demos: DemoDef[] = [
  {
    slug: "restaurant",
    industry: "gastro",
    service: "bestellsystem",
    kind: "Bestellsystem",
    firm: "Pizzeria Fiamma",
    firmLine: "Holzofen-Pizzeria · Musterstadt",
    title: "Bestellsystem für die Gastronomie",
    summary: "Gäste bestellen direkt auf der eigenen Seite, die Küche arbeitet am Board – ohne Provision an eine Plattform.",
    metaTitle: "Bestellsystem-Demo für Restaurants zum Ausprobieren",
    metaDescription: "Bestell bei der Muster-Pizzeria Fiamma und verfolge die Bestellung im Küchen-Board: Speisekarte, Abholung und Lieferung, Auswertung. Kostenlos testen.",
    image: "/images/demo/restaurant.jpg",
    pack: "pro",
    theme: { accent: "#f2541b", cta: "#d5430e", on: "#ffffff", soft: "#fdeee6", deep: "#2b2420", display: "var(--font-urbanist)", ui: "var(--font-urbanist)", bo: { bg: "#fbf1eb", line: "#f0e2d8", ink: "#2b2420", r: "22px", rc: "999px", side: "#ffffff", sideInk: "#2b2420" } },
    views: [
      { id: "kunde", label: "Bestellseite", tab: "karte" },
      { id: "betrieb", label: "Dashboard", tab: "kueche" },
    ],
    tour: [
      { view: "kunde", tab: "karte", target: "menu", title: "Die Speisekarte", text: "Kategorien, Größen, Extras und Allergene. Tipp auf ein Gericht, stell es zusammen und leg es in den Warenkorb." },
      { view: "kunde", tab: "karte", target: "cart", title: "Warenkorb und Kasse", text: "Abholung oder Lieferung, Wunschzeit, Mindestbestellwert und Liefergebühr rechnet das System selbst." },
      { view: "betrieb", tab: "kueche", target: "board", title: "Das Küchen-Board", text: "Jede Bestellung landet sofort hier. Ein Tipp setzt den Status – der Gast sieht ihn auf seiner Seite mitlaufen." },
      { view: "betrieb", tab: "speisekarte", target: "karte", title: "Speisekarte selbst pflegen", text: "Preis ändern oder ein Gericht als ausverkauft markieren. Die Bestellseite zieht in derselben Sekunde nach." },
      { view: "betrieb", tab: "zahlen", target: "zahlen", title: "Zahlen des Tages", text: "Umsatz, Stoßzeiten und Renner – und was eine Plattform an Provision einbehalten hätte." },
      { view: "kunde", tab: "karte", title: "Jetzt du", text: "Bestell eine Pizza und wechsle danach oben ins Dashboard. Deine Bestellung wartet dort schon in der Küche." },
    ],
    features: [
      { title: "Speisekarte mit Varianten", text: "Größen, Extras, Allergene und Hinweise wie „vegetarisch“ oder „scharf“." },
      { title: "Abholung und Lieferung", text: "Wunschzeit, Liefergebiete, Mindestbestellwert und Liefergebühr." },
      { title: "Bestellstatus für den Gast", text: "Eingegangen, in Zubereitung, fertig – live auf dem Handy des Gastes." },
      { title: "Küchen-Board", text: "Neue Bestellungen in Spalten, ein Tipp pro Schritt, auch auf dem Tablet." },
      { title: "Selbst pflegen", text: "Preise, Artikel, „ausverkauft“ und Bestellstopp ohne Agentur ändern." },
      { title: "Auswertung", text: "Umsatz, Bestellungen je Stunde, beliebteste Gerichte." },
    ],
    options: [
      "Online-Zahlung mit Auszahlung direkt an dich",
      "Tischreservierung und QR-Bestellung am Tisch",
      "Gutscheine, Treuepunkte und Stammkunden-Rabatte",
      "Bon-Drucker, Kassen-Schnittstelle, mehrere Filialen",
      "Mehrsprachige Karte, zum Beispiel Deutsch, Englisch, Arabisch",
      "WhatsApp-Benachrichtigung bei neuer Bestellung",
    ],
    fits: [
      { who: "Bäckereien und Konditoreien", how: "Vorbestellung von Brot, Torten und Frühstück zur Abholung." },
      { who: "Imbisse und Lieferdienste", how: "Schnelle Karte, Lieferzonen, Stoßzeiten im Blick." },
      { who: "Cafés und Bistros", how: "Mittagstisch vorbestellen, Abholfenster statt Schlange." },
      { who: "Metzgereien und Hofläden", how: "Bestellung nach Gewicht, Abholung zum Wunschtermin." },
      { who: "Catering", how: "Anfragen mit Personenzahl, Menüwahl und Anzahlung." },
    ],
  },
  {
    slug: "friseur",
    industry: "beauty",
    service: "buchungssystem",
    kind: "Buchungssystem",
    firm: "Kammwerk",
    firmLine: "Friseur & Barber · Musterstadt",
    title: "Terminbuchung für Salons und Studios",
    summary: "Kundinnen und Kunden buchen rund um die Uhr selbst. Das Team sieht Kalender, Kundenkartei und Auslastung an einem Ort.",
    metaTitle: "Buchungssystem-Demo für Friseure zum Ausprobieren",
    metaDescription: "Buch einen Termin beim Muster-Salon Kammwerk und sieh ihn im Kalender des Teams: Leistungen, freie Zeiten, Kundenprofil, Kundenkartei. Kostenlos testen.",
    image: "/images/demo/friseur.jpg",
    pack: "pro",
    theme: { accent: "#0d0d0d", on: "#ffffff", soft: "#f1f1ef", deep: "#0d0d0d", display: "var(--font-hanken)", ui: "var(--font-hanken)", bo: { bg: "#f4f4f2", line: "#e2e2de", ink: "#0d0d0d", r: "14px", rc: "8px", side: "#0d0d0d", sideInk: "#ffffff" } },
    views: [
      { id: "kunde", label: "Buchungsseite", tab: "buchen" },
      { id: "betrieb", label: "Dashboard", tab: "kalender" },
    ],
    tour: [
      { view: "kunde", tab: "buchen", target: "services", title: "Leistung wählen", text: "Jede Leistung hat Dauer und Preis. Mehrere lassen sich kombinieren – die Zeit rechnet das System zusammen." },
      { view: "kunde", tab: "buchen", target: "slots", title: "Nur freie Zeiten", text: "Angezeigt wird, was wirklich frei ist: Arbeitszeiten, Pausen und bestehende Termine sind schon berücksichtigt." },
      { view: "kunde", tab: "profil", target: "profil", title: "Das Kundenprofil", text: "Termine verschieben oder absagen, den letzten Besuch nochmal buchen, Treuekarte einsehen." },
      { view: "betrieb", tab: "kalender", target: "kalender", title: "Der Teamkalender", text: "Ein Tag, alle Mitarbeitenden nebeneinander. Tipp auf einen Termin für Details, Check-in oder No-Show." },
      { view: "betrieb", tab: "kunden", target: "kunden", title: "Die Kundenkartei", text: "Besuche, Umsatz und Notizen wie die Farbrezeptur – beim nächsten Termin sofort zur Hand." },
      { view: "kunde", tab: "buchen", title: "Jetzt du", text: "Buch einen Termin und wechsle ins Dashboard. Er steht dort schon im Kalender." },
    ],
    features: [
      { title: "Buchung in vier Schritten", text: "Leistung, Person, Zeit, Kontaktdaten – ohne Konto, in unter einer Minute." },
      { title: "Keine Doppelbuchungen", text: "Freie Zeiten ergeben sich aus Arbeitszeiten, Pausen und Terminen." },
      { title: "Kundenprofil", text: "Verschieben, absagen, nochmal buchen und Treuekarte." },
      { title: "Teamkalender", text: "Tagesansicht je Mitarbeiter mit Check-in und No-Show." },
      { title: "Kundenkartei", text: "Besuchshistorie, Umsatz und interne Notizen." },
      { title: "Auslastung", text: "Wer ist wie voll, welche Leistung bringt wie viel." },
    ],
    options: [
      "Anzahlung oder Kartenhinterlegung gegen No-Shows",
      "Erinnerung per SMS, E-Mail oder WhatsApp",
      "Warteliste, die frei gewordene Termine nachbesetzt",
      "Gutscheine, Zehnerkarten und Pakete",
      "Buchen-Button für Google und Instagram",
      "Mehrere Standorte und Räume",
    ],
    fits: [
      { who: "Kosmetik- und Nagelstudios", how: "Behandlungen mit Räumen und Geräten statt nur Personen." },
      { who: "Physio und Heilpraktiker", how: "Rezept-Serien, feste Folgetermine, Ausfallregeln." },
      { who: "Tattoo und Piercing", how: "Beratungstermin, Anzahlung, Einverständnis vorab." },
      { who: "Yoga, Fitness und Kurse", how: "Kursplätze, Zehnerkarten und Warteliste." },
      { who: "Tierärzte und Hundesalons", how: "Tierdaten in der Kartei, Erinnerung an die Impfung." },
    ],
  },
  {
    slug: "immobilien",
    industry: "immobilien",
    service: "webapp",
    kind: "Vermarktungs-Portal",
    firm: "Kranich Immobilien",
    firmLine: "Makler & Vermietung · Musterstadt",
    title: "Objekte, Exposés und Interessenten",
    summary: "Interessenten finden Objekte, lesen das Exposé und fragen die Besichtigung an. Das Büro führt jede Anfrage durch eine klare Pipeline.",
    metaTitle: "Makler-Software-Demo: Exposé und Interessenten-Pipeline",
    metaDescription: "Durchsuch die Objekte der Muster-Firma Kranich Immobilien, frag eine Besichtigung an und sieh die Anfrage in der Pipeline des Büros. Kostenlos testen.",
    image: "/images/demo/immobilien.jpg",
    pack: "portal",
    theme: { accent: "#1e1e1b", on: "#ffffff", soft: "#efefec", deep: "#1e1e1b", display: "var(--font-redhat)", ui: "var(--font-redhat)", bo: { bg: "#f3f3f1", line: "#cccccc", ink: "#1e1e1b", r: "3px", rc: "3px", side: "#ffffff", sideInk: "#1e1e1b" } },
    views: [
      { id: "kunde", label: "Website & Exposé", tab: "suche" },
      { id: "betrieb", label: "Dashboard", tab: "anfragen" },
    ],
    tour: [
      { view: "kunde", tab: "suche", target: "suche", title: "Objektsuche", text: "Mieten oder kaufen, Zimmer, Budget. Reservierte Objekte bleiben sichtbar, sind aber gekennzeichnet." },
      { view: "kunde", tab: "expose", target: "fakten", title: "Das Exposé", text: "Eckdaten, Grundriss, Energieausweis und Kosten auf einer Seite – statt als PDF im Anhang." },
      { view: "kunde", tab: "expose", target: "besichtigung", title: "Besichtigung anfragen", text: "Interessenten wählen einen Termin und beantworten vorab die Fragen, die du sonst am Telefon stellst." },
      { view: "betrieb", tab: "anfragen", target: "pipeline", title: "Die Pipeline", text: "Jede Anfrage mit Vorab-Einschätzung. Ein Tipp schiebt sie weiter: Besichtigung, Unterlagen, Zusage." },
      { view: "betrieb", tab: "objekte", target: "objekte", title: "Objekte verwalten", text: "Status ändern, Aufrufe und Anfragen je Objekt sehen. „Reserviert“ erscheint sofort auf der Website." },
      { view: "kunde", tab: "expose", title: "Jetzt du", text: "Frag eine Besichtigung an und sieh im Dashboard nach, wie die Anfrage beim Büro ankommt." },
    ],
    features: [
      { title: "Objektsuche", text: "Filter nach Art, Zimmern und Budget, Status direkt sichtbar." },
      { title: "Exposé als Seite", text: "Eckdaten, Grundriss, Energieklasse und Kostenaufstellung." },
      { title: "Besichtigungsanfrage", text: "Terminwahl mit Vorab-Fragen zu Einzug, Haushalt und Einkommen." },
      { title: "Interessenten-Pipeline", text: "Von der Anfrage bis zur Zusage, mit Einschätzung je Interessent." },
      { title: "Objektverwaltung", text: "Status, Aufrufe und Anfragen je Objekt." },
      { title: "Auswertung", text: "Vom Aufruf bis zum Abschluss – wo Interessenten abspringen." },
    ],
    options: [
      "Mieterportal mit Schadensmeldung und Dokumenten",
      "Eigentümer-Zugang mit Vermarktungsbericht",
      "Automatischer Export zu den großen Portalen",
      "Digitale Selbstauskunft mit Unterlagen-Upload",
      "Nebenkostenabrechnung und Zählerstände online",
      "KI-Assistent, der Erstanfragen rund um die Uhr beantwortet",
    ],
    fits: [
      { who: "Hausverwaltungen", how: "Mieterportal: Schäden melden, Dokumente, Abrechnungen." },
      { who: "Bauträger", how: "Einheiten eines Neubaus mit Reservierungsstand und Käuferbereich." },
      { who: "Ferienwohnungen", how: "Verfügbarkeit, Buchung und Anzahlung ohne Portalgebühr." },
      { who: "Gewerbevermietung", how: "Flächen mit Anfragestrecke für Unternehmen." },
      { who: "Wohnungsgenossenschaften", how: "Bewerberliste und Vergabe nach festen Kriterien." },
    ],
  },
  {
    slug: "werkstatt",
    industry: "automotive",
    service: "buchungssystem",
    kind: "Werkstatt-Portal",
    firm: "Autohaus Falkner",
    firmLine: "Werkstatt & Service · Musterstadt",
    title: "Werkstatt-Termine und Fahrzeugstatus",
    summary: "Kunden buchen den Werkstatttermin online, verfolgen ihr Fahrzeug und geben Zusatzarbeiten mit einem Tipp frei.",
    metaTitle: "Werkstatt-Software-Demo: Termine online und Fahrzeugstatus",
    metaDescription: "Buch einen Werkstatttermin beim Muster-Autohaus Falkner, gib eine Zusatzarbeit frei und sieh den Werkstattplan des Teams. Kostenlos testen.",
    image: "/images/demo/werkstatt.jpg",
    pack: "app",
    theme: { accent: "#e63e2d", cta: "#d8321f", on: "#ffffff", soft: "#fdecea", deep: "#0e1b1d", display: "var(--font-rajdhani)", ui: "var(--font-plex-sans)", bo: { bg: "#eef2f5", line: "#d9e0e6", ink: "#0e1b1d", r: "0px", rc: "0px", side: "#0e1b1d", sideInk: "#ffffff", caps: true } },
    views: [
      { id: "kunde", label: "Kundenseite", tab: "termin" },
      { id: "betrieb", label: "Dashboard", tab: "auftraege" },
    ],
    tour: [
      { view: "kunde", tab: "termin", target: "leistungen", title: "Termin buchen", text: "Fahrzeug, Leistung, Mobilität. Richtpreis und Dauer stehen dabei – der Anruf in der Annahme entfällt." },
      { view: "kunde", tab: "fahrzeug", target: "status", title: "Fahrzeugstatus", text: "Wie bei einer Paketverfolgung: Der Kunde sieht, wo sein Auto gerade steht, und ruft nicht mehr nach." },
      { view: "kunde", tab: "fahrzeug", target: "freigabe", title: "Zusatzarbeit freigeben", text: "Befund mit Preis aufs Handy, Freigabe mit einem Tipp. Die Bühne steht nicht, bis jemand ans Telefon geht." },
      { view: "betrieb", tab: "auftraege", target: "auftraege", title: "Aufträge", text: "Alle Fahrzeuge des Tages mit Status. Die Freigabe des Kunden erscheint hier mit Uhrzeit." },
      { view: "betrieb", tab: "plan", target: "plan", title: "Der Werkstattplan", text: "Bühnen und Zeiten auf einen Blick. Online gebuchte Termine tragen sich selbst ein." },
      { view: "betrieb", tab: "kunden", target: "hu", title: "Fällige Hauptuntersuchungen", text: "Wer bald zur HU muss, bekommt eine Erinnerung mit Buchungslink. Das füllt den Plan von allein." },
    ],
    features: [
      { title: "Online-Terminbuchung", text: "Leistungen mit Richtpreis und Dauer, Annahmezeit nach freier Bühne." },
      { title: "Mobilität", text: "Warten, Ersatzwagen oder Hol- und Bringservice direkt mitbuchen." },
      { title: "Fahrzeugstatus", text: "Schritt für Schritt von der Annahme bis „abholbereit“." },
      { title: "Digitale Freigabe", text: "Zusatzarbeiten mit Befund und Preis, Freigabe per Tipp." },
      { title: "Werkstattplan", text: "Bühnen und Mechaniker im Tagesraster." },
      { title: "HU-Erinnerungen", text: "Fällige Fahrzeuge aus der Kartei, Erinnerung mit Buchungslink." },
    ],
    options: [
      "Fahrzeugbörse mit Probefahrt-Anfrage",
      "Reifeneinlagerung mit Lagerplatz und Saisonwechsel-Aktion",
      "Fotos und Videos vom Befund direkt aus der Werkstatt",
      "Online-Zahlung und Rechnung im Kundenbereich",
      "Anbindung an das Dealer-Management-System",
      "Fahrschule: Fahrstunden buchen, Ausbildungsstand, Theorie",
    ],
    fits: [
      { who: "Freie Werkstätten", how: "Termine und Freigaben ohne teures Herstellersystem." },
      { who: "Reifenhändler", how: "Saisonwechsel in Zeitfenstern, Einlagerung mit Lagerplatz." },
      { who: "Fahrschulen", how: "Fahrstunden buchen, Ausbildungsstand und Zahlungen." },
      { who: "Autovermietungen", how: "Verfügbarkeit, Buchung, Übergabeprotokoll mit Fotos." },
      { who: "Zweirad- und E-Bike-Werkstätten", how: "Inspektion buchen, Status, Abholinfo." },
    ],
  },
  {
    slug: "steuerkanzlei",
    industry: "kanzlei",
    service: "webapp",
    kind: "Mandantenportal",
    firm: "Albrecht & Sommer",
    firmLine: "Steuerberatung · Musterstadt",
    title: "Mandantenportal für Kanzleien",
    summary: "Mandanten laden Belege hoch, geben Erklärungen frei und schreiben der Kanzlei – statt Pendelordner, E-Mail-Anhänge und Rückrufe.",
    metaTitle: "Mandantenportal-Demo für Steuerberater zum Ausprobieren",
    metaDescription: "Lad im Muster-Portal von Albrecht & Sommer einen Beleg hoch, gib eine Steuererklärung frei und sieh die Kanzlei-Ansicht mit Fristen. Kostenlos testen.",
    image: "/images/demo/steuerkanzlei.jpg",
    pack: "portal",
    theme: { accent: "#111111", on: "#ffffff", soft: "#f1f1f0", deep: "#0f0f0f", display: "var(--font-manrope)", ui: "var(--font-manrope)", bo: { bg: "#f5f5f4", line: "#dcdcda", ink: "#0f0f0f", r: "0px", rc: "0px", side: "#0f0f0f", sideInk: "#ffffff" } },
    views: [
      { id: "kunde", label: "Mandantenportal", tab: "uebersicht" },
      { id: "betrieb", label: "Kanzlei-Ansicht", tab: "mandanten" },
    ],
    tour: [
      { view: "kunde", tab: "uebersicht", target: "aufgaben", title: "Was offen ist", text: "Die Mandantin sieht auf einen Blick, was die Kanzlei von ihr braucht und bis wann." },
      { view: "kunde", tab: "belege", target: "upload", title: "Belege hochladen", text: "Foto oder PDF genügt. Die KI liest Lieferant, Datum und Betrag aus – die Mandantin prüft nur noch." },
      { view: "kunde", tab: "dokumente", target: "freigabe", title: "Digital freigeben", text: "Erklärung ansehen und freigeben, mit Zeitstempel. Kein Ausdrucken, Unterschreiben, Einscannen." },
      { view: "betrieb", tab: "mandanten", target: "mandanten", title: "Alle Mandanten", text: "Wer hat geliefert, wo fehlen Belege, welche Frist steht an. Sortiert nach Dringlichkeit." },
      { view: "betrieb", tab: "fristen", target: "fristen", title: "Fristen", text: "Voranmeldungen, Lohn und Erklärungen in einer Liste, mit Stand der Unterlagen." },
      { view: "betrieb", tab: "postfach", target: "postfach", title: "Postfach statt E-Mail", text: "Nachrichten und Uploads landen am Mandanten, nicht im Postfach einer einzelnen Person." },
    ],
    features: [
      { title: "Aufgaben für Mandanten", text: "Klare Liste: was fehlt, bis wann, mit einem Tipp erledigt." },
      { title: "Beleg-Upload mit KI", text: "Lieferant, Datum, Betrag und Kategorie werden ausgelesen." },
      { title: "Dokumentenablage", text: "Bescheide, Abschlüsse, Lohn und Verträge geordnet abrufbar." },
      { title: "Digitale Freigabe", text: "Erklärungen prüfen und freigeben, mit Zeitstempel." },
      { title: "Sicheres Postfach", text: "Nachrichten am Mandat statt im E-Mail-Verlauf." },
      { title: "Kanzlei-Übersicht", text: "Belegstand, Rückfragen und Fristen aller Mandanten." },
    ],
    options: [
      "Übergabe an DATEV und andere Kanzleiprogramme",
      "Online-Terminbuchung für Erstgespräche",
      "Onboarding neuer Mandanten mit Vollmacht und Stammdaten",
      "Automatische Erinnerungen bei fehlenden Belegen",
      "Lohn: Stundenzettel und Personalfragebogen digital",
      "Zwei-Faktor-Anmeldung und Hosting in Deutschland",
    ],
    fits: [
      { who: "Anwaltskanzleien", how: "Akte, Schriftsätze und Termine für Mandanten einsehbar." },
      { who: "Lohnbüros", how: "Monatliche Lohndaten einsammeln, Auswertungen bereitstellen." },
      { who: "Versicherungsmakler", how: "Verträge, Schadensmeldung und Dokumente an einem Ort." },
      { who: "Unternehmensberater und Coaches", how: "Unterlagen, Aufgaben und Termine je Kunde." },
      { who: "Hausverwaltungen", how: "Eigentümer- und Mieterunterlagen mit Freigaben." },
    ],
  },
  {
    slug: "handwerk",
    industry: "handwerk",
    service: "individualsoftware",
    kind: "Auftragssoftware",
    firm: "Wilke Haustechnik",
    firmLine: "Sanitär · Heizung · Klima · Musterstadt",
    title: "Vom Anruf bis zur Rechnung in einem System",
    summary: "Anfrage mit Fotos, Angebot, Einsatzplan, Monteur-App und digitale Abnahme – drei Ansichten, ein Auftrag.",
    metaTitle: "Handwerker-Software-Demo: Angebot, Einsatzplan, Monteur-App",
    metaDescription: "Stell bei Wilke Haustechnik eine Anfrage, schreib im Büro das Angebot und schließ den Auftrag in der Monteur-App mit Unterschrift ab. Kostenlos testen.",
    image: "/images/demo/handwerk.jpg",
    pack: "auftrag",
    theme: { accent: "#f4c042", on: "#152b3b", soft: "#dfecf3", deep: "#152b3b", display: "var(--font-shoulders)", ui: "var(--font-instrument)", bo: { bg: "#f4f7f9", line: "#d6e0e7", ink: "#152b3b", r: "16px", rc: "10px", side: "#152b3b", sideInk: "#ffffff", caps: true } },
    views: [
      { id: "kunde", label: "Kundenseite", tab: "anfrage" },
      { id: "betrieb", label: "Büro", tab: "auftraege" },
      { id: "monteur", label: "Monteur-App", tab: "heute" },
    ],
    tour: [
      { view: "kunde", tab: "anfrage", target: "anfrage", title: "Anfrage mit Fotos", text: "Kunden beschreiben das Problem in drei Schritten und hängen Fotos an. Das Büro muss nicht mehr nachfragen." },
      { view: "betrieb", tab: "auftraege", target: "kanban", title: "Alle Aufträge", text: "Von der Anfrage bis zur Rechnung. Auch Anrufe außerhalb der Bürozeit landen hier – aufgenommen vom KI-Telefonassistenten." },
      { view: "betrieb", tab: "angebot", target: "angebot", title: "Angebot in Minuten", text: "Positionen aus dem Leistungskatalog, Summe rechnet mit. Der Kunde nimmt online an." },
      { view: "betrieb", tab: "plan", target: "plan", title: "Der Einsatzplan", text: "Wer fährt wann wohin. Angenommene Aufträge werden einem Monteur und einem Tag zugeteilt." },
      { view: "monteur", tab: "heute", target: "monteur", title: "Die Monteur-App", text: "Auftrag, Checkliste, Material und Fotos auf dem Handy. Der Kunde unterschreibt auf dem Display." },
      { view: "kunde", tab: "status", target: "status", title: "Der Kunde bleibt informiert", text: "Angebot, Termin und Arbeitsbericht an einem Ort. Weniger Rückrufe, schnellere Zusagen." },
    ],
    features: [
      { title: "Anfrage-Assistent", text: "Anliegen, Fotos, Adresse und Terminwunsch in drei Schritten." },
      { title: "Auftragsübersicht", text: "Jeder Auftrag mit Stand – von der Anfrage bis zur Rechnung." },
      { title: "Angebotsgenerator", text: "Leistungskatalog, Mengen, Summen, Annahme online." },
      { title: "Einsatzplanung", text: "Wochenplan je Monteur, offene Aufträge zuteilen." },
      { title: "Monteur-App", text: "Checkliste, Material, Fotos und Unterschrift vor Ort." },
      { title: "KI-Telefonassistent", text: "Nimmt Anrufe an und legt daraus eine Anfrage an." },
    ],
    options: [
      "Rechnung aus dem Arbeitsbericht, Übergabe an die Buchhaltung",
      "Wartungsverträge mit automatischer Terminplanung",
      "Lager und Fahrzeugbestand mit Materialverbrauch",
      "Zeiterfassung je Auftrag und Mitarbeiter",
      "Routenplanung und Anfahrts-Info an den Kunden",
      "Bewertungsanfrage nach abgeschlossenem Auftrag",
    ],
    fits: [
      { who: "Elektro, Maler, Schreiner, Dachdecker", how: "Gleicher Ablauf, anderer Leistungskatalog." },
      { who: "Gebäudereinigung", how: "Wiederkehrende Einsätze, Objektlisten, Leistungsnachweis." },
      { who: "Umzug und Entrümpelung", how: "Anfrage mit Fotos und Volumen, Festpreis-Angebot." },
      { who: "Garten- und Landschaftsbau", how: "Pflegeverträge, Saisonplanung, Fotodokumentation." },
      { who: "Kundendienst und Wartung", how: "Störungsannahme, Einsatz, Bericht mit Unterschrift." },
    ],
  },
  {
    slug: "kosmetik",
    industry: "beauty",
    service: "buchungssystem",
    kind: "Studio-Buchung",
    firm: "Studio Malou",
    firmLine: "Kosmetik & Nägel · Musterstadt",
    title: "Terminbuchung für Kosmetik- und Nagelstudios",
    summary: "Kundinnen buchen Behandlung und Platz selbst und zahlen an. Das Studio sieht Kabinen, Nageltisch und fällige Folgetermine auf einen Blick.",
    metaTitle: "Buchungssystem-Demo für Kosmetik- und Nagelstudios",
    metaDescription: "Buch beim Muster-Studio Malou eine Behandlung mit Anzahlung und sieh den Termin im Kalender nach Kabinen und Nageltisch. Mit Folgetermin-Erinnerung. Kostenlos testen.",
    image: "/images/demo/kosmetik.jpg",
    pack: "pro",
    theme: { accent: "#4a231d", on: "#ffffff", soft: "#fbeee6", deep: "#2b1a17", display: "var(--font-urbanist)", ui: "var(--font-urbanist)", bo: { bg: "#fdf8f5", line: "#f0e2d8", ink: "#2b1a17", r: "20px", rc: "999px", side: "#ffffff", sideInk: "#2b1a17" } },
    views: [
      { id: "kunde", label: "Buchungsseite", tab: "buchen" },
      { id: "betrieb", label: "Dashboard", tab: "kalender" },
    ],
    tour: [
      { view: "kunde", tab: "buchen", target: "services", title: "Stöbern wie in einer App", text: "Bereiche, Team und Behandlungen mit Foto, Bewertung und Preis. Die Kundin sucht selbst aus – ohne Anruf." },
      { view: "kunde", tab: "buchen", target: "beliebt", title: "Eine Behandlung, ein Tipp", text: "Dahinter stehen Details, Ablauf und die freien Zeiten des passenden Platzes. Mit der Buchung wird die Anzahlung hinterlegt." },
      { view: "kunde", tab: "termine", target: "karte", title: "Der Folgetermin kommt von selbst", text: "Auffüllen nach vier Wochen, Lifting nach sechs: Das System erinnert und bietet den nächsten Termin gleich an." },
      { view: "betrieb", tab: "kalender", target: "kalender", title: "Kalender nach Plätzen", text: "Kabine 1, Kabine 2, Nageltisch nebeneinander. Tipp auf einen Termin für Check-in oder „nicht erschienen“ – die Anzahlung bleibt dann im Studio." },
      { view: "betrieb", tab: "kunden", target: "kunden", title: "Wer ist überfällig?", text: "Die Kartei zeigt, bei wem der übliche Abstand überschritten ist. Eine Erinnerung mit Buchungslink genügt." },
      { view: "kunde", tab: "buchen", title: "Jetzt du", text: "Buch eine Behandlung und wechsle ins Dashboard. Dein Termin steht dort schon am richtigen Platz." },
    ],
    features: [
      { title: "Behandlungen nach Bereichen", text: "Gesicht, Nägel, Wimpern und Brauen, Haarentfernung – mit Dauer, Preis und Hinweis." },
      { title: "Plätze statt nur Personen", text: "Kabinen und Nageltisch als Ressourcen, keine Doppelbelegung." },
      { title: "Anzahlung gegen Ausfälle", text: "Bei der Buchung hinterlegt, bei Nichterscheinen einbehalten." },
      { title: "Folgetermin-Erinnerung", text: "Auffüllen, Auffrischen und Kuren nach üblichem Abstand." },
      { title: "Kundenkartei", text: "Behandlungsnotizen, Allergien und Verträglichkeit beim Termin zur Hand." },
      { title: "Auswertung", text: "Auslastung je Platz, Umsatz je Behandlung, Ausfallquote." },
    ],
    options: [
      "Online-Zahlung der ganzen Behandlung",
      "Erinnerung per SMS, E-Mail oder WhatsApp",
      "Gutscheine, Treuekarte und Kur-Pakete",
      "Einverständniserklärung und Anamnese vorab digital",
      "Buchen-Button für Google und Instagram",
      "Produktverkauf mit Bestand an der Kasse",
    ],
    fits: [
      { who: "Nagelstudios", how: "Auffüll-Rhythmus, Tische als Plätze, Designs als Zusatzleistung." },
      { who: "Wimpern- und Brauenstudios", how: "Auffüllen nach zwei bis drei Wochen, Patch-Test vorab." },
      { who: "Fußpflege und Podologie", how: "Feste Abstände, Hausbesuche, Rezept-Serien." },
      { who: "Massage und Wellness", how: "Räume und Liegen, Paartermine, Gutscheine." },
      { who: "Dauerhafte Haarentfernung", how: "Behandlungsserien mit festen Abständen je Zone." },
    ],
  },
  {
    slug: "sonnenstudio",
    industry: "beauty",
    service: "buchungssystem",
    kind: "Kabinen & Guthaben",
    firm: "Sonnendeck",
    firmLine: "Sonnenstudio · Musterstadt",
    title: "Kabinen, Guthaben und Abos fürs Sonnenstudio",
    summary: "Kunden sehen, welche Kabine frei ist, reservieren und zahlen mit Guthaben. Das Studio hat Belegung, schlafendes Guthaben und Röhrenstunden im Blick.",
    metaTitle: "Sonnenstudio-Software-Demo: Kabinen, Guthaben, Abo",
    metaDescription: "Reservier beim Muster-Sonnenstudio Sonnendeck eine Kabine, zahl mit Guthaben und sieh das Kabinen-Board des Studios – mit Hauttyp-Regeln und Röhrenstunden. Kostenlos testen.",
    image: "/images/demo/sonnenstudio.jpg",
    pack: "pro",
    theme: { accent: "#e2b25c", on: "#231509", soft: "#f7efe4", deep: "#17110d", display: "var(--font-urbanist)", ui: "var(--font-urbanist)", bo: { bg: "#f7f1e8", line: "#eadfce", ink: "#2a1c12", r: "20px", rc: "999px", side: "#17110d", sideInk: "#f7efe4" } },
    views: [
      { id: "kunde", label: "Kunden-App", tab: "kabinen" },
      { id: "betrieb", label: "Dashboard", tab: "live" },
    ],
    tour: [
      { view: "kunde", tab: "kabinen", target: "kabinen", title: "Was ist jetzt frei?", text: "Alle Kabinen mit Gerät, Stärke und Minutenpreis. Der Kunde sieht vom Sofa aus, ob sich der Weg lohnt." },
      { view: "kunde", tab: "kabinen", target: "reservieren", title: "Reservieren und zahlen", text: "Dauer wählen, Startzeit antippen, mit Guthaben zahlen. Die Höchstdauer richtet sich nach dem Hauttyp." },
      { view: "kunde", tab: "konto", target: "konto", title: "Guthaben statt Papierkarte", text: "Aufladen mit Bonus, Verlauf und Flat an einem Ort. Nichts geht verloren, nichts wird doppelt abgestempelt." },
      { view: "betrieb", tab: "live", target: "board", title: "Das Kabinen-Board", text: "Belegt, Reinigung, frei – mit Restzeit. Online-Reservierungen stehen dabei, Laufkunden startest du mit einem Tipp." },
      { view: "betrieb", tab: "kunden", target: "kunden", title: "Schlafendes Guthaben wecken", text: "Wer seit Wochen nicht da war und noch Guthaben hat, bekommt eine Erinnerung. Das bringt Kunden zurück, ohne Rabatt." },
      { view: "betrieb", tab: "zahlen", target: "zahlen", title: "Auslastung und Röhren", text: "Stoßzeiten, Laufzeit je Kabine und Betriebsstunden der Röhren – der Wechsel kündigt sich rechtzeitig an." },
    ],
    features: [
      { title: "Kabinen in Echtzeit", text: "Frei, belegt oder in Reinigung – mit Restzeit, für Kunden und Team." },
      { title: "Reservierung mit Guthaben", text: "Dauer und Startzeit wählen, der Betrag wird sofort verbucht." },
      { title: "Schutzregeln eingebaut", text: "Höchstdauer nach Hauttyp, 48 Stunden Pause, Zutritt ab 18." },
      { title: "Guthaben und Flat", text: "Aufladen mit Bonus, Monats-Abo, Verlauf je Kunde." },
      { title: "Kabinen-Board", text: "Laufkunden starten, Kabine für Wartung sperren, nächste Reservierung sehen." },
      { title: "Röhrenstunden", text: "Betriebsstunden je Gerät zählen mit, der Wechsel wird angekündigt." },
    ],
    options: [
      "Abo-Einzug per Lastschrift",
      "Anbindung an die Gerätesteuerung und das Kassensystem",
      "Hauttyp-Beratung mit Unterschrift auf dem Tablet",
      "Digitale Kundenkarte fürs Handy",
      "Aktionen für ruhige Stunden, zum Beispiel vormittags günstiger",
      "Mehrere Studios mit gemeinsamem Guthaben",
    ],
    fits: [
      { who: "Fitness- und EMS-Studios", how: "Geräte und Zeitfenster buchen, Mitgliedschaft mit Einzug." },
      { who: "Waschsalons und Waschstraßen", how: "Freie Maschinen sehen, Guthaben laden, Waschkarte aufs Handy." },
      { who: "Solebäder, Saunen, Floating", how: "Kabinen und Zeitfenster mit Vorauszahlung." },
      { who: "Indoor-Spielplätze und Escape-Rooms", how: "Räume und Slots, Gruppen, Anzahlung." },
      { who: "Tennis, Padel und Bowling", how: "Plätze und Bahnen stundenweise, Guthaben und Abos." },
    ],
  },
  {
    slug: "fahrschule",
    industry: "automotive",
    service: "buchungssystem",
    kind: "Fahrschul-App",
    firm: "Fahrschule Kompass",
    firmLine: "Fahrschule · Musterstadt",
    title: "Fahrstunden, Ausbildungsstand und Zahlungen",
    summary: "Schüler buchen Fahrstunden selbst und sehen, was bis zur Prüfung fehlt. Das Büro hat Fahrlehrer-Plan, Prüfungsreife und offene Beträge an einem Ort.",
    metaTitle: "Fahrschul-App-Demo: Fahrstunden buchen, Ausbildungsstand",
    metaDescription: "Buch bei der Muster-Fahrschule Kompass eine Fahrstunde, sieh deinen Ausbildungsstand und den Fahrlehrer-Plan des Büros mit offenen Posten. Kostenlos testen.",
    image: "/images/demo/fahrschule.jpg",
    pack: "app",
    theme: { accent: "#0b8a4b", on: "#ffffff", soft: "#e9f6ee", deep: "#111111", display: "var(--font-urbanist)", ui: "var(--font-urbanist)", bo: { bg: "#f5f5f5", line: "#e4e4e4", ink: "#141414", r: "20px", rc: "999px", side: "#111111", sideInk: "#ffffff" } },
    views: [
      { id: "kunde", label: "Schüler-App", tab: "stunden" },
      { id: "betrieb", label: "Büro", tab: "plan" },
    ],
    tour: [
      { view: "kunde", tab: "stunden", target: "buchen", title: "Fahrstunde buchen", text: "Art der Fahrt, Tag, Uhrzeit – angeboten wird nur, was beim eigenen Fahrlehrer frei ist. Bezahlt wird vom Guthaben." },
      { view: "kunde", tab: "stand", target: "stand", title: "Der Ausbildungsstand", text: "Theorie, Überland, Autobahn, Nacht: Der Schüler sieht selbst, was fehlt, und fragt nicht mehr per WhatsApp nach." },
      { view: "betrieb", tab: "plan", target: "plan", title: "Der Fahrlehrer-Plan", text: "Alle Fahrlehrer nebeneinander, Farben nach Art der Fahrt. Online gebuchte Stunden tragen sich selbst ein." },
      { view: "betrieb", tab: "schueler", target: "schueler", title: "Wer ist prüfungsreif?", text: "Pflichtstunden zählen automatisch mit. Sind alle erfüllt und nichts ist offen, meldest du mit einem Tipp zur Prüfung an." },
      { view: "betrieb", tab: "zahlen", target: "offen", title: "Offene Posten", text: "Wer schuldet was seit wann – mit Erinnerung samt Bezahl-Link. Wer mit Guthaben bucht, wird gar nicht erst offen." },
      { view: "kunde", tab: "stunden", title: "Jetzt du", text: "Buch eine Fahrstunde und wechsle ins Büro. Sie steht dort schon im Plan von Murat." },
    ],
    features: [
      { title: "Fahrstunden online buchen", text: "Übungs- und Sonderfahrten beim eigenen Fahrlehrer, mit Wechselzeit und Pausen." },
      { title: "Ausbildungsstand", text: "Theorie-Lektionen und Pflichtfahrten mit Fortschritt je Schüler." },
      { title: "Guthaben und Zahlungen", text: "Aufladen, abbuchen, Verlauf – ohne Barkasse im Auto." },
      { title: "Fahrlehrer-Plan", text: "Tagesraster je Fahrlehrer und Fahrzeug, Ausfälle vermerken." },
      { title: "Prüfungsreife", text: "Wer alle Pflichtstunden hat, wird markiert und angemeldet." },
      { title: "Offene Posten", text: "Fällige Beträge mit Erinnerung und Bezahl-Link." },
    ],
    options: [
      "Theorie-Unterricht mit Anwesenheit per QR-Code",
      "Anmeldung neuer Schüler mit Vertrag und Unterschrift online",
      "Nachrücker-Liste für abgesagte Stunden",
      "Übergabe an Fahrschul-Verwaltung und Buchhaltung",
      "Erinnerung per WhatsApp am Vortag",
      "Mehrere Filialen und Führerscheinklassen",
    ],
    fits: [
      { who: "Musikschulen", how: "Einzelstunden beim eigenen Lehrer, Monatsbeitrag, Vorspiel-Termine." },
      { who: "Nachhilfe und Sprachschulen", how: "Stunden buchen, Lernstand, Stundenkontingent." },
      { who: "Reit- und Tennisschulen", how: "Trainer, Plätze und Pferde als Ressourcen." },
      { who: "Tauch- und Flugschulen", how: "Pflichtstunden mit Nachweis bis zur Prüfung." },
      { who: "Personal Trainer", how: "Zehnerkarten, Termine, Trainingsstand." },
    ],
  },
];

export const getDemo = (slug: string) => demos.find((d) => d.slug === slug);

/** Vorschaubild einer Ansicht: die erste Ansicht ist das Hauptbild der Demo, jede weitere liegt als <slug>-<ansicht>.jpg daneben */
export const demoViewImage = (d: DemoDef, viewId: string) => (viewId === d.views[0].id ? d.image : `/images/demo/${d.slug}-${viewId}.jpg`);

/** Kostenrahmen aus der Preisliste der Branchenseite: Einstieg, Umfang der Demo und Miete */
export function demoPricing(d: DemoDef) {
  const items = industryPackages[d.industry].items;
  const start = items[0].price;
  const shown = (items.find((i) => i.id === d.pack) ?? items[0]).price;
  return { start, shown, rent: rentPerMonth(start) };
}
