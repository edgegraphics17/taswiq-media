import "server-only";
import { env, isMailConfigured } from "@/lib/env";
import { site } from "@/config/site";
import { formatEUR, formatRange } from "@/lib/format";
import { BUDGET_LABEL, INDUSTRY_LABEL, SOURCE_LABEL, TIER_LABEL } from "@/lib/admin/labels";
import type { Locale } from "@/i18n/routing";

/**
 * E-Mail-Versand über Resend (https://resend.com) – ohne SDK, ein einzelner HTTP-Aufruf.
 *  - Benachrichtigung ans offizielle Postfach (deutsch, Antwort geht direkt an den Lead);
 *    wichtige Anfragen (Premium oder dringend) gehen zusätzlich ans private Postfach
 *  - Bestätigung an den Lead in der Sprache der Website
 * Timeout 4 s – ein langsamer Versand darf den Funnel nie blockieren.
 * Der Lead ist zu diesem Zeitpunkt bereits im Backend gespeichert.
 */

export interface LeadMail {
  id: string | null;
  name: string;
  firstName: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: string;
  industry: string;
  interests: string[];
  projectStatus: string | null;
  budget: string;
  estimate: { min: number; max: number; monthly: number } | null;
  calculatorSummary: { label: string; wert: string }[] | null;
  calculatorSummaryLocalized: { label: string; wert: string }[] | null;
  locale: Locale;
  score: number;
  tier: keyof typeof TIER_LABEL;
}

interface Mail {
  to: string[];
  subject: string;
  html: string;
  replyTo: string;
}

async function send(kind: string, mail: Mail) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${env.resendApiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: env.mailFrom, to: mail.to, subject: mail.subject, html: mail.html, reply_to: mail.replyTo }),
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
    return true;
  } catch (error) {
    console.error(`[mail] Versand fehlgeschlagen (${kind})`, error);
    return false;
  }
}

/** Alles, was vom Lead kommt, landet escaped im HTML. */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const rowsTable = (rows: [string, string][]) =>
  `<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:9px 12px 9px 0;border-bottom:1px solid #dfe4ea;color:#5b6472;vertical-align:top;width:38%">${esc(label)}</td><td style="padding:9px 0;border-bottom:1px solid #dfe4ea;color:#111113;font-weight:600">${esc(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;

const layout = (body: string, footer: string) =>
  `<div style="background:#f4f5f7;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#2b2f36">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">
<p style="margin:0 0 20px;font-size:18px;font-weight:800;color:#111113">${esc(site.name)}</p>
${body}
</div>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#7a8290;text-align:center">${footer}</p>
</div>`;

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#7840fe;color:#ffffff;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px">${esc(label)}</a>`;

const isImportant = (lead: LeadMail) => lead.tier === "premium" || lead.projectStatus === "dringend";

function notification(lead: LeadMail): Mail {
  const important = isImportant(lead);
  const rows: [string, string][] = [
    ["Name", lead.name],
    ["E-Mail", lead.email],
    ...(lead.phone ? [["Telefon", lead.phone] as [string, string]] : []),
    ...(lead.company ? [["Firma", lead.company] as [string, string]] : []),
    ["Branche", INDUSTRY_LABEL[lead.industry] ?? lead.industry],
    ["Interesse", lead.interests.join(", ")],
    ["Budget", BUDGET_LABEL[lead.budget] ?? lead.budget],
    ...(lead.estimate
      ? [["Kalkulation", formatRange(lead.estimate.min, lead.estimate.max) + (lead.estimate.monthly ? ` · ${formatEUR(lead.estimate.monthly)} mtl.` : "")] as [string, string]]
      : []),
    ["Quelle", SOURCE_LABEL[lead.source] ?? lead.source],
    ["Einstufung", `${TIER_LABEL[lead.tier]} · Score ${lead.score}${lead.projectStatus === "dringend" ? " · dringend" : ""}`],
    ...(lead.message ? [["Nachricht", lead.message] as [string, string]] : []),
  ];
  const summary = lead.calculatorSummary?.length
    ? `<p style="margin:22px 0 0;font-weight:700;color:#111113">Konfiguration aus dem Rechner</p>${rowsTable(lead.calculatorSummary.map((r) => [r.label, r.wert]))}`
    : "";
  const link = lead.id ? `<p style="margin:22px 0 0">${btn(`${site.url}/admin/leads/${lead.id}`, "Im Dashboard öffnen")}</p>` : "";
  return {
    to: [...new Set(important ? [...env.leadNotifyTo, ...env.leadNotifyImportantTo] : env.leadNotifyTo)],
    subject: `${important ? "Wichtig – neue" : "Neue"} Anfrage: ${lead.name}${lead.company ? ` (${lead.company})` : ""} – ${TIER_LABEL[lead.tier]}`,
    html: layout(
      `<p style="margin:0">Neue Anfrage über die Website. Antworten auf diese Mail gehen direkt an ${esc(lead.firstName)}.</p>${rowsTable(rows)}${summary}${link}`,
      "Automatische Benachrichtigung der Website.",
    ),
    replyTo: lead.email,
  };
}

