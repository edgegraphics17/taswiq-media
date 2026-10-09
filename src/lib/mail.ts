import "server-only";
import { env, isMailConfigured } from "@/lib/env";
import { site } from "@/config/site";
import { formatEUR, formatRange } from "@/lib/format";
import { BUDGET_LABEL, INDUSTRY_LABEL, SOURCE_LABEL, TIER_LABEL } from "@/lib/admin/labels";
import { esc, paragraphs, renderTemplate, rows } from "@/emails/templates";
import type { Locale } from "@/i18n/routing";

/**
 * E-Mail-Versand über Resend (https://resend.com) – ohne SDK, ein einzelner HTTP-Aufruf.
 * Design und Texte liegen als Templates bei Resend (Quelle: src/emails/templates.ts, `npm run mail:sync`).
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
  /** Zweck – landet als Tag bei Resend und kommt im Webhook zurück */
  kind: "benachrichtigung" | "bestaetigung" | "hinweis";
  leadId: string | null;
  to: string[];
  subject: string;
  /** Alias des Resend-Templates (src/emails/templates.ts) */
  template: string;
  variables: Record<string, string>;
  replyTo: string;
}

const post = (mail: Mail, content: Record<string, unknown>) =>
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.resendApiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.mailFrom,
      to: mail.to,
      subject: mail.subject,
      reply_to: mail.replyTo,
      tags: [{ name: "kind", value: mail.kind }, ...(mail.leadId ? [{ name: "lead_id", value: mail.leadId }] : [])],
      ...content,
    }),
    signal: AbortSignal.timeout(4_000),
    cache: "no-store",
  });

/**
 * Versand über das veröffentlichte Resend-Template. Fehlt es dort oder wurde es im Dashboard
 * kaputt-editiert, geht dieselbe Mail mit lokal gerendertem HTML raus – eine Anfrage bleibt nie ohne Mail.
 */
