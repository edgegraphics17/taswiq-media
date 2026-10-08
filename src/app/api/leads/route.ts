import { NextResponse, type NextRequest } from "next/server";
import { leadSchema, toValidationCode } from "@/lib/validation";
import { scoreLead } from "@/lib/lead-scoring";
import { computeEstimate, computeRent, rentText, sanitizeState, summaryRows } from "@/lib/pricing-engine";
import { getPricingData } from "@/lib/pricing-source";
import { localizeOptions } from "@/lib/pricing-i18n";
import { getCalcI18n } from "@/lib/pricing-i18n.server";
import { bracketForRange } from "@/config/funnel";
import { insertLead } from "@/lib/db";
import { isBackendConfigured } from "@/lib/env";
import { forwardToN8n, hashIp } from "@/lib/webhook";
import { sendLeadMails } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/leads – gemeinsamer Endpunkt für Funnel, Rechner und Unterseiten
 * (wie bei asap: ein Payload-Format, ein Endpunkt).
 *
 *  1. Rate-Limit + Honeypot
 *  2. Zod-Validierung (identisches Schema wie im Client)
 *  3. Rechner-Leads: Kalkulation serverseitig neu berechnen → Budget-Stufe ableiten
 *  4. Scoring serverseitig (Client-Werte werden ignoriert)
 *  5. Im Backend (Sprite) speichern (Source of Truth) + Kalkulation verknüpfen
 *  6. E-Mails über Resend (Benachrichtigung an uns, Bestätigung an den Lead)
 *  7. n8n-Webhook (Slack/Discord, Follow-up) – optional
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  if (!rateLimit(`lead:${ip}`, 5, 10 * 60_000)) {
    // Fehler als Code – der Client zeigt den Text in der Sprache der Seite
    return NextResponse.json({ ok: false, error: "rateLimit" }, { status: 429 });
  }

  const parsed = leadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0] ?? "form")] ??= toValidationCode(issue.message);
    return NextResponse.json({ ok: false, error: "invalid", fields }, { status: 422 });
  }
  const data = parsed.data;

  // Bot hat das unsichtbare Feld ausgefüllt → Erfolg vortäuschen, nichts speichern.
  if (data.website) return NextResponse.json({ ok: true, tier: "growth", leadId: null });

  // Rechner-Leads: Preis & Budget niemals vom Client übernehmen
  let estimate: { min: number; max: number; monthly: number } | null = null;
  let calculatorSummary: { label: string; wert: string }[] | null = null;
  /** Zusammenfassung in der Sprache des Leads (für die Bestätigungs-Mail aus n8n) */
  let calculatorSummaryLocalized: { label: string; wert: string }[] | null = null;
  /** Kauf oder Miete – die Mietrate wird wie der Preis serverseitig neu berechnet */
  let paymentModel: "kauf" | "miete" | null = null;
  let rentEstimate: { min: number; max: number } | null = null;
  let budget = data.budget;
  if (data.source === "rechner" && data.calculator) {
    const pricing = await getPricingData();
    const state = sanitizeState(data.calculator.state, pricing);
    // Dashboard & Backend bleiben deutsch
    const de = await getCalcI18n("de");
    const e = computeEstimate(state, Number.POSITIVE_INFINITY, pricing, de);
    estimate = { min: e.von, max: e.bis, monthly: e.summeMtl };
    calculatorSummary = summaryRows(state, localizeOptions(pricing, de), de);
    if (data.locale === "de") calculatorSummaryLocalized = calculatorSummary;
    else {
      const i18n = await getCalcI18n(data.locale);
      calculatorSummaryLocalized = summaryRows(state, localizeOptions(pricing, i18n), i18n);
    }
    const rent = computeRent(e, state, pricing.konfig);
    paymentModel = data.calculator.model === "miete" && rent ? "miete" : "kauf";
    if (rent) rentEstimate = { min: rent.von, max: rent.bis };
    // Wunsch als erste Zeile der Zusammenfassung → erscheint ohne Umbau in Dashboard und Mails
    const i18n = data.locale === "de" ? de : await getCalcI18n(data.locale);
    const row = (c: typeof de) => ({
      id: "modell",
      label: c.t("rent.summaryLabel"),
      wert: paymentModel === "miete" && rent ? c.t("rent.summaryRent", { value: rentText(rent, c) }) : c.t("rent.summaryBuy"),
    });
    calculatorSummary = [row(de), ...calculatorSummary];
    calculatorSummaryLocalized = [row(i18n), ...calculatorSummaryLocalized];
    budget = bracketForRange(e.von, e.bis);
  }

  const { score, tier, reasons } = scoreLead({
    industry: data.industry,
    interests: data.interests,
    projectStatus: data.projectStatus ?? null,
    budget,
    source: data.source,
    hasPhone: Boolean(data.phone),
    hasCompany: Boolean(data.company),
  });

  const now = new Date().toISOString();
  const sourceMeta = {
    ...(data.attribution ?? {}),
    userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    locale: data.locale,
    calculatorSummary,
    paymentModel,
    rentEstimate,
  };

  let leadId: string | null = null;
  if (isBackendConfigured()) {
    try {
      // Das Backend verknüpft die Kalkulation (calculator_request_id) und legt den "created"-Verlaufseintrag an.
      leadId = await insertLead({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        message: data.message || null,
        source: data.source,
        industry: data.industry,
        interests: data.interests,
        project_status: data.projectStatus ?? null,
        budget,
        estimate_min: estimate?.min ?? null,
        estimate_max: estimate?.max ?? null,
        monthly_estimate: estimate?.monthly ?? null,
        calculator_request_id: data.calculator?.requestId ?? null,
        score,
        score_reasons: reasons,
        tier,
        consent_at: now,
        source_meta: JSON.parse(JSON.stringify(sourceMeta)),
        ip_hash: hashIp(ip),
      });
    } catch (error) {
      console.error("[leads] Insert fehlgeschlagen", error);
      return NextResponse.json({ ok: false, error: "saveFailed" }, { status: 500 });
    }
  } else {
    console.info("[leads] Backend nicht konfiguriert – Lead nur geloggt:", { ...data, budget, score, tier });
  }

  // Flacher, sprechender Payload – n8n arbeitet ohne Mapping (Schema: docs/ARCHITECTURE.md)
  const lead = {
    id: leadId,
    createdAt: now,
    name: data.name,
    firstName: data.name.split(" ")[0],
    email: data.email,
    phone: data.phone || null,
    company: data.company || null,
    message: data.message || null,
    source: data.source,
    industry: data.industry,
    interests: data.interests,
    projectStatus: data.projectStatus ?? null,
    budget,
    estimate,
    paymentModel,
    rentEstimate,
    calculatorSummary,
    calculatorSummaryLocalized,
    locale: data.locale,
    score,
    scoreReasons: reasons,
    tier,
  };
  await Promise.all([
    sendLeadMails(lead),
    forwardToN8n("lead.created", {
      lead,
      meta: { attribution: data.attribution ?? {}, calculatorRequestId: data.calculator?.requestId ?? null },
    }),
  ]);

  return NextResponse.json({ ok: true, leadId, tier, score });
}
