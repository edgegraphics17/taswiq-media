"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { FunnelIndustry, InterestId, LeadTier } from "@/config/funnel";
import { ContactForm, type ContactValues } from "@/components/funnel/ContactForm";
import { LeadResult } from "@/components/funnel/LeadResult";
import { submitLead, type ServerErrorCode } from "@/lib/submit-lead";
import type { ValidationCode } from "@/lib/validation";
import { track } from "@/lib/track";

/**
 * Direkte Anfrage ohne Fragen-Strecke: ein Formular, eine Nachricht.
 * Branche und Interessen sind von der Seite vorbelegt, das Budget bleibt offen.
 */
export function DirectContact({ title, text, submitLabel, industry, interests }: { title: string; text: string; submitLabel: string; industry: FunnelIndustry; interests: InterestId[] }) {
  const locale = useLocale();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<ServerErrorCode | null>(null);
  const [serverFields, setServerFields] = useState<Record<string, ValidationCode>>();
  const [done, setDone] = useState<{ tier: LeadTier; name: string; email: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const submit = async (v: ContactValues) => {
    setSubmitting(true);
    setServerError(null);
    const res = await submitLead({
      source: "branchen_seite",
      industry,
      interests,
      projectStatus: null,
      budget: "keine_angabe",
      name: v.name,
      email: v.email,
      phone: v.phone,
      company: v.company,
      message: v.message,
      consent: true,
      website: v.website,
      locale,
    });
    setSubmitting(false);
    if (!res.ok) {
      setServerError(res.error);
      setServerFields(res.fields);
      return;
    }
    track("generate_lead", { tier: res.tier, source: "branchen_seite", currency: "EUR" });
    setDone({ tier: res.tier, name: v.name, email: v.email });
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={cardRef} className="card scroll-mt-28 p-5 sm:p-9">
      {done ? (
        <LeadResult tier={done.tier} name={done.name} email={done.email} industry={industry} onReset={() => setDone(null)} />
      ) : (
        <>
          <h3 className="text-2xl font-medium sm:text-[1.7rem]">{title}</h3>
          <p className="mt-1.5 text-sm text-muted">{text}</p>
          <div className="mt-6">
            <ContactForm idPrefix="re-contact" submitLabel={submitLabel} submitting={submitting} serverError={serverError} serverFields={serverFields} onSubmit={submit} />
          </div>
        </>
      )}
    </div>
  );
}
