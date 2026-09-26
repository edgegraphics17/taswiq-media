"use client";

import { useRef, useState } from "react";
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

/**
 * 4-Schritte-Kontakt-Funnel nach asapmarketing.de:
 *   1 Vorhaben (Mehrfachauswahl) → 2 Status → 3 Budget → 4 Kontakt
 * Übergänge mit asap-Wipe (zwei Teal-Flächen per clip-path), Fortschrittsleiste,
 * Inline-Validierung statt alert(), Lead-Scoring-Abschluss je Budget.
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
  const [wipe, setWipe] = useState<"fwd" | "rev" | null>(null);
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
  const busy = useRef(false);

  const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** asap triggerWipe: Fläche wischt über die Karte, bei 400 ms wird der Inhalt getauscht. */
  const goTo = (next: number) => {
    if (busy.current) return;
    setStepError(null);
    const swap = () => {
      setStep(next);
      track("funnel_step", { step: next, source });
      requestAnimationFrame(() => headingRef.current?.focus());
      const top = cardRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.4) {
        cardRef.current?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
      }
    };
    if (reduced()) return swap();
    busy.current = true;
    setWipe(next > step ? "fwd" : "rev");
    setTimeout(swap, 400);
    setTimeout(() => {
      setWipe(null);
      busy.current = false;
    }, 1000);
  };

  const next = () => {
    if (step === 1 && picked.length === 0) return setStepError("Wähle mindestens einen Bereich aus.");
    if (step === 2 && !status) return setStepError("Wähle aus, wo du gerade stehst.");
    if (step === 3 && !budget) return setStepError("Wähle eine Budget-Stufe – oder „Keine Angabe“.");
    goTo(step + 1);
  };

  const choose = (fn: () => void) => {
    fn();
    setStepError(null);
    // Einfachauswahl: automatisch weiter, nach kurzem Feedback
    setTimeout(() => goTo(step + 1), 320);
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
    cardRef.current?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };

  const reset = () => {
    setDone(null);
    setStep(1);
    setPicked(initialInterests);
    setStatus(null);
    setBudget(null);
  };

  const progress = ((step - 1) / (FUNNEL_STEPS.length - 1)) * 100;

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-3xl border border-teal/20 bg-white p-6 shadow-[var(--shadow-card)] sm:p-10"
    >
      {/* Wipe-Flächen */}
      {wipe && (
        <div className={cn("pointer-events-none absolute inset-0 z-50", wipe === "fwd" ? "wipe-fwd" : "wipe-rev")} aria-hidden>
          <div className="wipe-panel bg-teal-light" />
          <div className="wipe-panel bg-teal" />
        </div>
      )}

      {done ? (
        <LeadResult tier={done.tier} name={done.name} email={done.email} industry={industry} onReset={reset} />
      ) : (
        <>
          {/* Fortschritt */}
          <ol className="relative mb-9 flex justify-between" aria-label="Fortschritt">
            <span className="absolute top-[15px] right-4 left-4 h-0.5 bg-line" aria-hidden />
            <span
              className="absolute top-[15px] left-4 h-0.5 bg-teal transition-[width] duration-500"
              style={{ width: `calc((100% - 2rem) * ${progress / 100})` }}
              aria-hidden
            />
            {FUNNEL_STEPS.map((label, i) => {
              const n = i + 1;
              const state = n < step ? "done" : n === step ? "active" : "todo";
              return (
                <li key={label} className="relative z-10 flex flex-col items-center gap-2" aria-current={state === "active" ? "step" : undefined}>
                  <span
                    className={cn(
                      "num grid size-8 place-items-center rounded-full border-2 text-xs font-bold transition-all duration-400",
                      state === "todo" ? "border-line bg-line text-muted" : "border-teal bg-teal text-ink-950",
                      state === "active" && "shadow-[0_0_0_4px_rgb(90_174_184/0.22)]",
                    )}
                  >
                    {state === "done" ? <Check className="size-4" aria-hidden /> : n}
                  </span>
                  <span className={cn("text-[11px] font-semibold tracking-wide", state === "active" ? "text-teal-deep" : "text-muted")}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          {step === 1 && (
            <fieldset>
              <legend className="sr-only">Schritt 1 von 4: Vorhaben</legend>
              <h3 ref={headingRef} tabIndex={-1} className="text-xl font-extrabold tracking-tight text-ink outline-none sm:text-2xl">
                Was ist dein Vorhaben?
              </h3>
              <p className="mt-1.5 text-sm text-muted">Wähle alle Bereiche, bei denen du Unterstützung brauchst.</p>

              <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Deine Branche">
                {funnelIndustries.map((ind) => (
                  <label
                    key={ind.id}
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center rounded-full border-[1.5px] px-4 text-sm font-semibold transition-all duration-250",
                      industry === ind.id ? "border-ink-900 bg-ink-900 text-white" : "border-line text-body hover:border-ink/40",
                    )}
                  >
                    <input type="radio" name={`${idPrefix}-industry`} value={ind.id} checked={industry === ind.id} onChange={() => setIndustry(ind.id)} className="sr-only" />
                    {ind.label}
                  </label>
                ))}
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {INTERESTS.map((it) => {
                  const Ico = INTEREST_ICONS[it.id];
                  const on = picked.includes(it.id);
                  return (
                    <label
                      key={it.id}
                      className={cn(
                        "group relative flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-3.5 py-3 text-[14.5px] font-medium transition-all duration-250 ease-[var(--ease-bounce)] select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal",
                        it.id === "unsicher" && "sm:col-span-2",
                        on
                          ? "-translate-y-0.5 border-teal bg-teal-wash font-semibold text-ink shadow-[0_6px_20px_rgb(90_174_184/0.15)]"
                          : "border-line text-body hover:-translate-y-0.5 hover:border-teal hover:text-ink",
                      )}
                    >
                      <input type="checkbox" checked={on} onChange={() => togglePick(it.id)} className="sr-only" />
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl transition-colors", on ? "bg-teal/25 text-teal-deep" : "bg-fog text-muted")}>
                        <Ico className="size-[18px]" strokeWidth={1.75} aria-hidden />
                      </span>
                      <span className="flex-1">{it.label}</span>
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-md border-[1.5px] transition-colors",
                          on ? "border-teal bg-teal text-ink-950" : "border-line",
                        )}
                        aria-hidden
                      >
                        {on && <Check className="size-3.5" strokeWidth={3} />}
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
              <h3 ref={headingRef} tabIndex={-1} className="text-xl font-extrabold tracking-tight text-ink outline-none sm:text-2xl">
                Wo stehst du mit deinem Content?
              </h3>
              <p className="mt-1.5 text-sm text-muted">Das hilft uns, den richtigen Einstieg für dich zu finden.</p>
              <div className="mt-5 grid gap-2.5" role="radiogroup">
                {projectStatuses.map((s) => {
                  const on = status === s.id;
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex min-h-13 cursor-pointer items-center gap-3 rounded-full border-[1.5px] px-5 py-3 text-[14.5px] font-medium transition-all duration-250 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal",
                        on ? "border-teal bg-teal-wash font-semibold text-ink" : "border-line text-body hover:border-teal hover:bg-teal-wash/50",
                      )}
                    >
                      <input type="radio" name={`${idPrefix}-status`} checked={on} onChange={() => choose(() => setStatus(s.id))} className="sr-only" />
                      <span
                        className={cn("size-3.5 shrink-0 rounded-full border-2 transition-all", on ? "border-teal bg-teal shadow-[0_0_14px_rgb(90_174_184/0.5)]" : "border-line")}
                        aria-hidden
                      />
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
              <h3 ref={headingRef} tabIndex={-1} className="text-xl font-extrabold tracking-tight text-ink outline-none sm:text-2xl">
                Welches Budget hast du eingeplant?
              </h3>
              <p className="mt-1.5 text-sm text-muted">Kein Muss – aber so können wir dir passende Pakete empfehlen.</p>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2" role="radiogroup">
                {budgetBrackets.map((b) => {
                  const on = budget === b.id;
                  return (
                    <label
                      key={b.id}
                      className={cn(
                        "num flex min-h-13 cursor-pointer items-center justify-center rounded-xl border-[1.5px] px-4 py-3 text-center text-[15px] font-semibold transition-all duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal",
                        b.wide && "sm:col-span-2",
                        on ? "border-teal bg-teal-wash text-teal-deep" : "border-line text-body hover:border-teal hover:text-teal-deep",
                      )}
                    >
                      <input type="radio" name={`${idPrefix}-budget`} checked={on} onChange={() => choose(() => setBudget(b.id))} className="sr-only" />
                      {b.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <div>
              <h3 ref={headingRef} tabIndex={-1} className="text-xl font-extrabold tracking-tight text-ink outline-none sm:text-2xl">
                Fast geschafft! Wie erreichen wir dich?
              </h3>
              <p className="mt-1.5 mb-5 text-sm text-muted">Wir melden uns innerhalb von 24 Stunden – versprochen.</p>
              <ContactForm
                idPrefix={idPrefix}
                submitting={submitting}
                serverError={serverError}
                serverFields={serverFields}
                onSubmit={submit}
                footer={
                  <button type="button" onClick={() => goTo(3)} className="inline-flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-line px-5 font-semibold text-body hover:border-ink/40">
                    <ArrowLeft className="size-4" aria-hidden /> Zurück
                  </button>
                }
              />
            </div>
          )}

          {stepError && (
            <p role="alert" className="mt-4 text-sm font-medium text-danger">
              {stepError}
            </p>
          )}

          {step < 4 && (
            <div className="mt-7 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button type="button" onClick={() => goTo(step - 1)} className="inline-flex min-h-12 items-center gap-2 rounded-full border-[1.5px] border-line px-5 font-semibold text-body hover:border-ink/40">
                  <ArrowLeft className="size-4" aria-hidden /> Zurück
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-teal px-7 font-semibold text-ink-950 shadow-[var(--shadow-teal)] transition-all hover:-translate-y-0.5 hover:bg-teal-light"
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
