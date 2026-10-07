"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CONSENT_OPEN_EVENT, getConsent, setConsent } from "@/lib/consent";

/**
 * Einwilligungs-Fenster: schwebende Karte unten links, blockiert die Seite nicht.
 * „Alle akzeptieren“ und „Nur notwendige“ sind gleichwertig (gleiche Größe, eine Ebene);
 * die Detail-Auswahl liegt dahinter. Über den Footer-Link jederzeit wieder zu öffnen.
 */
export function CookieBanner() {
  const t = useTranslations("consent");
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [statistics, setStatistics] = useState(false);
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Erst nach dem Hydrieren entscheiden – der Server kennt die Auswahl nicht.
    if (!getConsent()) setOpen(true);
    const reopen = () => {
      setStatistics(getConsent()?.statistics ?? false);
      setDetails(true);
      setOpen(true);
      requestAnimationFrame(() => ref.current?.focus());
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (value: boolean) => {
    setConsent(value);
    setOpen(false);
    setDetails(false);
  };

  const btn = "inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-colors";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="card fixed inset-x-3 bottom-3 z-[90] max-h-[calc(100dvh-1.5rem)] animate-rise overflow-y-auto p-5 shadow-[var(--shadow-float)] outline-none sm:inset-x-auto sm:left-5 sm:bottom-5 sm:w-[26rem] sm:p-6 print:hidden"
    >
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
          <Cookie className="size-4" aria-hidden />
        </span>
        <h2 id={titleId} className="text-base font-semibold tracking-tight text-ink">
          {t("title")}
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-body">
        {t("text")}{" "}
        <Link href="/datenschutz" className="font-medium text-brand-600 underline-offset-2 hover:underline">
          {t("privacy")}
        </Link>
      </p>

      {details && (
        <ul className="mt-4 space-y-2">
          <li className="rounded-2xl bg-canvas p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">{t("necessaryTitle")}</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-muted">{t("alwaysOn")}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{t("necessaryText")}</p>
          </li>
          <li className="rounded-2xl bg-canvas p-4">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">{t("statisticsTitle")}</span>
              <input type="checkbox" role="switch" checked={statistics} onChange={(e) => setStatistics(e.target.checked)} className="peer sr-only" />
              <span
                aria-hidden
                className="relative h-7 w-12 shrink-0 rounded-full bg-[#c9c9d1] transition-colors peer-checked:bg-brand-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
              />
            </label>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{t("statisticsText")}</p>
          </li>
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose(false)} className={`${btn} bg-night text-white hover:bg-night-soft`}>
          {t("onlyNecessary")}
        </button>
        <button type="button" onClick={() => choose(true)} className={`${btn} bg-night text-white hover:bg-night-soft`}>
          {t("acceptAll")}
        </button>
        {details ? (
          <button type="button" onClick={() => choose(statistics)} className={`${btn} basis-full border border-line bg-white text-ink hover:border-brand-300`}>
            {t("save")}
          </button>
        ) : (
          <button type="button" onClick={() => setDetails(true)} className="min-h-11 basis-full rounded-full text-sm font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
            {t("settings")}
          </button>
        )}
      </div>
    </div>
  );
}
