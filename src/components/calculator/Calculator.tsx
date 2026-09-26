"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calculator as CalcIcon, Check, ChevronDown, Copy, Printer } from "lucide-react";
import type { CalcState } from "@/config/pricing";
import { computeEstimate, initialState, stepError, summaryRows, summaryText, visibleSteps, type PricingData } from "@/lib/pricing-engine";
import type { FunnelIndustry, InterestId, LeadTier } from "@/config/funnel";
import { getAttribution, getSessionId } from "@/lib/attribution";
import { submitLead, type ServerErrorCode } from "@/lib/submit-lead";
import { asTranslator, localizeOptions, stepCopy, type CalcI18n } from "@/lib/pricing-i18n";
import { track } from "@/lib/track";
import { eurAffix, formatEUR, formatNumber, cn } from "@/lib/format";
import { CalcField } from "@/components/calculator/Fields";
import { QuoteSheet } from "@/components/calculator/QuoteSheet";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { ContactForm, type ContactValues } from "@/components/funnel/ContactForm";
import { LeadResult } from "@/components/funnel/LeadResult";

/**
 * Preisrechner – Soft UI.
 *  - Schritte als Pillen-Leiste (erledigte anklickbar), verzweigt nach gewählten Leistungen
 *  - große Auswahlkarten mit violettem Ring
 *  - Desktop: sticky schwarze Kontrast-Karte mit Live-Richtwert; Mobil: schwebende Preis-Pille unten
 *  - Ergebnis: Aufstellung als Angebotsblatt, Kopieren, PDF, Anfrage
 *  - Pfeiltasten ← → navigieren
 */
