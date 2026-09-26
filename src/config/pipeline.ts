/**
 * Unterseite /content-pipeline – das Flaggschiff.
 * Aufbau 1:1 nach asapmarketing.de/ki-telefonassistent.html:
 * Hero → Problem → Funktionen → 3 Modi → Für wen → Unsere Rolle → Preise → FAQ → CTA
 */

export const pipelineHero = {
  badge: "Das Flaggschiff von TasWiq Media.",
  titleStart: "Ein Drehtag.",
  titleHighlight: "Content für ein Quartal",
  text: "Wir drehen einen Tag bei dir – und unsere Pipeline macht daraus 12 bis 30 fertige Clips in allen Formaten, Längen und Sprachen. Du postest jede Woche Neues, ohne jede Woche zu drehen. Wir planen, drehen, schneiden und betreuen.",
  primary: { label: "Kosten berechnen", href: "/preisrechner" },
  secondary: { label: "Beratung anfragen", href: "#anfrage" },
  stats: [
    { value: "12–30", label: "Clips pro Dreh" },
    { value: "72 h", label: "bis zu den ersten Clips" },
    { value: "4", label: "Sprachen per KI" },
    { value: "1", label: "Ansprechpartner" },
  ],
};

export const pipelineProblem = {
  tag: "Das Problem",
  title: "Ein Dreh im Jahr reicht nicht mehr für einen Feed, der jede Woche lebt.",
  text: "Gäste entscheiden auf Instagram, TikTok und Google, wo sie essen und feiern. Wer dort nur alle drei Monate auftaucht, verliert gegen den Laden nebenan. Genau da setzt die Pipeline an:",
  points: [
    "Jede Woche neuer Content – ohne jede Woche eine Kamera im Laden.",
    "Du musst im Service nicht mehr selbst filmen, um sichtbar zu bleiben.",
    "Statt „wir müssten mal wieder was posten“ liegt der Plan für den Monat bereit.",
    "Saison, neue Karte, neues Line-up: Wir aktualisieren Clips, statt neu zu drehen.",
  ],
  story: {
    label: "So läuft ein Drehtag",
    quote: "„Um 16 Uhr Mise en Place, um 19 Uhr volles Haus – wir sind bei beidem dabei.“",
    text: "Vorab steht die Shotlist. Wir filmen Küche, Team, Gerichte und Gäste, dazu Hooks für Reels und Totale für den Imagefilm. Nach dem Dreh schneidet die Pipeline Varianten vor, wir wählen aus, graden und vertonen. Du gibst in einer Freigabe-Runde frei – fertig.",
  },
  note: "Ehrlich statt getarnt: KI-Stimmen und generierte Szenen kennzeichnen wir auf Wunsch. Deine Gerichte und Gäste sind immer echt gefilmt.",
};

export const pipelineFeatures = {
  tag: "Funktionen",
  title: "Nicht nur schneiden.",
  accent: "Mitdenken.",
  text: "Die Pipeline kennt deine Marke: Farben, Schriften, Tonalität, Do's und Don'ts. Danach entstehen Varianten, die nach dir aussehen – nicht nach Vorlage.",
  items: [
    { icon: "frame", title: "Alle Formate aus einem Dreh", text: "16:9, 9:16, 4:5 und 1:1 – automatisch neu kadriert, von uns kontrolliert." },
    { icon: "zap", title: "Hook-Varianten", text: "Drei bis fünf Einstiege pro Clip, damit du testen kannst, was in den ersten Sekunden zieht." },
    { icon: "audio", title: "KI-Voiceover", text: "Deine Stimme oder eine Premium-KI-Stimme – in Deutsch, Englisch, Arabisch oder Türkisch." },
    { icon: "captions", title: "Untertitel im Markenlook", text: "Automatisch transkribiert, in deinen Farben und Schriften gesetzt." },
    { icon: "message", title: "Captions & Posting-Plan", text: "Texte, Hashtags und Zeitplan für den ganzen Monat – vorbereitet und redigiert." },
    { icon: "refresh", title: "Saison-Updates", text: "Neue Preise, neues Gericht, neues Datum: Wir aktualisieren bestehende Clips statt neu zu drehen." },
    { icon: "split", title: "Ad-Varianten für A/B-Tests", text: "20+ Varianten für Meta- und TikTok-Ads, sauber benannt und exportiert." },
    { icon: "archive", title: "Durchsuchbares Archiv", text: "Jede Aufnahme verschlagwortet – „Pasta, Abend, Nahaufnahme“ ist in Sekunden gefunden." },
    { icon: "chart", title: "Reporting", text: "Welche Clips performen? Einmal im Monat als kurzer Report mit klaren Empfehlungen." },
  ],
};

export const pipelineModes = {
  tag: "So kommt dein Content zustande",
  title: "Dein Laden bleibt dein Laden.",
  accent: "Wir passen uns an.",
  text: "Kein Filmteam, das den Service lahmlegt. Wir drehen, wann es passt – oder arbeiten mit dem, was du schon hast. Du entscheidest den Modus:",
  modes: [
    { label: "Modus 01", title: "Aus unserem Dreh", text: "Wir kommen einen halben oder ganzen Tag vorbei und filmen alles für die nächsten Wochen.", note: "Der Klassiker" },
    { label: "Modus 02", title: "Aus deinem Material", text: "Du schickst Handy-Clips aus dem Alltag, die Pipeline macht daraus fertige Reels.", note: "Ideal zum Start" },
    { label: "Modus 03", title: "Always-on", text: "Ein Drehtag pro Monat plus laufende Produktion – dein Feed läuft, ohne dass du daran denkst.", note: "Der Retainer" },
  ],
  footnote: "Wechseln geht jederzeit: Modus anpassen dauert eine Nachricht. Retainer sind nach der Mindestlaufzeit monatlich kündbar.",
};

