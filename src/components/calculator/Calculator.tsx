"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Copy, Printer } from "lucide-react";
import type { CalcState } from "@/config/pricing";
import {
  computeEstimate,
  initialState,
  stepError,
  summaryRows,
  summaryText,
  visibleSteps,
  type PricingData,
} from "@/lib/pricing-engine";
import type { FunnelIndustry, InterestId, LeadTier } from "@/config/funnel";
import { getAttribution, getSessionId } from "@/lib/attribution";
import { submitLead } from "@/lib/submit-lead";
import { track } from "@/lib/track";
import { formatEUR, formatNumber, cn } from "@/lib/format";
import { CalcField } from "@/components/calculator/Fields";
import { QuoteSheet } from "@/components/calculator/QuoteSheet";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { ContactForm, type ContactValues } from "@/components/funnel/ContactForm";
import { LeadResult } from "@/components/funnel/LeadResult";

/**
 * Preisrechner – Aufbau & Logik nach asapmarketing.de/rechner.html:
 *  - links dunkle Info-Spalte mit Schrittleiste (erledigte Schritte anklickbar)
 *  - Verzweigung: gewählte Leistungen bestimmen die folgenden Schritte
 *  - sticky Leiste unten: Richtwert live ("ab" in Schritt 1, danach Spanne) + Zurück/Weiter
 *  - Ergebnis: Summenbox, Aufstellung als Rechnungs-Sheet, Kopieren, PDF, Anfrage
 *  - Pfeiltasten ← → navigieren
 */