export function Calculator({ data: rawData }: { data: PricingData }) {
  const tr = useTranslations("calculator");
  const tc = useTranslations("common");
  const locale = useLocale();
  const i18n = useMemo<CalcI18n>(() => ({ t: asTranslator(tr), locale }), [tr, locale]);
  // Preise aus Supabase, Texte aus messages/{de,en}.json
  const data = useMemo(() => localizeOptions(rawData, i18n), [rawData, i18n]);
  const eur = eurAffix(locale);
  const [s, setS] = useState<CalcState>(() => initialState());
  const [current, setCurrent] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<ServerErrorCode | null>(null);
  const [done, setDone] = useState<{ tier: LeadTier; name: string; email: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const loggedState = useRef<string>("");

  useEffect(() => setMounted(true), []);

  const steps = useMemo(() => visibleSteps(s), [s]);
  const idx = Math.min(current, steps.length - 1);
  const step = steps[idx];
  const isResult = Boolean(step.ergebnis);
  const copy = useMemo(() => stepCopy(i18n, step), [i18n, step]);
  const live = useMemo(() => computeEstimate(s, idx, data, i18n), [s, idx, data, i18n]);
  const full = useMemo(() => computeEstimate(s, Number.POSITIVE_INFINITY, data, i18n), [s, data, i18n]);
  const rows = useMemo(() => summaryRows(s, data, i18n), [s, data, i18n]);

  const leistungen = (s.leistungen as string[]) ?? [];
  const industry: FunnelIndustry = s.branche === "musik" ? "musik" : "gastro";
  const sheetTitle = tr("sheetTitle", {
    services: leistungen.map((id) => data.optionen.leistungen.find((o) => o.id === id)?.label).join(" · "),
    industry: tr(`industries.${industry === "musik" ? "musik" : "gastro"}`),
  });

  const update = (id: string, value: CalcState[string]) => {
    setError(null);
    setS((prev) => ({ ...prev, [id]: value }));
  };

  const go = useCallback(
    (target: number) => {
      const list = visibleSteps(s);
      const t = Math.max(0, Math.min(target, list.length - 1));
      if (t > idx) {
        const err = stepError(list[idx], s, i18n);
        if (err) return setError(err);
      }
      setError(null);
      setDir(t > idx ? 1 : -1);
      setCurrent(t);
      setMaxReached((m) => Math.max(m, t));
      track("rechner_schritt", { schritt: list[t].id });
      requestAnimationFrame(() => {
        const top = (topRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 96;
        if (window.scrollY > top + 40) window.scrollTo({ top, behavior: "smooth" });
      });
    },
    [s, idx, i18n],
  );

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

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText(s, full, data, i18n));
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
      locale,
      calculator: { state: s, requestId },
    });
    setSubmitting(false);
    if (!res.ok) return setServerError(res.error);
    track("rechner_anfrage", { tier: res.tier });
    setDone({ tier: res.tier, name: v.name, email: v.email });
  };

  const nextLabel = idx === steps.length - 2 ? tr("showResult") : tc("next");
  const priceLabel = idx === 0 ? tr("entryPrice") : tr("estimateOneTime");
  const money = (n: number) => (
    <>
      {eur.pre}
      <AnimatedNumber value={n} locale={locale} />
      {eur.post}
    </>
  );
  const price = (className?: string) =>
    idx === 0 ? (
      <span className={cn("num", className)}>{tr.rich("from", { amount: () => money(live.ab) })}</span>
    ) : (
      <span className={cn("num", className)}>
        {eur.pre}
        <AnimatedNumber value={live.von} locale={locale} /> – {money(live.bis)}
      </span>
    );

  return (
    <div className="container-x pt-28 pb-32 sm:pt-32 lg:pb-20">
      {/* Kopf */}
      <div ref={topRef} className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow icon={CalcIcon}>{tr("eyebrow")}</Eyebrow>
        </div>
        <h1 className="mt-4 text-[clamp(2.3rem,5vw,3.8rem)] leading-[1.03] font-medium">
          {tr("titleStart")} <span className="text-brand-500">{tr("titleAccent")}</span>
        </h1>
        <p className="mt-3 text-[15px] text-muted">{tr("sub")}</p>
      </div>

      {/* Schritt-Pillen */}
      <nav aria-label={tr("stepsAria")} className="mt-8 -mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
        <ol className="mx-auto flex w-fit gap-1.5 rounded-full border border-line bg-white p-1.5 shadow-[var(--shadow-soft)]">
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
                    "flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all duration-300 disabled:cursor-default",
                    state === "aktiv" && "bg-brand-500 text-white shadow-[var(--shadow-brand)]",
                    state === "erledigt" && "text-brand-600 hover:bg-brand-50",
                    state === "offen" && "text-muted/70",
                  )}
                >
                  {state === "erledigt" ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <span className="num text-xs opacity-70">{i + 1}</span>}
                  {stepCopy(i18n, st).kurz}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1fr_360px]">
        {/* ─── Frage-Bereich ─── */}
        <div className="card min-w-0 overflow-hidden p-5 sm:p-8">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.section
              key={step.id}
              custom={dir}
              initial={{ opacity: 0, x: 40 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 * dir, transition: { duration: 0.18 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby={`step-${step.id}`}
            >
              <p className="num text-sm font-medium text-brand-600">
                {tr("stepOf", { current: idx + 1, total: steps.length })}
              </p>
              <h2 id={`step-${step.id}`} className="mt-1.5 text-[clamp(1.5rem,3vw,2rem)] leading-tight font-medium">
                {copy.titel}
              </h2>
              {copy.hint && <p className="mt-2 max-w-[60ch] text-[15px] text-muted">{copy.hint}</p>}

              {!isResult && (
                <div className="mt-8 space-y-8">
                  {step.felder
                    .filter((f) => (f.wenn ? f.wenn(s) : true))
                    .map((f) => (
                      <CalcField key={f.id} field={f} state={s} options={data.optionen} onChange={update} i18n={i18n} />
                    ))}
                </div>
              )}

              {isResult && (
                <div className="mt-8 space-y-4">
                  {/* Ergebnis als schwarze Kontrast-Karte */}
                  <div className="card-night relative overflow-hidden p-7 sm:p-9">
                    <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.45),transparent)]" aria-hidden />
                    <p className="relative text-sm text-night-muted">{tr("oneTimeCosts")}</p>
                    <p className="num relative mt-1 text-[clamp(2.2rem,5.4vw,3.4rem)] leading-none font-medium tracking-tight text-white">
                      {eur.pre}
                      {formatNumber(full.von, locale)} – {eur.pre}
                      {formatNumber(full.bis, locale)}
                      {eur.post}
                    </p>
                    <div className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                      <span className="size-2 rounded-full bg-mint-400" aria-hidden />
                      {tr("monthlyLabel")} <b className="num font-medium">{full.summeMtl > 0 ? formatEUR(full.summeMtl, locale) : tr("none")}</b>
                    </div>
                    <p className="relative mt-5 max-w-lg text-[13px] leading-relaxed text-night-muted">
                      <b className="font-medium text-white">{tr("disclaimerStrong")}</b> {tr("disclaimer")}
                    </p>
                  </div>

                  <details className="group overflow-hidden rounded-3xl border border-line bg-white">
                    <summary className="flex min-h-14 list-none items-center justify-between px-6 font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {tr("howCalculated")}
                      <ChevronDown className="size-5 text-muted transition-transform duration-300 group-open:rotate-180" aria-hidden />
                    </summary>
                    <div className="border-t border-line bg-canvas p-3 sm:p-5">
                      <QuoteSheet estimate={full} rows={rows} title={sheetTitle} className="rounded-3xl shadow-[var(--shadow-soft)]" />
                    </div>
                  </details>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copySummary} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-canvas px-5 text-sm font-medium text-ink transition hover:bg-brand-50 hover:text-brand-600">
                      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                      {copied ? tr("copied") : tr("copy")}
                    </button>
                    <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-canvas px-5 text-sm font-medium text-ink transition hover:bg-brand-50 hover:text-brand-600">
                      <Printer className="size-4" aria-hidden /> {tr("pdf")}
                    </button>
                  </div>

                  <div id="angebot" className="scroll-mt-28 rounded-[2rem] border border-brand-100 bg-brand-50/60 p-5 sm:p-8">
                    {done ? (
                      <LeadResult tier={done.tier} name={done.name} email={done.email} industry={industry} />
                    ) : (
                      <>
                        <h3 className="text-2xl font-medium">{tr("requestTitle")}</h3>
                        <p className="mt-1.5 mb-6 text-sm text-muted">{tr("requestText")}</p>
                        <ContactForm idPrefix="rechner" submitLabel={tr("requestSubmit")} submitting={submitting} serverError={serverError} onSubmit={submit} />
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.section>
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-6 text-sm font-medium text-danger">
              {error}
            </p>
          )}
        </div>

        {/* ─── Desktop: sticky schwarze Preis-Karte ─── */}
        <aside className="card-night sticky top-28 hidden overflow-hidden p-6 lg:block" aria-live="polite">
          <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.4),transparent)]" aria-hidden />
          <p className="relative text-sm text-night-muted">{priceLabel}</p>
          {price("relative mt-1 block text-[2.1rem] leading-tight font-medium tracking-tight text-white")}
          {idx > 0 && live.summeMtl > 0 && (
            <p className="relative mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
              <span className="size-1.5 rounded-full bg-mint-400" aria-hidden /> {tr("plusMonthly", { amount: formatEUR(live.summeMtl, locale) })}
            </p>
          )}
          {live.einmalig.length > 0 && idx > 0 && (
            <ul className="relative mt-5 max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {live.einmalig.map((l) => (
                <li key={l.key} className="flex justify-between gap-3 rounded-full bg-white/[0.06] px-3.5 py-2 text-[13px]">
                  <span className="truncate text-night-muted">{l.label}</span>
                  <span className="num shrink-0 text-white">{formatEUR(l.betrag, locale)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="relative mt-6 flex gap-2">
            {idx > 0 && (
              <button type="button" onClick={() => go(idx - 1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-medium text-white hover:bg-white/10">
                <ArrowLeft className="size-4" aria-hidden /> {tc("back")}
              </button>
            )}
            {isResult ? (
              <a href="#angebot" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-medium text-white shadow-[var(--shadow-brand)]">
                {tr("requestTitle")}
              </a>
            ) : (
              <button type="button" onClick={() => go(idx + 1)} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 text-sm font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600">
                {nextLabel} <ArrowRight className="size-4" aria-hidden />
              </button>
            )}
          </div>
          <p className="relative mt-4 text-center text-xs text-night-muted">{tr("keyboardTip")}</p>
        </aside>
      </div>

      {/* ─── Mobil: schwebende Preis-Pille ─── */}
      <div className="fixed inset-x-3 bottom-3 z-30 lg:hidden">
        <div className="flex items-center gap-2 rounded-full bg-night p-1.5 pl-5 text-white shadow-[var(--shadow-float)]" aria-live="polite">
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[11px] text-night-muted">
              {priceLabel}
              {idx > 0 && live.summeMtl > 0 && <> · {tr("plusMonthlyShort", { amount: formatEUR(live.summeMtl, locale) })}</>}
            </p>
            {price("block truncate text-base font-medium")}
          </div>
          {idx > 0 && (
            <button type="button" onClick={() => go(idx - 1)} aria-label={tc("back")} className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10">
              <ArrowLeft className="size-4" aria-hidden />
            </button>
          )}
          {isResult ? (
            <a href="#angebot" className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-brand-500 px-4 text-sm font-medium">
              {tr("request")}
            </a>
          ) : (
            <button type="button" onClick={() => go(idx + 1)} className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand-500 px-4 text-sm font-medium">
              {idx === steps.length - 2 ? tr("resultShort") : tc("next")} <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* Druckvorlage (PDF) – außerhalb der Seite, nur beim Drucken sichtbar */}
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
