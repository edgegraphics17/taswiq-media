import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { getLead } from "@/lib/admin/data";
import { addNote, markLeadTest, updateLead } from "@/app/admin/actions";
import { BUDGET_LABEL, INDUSTRY_LABEL, SOURCE_LABEL, STATUS_LABEL } from "@/lib/admin/labels";
import { LEAD_STATUSES, type Json } from "@/types/database";
import { getTranslations } from "next-intl/server";
import { formatDateTime, formatNumber } from "@/lib/format";
import { ScoreBar, StatusPill, TestPill, TierPill } from "@/components/admin/Pills";

const JEV_LEVELS = ["Niedrig", "Mittel", "Hoch", "Sehr hoch"];

/** Jev-Ergebnis aus lead.automation lesen – strikt geprüft, weil das JSON von außen befüllt wird. */
function readJev(automation: Json): { priority: number; spam: number; package: string } | null {
  const j = (automation as { jev?: Record<string, unknown> } | null)?.jev;
  if (!j || typeof j.priority !== "number" || typeof j.spam !== "number" || typeof j.package !== "string") return null;
  return { priority: j.priority, spam: j.spam, package: j.package };
}

const EVENT_LABEL = { created: "Lead erstellt", status_change: "Status geändert", note: "Notiz", email_sent: "E-Mail gesendet", call: "Anruf", automation: "Automation" } as const;

