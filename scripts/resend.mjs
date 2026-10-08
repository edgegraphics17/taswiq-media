#!/usr/bin/env node
/**
 * Resend-Werkzeug für die E-Mail-Templates (Quelle: src/emails/templates.ts).
 *
 *   npm run mail:sync                      Templates bei Resend anlegen/aktualisieren und veröffentlichen
 *   npm run mail:preview [ordner]          Alle Templates mit Beispielwerten als HTML-Dateien schreiben
 *   npm run mail:send -- <alias> <an> KEY=Wert …   Eine Mail über ein Template verschicken
 *       *_HTML-Variablen werden aus reinem Text gebaut (Leerzeile = neuer Absatz), alles andere wird escaped.
 *       Beispiel: npm run mail:send -- taswiq-nachricht kunde@example.com BETREFF="Kurzes Update" \
 *                 UEBERSCHRIFT="Kurzes Update" INHALT_HTML="Hallo Mara,\n\nder Prototyp steht."
 *
 * Der Key kommt aus RESEND_API_KEY oder aus .env.development.local (gitignored).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { esc, paragraphs, renderTemplate, rows, templates } from "../src/emails/templates.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FROM = process.env.MAIL_FROM ?? "TasWiq Media. <info@taswiq-media.de>";

function apiKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  try {
    const line = readFileSync(resolve(root, ".env.development.local"), "utf8").split("\n").findLast((l) => l.startsWith("RESEND_API_KEY="));
    if (line) return line.slice("RESEND_API_KEY=".length).trim();
  } catch {}
  throw new Error("RESEND_API_KEY fehlt (Umgebung oder .env.development.local).");
}

async function api(method, path, body) {
  const res = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: { authorization: `Bearer ${apiKey()}`, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${json.message ?? ""}`);
  return json;
}

async function sync() {
  const existing = new Map();
  for (let after = ""; ; ) {
    const page = await api("GET", `/templates?limit=100${after && `&after=${after}`}`);
    for (const t of page.data) existing.set(t.alias, t.id);
    if (!page.has_more) break;
    after = page.data.at(-1).id;
  }
  for (const t of templates) {
    const body = {
      name: t.name,
      alias: t.alias,
      from: FROM,
      subject: t.subject,
      html: t.html,
      variables: t.variables.map((x) => ({ key: x.key, type: "string", ...(x.fallback === undefined ? {} : { fallback_value: x.fallback }) })),
    };
    const id = existing.get(t.alias);
    const saved = id ? await api("PATCH", `/templates/${id}`, body) : await api("POST", "/templates", body);
    await api("POST", `/templates/${saved.id}/publish`);
    console.log(`${id ? "aktualisiert" : "angelegt    "}  ${t.alias}  (${t.name})`);
    // Resend erlaubt nur wenige Aufrufe pro Sekunde
    await new Promise((r) => setTimeout(r, 700));
  }
}

const SAMPLE = {
  NAME: "Mara",
  BADGE: "Wichtige Anfrage",
  EINSTUFUNG: "Premium · Score 86 · dringend",
  DETAILS_HTML: rows([
    ["Name", "Mara Beispiel"],
    ["E-Mail", "mara@example.com"],
    ["Telefon", "+49 170 0000000"],
    ["Firma", "Trattoria Beispiel"],
    ["Branche", "Gastronomie & Food"],
    ["Interesse", "bestellsystem, web"],
    ["Budget", "15.000–40.000 €"],
    ["Nachricht", "Wir verlieren zu viel Marge an Lieferplattformen und möchten ein eigenes Bestellsystem."],
  ]),
  ZUSAMMENFASSUNG_HTML: rows(
    [
      ["Modell", "Kauf"],
      ["Lösung", "Bestellsystem mit Online-Zahlung"],
      ["Umfang", "Web-App + Küchen-Dashboard"],
      ["Rahmen", "14.900 – 18.400 €"],
    ],
    "Deine Konfiguration",
  ),
  PROJEKT: "Eigenes Bestellsystem für die Trattoria Beispiel",
  INTRO_HTML: paragraphs("danke für das gute Gespräch. Wie besprochen findest du hier unser Angebot – mit allem, was du für den Start brauchst."),
  PREIS: "14.900 €",
  PREIS_HINWEIS: "Einmalig, zahlbar in drei Abschnitten. Betrieb und Wartung ab 149 € im Monat.",
  GUELTIG_BIS: "31.10.2026",
  LEISTUNGEN_HTML: rows(
    [
      ["Bestellsystem", "Speisekarte, Warenkorb, Online-Zahlung"],
      ["Küchen-Dashboard", "Eingehende Bestellungen in Echtzeit"],
      ["Start", "Einrichtung, Schulung, 30 Tage Begleitung"],
    ],
    "Leistungsumfang",
  ),
  ANGEBOT_URL: "https://www.taswiq-media.de",
  THEMA: "deinem Bestellsystem",
  BETREFF: "Kurzes Update zu deinem Projekt",
  UEBERSCHRIFT: "Der Prototyp steht.",
  INHALT_HTML: paragraphs("Hallo Mara,\n\nder erste klickbare Prototyp ist fertig. Schau ihn dir in Ruhe an und sag uns, was dir auffällt.\n\nWir planen danach die nächsten zwei Wochen."),
  CTA_LABEL: "Prototyp ansehen",
  CTA_URL: "https://www.taswiq-media.de",
};

function preview(dir = "mail-preview") {
  const out = resolve(root, dir);
  mkdirSync(out, { recursive: true });
  for (const t of templates) {
    const vars = Object.fromEntries(t.variables.map((x) => [x.key, SAMPLE[x.key] ?? x.fallback ?? ""]));
    if (t.alias === "taswiq-anfrage-intern") vars.ZUSAMMENFASSUNG_HTML = rows([["Modell", "Kauf"], ["Rahmen", "14.900 – 18.400 €"]], "Konfiguration aus dem Rechner");
    writeFileSync(resolve(out, `${t.alias}.html`), renderTemplate(t.alias, vars).html);
    console.log(resolve(out, `${t.alias}.html`));
  }
}

async function send([alias, to, ...pairs]) {
  const t = templates.find((x) => x.alias === alias);
  if (!t || !to) throw new Error(`Aufruf: mail:send -- <alias> <an> KEY=Wert …\nTemplates: ${templates.map((x) => x.alias).join(", ")}`);
  const raw = Object.fromEntries(pairs.map((x) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1).replace(/\\n/g, "\n")]));
  const missing = t.variables.filter((x) => x.fallback === undefined && !raw[x.key]).map((x) => `${x.key} (${x.hint})`);
  if (missing.length) throw new Error(`Es fehlen: ${missing.join(", ")}`);
  const variables = Object.fromEntries(Object.entries(raw).map(([k, val]) => [k, k.endsWith("_HTML") ? paragraphs(val) : k.endsWith("_URL") ? val : esc(val)]));
  const { subject } = renderTemplate(alias, raw);
  const res = await api("POST", "/emails", { from: FROM, to: [to], reply_to: "info@taswiq-media.de", subject, template: { id: alias, variables } });
  console.log(`Gesendet an ${to}: „${subject}“ (${res.id})`);
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === "sync") await sync();
  else if (cmd === "preview") preview(args[0]);
  else if (cmd === "send") await send(args);
  else console.log("Befehle: sync · preview [ordner] · send <alias> <an> KEY=Wert …");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
