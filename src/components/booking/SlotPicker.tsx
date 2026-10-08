"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarCheck, Check, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/format";
import { BOOKING_TZ } from "@/lib/booking";
import { submitBooking, type BookingErrorCode } from "@/lib/submit-lead";

export interface OpenDay {
  date: string;
  slots: { start: string; time: string }[];
}

type Load = { state: "loading" } | { state: "ready"; days: OpenDay[] } | { state: "failed" };

/** Lädt die freien Termine; `version` hochzählen lädt neu (z. B. nachdem ein Slot gerade vergeben wurde). */
export function useOpenSlots(version = 0): Load {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  useEffect(() => {
    let active = true;
    fetch("/api/booking/slots", { cache: "no-store", signal: AbortSignal.timeout(15_000) })
      .then((r) => r.json())
      .then((j: { ok?: boolean; days?: OpenDay[] }) => active && setLoad(j.ok && Array.isArray(j.days) ? { state: "ready", days: j.days } : { state: "failed" }))
      .catch(() => active && setLoad({ state: "failed" }));
    return () => {
      active = false;
    };
  }, [version]);
  return load;
}

/**
 * Tag wählen, dann Uhrzeit. Zeigt nur, was frei ist – gebuchte und gesperrte Zeiten kommen gar nicht erst an.
 * Uhrzeiten sind deutsche Zeit (steht darunter).
 */
export function SlotPicker({ days, value, onChange, invalid }: { days: OpenDay[]; value: string | null; onChange: (start: string) => void; invalid?: boolean }) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [date, setDate] = useState(days[0]?.date ?? "");
  const day = days.find((d) => d.date === date) ?? days[0];
  const part = (d: string, opts: Intl.DateTimeFormatOptions) => new Date(`${d}T12:00:00Z`).toLocaleDateString(locale, { timeZone: "UTC", ...opts });

  return (
    <div>
      <p id="slot-day-label" className="pl-1 text-sm font-medium text-ink">
        {t("day")}
      </p>
      <div role="group" aria-labelledby="slot-day-label" className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-2">
        {days.map((d) => {
          const active = d.date === day?.date;
          return (
            <button
              key={d.date}
              type="button"
              aria-pressed={active}
              aria-label={part(d.date, { weekday: "long", day: "numeric", month: "long" })}
              onClick={() => setDate(d.date)}
              className={cn(
                "flex min-h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-3xl border text-sm transition-colors",
                active ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white text-ink hover:border-brand-200",
              )}
            >
              <span className={cn("text-xs", active ? "text-white/80" : "text-muted")}>{part(d.date, { weekday: "short" })}</span>
              <span className="num text-lg leading-tight font-medium">{part(d.date, { day: "numeric" })}</span>
              <span className={cn("text-[11px]", active ? "text-white/80" : "text-muted")}>{part(d.date, { month: "short" })}</span>
            </button>
          );
        })}
      </div>

      <p id="slot-time-label" className="mt-4 pl-1 text-sm font-medium text-ink">
        {t("time")} <span className="font-normal text-muted">· {day ? part(day.date, { weekday: "long", day: "numeric", month: "long" }) : ""}</span>
      </p>
      <div role="group" aria-labelledby="slot-time-label" aria-describedby={invalid ? "slot-err" : undefined} className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {day?.slots.map((s) => {
          const active = s.start === value;
          return (
            <button
              key={s.start}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(s.start)}
              className={cn(
                "num min-h-11 cursor-pointer rounded-full border text-[15px] font-medium transition-colors",
                active ? "border-brand-500 bg-brand-500 text-white" : "border-transparent bg-canvas text-ink hover:border-brand-200 hover:bg-white",
              )}
            >
              {s.time}
            </button>
          );
        })}
      </div>
      {invalid && (
        <p id="slot-err" role="alert" className="mt-2 pl-1 text-sm text-danger">
          {t("missing")}
        </p>
      )}
      <p className="mt-3 pl-1 text-xs text-muted">{t("timezone")}</p>
    </div>
  );
}

/** Bestätigung nach der Buchung – Zeitraum in deutscher Zeit, in der Sprache der Seite. */
export function BookedNote({ start, end }: { start: string; end: string }) {
  const locale = useLocale();
  const day = new Date(start).toLocaleDateString(locale, { timeZone: BOOKING_TZ, weekday: "long", day: "numeric", month: "long" });
  const time = (iso: string) => new Date(iso).toLocaleTimeString(locale, { timeZone: BOOKING_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return (
    <p className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-full bg-canvas p-1.5 pr-5 text-left">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
        <Check className="size-4" strokeWidth={3} aria-hidden />
      </span>
      <span className="num text-sm text-body">
        {day} · {time(start)}–{time(end)}
      </span>
    </p>
  );
}

/**
 * Kompletter Buchungsblock für eine gerade gestellte Anfrage: Slot wählen, buchen, Bestätigung.
 * Gibt es keine freien Termine (oder lädt der Kalender nicht), erscheint stattdessen `fallback`.
 */
export function LeadBooking({ leadId, fallback, onBooked }: { leadId: string; fallback: React.ReactNode; onBooked: (b: { start: string; end: string }) => void }) {
  const t = useTranslations("booking");
  const tErr = useTranslations("contactForm.server");
  const locale = useLocale();
  const [version, setVersion] = useState(0);
  const load = useOpenSlots(version);
  const [value, setValue] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<BookingErrorCode | null>(null);

  if (load.state === "loading") {
    return (
      <div className="mt-6 grid min-h-48 place-items-center rounded-[2rem] border border-line bg-white p-6 text-sm text-muted" role="status">
        <span className="inline-flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" aria-hidden /> {t("loading")}
        </span>
      </div>
    );
  }
  if (load.state === "failed" || !load.days.length) return <>{fallback}</>;

  const book = async () => {
    if (!value) return setMissing(true);
    setSending(true);
    setError(null);
    const res = await submitBooking({ start: value, leadId, locale: locale === "en" ? "en" : "de" });
    setSending(false);
    if (res.ok) return onBooked(res);
    setError(res.error);
    if (res.error === "taken") {
      setValue(null);
      setVersion((v) => v + 1);
    }
  };

  return (
    <div className="mt-6 rounded-[2rem] border border-line bg-white p-5 text-left sm:p-6">
      <p className="flex items-center gap-2 font-medium text-ink">
        <CalendarCheck className="size-5 text-brand-600" aria-hidden /> {t("question")}
      </p>
      <p className="mt-1 mb-4 text-sm text-muted">{t("hint")}</p>
      <SlotPicker
        days={load.days}
        value={value}
        invalid={missing && !value}
        onChange={(s) => {
          setValue(s);
          setMissing(false);
          setError(null);
        }}
      />
      {error && (
        <p role="alert" className="mt-4 rounded-3xl bg-blush-50 px-4 py-3 text-sm text-danger">
          {error === "taken" ? t("taken") : tErr(error)}
        </p>
      )}
      <button
        type="button"
        onClick={book}
        disabled={sending}
        className="mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)] transition hover:bg-brand-600 disabled:cursor-wait disabled:opacity-60"
      >
        {sending ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <CalendarCheck className="size-5" aria-hidden />} {t("book")}
      </button>
      <p className="mt-3 text-center text-xs text-muted">{t("privacyNote")}</p>
    </div>
  );
}