export const pipelineAudience = {
  tag: "Für wen",
  title: "In Gastro und Festival zu Hause –",
  accent: "und offen für deine Branche.",
  text: "Die Pipeline ist für Betriebe gebaut, die jede Woche sichtbar sein müssen und keine Zeit zum Filmen haben.",
  chips: ["Restaurants", "Bars & Cocktailbars", "Cafés & Bäckereien", "Catering", "Festivals & Open Airs", "Clubs", "Konzerte & Touren", "Artists & Labels", "Hotels", "Eventlocations"],
};

export const pipelineRole = {
  tag: "Unsere Rolle",
  title: "Du bekommst kein Tool.",
  accent: "Du bekommst fertigen Content.",
  text: "Technik allein nimmt niemandem Arbeit ab. Wir übernehmen Konzept, Dreh und Pipeline und bleiben dein Ansprechpartner.",
  items: [
    { title: "Konzept & Shotlist", text: "Welche Formate, welche Stimmung, welche Botschaft? Wir planen, bevor die Kamera läuft." },
    { title: "Dreh vor Ort", text: "Premium-Kameras, Licht und Ton – abgestimmt auf deinen Service, ohne Gäste zu stören." },
    { title: "Pipeline & Freigabe", text: "Die KI schneidet vor, wir veredeln. Du gibst in einer übersichtlichen Freigabe-Runde frei." },
    { title: "Betreuung & Nachschärfen", text: "Wir schauen auf die Zahlen und justieren nach. Ein Ansprechpartner, keine Warteschleife." },
  ],
};

export const pipelinePricing = {
  tag: "Pakete",
  title: "Festpreise.",
  accent: "Klassisches Handwerk, KI‑Tempo.", // geschützter Bindestrich
  text: "Jedes Paket startet mit einem echten Dreh vor Ort. Die KI kommt danach – für Menge, Varianten und Geschwindigkeit.",
  packages: [
    {
      name: "Classic Aftermovie",
      audience: "Für Festivals, Clubnächte & Konzerte",
      price: "2.490 €",
      unit: "einmalig",
      meta: "1 Drehtag · 2 Kameras · Lieferung in 7 Tagen",
      features: ["Aftermovie 2–3 Min. in 4K", "6 Social-Cutdowns in 9:16", "Lizenzfreie Musik", "Kino-Color-Grading", "1 Korrekturschleife inklusive"],
      interest: "aftermovie",
    },
    {
      name: "AI-Enhanced Promo",
      audience: "Für Launches, Line-ups & Neueröffnungen",
      price: "3.490 €",
      unit: "einmalig",
      meta: "Drehtag + KI-Postproduktion",
      features: ["Alles aus Classic Aftermovie", "20+ Ad-Varianten: Hooks, Längen, Formate", "KI-Voiceover in bis zu 4 Sprachen", "KI-generierte Szenen & Übergänge", "Ad-ready Export für Meta & TikTok"],
      featured: true,
      interest: "ki_content",
    },
    {
      name: "Gastro Social-Retainer",
      audience: "Für Restaurants, Bars & Cafés",
      price: "1.490 €",
      unit: "pro Monat",
      meta: "6 Monate Mindestlaufzeit",
      features: ["1 halber Drehtag pro Monat", "12 Reels + 20 Fotos pro Monat", "Captions & Posting-Plan", "Google-Profil-Pflege", "Monatliches Reporting"],
      interest: "social",
    },
  ],
  trust: ["Festpreis vor dem Dreh", "Volle Nutzungsrechte", "Endpreise nach § 19 UStG", "Antwort in 24 Stunden"],
};

export const pipelineFaq = [
  {
    q: "Wie schnell bekomme ich die ersten Ergebnisse?",
    a: "Erste Social-Clips liefern wir 72 Stunden nach dem Dreh, den fertigen Film je nach Paket nach 7 bis 14 Tagen. Mit Express geht alles in 72 Stunden.",
  },
  {
    q: "Was macht die KI – und was nicht?",
    a: "Die KI übernimmt Fleißarbeit: Schnitt-Varianten, Untertitel, Übersetzungen, Voiceover und Formatanpassungen. Kamera, Licht, Auswahl und finaler Look bleiben Handarbeit. Gerichte und Gäste sind immer echt gefilmt.",
  },
  {
    q: "Wem gehören die Rechte an Fotos und Videos?",
    a: "Dir. Du bekommst ausschließliche, zeitlich und räumlich unbegrenzte Nutzungsrechte an allen finalen Dateien, sobald die Rechnung bezahlt ist.",
  },
  {
    q: "Was, wenn mir der Schnitt nicht gefällt?",
    a: "Eine Korrekturschleife ist in jedem Paket enthalten. Weitere Runden kosten 49,99 € – meist brauchen wir sie nicht, weil der Masterplan vorher steht.",
  },
  {
    q: "Dreht ihr auch außerhalb eurer Stadt?",
    a: "Ja, in ganz Deutschland, Österreich und der Schweiz. Anfahrt rechnen wir transparent ab – bis 50 km ist sie inklusive.",
  },
  {
    q: "Wie läuft das mit Gästen im Bild und Datenschutz?",
    a: "Wir kündigen Drehs mit Aushängen an, filmen Gäste nur mit Einverständnis und liefern Einwilligungsvorlagen mit. Bei Festivals stimmen wir uns mit dem Veranstalter ab.",
  },
];
