"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { site } from "@/config/site";
import { starterPackages, type FunnelIndustry, type LeadTier } from "@/config/funnel";
import { formatEUR } from "@/lib/format";

/**
 * Abschluss-Screen mit Lead-Scoring-Twist:
 *  starter (< 1.000 €)  → produktisierte Standard-Pakete, sofort per WhatsApp buchbar
 *  growth               → "Angebot in 24 h" + nächste Schritte
 *  premium (> 5.000 €)  → direkte Terminbuchung (Calendly, Zwei-Klick-Lösung für DSGVO)
 */
export function LeadResult({ tier, name, email, industry, onReset }: { tier: LeadTier; name: string; email: string; industry: FunnelIndustry; onReset?: () => void }) {
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
      {tier === "premium" && <Premium first={first} name={name} email={email} />}

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
  const packs = starterPackages[industry].map((p) => ({ ...p, name: tp(`starter.${p.id}.name`), text: tp(`starter.${p.id}.text`) }));
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

function Premium({ first, name, email }: { first: string; name: string; email: string }) {
  const t = useTranslations("leadResult.premium");
  const [load, setLoad] = useState(false);
  const url = site.calendlyUrl ? `${site.calendlyUrl}?${new URLSearchParams({ name, email, hide_gdpr_banner: "1", primary_color: "7840fe" })}` : "";
  return (
    <>
      <h3 className="mt-5 text-2xl font-medium">{t("title", { name: first })}</h3>
      <p className="mx-auto mt-3 max-w-md text-muted">{t("text")}</p>
      {url ? (
        load ? (
          <iframe title={t("iframeTitle")} src={url} className="mt-6 h-[640px] w-full rounded-3xl border border-line" loading="lazy" />
        ) : (
          <div className="mt-6 rounded-[2rem] bg-night p-7 text-white">
            <button type="button" onClick={() => setLoad(true)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)]">
              <CalendarCheck className="size-5" aria-hidden /> {t("loadCalendar")}
            </button>
            <p className="mt-3 text-xs text-night-muted">{t("calendlyNote")}</p>
          </div>
        )
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <a href={site.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)]">
            <Phone className="size-4" aria-hidden /> {t("callNow")}
          </a>
          <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-night px-7 font-medium text-white">
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
        </div>
      )}
      <p className="mt-4 text-sm text-muted">{t("noSlot")}</p>
    </>
  );
}
