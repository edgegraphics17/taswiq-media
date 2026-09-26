"use client";

import { useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CircleHelp,
  Clapperboard,
  Film,
  Megaphone,
  MonitorSmartphone,
  Music,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import {
  FUNNEL_STEPS,
  budgetBrackets,
  funnelIndustries,
  interests as INTERESTS,
  projectStatuses,
  type BudgetBracket,
  type FunnelIndustry,
  type InterestId,
  type LeadSource,
  type LeadTier,
  type ProjectStatus,
} from "@/config/funnel";
import { ContactForm, type ContactValues } from "@/components/funnel/ContactForm";
import { LeadResult } from "@/components/funnel/LeadResult";
import { submitLead } from "@/lib/submit-lead";
import { track } from "@/lib/track";
import { cn } from "@/lib/format";

const INTEREST_ICONS: Record<InterestId, LucideIcon> = {
  aftermovie: Clapperboard,
  reels: Film,
  foto: Camera,
  social: Megaphone,
  ki_content: Sparkles,
  automation: Workflow,
  web: MonitorSmartphone,
  musikvideo: Music,
  unsicher: CircleHelp,
};

/** Große Pillen-Option: Auswahl = weicher violetter Ring + Schatten. */
const pill = (on: boolean) =>
  cn(
    "relative flex min-h-14 cursor-pointer items-center gap-3 rounded-full border bg-white px-2 pr-5 text-[15px] font-medium transition-all duration-300 ease-[var(--ease-soft)] select-none",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500",
    on ? "border-transparent bg-brand-50 text-ink shadow-[var(--shadow-picked)] ring-2 ring-brand-500" : "border-line text-body hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-soft)]",
  );

/**
 * 4-Schritte-Kontakt-Funnel: Vorhaben → Status → Budget → Kontakt.
 * Soft UI: Schritte gleiten horizontal (Richtung folgt Vor/Zurück), alle Optionen
 * sind große Pillen, Fortschritt als Pillen-Leiste. Lead-Scoring-Abschluss je Budget.
 */
export function LeadFunnel({
  source = "funnel",
  initialIndustry = "gastro",
  initialInterests = [],
  idPrefix = "funnel",
}: {
  source?: LeadSource;
  initialIndustry?: FunnelIndustry;
  initialInterests?: InterestId[];
  idPrefix?: string;
}) {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [industry, setIndustry] = useState<FunnelIndustry>(initialIndustry);
  const [picked, setPicked] = useState<InterestId[]>(initialInterests);
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [budget, setBudget] = useState<BudgetBracket | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverFields, setServerFields] = useState<Record<string, string>>();
  const [done, setDone] = useState<{ tier: LeadTier; name: string; email: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const goTo = (next: number) => {
    setStepError(null);
    setDir(next > step ? 1 : -1);
    setStep(next);
    track("funnel_step", { step: next, source });
    setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 50);
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const next = () => {
    if (step === 1 && picked.length === 0) return setStepError("Wähle mindestens einen Bereich aus.");
    if (step === 2 && !status) return setStepError("Wähle aus, wo du gerade stehst.");
    if (step === 3 && !budget) return setStepError("Wähle eine Budget-Stufe – oder „Keine Angabe“.");
    goTo(step + 1);
  };

  // Einfachauswahl: nach kurzem visuellem Feedback automatisch weiter
  const choose = (fn: () => void) => {
    fn();
    setStepError(null);
    setTimeout(() => goTo(step + 1), 280);
  };

  const togglePick = (id: InterestId) => {
    setStepError(null);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const submit = async (v: ContactValues) => {
    setSubmitting(true);
    setServerError(null);
    const res = await submitLead({
      source,
      industry,
      interests: picked,
      projectStatus: status,
      budget: budget ?? "keine_angabe",
      name: v.name,
      email: v.email,
      phone: v.phone,
      company: v.company,
      message: v.message,
      consent: true,
      website: v.website,
    });
    setSubmitting(false);
    if (!res.ok) {
      setServerError(res.error);
      setServerFields(res.fields);
      return;
    }
    track("generate_lead", { tier: res.tier, source, currency: "EUR" });
    setDone({ tier: res.tier, name: v.name, email: v.email });
    cardRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const reset = () => {
    setDone(null);
    setDir(-1);
    setStep(1);
    setPicked(initialInterests);
    setStatus(null);
    setBudget(null);
  };

  const heading = (text: string, sub: string) => (
    <>
      <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-medium outline-none sm:text-[1.7rem]">
        {text}
      </h3>
      <p className="mt-1.5 text-sm text-muted">{sub}</p>
    </>
  );

  return (
    <div ref={cardRef} className="card relative scroll-mt-28 overflow-hidden p-5 sm:p-9">
      {done ? (
        <LeadResult tier={done.tier} name={done.name} email={done.email} industry={industry} onReset={reset} />
      ) : (
        <>
          {/* Fortschritt als Pillen-Leiste */}
          <ol className="grid grid-cols-4 gap-1.5 rounded-full bg-canvas p-1.5" aria-label="Fortschritt">
            {FUNNEL_STEPS.map((label, i) => {
              const n = i + 1;
              const state = n < step ? "done" : n === step ? "active" : "todo";
              return (
                <li
                  key={label}
                  aria-current={state === "active" ? "step" : undefined}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-full text-xs font-medium transition-all duration-500 ease-[var(--ease-soft)] sm:text-[13px]",
                    state === "active" && "bg-brand-500 text-white shadow-[var(--shadow-brand)]",
                    state === "done" && "bg-white text-brand-600",
                    state === "todo" && "text-muted",
                  )}
                >
                  {state === "done" ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <span className="num">{n}</span>}
                  <span className={cn(state !== "active" && "max-sm:sr-only")}>{label}</span>
                </li>
              );
            })}
          </ol>

          <div className="relative mt-8">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                custom={dir}
                initial={{ opacity: 0, x: reduced ? 0 : 48 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduced ? 0 : -32 * dir, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 1 && (
                  <fieldset>
                    <legend className="sr-only">Schritt 1 von 4: Vorhaben</legend>
                    {heading("Was ist dein Vorhaben?", "Wähle alle Bereiche, bei denen du Unterstützung brauchst.")}

                    <LayoutGroup id={`${idPrefix}-ind`}>
                      <div role="radiogroup" aria-label="Deine Branche" className="mt-5 inline-flex max-w-full flex-wrap gap-1 rounded-full bg-canvas p-1.5">
                        {funnelIndustries.map((ind) => (
                          <label key={ind.id} className={cn("relative min-h-10 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500", industry === ind.id ? "text-white" : "text-body hover:text-ink")}>
                            <input type="radio" name={`${idPrefix}-industry`} value={ind.id} checked={industry === ind.id} onChange={() => setIndustry(ind.id)} className="sr-only" />
                            {industry === ind.id && <motion.span layoutId="ind-pill" className="absolute inset-0 rounded-full bg-night" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                            <span className="relative">{ind.label}</span>
                          </label>
                        ))}
                      </div>
                    </LayoutGroup>

                    <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {INTERESTS.map((it) => {
                        const Ico = INTEREST_ICONS[it.id];
                        const on = picked.includes(it.id);
                        return (
                          <label key={it.id} className={cn(pill(on), it.id === "unsicher" && "sm:col-span-2")}>
                            <input type="checkbox" checked={on} onChange={() => togglePick(it.id)} className="sr-only" />
                            <span className={cn("grid size-10 shrink-0 place-items-center rounded-full transition-colors", on ? "bg-brand-500 text-white" : "bg-canvas text-muted")}>
                              <Ico className="size-[18px]" strokeWidth={1.75} aria-hidden />
                            </span>
                            <span className="flex-1 leading-tight">{it.label}</span>
                            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border transition-all", on ? "border-brand-500 bg-brand-500 text-white" : "border-line")} aria-hidden>
                              {on && <Check className="size-3" strokeWidth={3.5} />}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {step === 2 && (
                  <fieldset>
                    <legend className="sr-only">Schritt 2 von 4: Status</legend>
                    {heading("Wo stehst du mit deinem Content?", "Das hilft uns, den richtigen Einstieg für dich zu finden.")}
                    <div role="radiogroup" className="mt-6 grid gap-2.5">
                      {projectStatuses.map((s) => {
                        const on = status === s.id;
                        return (
                          <label key={s.id} className={cn(pill(on), "pl-5")}>
                            <input type="radio" name={`${idPrefix}-status`} checked={on} onChange={() => choose(() => setStatus(s.id))} className="sr-only" />
                            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all", on ? "border-brand-500" : "border-line")} aria-hidden>
                              <span className={cn("size-2.5 rounded-full bg-brand-500 transition-transform duration-300", on ? "scale-100" : "scale-0")} />
                            </span>
                            {s.label}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {step === 3 && (
                  <fieldset>
                    <legend className="sr-only">Schritt 3 von 4: Budget</legend>
                    {heading("Welches Budget hast du eingeplant?", "Kein Muss – aber so können wir dir passende Pakete empfehlen.")}
                    <div role="radiogroup" className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {budgetBrackets.map((b) => {
                        const on = budget === b.id;
                        return (
                          <label key={b.id} className={cn(pill(on), "num justify-center px-5 text-base", b.wide && "sm:col-span-2")}>
                            <input type="radio" name={`${idPrefix}-budget`} checked={on} onChange={() => choose(() => setBudget(b.id))} className="sr-only" />
                            {on && <Check className="size-4 text-brand-600" strokeWidth={3} aria-hidden />}
                            {b.label}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {step === 4 && (
                  <div>
                    {heading("Fast geschafft! Wie erreichen wir dich?", "Wir melden uns innerhalb von 24 Stunden – versprochen.")}
                    <div className="mt-6">
                      <ContactForm
                        idPrefix={idPrefix}
                        submitting={submitting}
                        serverError={serverError}
                        serverFields={serverFields}
                        onSubmit={submit}
                        footer={
                          <button type="button" onClick={() => goTo(3)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-canvas px-5 font-medium text-body transition hover:bg-line">
                            <ArrowLeft className="size-4" aria-hidden /> Zurück
                          </button>
                        }
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {stepError && (
            <p role="alert" className="mt-4 text-sm font-medium text-danger">
              {stepError}
            </p>
          )}

          {step < 4 && (
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button type="button" onClick={() => goTo(step - 1)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-canvas px-5 font-medium text-body transition hover:bg-line">
                  <ArrowLeft className="size-4" aria-hidden /> Zurück
                </button>
              ) : (
                <span className="text-xs text-muted">Dauert ca. 60 Sekunden</span>
              )}
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 hover:bg-brand-600"
              >
                Weiter <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
