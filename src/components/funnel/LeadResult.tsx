"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, MessageCircle, Phone } from "lucide-react";
import { site } from "@/config/site";
import { starterPackages, type FunnelIndustry, type LeadTier } from "@/config/funnel";

/**
 * Abschluss-Screen mit Lead-Scoring-Twist:
 *  starter (< 1.000 €)  → produktisierte Standard-Pakete, sofort per WhatsApp buchbar
 *  growth               → "Angebot in 24 h" + nächste Schritte
 *  premium (> 5.000 €)  → direkte Terminbuchung (Calendly, Zwei-Klick-Lösung für DSGVO)
 */
export function LeadResult({
  tier,
  name,
  email,
  industry,
  onReset,
}: {
  tier: LeadTier;
  name: string;
  email: string;
  industry: FunnelIndustry;
  onReset?: () => void;
}) {
  const first = name.trim().split(" ")[0] || "du";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      className="text-center"
      role="status"
      aria-live="polite"
    >
      <svg viewBox="0 0 52 52" className="mx-auto size-20" aria-hidden>
        <circle cx="26" cy="26" r="25" fill="rgb(90 174 184 / 0.1)" stroke="var(--color-teal)" strokeWidth="2" className="draw-circle" />
        <path d="M14 27l8 8 16-16" fill="none" stroke="var(--color-teal-deep)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="draw-check" />
      </svg>

      {tier === "starter" && <Starter first={first} industry={industry} />}
      {tier === "growth" && <Growth first={first} />}
      {tier === "premium" && <Premium first={first} name={name} email={email} />}

      {onReset && (
        <button type="button" onClick={onReset} className="mt-8 text-sm font-semibold text-teal-deep underline underline-offset-4">
          Neue Anfrage stellen
        </button>
      )}
    </motion.div>
  );
}

function Starter({ first, industry }: { first: string; industry: FunnelIndustry }) {
  const packs = starterPackages[industry];
  const wa = (p: string) => `${site.whatsappHref}?text=${encodeURIComponent(`Hallo TasWiq, ich möchte das Paket „${p}“ buchen.`)}`;
  return (
    <>
      <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Danke, {first}! Dafür haben wir feste Pakete.</h3>
      <p className="mx-auto mt-3 max-w-md text-body">
        Für dein Budget sind unsere Starter-Pakete ideal – fester Preis, kein Erstgespräch nötig. Die Übersicht liegt auch in deinem Postfach.
      </p>
      <ul className="mt-6 grid gap-3 text-left">
        {packs.map((p) => (
          <li key={p.name} className="flex items-start justify-between gap-4 rounded-2xl border border-line p-4 transition hover:border-teal">
            <div>
              <p className="font-bold text-ink">{p.name}</p>
              <p className="mt-0.5 text-sm text-muted">{p.text}</p>
              <a href={wa(p.name)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal-deep">
                <MessageCircle className="size-4" aria-hidden /> Per WhatsApp buchen
              </a>
            </div>
            <p className="num shrink-0 text-lg font-extrabold text-ink">{p.price}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Growth({ first }: { first: string }) {
  const steps = [
    "Wir prüfen deine Angaben und schauen uns deine Kanäle an.",
    "Innerhalb von 24 Stunden bekommst du ein Angebot mit Festpreis.",
    "Passt alles, planen wir den Deep Dive – per Call oder vor Ort.",
  ];
  return (
    <>
      <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">Danke, {first}! Dein Angebot kommt in 24 Stunden.</h3>
      <p className="mx-auto mt-3 max-w-md text-body">Deine Anfrage ist da. So geht es weiter:</p>
      <ol className="mx-auto mt-6 max-w-md space-y-3 text-left">
        {steps.map((s, i) => (
          <li key={s} className="flex gap-3">
            <span className="num grid size-7 shrink-0 place-items-center rounded-full bg-teal-wash text-sm font-bold text-teal-deep">{i + 1}</span>
            <span className="pt-0.5 text-body">{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">
        Lieber sofort sprechen?{" "}
        <a href={site.phoneHref} className="font-semibold text-teal-deep">
          {site.phone}
        </a>
      </p>
    </>
  );
}

function Premium({ first, name, email }: { first: string; name: string; email: string }) {
  const [load, setLoad] = useState(false);
  const url = site.calendlyUrl
    ? `${site.calendlyUrl}?${new URLSearchParams({ name, email, hide_gdpr_banner: "1", primary_color: "5aaeb8" })}`
    : "";
  return (
    <>
      <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">{first}, lass uns direkt sprechen.</h3>
      <p className="mx-auto mt-3 max-w-md text-body">
        Projekte dieser Größe planen wir persönlich. Such dir einen Termin für ein 30-minütiges Strategiegespräch aus – kostenlos und unverbindlich.
      </p>
      {url ? (
        load ? (
          <iframe title="Termin buchen" src={url} className="mt-6 h-[640px] w-full rounded-2xl border border-line" loading="lazy" />
        ) : (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-teal/60 p-6">
            <button
              type="button"
              onClick={() => setLoad(true)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-teal px-7 font-semibold text-ink-950 shadow-[var(--shadow-teal)]"
            >
              <CalendarCheck className="size-5" aria-hidden /> Kalender laden
            </button>
            <p className="mt-3 text-xs text-muted">Beim Laden werden Daten an Calendly (USA) übertragen.</p>
          </div>
        )
      ) : (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={site.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-teal px-7 font-semibold text-ink-950">
            <Phone className="size-4" aria-hidden /> Jetzt anrufen
          </a>
          <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line px-7 font-semibold text-ink">
            <MessageCircle className="size-4" aria-hidden /> WhatsApp
          </a>
        </div>
      )}
      <p className="mt-4 text-sm text-muted">Kein passender Termin? Wir melden uns noch heute persönlich bei dir.</p>
    </>
  );
}
