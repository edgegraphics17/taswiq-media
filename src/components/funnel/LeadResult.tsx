"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CalendarCheck, Check, LoaderCircle, MessageCircle, Phone } from "lucide-react";
import { site } from "@/config/site";
import { starterPackages, starterPrices, type FunnelIndustry, type LeadTier } from "@/config/funnel";
import { cn, formatEUR } from "@/lib/format";
import { APPOINTMENT_MAX_DAYS, DAYPARTS, isoDay, type AppointmentSlot, type Daypart } from "@/lib/appointment";
import { submitAppointment, type ServerErrorCode } from "@/lib/submit-lead";

/**
 * Abschluss-Screen mit Lead-Scoring-Twist:
 *  starter (< 5.000 €)   → Einstiegspakete mit festem Preis (Prototyp-Sprint, Website, Buchung …)
 *  growth               → "Einschätzung in 24 h" + nächste Schritte
 *  premium (≥ 15.000 €) → Terminwunsch direkt hier: zwei Wunschtermine, gespeichert am Lead (kein Drittanbieter)
 */
export function LeadResult({ tier, name, leadId, industry, onReset }: { tier: LeadTier; name: string; leadId: string | null; industry: FunnelIndustry; onReset?: () => void }) {
  const t = useTranslations("leadResult");
  const first = name.trim().split(" ")[0] || name;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="text-center"
      role="status"
      aria-live="polite"
    >
      <svg viewBox="0 0 52 52" className="mx-auto size-20" aria-hidden>
        <circle cx="26" cy="26" r="25" fill="rgb(29 175 89 / 0.1)" stroke="var(--color-mint-500)" strokeWidth="2" className="draw-circle" />
        <path d="M14 27l8 8 16-16" fill="none" stroke="var(--color-mint-500)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="draw-check" />
      </svg>

      {tier === "starter" && <Starter first={first} industry={industry} />}
      {tier === "growth" && <Growth first={first} />}
      {tier === "premium" && <Premium first={first} leadId={leadId} />}

      {onReset && (
        <button type="button" onClick={onReset} className="mt-8 inline-flex min-h-11 items-center rounded-full bg-canvas px-5 text-sm font-medium text-body hover:bg-line">
          {t("reset")}
        </button>
      )}
    </motion.div>
  );
}

