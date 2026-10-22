import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { addDomain, saveGoogleClient } from "@/app/admin/seo-actions";
import { requireAdmin } from "@/lib/admin/data";
import { getGoogle, gscReport, listDomains, type SeoDomain } from "@/lib/admin/seo";
import { requestOrigin } from "@/lib/admin/site-report";
import { Delta } from "@/components/admin/SeoBits";
import { cn, formatDateTime, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "SEO" };

const input = "min-h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink";
const button = "flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-brand-600";

async function DomainCard({ d }: { d: SeoDomain }) {
  const gsc = d.data.gscSite ? await gscReport(d.data.gscSite, 28, false).catch((e: Error) => e) : null;
  const issues = d.data.crawl ? d.data.crawl.pages.reduce((a, p) => a + p.issues.length, 0) + d.data.crawl.broken.length : null;
  const psi = d.data.psi?.mobile?.score;
  return (
    <Link href={`/admin/seo/${d.domain}`} className="group block rounded-2xl border border-line bg-white p-5 hover:border-brand-200">
      <div className="flex items-center justify-between gap-3">
        <h2 className="truncate font-bold text-ink">{d.domain}</h2>
        <ArrowRight className="size-4 shrink-0 text-muted group-hover:text-brand-600" aria-hidden />
      </div>
      {gsc instanceof Error ? (
        <p className="mt-3 text-sm text-red-700">Search Console: {gsc.message}</p>
      ) : gsc ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><dt className="text-xs text-muted">Klicks</dt><dd className="num font-bold text-ink">{formatNumber(gsc.total.clicks)} <Delta now={gsc.total.clicks} prev={gsc.prev.clicks} /></dd></div>
          <div><dt className="text-xs text-muted">Impressionen</dt><dd className="num font-bold text-ink">{formatNumber(gsc.total.impressions)} <Delta now={gsc.total.impressions} prev={gsc.prev.impressions} /></dd></div>
          <div><dt className="text-xs text-muted">CTR</dt><dd className="num font-bold text-ink">{(gsc.total.ctr * 100).toLocaleString("de-DE", { maximumFractionDigits: 1 })} %</dd></div>
          <div><dt className="text-xs text-muted">Ø Position</dt><dd className="num font-bold text-ink">{gsc.total.position ? gsc.total.position.toLocaleString("de-DE", { maximumFractionDigits: 1 }) : "–"} <Delta now={gsc.total.position} prev={gsc.prev.position} lowerIsBetter /></dd></div>
        </dl>
      ) : (
        <p className="mt-3 text-sm text-muted">Keine Search-Console-Property zugeordnet.</p>
      )}
      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span>Seiten-Check: {issues === null ? "noch nicht gelaufen" : <b className={issues ? "text-amber-700" : "text-emerald-700"}>{issues} Hinweise</b>}</span>
        <span>PageSpeed mobil: {psi === undefined ? "–" : <b className={psi >= 90 ? "text-emerald-700" : psi >= 50 ? "text-amber-700" : "text-red-700"}>{psi}</b>}</span>
      </p>
    </Link>
  );
}

/** Übersicht aller betreuten Domains (eigene und Kunden) – letzte 28 Tage aus der Search Console. */
export default async function SeoPage({ searchParams }: { searchParams: Promise<{ google?: string; fehler?: string }> }) {
  const admin = await requireAdmin();
  if (admin.demo) return <p className="text-sm text-muted">Das SEO-Modul braucht das Backend – im Demo-Modus nicht verfügbar.</p>;
  const sp = await searchParams;
  const [google, domains, origin] = await Promise.all([getGoogle(), listDomains(), requestOrigin()]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold tracking-tight text-ink">SEO</h1>
      <p className="mt-1 text-sm text-muted">Search Console, GA4, PageSpeed und eigener Seiten-Check – letzte 28 Tage, Vergleich zum Vorzeitraum.</p>

      {sp.google && <p className={cn("mt-4 rounded-xl px-4 py-3 text-sm", sp.google === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900")}>{sp.google === "ok" ? "Google ist verbunden." : sp.google}</p>}

      {!google.refreshToken && (
        <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
          <h2 className="font-bold">Google verbinden (einmalig)</h2>
          {!google.clientId ? (
            <>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>In der Google Cloud Console ein Projekt anlegen und dort <b>Google Search Console API</b>, <b>Google Analytics Data API</b> und <b>Google Analytics Admin API</b> aktivieren.</li>
                <li>OAuth-Zustimmungsbildschirm: Typ „Extern“, danach auf „In Produktion“ stellen (sonst läuft der Zugang nach 7 Tagen ab).</li>
                <li>Anmeldedaten → OAuth-Client-ID → „Webanwendung“, autorisierte Weiterleitungs-URI: <code className="rounded bg-white px-1 break-all">{origin}/admin/seo/google</code></li>
                <li>Client-ID und Client-Secret hier eintragen – danach geht es direkt zur Google-Anmeldung.</li>
              </ol>
              <form action={saveGoogleClient} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input name="clientId" required placeholder="Client-ID" autoComplete="off" className={input} />
                <input name="clientSecret" type="password" required placeholder="Client-Secret" autoComplete="off" className={input} />
                <button className={button}>Speichern & verbinden</button>
              </form>
            </>
          ) : (
            <Link href="/admin/seo/google" prefetch={false} className={cn(button, "mt-3 inline-flex")}>Mit Google anmelden</Link>
          )}
        </section>
      )}

      <form action={addDomain} className="mt-6 flex gap-2">
        <label htmlFor="domain" className="sr-only">Domain hinzufügen</label>
        <input id="domain" name="domain" required placeholder="kundendomain.de" className={cn(input, "max-w-sm")} />
        <button className={button}><Plus className="size-4" aria-hidden /> Hinzufügen</button>
      </form>
      {sp.fehler === "domain" && <p className="mt-2 text-sm text-red-700">Bitte eine gültige Domain eingeben, z. B. beispiel.de.</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {domains.map((d) => <DomainCard key={d.domain} d={d} />)}
      </div>
      {!domains.length && <p className="mt-6 text-sm text-muted">Noch keine Domain angelegt.</p>}
      {google.email && <p className="mt-8 text-xs text-muted">Verbunden mit {google.email} · <Link href="/admin/seo/google" prefetch={false} className="underline">neu verbinden</Link> · Stand {formatDateTime(new Date().toISOString())}</p>}
    </div>
  );
}
