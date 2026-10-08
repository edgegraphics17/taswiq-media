/** Kleine Helfer der Demo-Apps: Beträge, Uhrzeiten und Tage relativ zu "heute" (damit jede Demo immer aktuell aussieht). */

const eurFmt = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const eur0Fmt = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat("de-DE");
const dayFmt = new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "numeric", month: "short" });
const dayLongFmt = new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" });
const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const wdFmt = new Intl.DateTimeFormat("de-DE", { weekday: "short" });

/** 12.5 → "12,50 €" */
export const eur = (n: number) => eurFmt.format(n);
/** 1240 → "1.240 €" */
export const eur0 = (n: number) => eur0Fmt.format(n);
export const num = (n: number) => numFmt.format(n);

/** Minuten seit Mitternacht → "09:30" */
export const hm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
/** 75 → "1 Std. 15 Min." */
export const dur = (min: number) => (min < 60 ? `${min} Min.` : min % 60 === 0 ? `${min / 60} Std.` : `${Math.floor(min / 60)} Std. ${min % 60} Min.`);

export function day(offset = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}
/** Nächster Werktag ab heute + offset (Sonntag wird übersprungen) */
export function workday(offset = 0) {
  let d = day(0);
  let left = offset;
  if (d.getDay() === 0) d = day(1);
  while (left > 0) {
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    if (d.getDay() !== 0) left--;
  }
  return d;
}
/** "Do., 8. Okt." */
export const fmtDay = (d: Date) => dayFmt.format(d);
/** "Donnerstag, 8. Oktober" */
export const fmtDayLong = (d: Date) => dayLongFmt.format(d);
/** "08.10.2026" */
export const fmtDate = (d: Date) => dateFmt.format(d);
/** "Do" */
export const weekdayShort = (d: Date) => wdFmt.format(d).replace(".", "");
export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};
export const clock = () => hm(nowMinutes());
export const monthName = (offset = 0) => new Intl.DateTimeFormat("de-DE", { month: "long" }).format(new Date(new Date().getFullYear(), new Date().getMonth() + offset, 1));

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Initialen für Avatare: "Lena Hartmann" → "LH" */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((p) => /^[A-Za-zÄÖÜäöü]/.test(p))
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
