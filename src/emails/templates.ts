/**
 * E-Mail-Templates im TasWiq-Design – einzige Quelle für Resend (Templates) und den lokalen Fallback.
 *
 *  - `npm run mail:sync` legt die Templates bei Resend an bzw. aktualisiert und veröffentlicht sie.
 *  - Die Website verschickt über den Alias (`template: { id: alias, variables }`); schlägt das fehl,
 *    rendert `renderTemplate()` dasselbe HTML lokal.
 *  - Resend setzt Variablen ungefiltert ein (`{{{KEY}}}`): Werte immer mit `esc()` bzw. den Block-Helfern bauen.
 *
 * Bewusst ohne Imports und nur mit löschbarer TypeScript-Syntax – das Sync-Skript lädt die Datei direkt mit Node.
 */

const BRAND = {
  name: "TasWiq Media.",
  legalName: "TasWiq Media. – Karim Azzaoui",
  owner: "Karim Azzaoui",
  url: "https://www.taswiq-media.de",
  logo: "https://www.taswiq-media.de/brand/logo.png",
  email: "info@taswiq-media.de",
  phone: "+49 162 2035499",
  phoneHref: "tel:+491622035499",
  whatsappHref: "https://wa.me/491622035499",
  address: "Taunusanlage 8, 60329 Frankfurt am Main",
};

/* Farben wie in src/app/globals.css */
const C = {
  canvas: "#f6f6f6",
  surface: "#ffffff",
  line: "#ececef",
  ink: "#111113",
  body: "#45454c",
  muted: "#6e6e73",
  night: "#141414",
  nightLine: "#2c2c31",
  nightMuted: "#9b9ba3",
  brand: "#7840fe",
  brandText: "#6635e8",
  brandSoft: "#f5f1ff",
  brandLight: "#b9a0ff",
};

const FONT = "'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export interface TemplateVariable {
  key: string;
  /** Leerer Text = optional; ohne Fallback ist die Variable Pflicht. */
  fallback?: string;
  hint: string;
}

export interface EmailTemplate {
  alias: string;
  name: string;
  subject: string;
  html: string;
  variables: TemplateVariable[];
}

/* ─── Bausteine (auch für Variablen-Werte aus dem Code) ─────────────── */

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

const P = `margin:0 0 16px;font-size:16px;line-height:1.6;color:${C.body}`;

