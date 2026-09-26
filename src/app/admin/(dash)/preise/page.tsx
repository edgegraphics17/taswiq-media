import { getPricingData } from "@/lib/pricing-source";
import { updatePrices } from "@/app/admin/actions";
import { OPTIONEN } from "@/config/pricing";

const GROUP_LABEL: Record<string, string> = {
  videoUmfang: "Video · Umfang", videoExtras: "Video · Extras", fotoUmfang: "Foto · Umfang", fotoExtras: "Foto · Extras",
  webArt: "Web · Pakete", webExtras: "Web · Extras", kiWorkflows: "KI · Workflows", anfahrt: "Anfahrt",
  contentAbo: "Content-Abo (monatlich)", hosting: "Hosting (monatlich)", kiBetrieb: "KI-Betreuung (monatlich)",
};

/**
 * Preis-Editor: schreibt in die Tabelle `services`, die pricing.ts zur Laufzeit überschreibt.
 * Nach dem Speichern ist der Rechner sofort aktuell (Cache-Tag "pricing").
 */
export default async function PricesPage({ searchParams }: { searchParams: Promise<{ saved?: string; demo?: string; error?: string }> }) {
  const [data, flags] = await Promise.all([getPricingData(), searchParams]);
  const groups = Object.keys(GROUP_LABEL);

  return (
    <div className="mx-auto max-w-[1000px]">
      <p className="eyebrow">Preisrechner</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Preise</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">Änderungen sind sofort im Rechner live. Deaktivierte Optionen werden ausgeblendet. Beträge in Euro, Endpreise.</p>
      {flags.saved && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Preise gespeichert – der Rechner ist aktualisiert.</p>}
      {flags.demo && <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Demo-Modus – nichts gespeichert.</p>}
      {flags.error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">Speichern fehlgeschlagen. Ist die Migration eingespielt?</p>}

      <form action={updatePrices} className="mt-6 space-y-6">
        {groups.map((g) => (
          <fieldset key={g} className="overflow-hidden rounded-2xl border border-line bg-white">
            <legend className="sr-only">{GROUP_LABEL[g]}</legend>
            <p className="border-b border-line bg-fog/60 px-4 py-2.5 text-xs font-bold tracking-wide text-ink">{GROUP_LABEL[g]}</p>
            <div className="divide-y divide-line">
              {OPTIONEN[g].map((base) => {
                const o = data.optionen[g]?.find((x) => x.id === base.id);
                const key = `${g}:${base.id}`;
                return (
                  <div key={key} className="grid items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_110px_110px_70px]">
                    <label className="grid gap-1 text-xs text-muted">
                      Bezeichnung
                      <input name={`label:${key}`} defaultValue={o?.label ?? base.label} className="h-10 rounded-lg border border-line px-3 text-sm text-ink" />
                    </label>
                    <label className="grid gap-1 text-xs text-muted">
                      Einmalig €
                      <input name={`preis:${key}`} type="number" min={0} defaultValue={o?.preis ?? base.preis ?? ""} className="num h-10 rounded-lg border border-line px-3 text-sm text-ink" />
                    </label>
                    <label className="grid gap-1 text-xs text-muted">
                      Monatlich €
                      <input name={`mtl:${key}`} type="number" min={0} defaultValue={o?.mtl ?? base.mtl ?? ""} className="num h-10 rounded-lg border border-line px-3 text-sm text-ink" />
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted sm:mt-4">
                      <input name={`active:${key}`} type="checkbox" defaultChecked={Boolean(o)} className="size-4 accent-[var(--color-teal-deep)]" /> Aktiv
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
        <div className="sticky bottom-4 flex justify-end">
          <button type="submit" className="h-12 rounded-full bg-teal px-8 font-semibold text-ink-950 shadow-[var(--shadow-teal)]">Preise speichern</button>
        </div>
      </form>
    </div>
  );
}