export function Calculator({ data }: { data: PricingData }) {
  const [s, setS] = useState<CalcState>(() => initialState());
  const [current, setCurrent] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ tier: LeadTier; name: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const loggedState = useRef<string>("");

  useEffect(() => setMounted(true), []);

  const steps = useMemo(() => visibleSteps(s), [s]);
  const idx = Math.min(current, steps.length - 1);
  const step = steps[idx];
  const isResult = Boolean(step.ergebnis);
  const live = useMemo(() => computeEstimate(s, idx, data), [s, idx, data]);
  const full = useMemo(() => computeEstimate(s, Number.POSITIVE_INFINITY, data), [s, data]);
  const rows = useMemo(() => summaryRows(s, data), [s, data]);

  const leistungen = (s.leistungen as string[]) ?? [];
  const industry: FunnelIndustry = s.branche === "musik" ? "musik" : "gastro";
  const sheetTitle = `${leistungen.map((id) => data.optionen.leistungen.find((o) => o.id === id)?.label).join(" · ")} für ${industry === "musik" ? "Festival & Musik" : "Gastronomie"}`;

  const update = (id: string, value: CalcState[string]) => {
    setError(null);
    setS((prev) => ({ ...prev, [id]: value }));
  };

  const go = useCallback(
    (target: number) => {
      const list = visibleSteps(s);
      const t = Math.max(0, Math.min(target, list.length - 1));
      if (t > idx) {
        const err = stepError(list[idx], s);
        if (err) return setError(err);
      }
      setError(null);
      setDir(t > idx ? 1 : -1);
      setCurrent(t);
      setMaxReached((m) => Math.max(m, t));
      track("rechner_schritt", { schritt: list[t].id });
      requestAnimationFrame(() => {
        const top = (mainRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 88;
        if (Math.abs(top - window.scrollY) > 40) window.scrollTo({ top, behavior: "smooth" });
      });
    },
    [s, idx],
  );

  // Pfeiltasten wie bei asap (nicht in Eingabefeldern)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" && !isResult) go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, idx, isResult]);

  // Ergebnis erreicht → Kalkulation serverseitig protokollieren (einmal je Konfiguration)
  useEffect(() => {
    if (!isResult) return;
    const key = JSON.stringify(s);
    if (loggedState.current === key) return;
    loggedState.current = key;
    track("rechner_ergebnis", { von: full.von, bis: full.bis });
    fetch("/api/calculator", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state: s, sessionId: getSessionId(), attribution: getAttribution() }),
    })
      .then((r) => r.json())
      .then((j) => setRequestId(j?.id ?? null))
      .catch(() => setRequestId(null));
  }, [isResult, s, full.von, full.bis]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(s, full));
    } catch {
      /* Clipboard verweigert – still ignorieren */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const submit = async (v: ContactValues) => {
    setSubmitting(true);
    setServerError(null);
    const interests: InterestId[] = [];
    if (leistungen.includes("video")) interests.push(industry === "musik" ? "aftermovie" : "reels");
    if (leistungen.includes("foto")) interests.push("foto");
    if (leistungen.includes("web")) interests.push("web");
    if (leistungen.includes("ki")) interests.push("automation");
    if (s.contentAbo && s.contentAbo !== "keins") interests.push("social");
    if (Number(s.sprachen) > 0) interests.push("ki_content");

    const res = await submitLead({
      source: "rechner",
      industry,
      interests: interests.length ? interests : ["unsicher"],
      projectStatus: null,
      budget: "keine_angabe", // wird serverseitig aus der Kalkulation abgeleitet
      name: v.name,
      email: v.email,
      phone: v.phone,
      company: v.company,
      message: v.message,
      consent: true,
      website: v.website,
      calculator: { state: s, requestId },
    });
    setSubmitting(false);
    if (!res.ok) return setServerError(res.error);
    track("rechner_anfrage", { tier: res.tier });
    setDone({ tier: res.tier, name: v.name, email: v.email });
  };

  const nextLabel = idx === steps.length - 2 ? "Ergebnis anzeigen" : "Weiter";

  return (
    <div className="lg:grid lg:min-h-[calc(100dvh-72px)] lg:grid-cols-[340px_1fr]">
      {/* ─── Info-Spalte mit Schrittleiste ─── */}
      <aside className="glow-box px-5 pt-10 pb-8 text-white sm:px-8 lg:sticky lg:top-[72px] lg:h-[calc(100dvh-72px)] lg:overflow-y-auto lg:pt-10">
        <p className="tag-line text-teal-light">Preisrechner</p>
        <h1 className="mt-4 text-[clamp(1.8rem,3vw,2.3rem)] leading-tight font-extrabold tracking-tight">Was kostet mein Projekt?</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mist">Stell dein Projekt zusammen und sieh sofort den Rahmen. Richtwert, kein Angebot.</p>

        {/* Desktop: vertikale Schrittleiste */}
        <ol className="mt-8 hidden flex-col gap-px lg:flex" aria-label="Schritte">
          {steps.map((st, i) => {
            const state = i === idx ? "aktiv" : i <= maxReached ? "erledigt" : "offen";
            return (
              <li key={st.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  disabled={i > maxReached && i > idx}
                  aria-current={i === idx ? "step" : undefined}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 border-l-[3px] py-2 pl-4 text-left text-[15px] transition-colors disabled:cursor-default",
                    state === "aktiv" && "border-teal font-semibold text-white",
                    state === "erledigt" && "border-white/45 text-white hover:border-teal-light",
                    state === "offen" && "border-white/12 text-white/45",
                  )}
                >
                  <span
                    className={cn(
                      "num grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                      state === "aktiv" && "bg-teal text-ink-950",
                      state === "erledigt" && "bg-white/85 text-ink-900",
                      state === "offen" && "bg-white/10 text-white/60",
                    )}
                  >
                    {state === "erledigt" ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                  </span>
                  {st.kurz}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Mobil: aktueller Schritt + Balken */}
        <div className="mt-7 lg:hidden">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-semibold">{step.kurz}</span>
            <span className="num text-sm text-haze">
              Schritt {idx + 1} von {steps.length}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-teal transition-[width] duration-500" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      </aside>

      {/* ─── Frage-Bereich ─── */}
      <div ref={mainRef} className="relative flex min-w-0 flex-col">
        <div className="flex-1 px-5 pt-8 pb-10 sm:px-10 lg:pt-12">
          <div className="max-w-[840px]">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.section
                key={step.id}
                custom={dir}
                initial={{ opacity: 0, x: 28 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 * dir, transition: { duration: 0.18 } }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                aria-labelledby={`step-${step.id}`}
              >
                <h2 id={`step-${step.id}`} className="text-[clamp(1.4rem,3.2vw,1.9rem)] font-extrabold tracking-tight text-ink">
                  {step.titel}
                </h2>
                {step.hint && <p className="mt-2 max-w-[60ch] text-[15px] text-muted">{step.hint}</p>}

                {!isResult && (
                  <div className="mt-8 space-y-9">
                    {step.felder
                      .filter((f) => (f.wenn ? f.wenn(s) : true))
                      .map((f) => (
                        <CalcField key={f.id} field={f} state={s} options={data.optionen} onChange={update} />
                      ))}
                  </div>
                )}

                {isResult && (
                  <div className="mt-8">
                    <div className="glow-box rounded-[22px] p-7 text-white shadow-[0_24px_60px_rgb(90_174_184/0.2)] sm:p-8">
                      <p className="text-xs font-bold tracking-[0.14em] text-teal-light uppercase">Einmalige Kosten</p>
                      <p className="num mt-1 text-[clamp(1.8rem,4.6vw,2.6rem)] leading-tight font-extrabold tracking-tight">
                        {formatNumber(full.von)} – {formatNumber(full.bis)} €
                      </p>
                      <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-white/10 pt-4">
                        <span className="text-xs font-bold tracking-[0.14em] text-teal-light uppercase">Laufend pro Monat</span>
                        <b className="num text-lg">{full.summeMtl > 0 ? formatEUR(full.summeMtl) : "keine"}</b>
                      </p>
                      <p className="mt-4 text-[13px] leading-relaxed text-mist">
                        <b className="text-white">Richtwert, kein Angebot.</b> Die Spanne beruht allein auf deinen Angaben. Was dein Projekt wirklich braucht,
                        besprechen wir gemeinsam – danach nennen wir einen festen Preis.
                      </p>
                    </div>

                    <details className="group mt-5 overflow-hidden rounded-2xl border border-line bg-white">
                      <summary className="flex min-h-14 list-none items-center justify-between px-5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                        Wie kommt der Betrag zustande?
                        <span className="text-xl text-muted transition-transform group-open:rotate-45" aria-hidden>
                          +
                        </span>
                      </summary>
                      <div className="border-t border-line bg-fog p-3 sm:p-5">
                        <QuoteSheet estimate={full} rows={rows} title={sheetTitle} className="rounded-xl shadow-[var(--shadow-card)]" />
                      </div>
                    </details>

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-5 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal-deep">
                        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                        {copied ? "Kopiert" : "Zusammenfassung kopieren"}
                      </button>
                      <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-5 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal-deep">
                        <Printer className="size-4" aria-hidden /> Als PDF speichern
                      </button>
                    </div>

                    <div id="angebot" className="mt-10 scroll-mt-28 rounded-3xl border border-teal/20 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
                      {done ? (
                        <LeadResult tier={done.tier} name={done.name} email={done.email} industry={industry} />
                      ) : (
                        <>
                          <h3 className="text-xl font-extrabold tracking-tight text-ink">Angebot anfordern</h3>
                          <p className="mt-1.5 mb-6 text-sm text-muted">
                            Wir prüfen deine Zusammenstellung und melden uns innerhalb von 24 Stunden. Unverbindlich – aus der Anfrage entsteht keine Beauftragung.
                          </p>
                          <ContactForm idPrefix="rechner" submitLabel="Angebot anfordern" submitting={submitting} serverError={serverError} onSubmit={submit} />
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.section>
            </AnimatePresence>

            {error && (
              <p role="alert" className="mt-6 text-sm font-semibold text-danger">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* ─── Sticky Richtwert-Leiste ─── */}
        <div className="sticky bottom-0 z-20 border-t border-line bg-white/95 px-5 py-3.5 backdrop-blur-xl sm:px-10">
          <div className="flex max-w-[840px] items-center gap-3">
            <div className="min-w-0 flex-1" aria-live="polite">
              <p className="text-xs text-muted">
                {idx === 0 ? "Einstiegspreis" : "Richtwert einmalig"}
                {idx > 0 && live.summeMtl > 0 && <> · dazu {formatEUR(live.summeMtl)}/Monat</>}
              </p>
              <p className="truncate text-[clamp(1rem,3.4vw,1.3rem)] font-extrabold tracking-tight text-ink">
                {idx === 0 ? (
                  <>
                    ab <AnimatedNumber value={live.ab} /> €
                  </>
                ) : (
                  <>
                    <AnimatedNumber value={live.von} /> – <AnimatedNumber value={live.bis} /> €
                  </>
                )}
              </p>
            </div>
            {idx > 0 && (
              <button type="button" onClick={() => go(idx - 1)} aria-label="Zurück" className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-line text-body hover:border-ink/40 sm:w-auto sm:px-5">
                <ArrowLeft className="size-4 sm:hidden" aria-hidden />
                <span className="hidden sm:inline">Zurück</span>
              </button>
            )}
            {isResult ? (
              <a href="#angebot" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-teal px-5 font-semibold text-ink-950 shadow-[var(--shadow-teal)] sm:px-7">
                Angebot anfordern
              </a>
            ) : (
              <button type="button" onClick={() => go(idx + 1)} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-teal px-5 font-semibold text-ink-950 shadow-[var(--shadow-teal)] transition hover:bg-teal-light sm:px-7">
                {nextLabel} <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Druckvorlage (PDF) – liegt außerhalb der Seite, nur beim Drucken sichtbar */}
      {mounted &&
        createPortal(
          <div className="print-root">
            <QuoteSheet estimate={full} rows={rows} title={sheetTitle} />
          </div>,
          document.body,
        )}
    </div>
  );
}
