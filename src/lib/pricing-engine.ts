import { KONFIG, LEISTUNG_QUELLE, OPTIONEN, SCHRITTE, type CalcState, type Field, type Option, type Step } from "@/config/pricing";
import { fieldCopy, stepCopy, type CalcI18n } from "@/lib/pricing-i18n";
import { formatEUR } from "@/lib/format";

/**
 * Reine, seiteneffektfreie Rechner-Engine (Logik nach asapmarketing.de/rechner.html).
 * Läuft identisch im Browser (Live-Richtwert) und auf dem Server (/api/calculator),
 * damit gespeicherte Kalkulationen nie vom Client manipuliert werden können.
 *
 * Kernidee: Es zählt nur, was schon beantwortet ist. Der Richtwert wächst mit
 * jedem Schritt – Schritt 1 zeigt "ab X €", danach eine Spanne.
 *
 * Mehrsprachig: Alle lesbaren Texte (Posten, Zuschläge, Fehler) kommen über `i18n`
 * aus messages → calculator. Optionslabels übersetzt vorher `localizeOptions()`.
 */

export interface PriceLine {
  key: string;
  label: string;
  detail?: string;
  betrag: number;
}

export interface Estimate {
  einmalig: PriceLine[];
  monatlich: PriceLine[];
  summeEin: number;
  summeMtl: number;
  /** Untere/obere Grenze der Richtwert-Spanne (gerundet) */
  von: number;
  bis: number;
  /** Einstiegspreis der aktuellen Auswahl – für Schritt 1 */
  ab: number;
}

export interface PricingData {
  optionen: Record<string, Option[]>;
  konfig: typeof KONFIG;
}

const DEFAULT_DATA: PricingData = { optionen: OPTIONEN, konfig: KONFIG };

const runde = (n: number, auf: number) => Math.round(n / auf) * auf;

export function opt(quelle: string, id: unknown, data: PricingData = DEFAULT_DATA): Option | undefined {
  return data.optionen[quelle]?.find((o) => o.id === id);
}

export const fieldVisible = (f: Field, s: CalcState) => (f.wenn ? f.wenn(s) : true);
export const visibleSteps = (s: CalcState): Step[] => SCHRITTE.filter((st) => (st.wenn ? st.wenn(s) : true));

export function initialState(): CalcState {
  const s: CalcState = {};
  for (const st of SCHRITTE) {
    for (const f of st.felder) {
      if (f.typ === "check") s[f.id] = [...f.standard];
      else if (f.typ === "schalter") s[f.id] = false;
      else s[f.id] = f.standard;
    }
  }
  return s;
}

/** Ist der Schritt vollständig? (Pflicht-Mindestauswahl bei Checkbox-Feldern) */
export function stepError(step: Step, s: CalcState, { t }: CalcI18n): string | null {
  for (const f of step.felder) {
    if (!fieldVisible(f, s)) continue;
    if (f.typ === "check" && f.min && (s[f.id] as string[]).length < f.min) {
      return f.id === "leistungen" ? t("engine.minService") : t("engine.minOption");
    }
  }
  return null;
}

/**
 * Säubert beliebigen Input (z. B. aus dem Request-Body) gegen die Schritt-Definition:
 * unbekannte Felder fallen weg, ungültige Werte werden durch Standards ersetzt.
 */
export function sanitizeState(input: unknown, data: PricingData = DEFAULT_DATA): CalcState {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const s = initialState();
  for (const st of SCHRITTE) {
    for (const f of st.felder) {
      const v = raw[f.id];
      if (f.typ === "radio" && typeof v === "string" && opt(f.quelle, v, data)) s[f.id] = v;
      if (f.typ === "check" && Array.isArray(v)) s[f.id] = v.filter((x) => typeof x === "string" && opt(f.quelle, x, data));
      if (f.typ === "zahl" && typeof v === "number" && Number.isFinite(v)) s[f.id] = Math.min(f.max, Math.max(f.min, Math.round(v)));
      if (f.typ === "schalter" && typeof v === "boolean") s[f.id] = v;
    }
  }
  return s;
}

/**
 * @param answeredUpTo Index im Array der sichtbaren Schritte, bis zu dem Antworten zählen.
 *                     Standard: alles (Ergebnis / Server).
 */
