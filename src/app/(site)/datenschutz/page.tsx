import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Datenschutz", robots: { index: false, follow: true }, alternates: { canonical: "/datenschutz" } };

/** Gliederung der tatsächlichen Datenflüsse dieser Website – Text vor Livegang juristisch prüfen lassen. */
export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
        Entwurf – beschreibt die technischen Datenflüsse dieser Website. Vor dem Livegang rechtlich prüfen lassen.
      </p>
      <h2>Verantwortlicher</h2>
      <p>
        {site.legalName} · <a href={`mailto:${site.email}`}>{site.email}</a> · {site.phone}
      </p>
      <h2>Kontaktformular, Funnel & Preisrechner</h2>
      <p>
        Wenn du uns über den Funnel oder den Preisrechner schreibst, speichern wir deine Angaben (Name, E-Mail, optional Telefon, Firma,
        Nachricht, gewählte Leistungen, Budget-Stufe und Kalkulation) zur Bearbeitung deiner Anfrage (Art. 6 Abs. 1 lit. b DSGVO). Die
        Daten liegen in einer Supabase-Datenbank (Hosting in der EU, Region Frankfurt) und werden über einen selbst betriebenen
        n8n-Workflow verarbeitet: Benachrichtigung an uns und eine Bestätigungs-E-Mail an dich. Deine IP-Adresse speichern wir nur als
        gesalzenen Hash zum Schutz vor Spam. Anfragen löschen wir, wenn kein Auftrag zustande kommt, spätestens nach 24 Monaten.
      </p>
      <h2>Terminbuchung (Calendly)</h2>
      <p>
        Den Buchungskalender laden wir erst nach deinem Klick. Dabei werden Daten an Calendly LLC (USA) übertragen (Art. 6 Abs. 1 lit. a
        DSGVO, EU-US Data Privacy Framework).
      </p>
      <h2>Videos</h2>
      <p>Vorschau-Clips liegen auf unserem eigenen Server. Links zu YouTube öffnen sich erst auf deinen Klick in einem neuen Tab.</p>
      <h2>Deine Rechte</h2>
      <p>Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch – eine E-Mail an uns genügt.</p>
    </LegalPage>
  );
}
