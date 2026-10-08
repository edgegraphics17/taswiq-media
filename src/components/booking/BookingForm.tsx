"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LoaderCircle, MessageCircle, Phone } from "lucide-react";
import { site } from "@/config/site";
import { ContactForm, type ContactValues } from "@/components/funnel/ContactForm";
import { BookedNote, SlotPicker, useOpenSlots } from "@/components/booking/SlotPicker";
import { submitBooking, type BookingErrorCode } from "@/lib/submit-lead";
import { track } from "@/lib/track";

/** Terminseite: freien Slot wählen, Kontaktdaten angeben, buchen. Ohne freie Termine bleiben Telefon und WhatsApp. */
export function BookingForm() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [version, setVersion] = useState(0);
  const load = useOpenSlots(version);
  const [value, setValue] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<BookingErrorCode | null>(null);
  const [done, setDone] = useState<{ start: string; end: string; name: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const submit = async (v: ContactValues) => {
    if (!value) {
      setMissing(true);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSending(true);
    setError(null);
    const res = await submitBooking({ start: value, name: v.name, email: v.email, phone: v.phone, message: [v.company, v.message].filter(Boolean).join(" – "), consent: true, website: v.website, locale: locale === "en" ? "en" : "de" });
    setSending(false);
    if (res.ok) {
      track("termin_gebucht", { quelle: "terminseite" });
      setDone({ ...res, name: v.name.trim().split(" ")[0] || v.name });
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setError(res.error);
    if (res.error === "taken") {
      setValue(null);
      setVersion((n) => n + 1);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const direct = (
    <div className="mt-6 flex flex-wrap justify-center gap-2.5">
      <a href={site.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)]">
        <Phone className="size-4" aria-hidden /> {site.phone}
      </a>
      <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-night px-7 font-medium text-white">
        <MessageCircle className="size-4" aria-hidden /> WhatsApp
      </a>
    </div>
  );

  return (
    <div ref={cardRef} className="scroll-mt-28 rounded-[2rem] border border-line bg-white p-5 shadow-[var(--shadow-soft)] sm:p-8">
      {done ? (
        <div className="py-6 text-center" role="status" aria-live="polite">
          <h2 className="text-2xl font-medium">{t("bookedTitle", { name: done.name })}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted">{t("bookedText")}</p>
          <BookedNote start={done.start} end={done.end} />
        </div>
      ) : load.state === "loading" ? (
        <p className="grid min-h-64 place-items-center text-sm text-muted" role="status">
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="size-4 animate-spin" aria-hidden /> {t("loading")}
          </span>
        </p>
      ) : load.state === "failed" || !load.days.length ? (
        <div className="py-8 text-center">
          <h2 className="text-xl font-medium">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">{t("emptyText")}</p>
          {direct}
        </div>
      ) : (
        <>
          <h2 className="text-xl font-medium">{t("stepSlot")}</h2>
          <div className="mt-4">
            <SlotPicker
              days={load.days}
              value={value}
              invalid={missing && !value}
              onChange={(s) => {
                setValue(s);
                setMissing(false);
                if (error === "taken") setError(null);
              }}
            />
          </div>
          {error === "taken" && (
            <p role="alert" className="mt-4 rounded-3xl bg-blush-50 px-4 py-3 text-sm text-danger">
              {t("taken")}
            </p>
          )}
          <h2 className="mt-8 mb-4 text-xl font-medium">{t("stepContact")}</h2>
          <ContactForm idPrefix="termin" submitLabel={t("book")} submitting={sending} serverError={error && error !== "taken" ? error : null} onSubmit={submit} />
        </>
      )}
    </div>
  );
}