export default async function LeadDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; demo?: string; error?: string }>;
}) {
  const [{ id }, flags] = await Promise.all([params, searchParams]);
  const data = await getLead(id);
  if (!data) notFound();
  const { lead, events } = data;
  // Dashboard ist deutsch – Funnel-Labels aus derselben Quelle wie die Website
  const tf = await getTranslations({ locale: "de", namespace: "funnel" });
  const leadLocale = (lead.source_meta as { locale?: string } | null)?.locale;
  const calc = (lead.source_meta as { calculatorSummary?: { label: string; wert: string }[] } | null)?.calculatorSummary;
  const jev = readJev(lead.automation);
  const wa = lead.phone ? `https://wa.me/${lead.phone.replace(/[^\d]/g, "")}` : null;

  return (
    <div className="mx-auto max-w-[1100px]">
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-600">
        <ArrowLeft className="size-4" aria-hidden /> Alle Leads
      </Link>

      {flags.saved && <p role="status" className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Gespeichert.</p>}
      {flags.demo && <p role="status" className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Demo-Modus – nichts gespeichert.</p>}
      {flags.error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">Speichern fehlgeschlagen. Prüfe die Eingaben und versuch es erneut.</p>}

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{lead.name}</h1>
          <p className="mt-1 text-muted">
            {lead.company ?? "–"} · eingegangen {formatDateTime(lead.created_at)} über {SOURCE_LABEL[lead.source]}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusPill status={lead.status} />
            <TierPill tier={lead.tier} />
            <ScoreBar score={lead.score} />
            {lead.is_test && <TestPill />}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${lead.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink">
            <Mail className="size-4" aria-hidden /> E-Mail
          </a>
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink">
              <Phone className="size-4" aria-hidden /> Anrufen
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white">
              <MessageCircle className="size-4" aria-hidden /> WhatsApp
            </a>
          )}
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-sm font-bold text-ink">Anfrage</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">E-Mail</dt><dd className="font-medium text-ink">{lead.email}</dd></div>
              <div><dt className="text-muted">Telefon</dt><dd className="font-medium text-ink">{lead.phone ?? "–"}</dd></div>
              <div><dt className="text-muted">Branche</dt><dd className="font-medium text-ink">{INDUSTRY_LABEL[lead.industry] ?? lead.industry}</dd></div>
              <div><dt className="text-muted">Budget</dt><dd className="num font-medium text-ink">{lead.estimate_min ? `${formatNumber(lead.estimate_min)}–${formatNumber(lead.estimate_max ?? 0)} € (Rechner)` : BUDGET_LABEL[lead.budget]}</dd></div>
              <div><dt className="text-muted">Status laut Lead</dt><dd className="font-medium text-ink">{lead.project_status ? tf(`statuses.${lead.project_status}`) : "–"}</dd></div>
              <div><dt className="text-muted">Sprache der Anfrage</dt><dd className="font-medium text-ink">{leadLocale === "en" ? "Englisch" : "Deutsch"}</dd></div>
              <div><dt className="text-muted">Monatlich (Rechner)</dt><dd className="num font-medium text-ink">{lead.monthly_estimate ? `${formatNumber(lead.monthly_estimate)} €` : "–"}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-muted">Vorhaben</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {lead.interests.map((i) => (
                    <span key={i} className="rounded-full bg-canvas px-2.5 py-0.5 text-xs font-semibold text-ink">{tf.has(`interests.${i}`) ? tf(`interests.${i}`) : i}</span>
                  ))}
                </dd>
              </div>
              {lead.message && (
                <div className="sm:col-span-2"><dt className="text-muted">Nachricht</dt><dd className="mt-1 whitespace-pre-line text-ink">{lead.message}</dd></div>
              )}
            </dl>
          </section>

          {calc && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-sm font-bold text-ink">Kalkulation aus dem Rechner</h2>
              <dl className="mt-3 divide-y divide-line text-sm">
                {calc.map((r) => (
                  <div key={r.label} className="flex justify-between gap-4 py-2"><dt className="text-muted">{r.label}</dt><dd className="text-right font-medium text-ink">{r.wert}</dd></div>
                ))}
              </dl>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-sm font-bold text-ink">Warum dieser Score?</h2>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {lead.score_reasons.map((r) => (
                <li key={r} className="rounded-md bg-canvas px-2 py-1 text-xs text-body">{r}</li>
              ))}
            </ul>
          </section>

          {jev && (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-sm font-bold text-ink">Jev-Einschätzung</h2>
              <dl className="mt-2 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted">Priorität</dt>
                  <dd className="font-semibold text-ink">{JEV_LEVELS[Math.round(jev.priority)] ?? "–"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Passendes Paket</dt>
                  <dd className="font-semibold text-ink capitalize">{jev.package}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Spam-Risiko</dt>
                  <dd className={jev.spam >= 0.5 ? "font-semibold text-rose-700" : "font-semibold text-ink"}>{Math.round(jev.spam * 100)} %</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-muted">Automatische Einschätzung – Grundlage bleibt der Score oben.</p>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-sm font-bold text-ink">Verlauf</h2>
            <form action={addNote} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <label htmlFor="note" className="sr-only">Notiz</label>
              <input id="note" name="body" placeholder="Notiz hinzufügen, z. B. „Rückruf am Freitag“" className="h-11 flex-1 rounded-lg border border-line px-3 text-sm" />
              <button type="submit" className="h-11 rounded-lg bg-night px-4 text-sm font-semibold text-white">Speichern</button>
            </form>
            <ol className="mt-4 space-y-3 border-l-2 border-line pl-4">
              {events.map((e) => (
                <li key={e.id} className="relative text-sm">
                  <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full border-2 border-white bg-brand-500" aria-hidden />
                  <p className="font-semibold text-ink">
                    {EVENT_LABEL[e.type]}
                    {e.type === "status_change" && e.to_status && <> → {STATUS_LABEL[e.to_status]}</>}
                  </p>
                  {e.body && <p className="text-body">{e.body}</p>}
                  <p className="num text-xs text-muted">{formatDateTime(e.created_at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <form action={updateLead} className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6">
            <h2 className="text-sm font-bold text-ink">Kunden-Status</h2>
            <input type="hidden" name="id" value={lead.id} />
            <label className="mt-4 grid gap-1 text-xs font-semibold text-muted">
              Status
              <select name="status" defaultValue={lead.status} className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink">
                {LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </label>
            <label className="mt-3 grid gap-1 text-xs font-semibold text-muted">
              Auftragswert (€)
              <input name="deal_value" type="number" min={0} inputMode="numeric" defaultValue={lead.deal_value ?? ""} className="num h-11 rounded-lg border border-line px-3 text-sm text-ink" />
            </label>
            <label className="mt-3 grid gap-1 text-xs font-semibold text-muted">
              Nächster Schritt am
              <input name="next_action_at" type="datetime-local" defaultValue={lead.next_action_at?.slice(0, 16) ?? ""} className="h-11 rounded-lg border border-line px-3 text-sm text-ink" />
            </label>
            <label className="mt-3 grid gap-1 text-xs font-semibold text-muted">
              Interne Notiz
              <textarea name="owner_notes" rows={4} defaultValue={lead.owner_notes ?? ""} className="rounded-lg border border-line p-3 text-sm text-ink" />
            </label>
            <button type="submit" className="mt-4 h-11 w-full rounded-lg bg-brand-500 text-sm font-semibold text-white">Speichern</button>
          </form>

          <form action={markLeadTest} className="rounded-2xl border border-line bg-white p-5 text-sm">
            <h2 className="font-bold text-ink">Test-Eintrag</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {lead.is_test
                ? "Diese Anfrage ist als Test markiert. Sie bleibt gespeichert, zählt aber weder in Analytics noch im Zielfortschritt."
                : "Eigene Probe-Anfrage? Als Test markiert zählt sie in keiner Kennzahl mit. Gelöscht wird nichts."}
            </p>
            <input type="hidden" name="id" value={lead.id} />
            <input type="hidden" name="test" value={lead.is_test ? "0" : "1"} />
            <button type="submit" className="mt-3 h-11 w-full cursor-pointer rounded-lg border border-line bg-white text-sm font-semibold text-ink hover:bg-canvas">
              {lead.is_test ? "Test-Markierung entfernen" : "Als Test markieren"}
            </button>
          </form>

          <section className="rounded-2xl border border-line bg-white p-5 text-sm">
            <h2 className="font-bold text-ink">Automation (n8n)</h2>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-canvas p-3 text-xs text-body">{JSON.stringify(lead.automation as Json, null, 2)}</pre>
          </section>
        </aside>
      </div>
    </div>
  );
}
