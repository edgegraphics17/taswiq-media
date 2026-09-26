"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Send } from "lucide-react";
import { validateContactField, type ContactField } from "@/lib/validation";
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

const FIELDS: { id: Exclude<ContactField, "consent">; label: string; type: string; autoComplete: string; required?: boolean; wide?: boolean }[] = [
  { id: "name", label: "Dein Name", type: "text", autoComplete: "name", required: true },
  { id: "email", label: "Deine E-Mail", type: "email", autoComplete: "email", required: true },
  { id: "phone", label: "Telefon", type: "tel", autoComplete: "tel" },
  { id: "company", label: "Restaurant / Event / Firma", type: "text", autoComplete: "organization" },
  { id: "message", label: "Noch etwas?", type: "textarea", autoComplete: "off", wide: true },
];

/**
 * Kontaktfelder mit Inline-Validierung (on blur), Fehler direkt am Feld,
 * Fokus aufs erste fehlerhafte Feld beim Absenden. Wird im Funnel (Schritt 4)
 * und im Ergebnis des Preisrechners verwendet.
 */
export function ContactForm({
  idPrefix,
  submitLabel = "Anfrage senden",
  serverError,
  serverFields,
  submitting,
  onSubmit,
  footer,
}: {
  idPrefix: string;
  submitLabel?: string;
  serverError?: string | null;
  serverFields?: Record<string, string>;
  submitting: boolean;
  onSubmit: (values: ContactValues) => void;
  footer?: React.ReactNode;
}) {
  const [v, setV] = useState<ContactValues>(emptyContact);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string | null>>>({});
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

  const err = (k: ContactField) => errors[k] ?? serverFields?.[k];

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
              "w-full rounded-xl border bg-white px-4 text-[16px] text-ink transition-[border-color,box-shadow] outline-none placeholder:text-muted/70 focus:border-teal focus:shadow-[0_0_0_4px_rgb(90_174_184/0.18)]",
              error ? "border-danger" : "border-line",
            ),
          };
          return (
            <div key={f.id} className={cn(f.wide && "sm:col-span-2")}>
              <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
                {f.label}
                {f.required ? <span className="text-teal-deep"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea {...common} rows={3} className={cn(common.className, "py-3")} onChange={(e) => set(f.id, e.target.value)} />
              ) : (
                <input
                  {...common}
                  type={f.type}
                  inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined}
                  required={f.required}
                  className={cn(common.className, "h-12")}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              )}
              {error && (
                <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-danger">
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
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-body">
          <input
            id={`${idPrefix}-consent`}
            type="checkbox"
            checked={v.consent}
            onChange={(e) => set("consent", e.target.checked)}
            aria-invalid={Boolean(err("consent")) || undefined}
            className="mt-0.5 size-5 shrink-0 accent-[var(--color-teal-deep)]"
          />
          <span>
            Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden. Details in der{" "}
            <Link href="/datenschutz" className="font-semibold text-teal-deep underline underline-offset-2">
              Datenschutzerklärung
            </Link>
            .
          </span>
        </label>
        {err("consent") && (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            {err("consent")}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {footer}
        <button
          type="submit"
          disabled={submitting}
          className="ml-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-teal px-7 font-semibold text-ink-950 shadow-[var(--shadow-teal)] transition-all hover:-translate-y-0.5 hover:bg-teal-light disabled:opacity-60"
        >
          {submitting ? (
            <>
              Wird gesendet <LoaderCircle className="size-4 animate-spin" aria-hidden />
            </>
          ) : (
            <>
              {submitLabel} <Send className="size-4" aria-hidden />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
