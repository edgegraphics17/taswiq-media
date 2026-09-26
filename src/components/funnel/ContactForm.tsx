"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { validateContactField, type ContactField, type ValidationCode } from "@/lib/validation";
import type { ServerErrorCode } from "@/lib/submit-lead";
import { cn } from "@/lib/format";

export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  consent: boolean;
  website: string; // Honeypot
}

export const emptyContact: ContactValues = { name: "", email: "", phone: "", company: "", message: "", consent: false, website: "" };

/** Labels: messages → contactForm.fields.<id> */
const FIELDS: { id: Exclude<ContactField, "consent">; type: string; autoComplete: string; required?: boolean; wide?: boolean }[] = [
  { id: "name", type: "text", autoComplete: "name", required: true },
  { id: "email", type: "email", autoComplete: "email", required: true },
  { id: "phone", type: "tel", autoComplete: "tel" },
  { id: "company", type: "text", autoComplete: "organization" },
  { id: "message", type: "textarea", autoComplete: "off", wide: true },
];

/**
 * Kontaktfelder mit Inline-Validierung (on blur), Fehler direkt am Feld,
 * Fokus aufs erste fehlerhafte Feld beim Absenden. Wird im Funnel (Schritt 4)
 * und im Ergebnis des Preisrechners verwendet.
 */
export function ContactForm({
  idPrefix,
  submitLabel,
  serverError,
  serverFields,
  submitting,
  onSubmit,
  footer,
}: {
  idPrefix: string;
  submitLabel?: string;
  serverError?: ServerErrorCode | null;
  serverFields?: Record<string, ValidationCode>;
  submitting: boolean;
  onSubmit: (values: ContactValues) => void;
  footer?: React.ReactNode;
}) {
  const t = useTranslations("contactForm");
  const [v, setV] = useState<ContactValues>(emptyContact);
  const [errors, setErrors] = useState<Partial<Record<ContactField, ValidationCode | null>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof ContactValues>(k: K, val: ContactValues[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k as ContactField]) setErrors((e) => ({ ...e, [k]: validateContactField(k as ContactField, val) }));
  };
  const blur = (k: ContactField) => setErrors((e) => ({ ...e, [k]: validateContactField(k, v[k]) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    (["name", "email", "phone", "company", "message", "consent"] as ContactField[]).forEach((k) => {
      next[k] = validateContactField(k, v[k]);
    });
    setErrors(next);
    const firstInvalid = (Object.keys(next) as ContactField[]).find((k) => next[k]);
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`#${idPrefix}-${firstInvalid}`)?.focus();
      return;
    }
    onSubmit(v);
  };

  /** Fehler-Code (Client oder Server) → Text in der Sprache der Seite */
  const err = (k: ContactField) => {
    const code = errors[k] ?? serverFields?.[k];
    return code ? t(`errors.${code}`) : null;
  };

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const id = `${idPrefix}-${f.id}`;
          const error = err(f.id);
          const common = {
            id,
            name: f.id,
            value: v[f.id],
            autoComplete: f.autoComplete,
            "aria-invalid": Boolean(error) || undefined,
            "aria-describedby": error ? `${id}-err` : undefined,
            onBlur: () => blur(f.id),
            className: cn(
              "w-full border bg-canvas px-5 text-[16px] text-ink transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted/70 focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_4px_rgb(120_64_254/0.14)]",
              error ? "border-danger bg-white" : "border-transparent",
            ),
          };
          return (
            <div key={f.id} className={cn(f.wide && "sm:col-span-2")}>
              <label htmlFor={id} className="mb-1.5 block pl-4 text-sm font-medium text-ink">
                {t(`fields.${f.id}`)}
                {f.required ? <span className="text-brand-600"> *</span> : <span className="font-normal text-muted"> {t("optional")}</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea {...common} rows={3} className={cn(common.className, "rounded-3xl py-3.5")} onChange={(e) => set(f.id, e.target.value)} />
              ) : (
                <input
                  {...common}
                  type={f.type}
                  inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined}
                  required={f.required}
                  className={cn(common.className, "h-12 rounded-full")}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              )}
              {error && (
                <p id={`${id}-err`} role="alert" className="mt-1.5 pl-4 text-sm text-danger">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Honeypot – für Menschen unsichtbar, Bots füllen es aus */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input id={`${idPrefix}-website`} name="website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-3xl bg-canvas p-4 text-sm leading-relaxed text-body">
          <input
            id={`${idPrefix}-consent`}
            type="checkbox"
            checked={v.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={Boolean(err("consent")) || undefined}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-brand-500)]"
          />
          <span>
            {t.rich("consent", {
              link: (chunks) => (
                <Link href="/datenschutz" className="font-medium text-brand-600 underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {err("consent") && (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            {err("consent")}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="rounded-3xl border border-danger/25 bg-danger/5 px-5 py-3 text-sm text-danger">
          {t(`server.${serverError}`)}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {footer}
        <button
          type="submit"
          disabled={submitting}
          className="ml-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-7 font-medium text-white shadow-[var(--shadow-brand)] transition-all hover:-translate-y-0.5 hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? (
            <>
              {t("sending")} <LoaderCircle className="size-4 animate-spin" aria-hidden />
            </>
          ) : (
            <>
              {submitLabel ?? t("submit")} <Send className="size-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
