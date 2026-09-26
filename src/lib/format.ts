const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
const date = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeZone: "Europe/Berlin" });

/** 1490 → "1.490 €" */
export const formatEUR = (n: number) => eur.format(n);
/** 1490 → "1.490" (für animierte Zahlen, € separat gesetzt) */
export const formatNumber = (n: number) => num.format(Math.round(n));
export const formatRange = (min: number, max: number) =>
  min === max ? formatEUR(min) : `${num.format(min)} – ${num.format(max)} €`;
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => date.format(new Date(iso));

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
