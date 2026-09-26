import { LOCALE_META, type Locale } from "@/i18n/routing";

/**
 * Zahlen & Beträge sprachabhängig: DE "1.490 €" · EN "€1,490".
 * Intl-Instanzen werden je Sprache einmal erzeugt und wiederverwendet.
 */
const cache = new Map<string, { eur: Intl.NumberFormat; num: Intl.NumberFormat }>();
function fmt(locale: Locale) {
  let f = cache.get(locale);
  if (!f) {
    const tag = LOCALE_META[locale].intl;
    f = {
      eur: new Intl.NumberFormat(tag, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
      num: new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }),
    };
    cache.set(locale, f);
  }
  return f;
}

/** 1490 → "1.490 €" (de) · "€1,490" (en) */
export const formatEUR = (n: number, locale: Locale = "de") => fmt(locale).eur.format(n);
/** 1490 → "1.490" / "1,490" (für animierte Zahlen, € separat gesetzt) */
export const formatNumber = (n: number, locale: Locale = "de") => fmt(locale).num.format(Math.round(n));
/** Wo steht das €-Zeichen? DE nachgestellt, EN vorangestellt */
export const eurAffix = (locale: Locale) => (locale === "en" ? { pre: "€", post: "" } : { pre: "", post: " €" });
/** "1.490 – 1.750 €" · "€1,490 – €1,750" */
export function formatRange(min: number, max: number, locale: Locale = "de") {
  if (min === max) return formatEUR(min, locale);
  const n = fmt(locale).num;
  return locale === "en" ? `€${n.format(min)} – €${n.format(max)}` : `${n.format(min)} – ${n.format(max)} €`;
}

/* Dashboard (intern, deutsch) */
const dateTime = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" });
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => date.format(new Date(iso));

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
