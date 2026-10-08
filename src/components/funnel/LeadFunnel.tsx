"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
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
  AppWindow,
  CalendarCheck,
  ChartLine,
  CodeXml,
  ShoppingCart,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import {
  budgetBrackets,
  funnelIndustries,
  interests as INTERESTS,
  projectStatuses,
  type FunnelBudget,
  type FunnelIndustry,
  type InterestId,
  type LeadSource,
  type LeadTier,
  type ProjectStatus,
} from "@/config/funnel";
import { ContactForm, type ContactValues } from "@/components/funnel/ContactForm";
import { LeadResult } from "@/components/funnel/LeadResult";
import { submitLead, type ServerErrorCode } from "@/lib/submit-lead";
import type { ValidationCode } from "@/lib/validation";
import { track } from "@/lib/track";
import { cn } from "@/lib/format";

const INTEREST_ICONS: Record<InterestId, LucideIcon> = {
  software: CodeXml,
  bestellsystem: ShoppingCart,
  buchungssystem: CalendarCheck,
  webapp: AppWindow,
  dashboard: ChartLine,
  app: Smartphone,
  web: MonitorSmartphone,
  automation: Sparkles,
  media: Clapperboard,
  unsicher: CircleHelp,
  // Legacy
  aftermovie: Clapperboard,
  reels: Film,
  foto: Camera,
  social: Megaphone,
  ki_content: Workflow,
  musikvideo: Music,
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
  initialIndustry = "andere",
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
  const [budget, setBudget] = useState<FunnelBudget | null>(null);
  const t = useTranslations("funnel");
  const tc = useTranslations("common");
  const locale = useLocale();
  const steps = t.raw("steps") as string[];
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<ServerErrorCode | null>(null);
  const [serverFields, setServerFields] = useState<Record<string, ValidationCode>>();
  const [done, setDone] = useState<{ tier: LeadTier; name: string; email: string; leadId: string | null } | null>(null);
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
    if (step === 1 && picked.length === 0) return setStepError(t("errors.interests"));
    if (step === 2 && !status) return setStepError(t("errors.status"));
    if (step === 3 && !budget) return setStepError(t("errors.budget"));
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
      locale,
    });
    setSubmitting(false);
    if (!res.ok) {
      setServerError(res.error);
      setServerFields(res.fields);
      return;
    }
    track("generate_lead", { tier: res.tier, source, currency: "EUR" });
    setDone({ tier: res.tier, name: v.name, email: v.email, leadId: res.leadId });
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

  const heading = (n: 1 | 2 | 3 | 4) => (
    <>
      <h3 ref={headingRef} tabIndex={-1} className="text-2xl font-medium outline-none sm:text-[1.7rem]">
        {t(`step${n}.title`)}
      </h3>
      <p className="mt-1.5 text-sm text-muted">{t(`step${n}.sub`)}</p>
    </>
  );

  return (
    <div ref={cardRef} className="card relative scroll-mt-28 overflow-hidden p-5 sm:p-9">
      {done ? (
        <LeadResult tier={done.tier} name={done.name} leadId={done.leadId} industry={industry} onReset={reset} />
      ) : (
        <>
          {/* Fortschritt als Pillen-Leiste */}
          <ol className="grid grid-cols-4 gap-1.5 rounded-full bg-canvas p-1.5" aria-label={t("progress")}>
            {steps.map((label, i) => {
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
                    <legend className="sr-only">{t("legend", { step: 1, label: steps[0] })}</legend>
                    {heading(1)}

                    <LayoutGroup id={`${idPrefix}-ind`}>
                      <div role="radiogroup" aria-label={t("industryAria")} className="mt-5 inline-flex max-w-full flex-wrap gap-1 rounded-[1.4rem] bg-canvas p-1.5">
                        {funnelIndustries.map((ind) => (
                          <label key={ind} className={cn("relative min-h-10 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500", industry === ind ? "text-white" : "text-body hover:text-ink")}>
                            <input type="radio" name={`${idPrefix}-industry`} value={ind} checked={industry === ind} onChange={() => setIndustry(ind)} className="sr-only" />
                            {industry === ind && <motion.span layoutId="ind-pill" className="absolute inset-0 rounded-full bg-night" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                            <span className="relative">{t(`industries.${ind}`)}</span>
                          </label>
                        ))}
                      </div>
                    </LayoutGroup>

                    <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                      {INTERESTS.map((id) => {
                        const Ico = INTEREST_ICONS[id];
                        const on = picked.includes(id);
                        return (
                          <label key={id} className={cn(pill(on), id === "unsicher" && "sm:col-span-2")}>
                            <input type="checkbox" checked={on} onChange={() => togglePick(id)} className="sr-only" />
                            <span className={cn("grid size-10 shrink-0 place-items-center rounded-full transition-colors", on ? "bg-brand-500 text-white" : "bg-canvas text-muted")}>
                              <Ico className="size-[18px]" strokeWidth={1.75} aria-hidden />
                            </span>
                            <span className="flex-1 leading-tight">{t(`interests.${id}`)}</span>
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
                    <legend className="sr-only">{t("legend", { step: 2, label: steps[1] })}</legend>
                    {heading(2)}
                    <div role="radiogroup" className="mt-6 grid gap-2.5">
                      {projectStatuses.map((id) => {
                        const on = status === id;
                        return (
                          <label key={id} className={cn(pill(on), "pl-5")}>
                            <input type="radio" name={`${idPrefix}-status`} checked={on} onChange={() => choose(() => setStatus(id))} className="sr-only" />
                            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 transition-all", on ? "border-brand-500" : "border-line")} aria-hidden>
                              <span className={cn("size-2.5 rounded-full bg-brand-500 transition-transform duration-300", on ? "scale-100" : "scale-0")} />
                            </span>
                            {t(`statuses.${id}`)}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {step === 3 && (
                  <fieldset>
                    <legend className="sr-only">{t("legend", { step: 3, label: steps[2] })}</legend>
                    {heading(3)}
                    <div role="radiogroup" className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {budgetBrackets.map((b) => {
                        const on = budget === b.id;
                        return (
                          <label key={b.id} className={cn(pill(on), "num justify-center px-5 text-base", b.wide && "sm:col-span-2")}>
                            <input type="radio" name={`${idPrefix}-budget`} checked={on} onChange={() => choose(() => setBudget(b.id))} className="sr-only" />
                            {on && <Check className="size-4 text-brand-600" strokeWidth={3} aria-hidden />}
                            {t(`budgets.${b.id}`)}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {step === 4 && (
                  <div>
                    {heading(4)}
                    <div className="mt-6">
                      <ContactForm
                        idPrefix={idPrefix}
                        submitting={submitting}
                        serverError={serverError}
                        serverFields={serverFields}
                        onSubmit={submit}
                        footer={
                          <button type="button" onClick={() => goTo(3)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-canvas px-5 font-medium text-body transition hover:bg-line">
                            <ArrowLeft className="size-4" aria-hidden /> {tc("back")}
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
                  <ArrowLeft className="size-4" aria-hidden /> {tc("back")}
                </button>
              ) : (
                <span className="text-xs text-muted">{t("duration")}</span>
              )}
              <button
                type="button"
                onClick={next}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 hover:bg-brand-600"
              >
                {tc("next")} <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
