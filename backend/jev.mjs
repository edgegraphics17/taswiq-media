/**
 * Jev AI (https://thejevai.com) – typisierte Entscheidungen für die Lead-Qualifizierung.
 * Ein Aufruf pro Lead, drei Fragen (Priorität, Spam, Paket) laufen bei Jev parallel.
 *
 * Schutz der Credits und der Leads:
 *  - Tageslimit (JEV_DAILY_LIMIT, Standard 50); der Slot wird VOR dem Aufruf reserviert
 *  - Timeout 8 s, kein automatischer Retry (429/529 kosten sonst doppelt) – der Lead ist längst gespeichert
 *  - Fehler blockieren nie den Lead: das bestehende Scoring (src/lib/lead-scoring.ts) bleibt die Grundlage
 *  - Datenschutz: Name, E-Mail, Telefon und Firma werden NICHT gesendet, nur Branche, Interessen, Budget,
 *    Projektstatus, Schätzung und der (gekürzte) Freitext der Anfrage
 * Antworten werden strikt validiert (kein Cast auf ein Wunschformat).
 */
import { randomUUID } from "node:crypto";

const ENDPOINT = "https://thejevai.com/v1/systemone";
const PACKAGES = ["starter", "growth", "premium"];

const QUESTIONS = {
  priority: {
    type: "score",
    instructions:
      "Wie verkaufsreif und dringend ist diese Anfrage für eine Software-Agentur (Bestell- und Buchungssysteme, Web-Apps, Websites, KI-Automatisierung, Premium-Video)?",
    criteria: ["Niedrig", "Mittel", "Hoch", "Sehr hoch"],
  },
  spam: {
    type: "noul",
    instructions: "Ist das Spam, ein Test oder keine echte Geschäftsanfrage?",
    criteria: { true: "Spam, Test, sinnlos oder unpassend", false: "Echte, ernstzunehmende Anfrage" },
  },
  package: {
    type: "choice",
    instructions: "Welches Einstiegspaket passt am besten zu dieser Anfrage?",
    criteria: {
      starter: "Kleines Budget oder einfaches Vorhaben (z. B. One-Pager, einzelne Funktion)",
      growth: "Mittleres Vorhaben mit klarem Bedarf (z. B. Bestell- oder Buchungssystem)",
      premium: "Großes Vorhaben, mehrere Systeme oder hohes Budget",
    },
  },
};

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const clamp01 = (v) => (v === null ? null : Math.min(1, Math.max(0, v)));

/** Antwort prüfen und auf unser Ergebnisformat abbilden – null bei jeder Abweichung. */
export function parseAnswers(data) {
  const a = data?.answers;
  if (!a || typeof a !== "object") return null;
  const priority = num(a.priority?.score);
  const spam = clamp01(num(a.spam?.noul));
  const pkg = a.package?.choice;
  if (priority === null || spam === null || !PACKAGES.includes(pkg)) return null;
  return {
    priority: Math.min(3, Math.max(0, priority)), // 0 = niedrig … 3 = sehr hoch
    priority_confidence: clamp01(num(a.priority?.confidence)),
    spam,
    package: pkg,
    package_confidence: clamp01(num(a.package?.confidence)),
  };
}

export function createJev({ db, apiKey = process.env.JEV_API_KEY, dailyLimit = Number(process.env.JEV_DAILY_LIMIT ?? 50), fetchImpl = fetch, log = console }) {
  if (!apiKey) return { enabled: false, qualify: async () => ({ skipped: "disabled" }), usage: () => ({ enabled: false }) };

  db.exec(
    "create table if not exists jev_usage (day text primary key, calls integer not null default 0, input_tokens integer not null default 0, output_tokens integer not null default 0)",
  );
  const day = () => new Date().toISOString().slice(0, 10);
  const calls = () => db.prepare("select calls from jev_usage where day = ?").get(day())?.calls ?? 0;

  /** Slot reservieren; false, wenn das Tageslimit erreicht ist. */
  const reserve = () => {
    if (calls() >= dailyLimit) return false;
    db.prepare("insert into jev_usage (day, calls) values (?, 1) on conflict (day) do update set calls = calls + 1").run(day());
    return true;
  };

  async function qualify(lead) {
    if (!reserve()) return { skipped: "limit" };
    const state = {
      branche: lead.industry,
      interessen: lead.interests,
      budget: lead.budget,
      projektstatus: lead.project_status ?? null,
      quelle: lead.source ?? "funnel",
      schaetzung_eur: { min: lead.estimate_min ?? null, max: lead.estimate_max ?? null, monatlich: lead.monthly_estimate ?? null },
      telefon_angegeben: Boolean(lead.phone),
      firma_angegeben: Boolean(lead.company),
      nachricht: String(lead.message ?? "").slice(0, 1000),
    };
    try {
      const res = await fetchImpl(ENDPOINT, {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ model: "jev-latest", state, questions: QUESTIONS }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        log.warn(`[jev] HTTP ${res.status} – Lead ${lead.id} bleibt beim Standard-Scoring`);
        return { skipped: `http_${res.status}` };
      }
      const body = await res.json();
      // Echte Antwort: { code, message, data: { result: { answers, usage }, creditsUsed } } – flaches Format bleibt erlaubt.
      const data = body?.data?.result ?? body;
      const parsed = parseAnswers(data);
      if (!parsed) {
        // Nur die Antwort-Struktur loggen (Jev sieht keine Kontaktdaten, die Antwort enthält keine) – zum Nachziehen des Parsers.
        log.warn(`[jev] Antwort hatte nicht das erwartete Format: ${JSON.stringify(body).slice(0, 700)}`);
        return { skipped: "bad_response" };
      }
      const usage = data.usage ?? {};
      db.prepare("update jev_usage set input_tokens = input_tokens + ?, output_tokens = output_tokens + ? where day = ?").run(
        num(usage.input_tokens) ?? 0,
        num(usage.output_tokens) ?? 0,
        day(),
      );
      const model = [data.model, body?.model].find((m) => typeof m === "string") ?? null;
      const result = { ...parsed, model, credits: num(body?.data?.creditsUsed), at: new Date().toISOString() };
      save(lead.id, result);
      return result;
    } catch (e) {
      log.warn(`[jev] Aufruf fehlgeschlagen: ${e?.name ?? "Fehler"}`);
      return { skipped: "error" };
    }
  }

  const LEVELS = ["niedrig", "mittel", "hoch", "sehr hoch"];
  function save(leadId, r) {
    db.prepare("update leads set automation = json_set(automation, '$.jev', json(?)) where id = ?").run(JSON.stringify(r), leadId);
    const body = `Jev: Priorität ${LEVELS[Math.round(r.priority)]} · Paket ${r.package} · Spam-Risiko ${Math.round(r.spam * 100)} %`;
    db.prepare("insert into lead_events (id, lead_id, type, body, payload, created_at) values (?, ?, 'automation', ?, ?, ?)").run(
      randomUUID(),
      leadId,
      body,
      JSON.stringify({ source: "jev", ...r }),
      r.at,
    );
  }

  return {
    enabled: true,
    qualify,
    usage: () => ({ enabled: true, today: calls(), limit: dailyLimit }),
  };
}