/** Fließtext: Leerzeilen trennen Absätze, einfache Umbrüche bleiben erhalten. */
export const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((p) => `<p style="${P}">${esc(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");

/** Zweispaltige Liste (Label · Wert), optional mit Überschrift – für Anfrage-Details, Konfiguration, Leistungen. */
export const rows = (items: [string, string][], heading?: string) =>
  (heading ? `<p style="margin:28px 0 4px;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.muted}">${esc(heading)}</p>` : "") +
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse">${items
    .map(
      ([label, value]) =>
        `<tr><td style="padding:12px 16px 12px 0;border-bottom:1px solid ${C.line};font-size:14px;line-height:1.5;color:${C.muted};vertical-align:top;width:36%">${esc(label)}</td><td style="padding:12px 0;border-bottom:1px solid ${C.line};font-size:15px;line-height:1.5;font-weight:600;color:${C.ink};vertical-align:top">${esc(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr><td style="border-radius:999px;background:${C.brand}"><a href="${href}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:16px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${label}</a></td></tr></table>`;

const eyebrow = (text: string) =>
  `<p style="margin:0 0 14px"><span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${C.brandSoft};font-size:12px;line-height:1.3;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.brandText}">${text}</span></p>`;

const h1 = (text: string) => `<h1 style="margin:0 0 20px;font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-0.01em;color:${C.ink}">${text}</h1>`;

const p = (html: string) => `<p style="${P}">${html}</p>`;

/** Schwarze Karte der Website – für das eine Element, das hervorstechen soll. */
const night = (inner: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 28px"><tr><td style="padding:26px 26px 10px;border-radius:20px;background:${C.night}">${inner}</td></tr></table>`;

const nightLabel = (text: string) => `<p style="margin:0 0 14px;font-size:12px;line-height:1.3;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.brandLight}">${text}</p>`;

const steps = (items: string[]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items
    .map(
      (text, i) =>
        `<tr><td style="padding:0 14px 16px 0;vertical-align:top;width:28px"><span style="display:inline-block;width:28px;height:28px;border-radius:999px;background:${C.nightLine};font-size:13px;line-height:28px;font-weight:700;color:#ffffff;text-align:center">${i + 1}</span></td><td style="padding:3px 0 16px;font-size:15px;line-height:1.55;color:#ffffff;vertical-align:top">${text}</td></tr>`,
    )
    .join("")}</table>`;

const phoneLink = `<a href="${BRAND.phoneHref}" style="color:${C.brandText};font-weight:700;text-decoration:none;white-space:nowrap">${BRAND.phone}</a>`;

const signature = (bye: string) =>
  `<p style="margin:8px 0 0;font-size:16px;line-height:1.6;color:${C.body}">${bye}<br><strong style="color:${C.ink}">${BRAND.owner}</strong><br><span style="font-size:14px;color:${C.muted}">${BRAND.name}</span></p>`;

interface LayoutOptions {
  lang: "de" | "en";
  /** Vorschautext im Posteingang (darf Variablen enthalten) */
  preheader: string;
  body: string;
  /** Warum der Empfänger die Mail bekommt – leer bei internen Mails */
  reason?: string;
}

function layout({ lang, preheader, body, reason }: LayoutOptions) {
  const legal = lang === "en" ? { label: "Legal notice", path: "/en/legal-notice", privacy: "Privacy", privacyPath: "/en/privacy" } : { label: "Impressum", path: "/impressum", privacy: "Datenschutz", privacyPath: "/datenschutz" };
  const link = `color:${C.muted};text-decoration:underline`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;background:${C.canvas}}
  @media (max-width:620px){.tw-card{padding:28px 22px !important;border-radius:20px !important}.tw-outer{padding:20px 12px !important}h1{font-size:25px !important}}
</style>
</head>
<body style="margin:0;padding:0;background:${C.canvas};font-family:${FONT};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.canvas}">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas}">
<tr><td class="tw-outer" align="center" style="padding:36px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 6px 22px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="vertical-align:middle;padding-right:12px"><a href="${BRAND.url}" style="text-decoration:none"><img src="${BRAND.logo}" width="40" height="40" alt="" style="display:block;border:0;border-radius:12px"></a></td>
<td style="vertical-align:middle;font-family:${FONT};font-size:19px;line-height:1.2;font-weight:800;letter-spacing:-0.01em"><a href="${BRAND.url}" style="color:${C.ink};text-decoration:none">${BRAND.name}</a></td>
</tr></table>
</td></tr>
<tr><td class="tw-card" style="padding:40px 40px 34px;border-radius:24px;background:${C.surface};font-family:${FONT}">
${body}
</td></tr>
<tr><td style="padding:24px 10px 0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};text-align:center">
${reason ? `${reason}<br>` : ""}${BRAND.legalName} · ${BRAND.address}<br>
<a href="mailto:${BRAND.email}" style="${link}">${BRAND.email}</a> · <a href="${BRAND.phoneHref}" style="${link}">${BRAND.phone}</a> · <a href="${BRAND.url}${legal.path}" style="${link}">${legal.label}</a> · <a href="${BRAND.url}${legal.privacyPath}" style="${link}">${legal.privacy}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const v = (key: string) => `{{{${key}}}}`;

/* ─── Templates ──────────────────────────────────────────────────────── */

export const templates: EmailTemplate[] = [
  {
    alias: "taswiq-anfrage-bestaetigung",
    name: "Anfrage · Bestätigung an den Kunden (DE)",
    subject: "Deine Anfrage ist angekommen",
    variables: [
      { key: "NAME", fallback: "du", hint: "Vorname" },
      { key: "ZUSAMMENFASSUNG_HTML", fallback: "", hint: "Konfiguration aus dem Rechner (rows-Block) – leer bei Funnel-Anfragen" },
    ],
    html: layout({
      lang: "de",
      preheader: "Wir melden uns innerhalb von 24 Stunden mit einer ehrlichen Einschätzung.",
      reason: "Du bekommst diese Mail, weil du über unsere Website eine Anfrage gesendet hast.",
      body:
        eyebrow("Anfrage eingegangen") +
        h1(`Danke, ${v("NAME")} – deine Anfrage ist bei uns.`) +
        p("Wir schauen uns dein Vorhaben an und melden uns <strong>innerhalb von 24 Stunden</strong> mit einer ehrlichen Einschätzung.") +
        v("ZUSAMMENFASSUNG_HTML") +
        night(
          nightLabel("So geht es weiter") +
            steps([
              "Wir prüfen, was du vorhast und was du dafür wirklich brauchst.",
              "Du bekommst unsere Einschätzung – auch wenn sie lautet: Dafür reicht fertige Software.",
              "Wenn es passt, folgt ein konkreter Vorschlag mit den nächsten Schritten.",
            ]),
        ) +
        p(`Ist dir noch etwas eingefallen? Antworte einfach auf diese Mail. Wenn es eilt, erreichst du uns unter ${phoneLink}.`) +
        signature("Bis bald"),
    }),
  },
  {
    alias: "taswiq-request-confirmation",
    name: "Anfrage · Bestätigung an den Kunden (EN)",
    subject: "We received your request",
    variables: [
      { key: "NAME", fallback: "there", hint: "First name" },
      { key: "ZUSAMMENFASSUNG_HTML", fallback: "", hint: "Calculator configuration (rows block) – empty for funnel requests" },
    ],
    html: layout({
      lang: "en",
      preheader: "We will get back to you within 24 hours with an honest assessment.",
      reason: "You are receiving this email because you sent a request via our website.",
      body:
        eyebrow("Request received") +
        h1(`Thanks, ${v("NAME")} – your request has reached us.`) +
        p("We will look into your project and get back to you <strong>within 24 hours</strong> with an honest assessment.") +
        v("ZUSAMMENFASSUNG_HTML") +
        night(
          nightLabel("What happens next") +
            steps([
              "We review what you are planning and what you actually need for it.",
              "You get our assessment – even if it is: off-the-shelf software will do.",
              "If it is a fit, we follow up with a concrete proposal and next steps.",
            ]),
        ) +
        p(`Something else came to mind? Just reply to this email. If it is urgent, you can reach us at ${phoneLink}.`) +
        signature("Talk soon"),
    }),
  },
  {
    alias: "taswiq-anfrage-intern",
    name: "Anfrage · Benachrichtigung intern",
    subject: `${v("BADGE")}: ${v("NAME")}`,
    variables: [
      { key: "BADGE", fallback: "Neue Anfrage", hint: "„Neue Anfrage“ oder „Wichtige Anfrage“" },
      { key: "NAME", hint: "Name des Leads, ggf. mit Firma" },
      { key: "EINSTUFUNG", fallback: "", hint: "z. B. „Premium · Score 86 · dringend“" },
      { key: "DETAILS_HTML", hint: "Angaben des Leads (rows-Block)" },
      { key: "ZUSAMMENFASSUNG_HTML", fallback: "", hint: "Konfiguration aus dem Rechner (rows-Block)" },
      { key: "DASHBOARD_URL", fallback: "https://www.taswiq-media.de/admin", hint: "Link zur Anfrage im Dashboard" },
    ],
    html: layout({
      lang: "de",
      preheader: v("EINSTUFUNG"),
      body:
        eyebrow(v("BADGE")) +
        h1(v("NAME")) +
        p(`<strong style="color:${C.ink}">${v("EINSTUFUNG")}</strong><br>Antworten auf diese Mail gehen direkt an den Absender der Anfrage.`) +
        v("DETAILS_HTML") +
        v("ZUSAMMENFASSUNG_HTML") +
        button(v("DASHBOARD_URL"), "Im Dashboard öffnen"),
    }),
  },
  {
    alias: "taswiq-angebot",
    name: "Angebot an den Kunden",
    subject: `Dein Angebot: ${v("PROJEKT")}`,
    variables: [
      { key: "NAME", fallback: "du", hint: "Vorname" },
      { key: "PROJEKT", hint: "Titel des Projekts" },
      { key: "INTRO_HTML", fallback: "", hint: "Einleitung (paragraphs-Block)" },
      { key: "PREIS", hint: "z. B. „8.900 €“ oder „ab 290 € / Monat“" },
      { key: "PREIS_HINWEIS", fallback: "", hint: "z. B. Zahlungsweise, Laufzeit, Steuerhinweis" },
      { key: "GUELTIG_BIS", hint: "Datum, bis wann das Angebot gilt" },
      { key: "LEISTUNGEN_HTML", fallback: "", hint: "Leistungsumfang (rows-Block)" },
      { key: "CTA_LABEL", fallback: "Angebot ansehen", hint: "Beschriftung des Buttons" },
      { key: "ANGEBOT_URL", hint: "Link zum Angebot (PDF oder Seite)" },
    ],
    html: layout({
      lang: "de",
      preheader: `Dein Angebot für ${v("PROJEKT")} – gültig bis ${v("GUELTIG_BIS")}.`,
      reason: "Du bekommst diese Mail, weil du bei uns ein Angebot angefragt hast.",
      body:
        eyebrow("Angebot") +
        h1(v("PROJEKT")) +
        p(`Hallo ${v("NAME")},`) +
        v("INTRO_HTML") +
        night(
          nightLabel("Investition") +
            `<p style="margin:0 0 6px;font-size:34px;line-height:1.15;font-weight:800;letter-spacing:-0.02em;color:#ffffff">${v("PREIS")}</p>` +
            `<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:${C.nightMuted}">${v("PREIS_HINWEIS")}</p>` +
            `<p style="margin:0 0 16px;padding-top:14px;border-top:1px solid ${C.nightLine};font-size:14px;line-height:1.55;color:${C.nightMuted}">Gültig bis <strong style="color:#ffffff">${v("GUELTIG_BIS")}</strong></p>`,
        ) +
        v("LEISTUNGEN_HTML") +
        button(v("ANGEBOT_URL"), v("CTA_LABEL")) +
        p(`Fragen oder Änderungswünsche? Antworte einfach auf diese Mail oder ruf an: ${phoneLink}.`) +
        signature("Viele Grüße"),
    }),
  },
  {
    alias: "taswiq-nachfassen",
    name: "Nachfassen nach Angebot oder Gespräch",
    subject: `Kurze Rückfrage zu ${v("THEMA")}`,
    variables: [
      { key: "NAME", fallback: "du", hint: "Vorname" },
      { key: "THEMA", hint: "Worum es ging, z. B. „deinem Bestellsystem“" },
      { key: "INHALT_HTML", fallback: "", hint: "Optionaler persönlicher Absatz (paragraphs-Block)" },
    ],
    html: layout({
      lang: "de",
      preheader: `Gibt es noch offene Fragen zu ${v("THEMA")}?`,
      reason: "Du bekommst diese Mail, weil wir zu deiner Anfrage in Kontakt stehen.",
      body:
        eyebrow("Kurze Rückfrage") +
        h1(`Wie sieht es bei ${v("THEMA")} aus?`) +
        p(`Hallo ${v("NAME")},`) +
        p(`wir haben uns vor ein paar Tagen zu ${v("THEMA")} ausgetauscht. Gibt es noch offene Fragen, oder sollen wir etwas anpassen?`) +
        v("INHALT_HTML") +
        p("Ein kurzes Ja, Nein oder Später reicht – dann wissen wir, woran wir sind.") +
        button(BRAND.whatsappHref, "Per WhatsApp antworten") +
        p(`Oder antworte einfach auf diese Mail. Telefonisch erreichst du uns unter ${phoneLink}.`) +
        signature("Viele Grüße"),
    }),
  },
  {
    alias: "taswiq-nachricht",
    name: "Allgemeine Nachricht",
    subject: v("BETREFF"),
    variables: [
      { key: "BETREFF", hint: "Betreffzeile" },
      { key: "UEBERSCHRIFT", hint: "Überschrift in der Mail" },
      { key: "INHALT_HTML", hint: "Text (paragraphs-Block)" },
      { key: "GRUSS", fallback: "Viele Grüße", hint: "Grußformel" },
    ],
    html: layout({
      lang: "de",
      preheader: v("UEBERSCHRIFT"),
      body: h1(v("UEBERSCHRIFT")) + v("INHALT_HTML") + signature(v("GRUSS")),
    }),
  },
  {
    alias: "taswiq-nachricht-button",
    name: "Allgemeine Nachricht mit Button",
    subject: v("BETREFF"),
    variables: [
      { key: "BETREFF", hint: "Betreffzeile" },
      { key: "UEBERSCHRIFT", hint: "Überschrift in der Mail" },
      { key: "INHALT_HTML", hint: "Text (paragraphs-Block)" },
      { key: "CTA_LABEL", hint: "Beschriftung des Buttons" },
      { key: "CTA_URL", hint: "Ziel des Buttons" },
      { key: "GRUSS", fallback: "Viele Grüße", hint: "Grußformel" },
    ],
    html: layout({
      lang: "de",
      preheader: v("UEBERSCHRIFT"),
      body: h1(v("UEBERSCHRIFT")) + v("INHALT_HTML") + button(v("CTA_URL"), v("CTA_LABEL")) + signature(v("GRUSS")),
    }),
  },
];

/** Dasselbe wie Resend: `{{{KEY}}}` durch Wert bzw. Fallback ersetzen. */
export function renderTemplate(alias: string, variables: Record<string, string>, subject?: string) {
  const t = templates.find((x) => x.alias === alias);
  if (!t) throw new Error(`Unbekanntes Template: ${alias}`);
  const fill = (s: string) => s.replace(/\{\{\{([A-Z_]+)\}\}\}/g, (_, key: string) => variables[key] ?? t.variables.find((x) => x.key === key)?.fallback ?? "");
  return { subject: subject ?? fill(t.subject), html: fill(t.html) };
}