const CONFIRM = {
  de: {
    subject: "Deine Anfrage ist angekommen",
    hello: (n: string) => `Hallo ${n},`,
    text: "danke für deine Anfrage – sie ist bei uns angekommen. Wir schauen uns dein Vorhaben an und melden uns innerhalb von 24 Stunden mit einer ehrlichen Einschätzung.",
    summary: "Deine Konfiguration",
    reply: "Ist dir noch etwas eingefallen? Antworte einfach auf diese Mail.",
    urgent: "Wenn es eilt, erreichst du uns unter",
    bye: "Bis bald",
    legal: "Impressum",
    legalPath: "/impressum",
    why: "Du bekommst diese Mail, weil du über unsere Website eine Anfrage gesendet hast.",
  },
  en: {
    subject: "We received your request",
    hello: (n: string) => `Hi ${n},`,
    text: "thanks for your request – it has reached us. We will look into your project and get back to you within 24 hours with an honest assessment.",
    summary: "Your configuration",
    reply: "Something else came to mind? Just reply to this email.",
    urgent: "If it is urgent, you can reach us at",
    bye: "Talk soon",
    legal: "Legal notice",
    legalPath: "/en/legal-notice",
    why: "You are receiving this email because you sent a request via our website.",
  },
} as const;

function confirmation(lead: LeadMail): Mail {
  const c = CONFIRM[lead.locale];
  const summary = lead.calculatorSummaryLocalized?.length
    ? `<p style="margin:22px 0 0;font-weight:700;color:#111113">${c.summary}</p>${rowsTable(lead.calculatorSummaryLocalized.map((r) => [r.label, r.wert]))}`
    : "";
  const a = site.address;
  return {
    to: [lead.email],
    subject: c.subject,
    html: layout(
      `<p style="margin:0 0 12px">${esc(c.hello(lead.firstName))}</p>
<p style="margin:0">${c.text}</p>${summary}
<p style="margin:18px 0 0">${c.reply} ${c.urgent} <a href="${site.phoneHref}" style="color:#6635e8;font-weight:700;white-space:nowrap">${site.phone}</a>.</p>
<p style="margin:18px 0 0">${c.bye}<br>${esc(site.owner)}</p>`,
      `${esc(site.legalName)} · ${a.street}, ${a.postalCode} ${a.city}<br>${c.why} · <a href="${site.url}${c.legalPath}" style="color:#7a8290">${c.legal}</a>`,
    ),
    replyTo: env.leadNotifyTo[0] ?? site.email,
  };
}

export async function sendLeadMails(lead: LeadMail) {
  if (!isMailConfigured()) {
    console.info("[mail] nicht konfiguriert – keine Benachrichtigung/Bestätigung für", lead.id ?? lead.email);
    return { notified: false, confirmed: false, reason: "not_configured" as const };
  }
  const [notified, confirmed] = await Promise.all([send("Benachrichtigung", notification(lead)), send("Bestätigung", confirmation(lead))]);
  return { notified, confirmed };
}