export function computeEstimate(s: CalcState, answeredUpTo: number, data: PricingData, i18n: CalcI18n): Estimate {
  const { konfig } = data;
  const { t, locale } = i18n;
  const eur = (n: number) => formatEUR(n, locale);
  const steps = visibleSteps(s);
  const upto = Math.min(answeredUpTo, steps.length - 1);
  const festival = s.branche === "musik";

  const ein: PriceLine[] = [];
  const mtl: PriceLine[] = [];
  let drehSumme = 0;

  const addOption = (f: Field & { quelle: string }, o: Option) => {
    const { posten } = fieldCopy(i18n, f);
    const label = posten ? `${posten} · ${o.label}` : o.label;
    if (o.preis) {
      ein.push({ key: `${f.id}:${o.id}`, label, detail: o.hint, betrag: o.preis });
      if (o.dreh) drehSumme += o.preis;
    }
    if (o.mtl) mtl.push({ key: `${f.id}:${o.id}`, label, detail: o.hint, betrag: o.mtl });
  };

  steps.forEach((st, i) => {
    if (i > upto || st.ergebnis) return;
    for (const f of st.felder) {
      if (!fieldVisible(f, s)) continue;
      if (f.typ === "radio") {
        const o = opt(f.quelle, s[f.id], data);
        if (o) addOption(f, o);
      } else if (f.typ === "check") {
        for (const id of s[f.id] as string[]) {
          const o = opt(f.quelle, id, data);
          if (o) addOption(f, o);
        }
      } else if (f.typ === "zahl") {
        const n = Number(s[f.id]) || 0;
        if (n > 0) {
          const betrag = n * f.preisProEinheit;
          const copy = fieldCopy(i18n, f);
          ein.push({
            key: f.id,
            label: t("engine.count", { label: copy.label ?? f.id, count: n, unit: copy.einheit ?? "" }),
            detail: t("engine.perUnit", { amount: eur(f.preisProEinheit) }),
            betrag,
          });
          if (f.dreh) drehSumme += betrag;
        }
      }
    }
  });

  if (festival && drehSumme > 0) {
    ein.push({
      key: "festival",
      label: t("engine.festival"),
      detail: t("engine.festivalDetail", { pct: Math.round((konfig.festivalFaktor - 1) * 100) }),
      betrag: drehSumme * (konfig.festivalFaktor - 1),
    });
  }

  let summeEin = ein.reduce((a, l) => a + l.betrag, 0);
  const expressAnswered = steps.findIndex((st) => st.felder.some((f) => f.id === "express")) <= upto;
  if (s.express === true && expressAnswered && summeEin > 0) {
    const auf = summeEin * konfig.expressAufschlag;
    ein.push({ key: "express", label: t("engine.express"), detail: t("engine.expressDetail", { pct: Math.round(konfig.expressAufschlag * 100) }), betrag: auf });
    summeEin += auf;
  }
  const summeMtl = mtl.reduce((a, l) => a + l.betrag, 0);

  return {
    einmalig: ein.map((l) => ({ ...l, betrag: Math.round(l.betrag) })),
    monatlich: mtl,
    summeEin: Math.round(summeEin),
    summeMtl,
    von: runde(summeEin * (1 - konfig.spanneUnten), konfig.rundenAuf),
    bis: runde(summeEin * (1 + konfig.spanneOben), konfig.rundenAuf),
    ab: einstiegspreis(s, data),
  };
}

/** Günstigste Hauptoption je gewählter Leistung – "ab"-Preis in Schritt 1. */
function einstiegspreis(s: CalcState, data: PricingData): number {
  const leistungen = (s.leistungen as string[]) ?? [];
  const f = s.branche === "musik" ? data.konfig.festivalFaktor : 1;
  let sum = 0;
  for (const id of leistungen) {
    const ref = LEISTUNG_QUELLE[id];
    if (!ref) continue;
    const min = Math.min(...(data.optionen[ref.quelle] ?? []).map((o) => o.preis ?? Infinity));
    if (Number.isFinite(min)) sum += min * (ref.dreh ? f : 1);
  }
  return Math.round(sum);
}

/** "490 €", "49 €/Monat", "inklusive" – Preishinweis auf jeder Karte */
export function priceHint(o: Option, { t, locale }: CalcI18n): string {
  const parts: string[] = [];
  if (o.preis) parts.push(formatEUR(o.preis, locale));
  if (o.mtl) parts.push(t("engine.perMonth", { amount: formatEUR(o.mtl, locale) }));
  if (!parts.length && (o.preis === 0 || o.mtl === 0)) return t("engine.included");
  return parts.join(" · ");
}

/** Lesbare Auswahl-Liste – für PDF, "Zusammenfassung kopieren", Lead-Payload & Backend */
export function summaryRows(s: CalcState, data: PricingData, i18n: CalcI18n): { id: string; label: string; wert: string }[] {
  const { t } = i18n;
  const rows: { id: string; label: string; wert: string }[] = [];
  for (const st of visibleSteps(s)) {
    if (st.ergebnis) continue;
    const { kurz } = stepCopy(i18n, st);
    for (const f of st.felder) {
      if (!fieldVisible(f, s)) continue;
      let wert: string;
      if (f.typ === "radio") wert = opt(f.quelle, s[f.id], data)?.label ?? "–";
      else if (f.typ === "check")
        wert = (s[f.id] as string[]).map((id) => opt(f.quelle, id, data)?.label).filter(Boolean).join(", ") || t("engine.none");
      else if (f.typ === "schalter") wert = s[f.id] ? t("engine.yes") : t("engine.no");
      else wert = Number(s[f.id]) === 0 ? t("engine.none") : String(s[f.id]);
      // Leistungs-Schritte bekommen ein Präfix, sonst gäbe es "Umfang" für Video UND Foto
      const fieldLabel = fieldCopy(i18n, f).label;
      const generic = ["start", "extras", "laufend", "funktionen"].includes(st.id);
      const label = generic ? (fieldLabel ?? kurz) : `${kurz} · ${fieldLabel ?? t("engine.selection")}`;
      rows.push({ id: f.id, label, wert });
    }
  }
  return rows;
}

export function summaryText(s: CalcState, e: Estimate, data: PricingData, i18n: CalcI18n): string {
  const { t, locale } = i18n;
  const eur = (n: number) => formatEUR(n, locale);
  const lines = [t("summary.heading"), ""];
  summaryRows(s, data, i18n).forEach((r) => lines.push(`- ${r.label}: ${r.wert}`));
  lines.push("", t("summary.oneTime"));
  e.einmalig.forEach((l) => lines.push(`- ${l.label}: ${eur(l.betrag)}`));
  if (e.monatlich.length) {
    lines.push("", t("summary.monthly"));
    e.monatlich.forEach((l) => lines.push(`- ${l.label}: ${t("engine.perMonth", { amount: eur(l.betrag) })}`));
  }
  lines.push("", t("summary.range", { from: eur(e.von), to: eur(e.bis) }));
  lines.push(t("summary.running", { value: e.summeMtl > 0 ? t("summary.perMonthLong", { amount: eur(e.summeMtl) }) : t("summary.noRunning") }));
  lines.push("", t("summary.footer"));
  return lines.join("\n");
}