function Starter({ first, industry }: { first: string; industry: FunnelIndustry }) {
  const t = useTranslations("leadResult.starter");
  const tp = useTranslations("funnel");
  const locale = useLocale();
  const packs = starterPackages[industry].map((id) => ({ id, price: starterPrices[id], name: tp(`starter.${id}.name`), text: tp(`starter.${id}.text`) }));
  const wa = (name: string) => `${site.whatsappHref}?text=${encodeURIComponent(t("whatsappText", { name }))}`;
  return (
    <>
      <h3 className="mt-5 text-2xl font-medium">{t("title", { name: first })}</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">{t("text")}</p>
      <ul className="mt-6 grid gap-2.5 text-left">
        {packs.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 rounded-3xl border border-line bg-white p-4 pl-5 transition hover:border-brand-200 hover:shadow-[var(--shadow-soft)]">
            <div>
              <p className="font-medium text-ink">{p.name}</p>
              <p className="mt-0.5 text-sm text-muted">{p.text}</p>
              <a href={wa(p.name)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 text-sm font-medium text-brand-600 hover:bg-brand-100">
                <MessageCircle className="size-4" aria-hidden /> {t("book")}
              </a>
            </div>
            <p className="num shrink-0 rounded-full bg-night px-3.5 py-1.5 text-sm font-medium text-white">{formatEUR(p.price, locale)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Growth({ first }: { first: string }) {
  const t = useTranslations("leadResult.growth");
  const steps = t.raw("steps") as string[];
  return (
    <>
      <h3 className="mt-5 text-2xl font-medium">{t("title", { name: first })}</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">{t("text")}</p>
      <ol className="mx-auto mt-6 grid max-w-md gap-2 text-left">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 rounded-full bg-canvas p-1.5 pr-5">
            <span className="num grid size-9 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-medium text-white">{i + 1}</span>
            <span className="text-sm text-body">{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">
        {t("callNow")}{" "}
        <a href={site.phoneHref} className="font-medium text-brand-600">
          {site.phone}
        </a>
      </p>
    </>
  );
}

type SlotDraft = { date: string; part: Daypart };

const FIELD = "h-12 w-full rounded-full border bg-canvas px-5 text-[16px] text-ink transition-[border-color,box-shadow,background-color] outline-none focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_4px_rgb(120_64_254/0.14)]";

/** Ohne gespeicherte Anfrage (Backend aus) gibt es nichts, woran der Terminwunsch hängen könnte → Telefon und WhatsApp. */
function Premium({ first, leadId }: { first: string; leadId: string | null }) {
  const t = useTranslations("leadResult.premium");
  const tErr = useTranslations("contactForm.server");
  const [slots, setSlots] = useState<[SlotDraft, SlotDraft]>([
    { date: "", part: "vormittag" },
    { date: "", part: "nachmittag" },
  ]);
  const [missing, setMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ServerErrorCode | null>(null);
  const [saved, setSaved] = useState<AppointmentSlot[] | null>(null);
  const locale = useLocale();

  const today = new Date();
  const min = isoDay(today);
  const max = isoDay(new Date(today.getFullYear(), today.getMonth(), today.getDate() + APPOINTMENT_MAX_DAYS));
  const set = (i: 0 | 1, patch: Partial<SlotDraft>) => {
    setSlots((p) => p.map((s, n) => (n === i ? { ...s, ...patch } : s)) as [SlotDraft, SlotDraft]);
    if (i === 0 && patch.date) setMissing(false);
  };
  const day = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    if (!slots[0].date) {
      setMissing(true);
      document.getElementById("termin-0-date")?.focus();
      return;
    }
    const chosen = slots.filter((s) => s.date);
    setSending(true);
    setError(null);
    const res = await submitAppointment({ leadId, slots: chosen });
    setSending(false);
    if (!res.ok) return setError(res.error);
    setSaved(chosen);
  };

  const contact = (
    <div className="mt-6 flex flex-wrap justify-center gap-2.5">
      <a href={site.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)]">
        <Phone className="size-4" aria-hidden /> {t("callNow")}
      </a>
      <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-night px-7 font-medium text-white">
        <MessageCircle className="size-4" aria-hidden /> WhatsApp
      </a>
    </div>
  );

  if (saved) {
    return (
      <>
        <h3 className="mt-5 text-2xl font-medium">{t("savedTitle", { name: first })}</h3>
        <p className="mx-auto mt-3 max-w-md text-muted">{t("savedText")}</p>
        <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left">
          {saved.map((s) => (
            <li key={`${s.date}-${s.part}`} className="flex items-center gap-3 rounded-full bg-canvas p-1.5 pr-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-sm text-body">
                {day(s.date)} · {t(`parts.${s.part}`)}
              </span>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <h3 className="mt-5 text-2xl font-medium">{t("title", { name: first })}</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">{t("text")}</p>
      {leadId ? (
        <form onSubmit={submit} noValidate className="mt-6 rounded-[2rem] border border-line bg-white p-5 text-left sm:p-6">
          <p className="flex items-center gap-2 font-medium text-ink">
            <CalendarCheck className="size-5 text-brand-600" aria-hidden /> {t("question")}
          </p>
          <p className="mt-1 text-sm text-muted">{t("hint")}</p>
          {([0, 1] as const).map((i) => (
            <fieldset key={i} className="mt-4">
              <legend className="mb-1.5 pl-4 text-sm font-medium text-ink">
                {t(i === 0 ? "slot1" : "slot2")}
                {i === 0 ? <span className="text-brand-600"> *</span> : <span className="font-normal text-muted"> {t("optional")}</span>}
              </legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label htmlFor={`termin-${i}-date`} className="sr-only">
                    {t("day")}
                  </label>
                  <input
                    id={`termin-${i}-date`}
                    type="date"
                    min={min}
                    max={max}
                    required={i === 0}
                    value={slots[i].date}
                    onChange={(e) => set(i, { date: e.target.value })}
                    aria-invalid={(i === 0 && missing) || undefined}
                    aria-describedby={i === 0 && missing ? "termin-0-err" : undefined}
                    className={cn(FIELD, i === 0 && missing ? "border-danger bg-white" : "border-transparent")}
                  />
                </div>
                <div>
                  <label htmlFor={`termin-${i}-part`} className="sr-only">
                    {t("time")}
                  </label>
                  <select id={`termin-${i}-part`} value={slots[i].part} onChange={(e) => set(i, { part: e.target.value as Daypart })} className={cn(FIELD, "cursor-pointer border-transparent")}>
                    {DAYPARTS.map((p) => (
                      <option key={p} value={p}>
                        {t(`parts.${p}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {i === 0 && missing && (
                <p id="termin-0-err" role="alert" className="mt-1.5 pl-4 text-sm text-danger">
                  {t("missing")}
                </p>
              )}
            </fieldset>
          ))}
          {error && (
            <p role="alert" className="mt-4 rounded-3xl bg-blush-50 px-4 py-3 text-sm text-danger">
              {tErr(error)}
            </p>
          )}
          <button
            type="submit"
            disabled={sending}
            className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
          >
            {sending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <CalendarCheck className="size-5" aria-hidden />} {t("send")}
          </button>
          <p className="mt-3 text-center text-xs text-muted">{t("privacyNote")}</p>
        </form>
      ) : (
        contact
      )}
      <p className="mt-4 text-sm text-muted">
        {t("noSlot")}{" "}
        {leadId && (
          <a href={site.phoneHref} className="font-medium text-brand-600">
            {site.phone}
          </a>
        )}
      </p>
    </>
  );
}
