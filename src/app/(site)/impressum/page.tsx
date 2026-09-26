import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { site, hasAddress } from "@/config/site";

export const metadata: Metadata = { title: "Impressum", robots: { index: false, follow: true }, alternates: { canonical: "/impressum" } };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
        Platzhalter – vor dem Livegang mit vollständiger Anschrift ergänzen und rechtlich prüfen lassen (z. B. über eRecht24).
      </p>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {site.legalName}
        <br />
        {hasAddress() ? (
          <>
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
          </>
        ) : (
          "[Straße, PLZ, Ort]"
        )}
      </p>
      <h2>Kontakt</h2>
      <p>
        Telefon: <a href={site.phoneHref}>{site.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <h2>Umsatzsteuer</h2>
      <p>{site.vatNote}</p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>{site.owner}, Anschrift wie oben.</p>
    </LegalPage>
  );
}