async function send(mail: Mail) {
  try {
    let res = await post(mail, { template: { id: mail.template, variables: mail.variables } });
    if (!res.ok && res.status !== 429 && res.status < 500) {
      console.warn(`[mail] Template "${mail.template}" abgelehnt (HTTP ${res.status}) – sende lokal gerendert`);
      res = await post(mail, { html: renderTemplate(mail.template, mail.variables).html });
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
    return true;
  } catch (error) {
    console.error(`[mail] Versand fehlgeschlagen (${mail.kind})`, error);
    return false;
  }
}

const isImportant = (lead: LeadMail) => lead.tier === "premium" || lead.projectStatus === "dringend";

function notification(lead: LeadMail): Mail {
  const important = isImportant(lead);
  const rating = `${TIER_LABEL[lead.tier]} · Score ${lead.score}${lead.projectStatus === "dringend" ? " · dringend" : ""}`;
  const details: [string, string][] = [
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
    ...(lead.message ? [["Nachricht", lead.message] as [string, string]] : []),
  ];
  return {
    kind: "benachrichtigung",
    leadId: lead.id,
    to: [...new Set(important ? [...env.leadNotifyTo, ...env.leadNotifyImportantTo] : env.leadNotifyTo)],
    subject: `${important ? "Wichtig – neue" : "Neue"} Anfrage: ${lead.name}${lead.company ? ` (${lead.company})` : ""} – ${TIER_LABEL[lead.tier]}`,
    template: "taswiq-anfrage-intern",
    variables: {
      BADGE: important ? "Wichtige Anfrage" : "Neue Anfrage",
      NAME: esc(lead.company ? `${lead.name} · ${lead.company}` : lead.name),
      EINSTUFUNG: rating,
      DETAILS_HTML: rows(details),
      ZUSAMMENFASSUNG_HTML: lead.calculatorSummary?.length ? rows(lead.calculatorSummary.map((r) => [r.label, r.wert]), "Konfiguration aus dem Rechner") : "",
      DASHBOARD_URL: lead.id ? `${site.url}/admin/leads/${lead.id}` : `${site.url}/admin`,
    },
    replyTo: lead.email,
  };
}

function confirmation(lead: LeadMail): Mail {
  const en = lead.locale === "en";
  return {
    kind: "bestaetigung",
    leadId: lead.id,
    to: [lead.email],
    subject: en ? "We received your request" : "Deine Anfrage ist angekommen",
    template: en ? "taswiq-request-confirmation" : "taswiq-anfrage-bestaetigung",
    variables: {
      NAME: esc(lead.firstName),
      ZUSAMMENFASSUNG_HTML: lead.calculatorSummaryLocalized?.length
        ? rows(lead.calculatorSummaryLocalized.map((r) => [r.label, r.wert]), en ? "Your configuration" : "Deine Konfiguration")
        : "",
    },
    replyTo: env.leadNotifyTo[0] ?? site.email,
  };
}

export async function sendLeadMails(lead: LeadMail) {
  if (!isMailConfigured()) {
    console.info("[mail] nicht konfiguriert – keine Benachrichtigung/Bestätigung für", lead.id ?? lead.email);
    return { notified: false, confirmed: false, reason: "not_configured" as const };
  }
  const [notified, confirmed] = await Promise.all([send(notification(lead)), send(confirmation(lead))]);
  return { notified, confirmed };
}

/** Interner Hinweis ans offizielle Postfach, z. B. wenn eine Bestätigung nicht zugestellt werden konnte. */
export async function sendInternalNotice(subject: string, text: string, leadId: string | null = null) {
  if (!isMailConfigured()) return false;
  return send({
    kind: "hinweis",
    leadId,
    to: env.leadNotifyTo,
    subject,
    template: leadId ? "taswiq-nachricht-button" : "taswiq-nachricht",
    variables: {
      BETREFF: esc(subject),
      UEBERSCHRIFT: esc(subject),
      INHALT_HTML: paragraphs(text),
      GRUSS: "Automatischer Hinweis der Website",
      ...(leadId ? { CTA_LABEL: "Im Dashboard öffnen", CTA_URL: `${site.url}/admin/leads/${leadId}` } : {}),
    },
    replyTo: env.leadNotifyTo[0] ?? site.email,
  });
}

/**
 * Terminbuchung über den eigenen Kalender: Hinweis an uns und Bestätigung an die Person, die gebucht hat
 * (in der Sprache der Website). `when` ist der fertig formatierte Zeitraum in deutscher Zeit.
 */
export async function sendBookingMails(b: { name: string; email: string; phone: string | null; note: string | null; when: string; whenDe: string; locale: Locale; leadId: string | null }) {
  if (!isMailConfigured()) return { notified: false, confirmed: false };
  const en = b.locale === "en";
  const first = b.name.trim().split(" ")[0] || b.name;
  const subject = en ? "Your call with TasWiq Media is booked" : "Dein Gespräch mit TasWiq Media ist eingetragen";
  const [notified, confirmed] = await Promise.all([
    sendInternalNotice(
      `Neuer Gesprächstermin: ${b.name}`,
      `${b.name} hat ein Gespräch gebucht: ${b.whenDe}.\n\nE-Mail: ${b.email}${b.phone ? `\nTelefon: ${b.phone}` : ""}${b.note ? `\n\nNachricht: ${b.note}` : ""}\n\nDer Termin steht im Dashboard unter „Kalender“.`,
      b.leadId,
    ),
    send({
      kind: "bestaetigung",
      leadId: b.leadId,
      to: [b.email],
      subject,
      template: "taswiq-nachricht",
      variables: {
        BETREFF: esc(subject),
        UEBERSCHRIFT: esc(en ? `See you then, ${first}.` : `Bis dahin, ${first}.`),
        INHALT_HTML: paragraphs(
          en
            ? `Your call is booked: ${b.when}.\n\nWe will contact you at that time – by phone or with a link to a video call.\n\nIf something comes up, just reply to this email and we will find a new time.`
            : `Dein Gespräch ist eingetragen: ${b.when}.\n\nWir melden uns zu diesem Termin bei dir – telefonisch oder mit einem Link zum Videogespräch.\n\nKommt dir etwas dazwischen, antworte einfach auf diese E-Mail, dann finden wir einen neuen Termin.`,
        ),
        GRUSS: en ? "Best regards" : "Viele Grüße",
      },
      replyTo: env.leadNotifyTo[0] ?? site.email,
    }),
  ]);
  return { notified, confirmed };
}

/**
 * Einladung zu einem Videocall (Dashboard → Meetings): je Adresse eine eigene Mail mit dem Link zum Raum.
 * Gibt die Adressen zurück, bei denen der Versand nicht geklappt hat.
 */
export async function sendMeetingInvites(to: string[], meeting: { title: string; url: string; note: string | null }): Promise<string[]> {
  if (!isMailConfigured()) return to;
  const subject = `Einladung zum Videocall: ${meeting.title}`;
  const results = await Promise.all(
    to.map((address) =>
      send({
        kind: "hinweis",
        leadId: null,
        to: [address],
        subject,
        template: "taswiq-nachricht-button",
        variables: {
          BETREFF: esc(subject),
          UEBERSCHRIFT: esc(meeting.title),
          INHALT_HTML: paragraphs(
            `du bist zu einem Videocall mit TasWiq Media eingeladen.${meeting.note ? `\n\n${meeting.note}` : ""}\n\nDer Call läuft direkt im Browser – ohne Programm und ohne Konto. Einfach auf den Button klicken, Namen eintragen und beitreten.\n\nFalls der Button nicht funktioniert: ${meeting.url}`,
          ),
          CTA_LABEL: "Zum Videocall",
          CTA_URL: meeting.url,
          GRUSS: "Viele Grüße",
        },
        replyTo: env.leadNotifyTo[0] ?? site.email,
      }),
    ),
  );
  return to.filter((_, i) => !results[i]);
}
