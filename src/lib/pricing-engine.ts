import { KONFIG, OPTIONEN, SCHRITTE, type CalcState, type Field, type Option, type Step } from "@/config/pricing";

/**
 * Reine, seiteneffektfreie Rechner-Engine (Logik nach asapmarketing.de/rechner.html).
 * Läuft identisch im Browser (Live-Richtwert) und auf dem Server (/api/calculator),
 * damit gespeicherte Kalkulationen nie vom Client manipuliert werden können.
 *
 * Kernidee: Es zählt nur, was schon beantwortet ist. Der Richtwert wächst mit
 * jedem Schritt – Schritt 1 zeigt "ab X €", danach eine Spanne.
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
export function stepError(step: Step, s: CalcState): string | null {
  for (const f of step.felder) {
    if (!fieldVisible(f, s)) continue;
    if (f.typ === "check" && f.min && (s[f.id] as string[]).length < f.min) {
      return f.id === "leistungen" ? "Wähle mindestens eine Leistung." : "Wähle mindestens eine Option.";
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
export function computeEstimate(s: CalcState, answeredUpTo = Number.POSITIVE_INFINITY, data: PricingData = DEFAULT_DATA): Estimate {
  const { konfig } = data;
  const steps = visibleSteps(s);
  const upto = Math.min(answeredUpTo, steps.length - 1);
  const festival = s.branche === "musik";

  const ein: PriceLine[] = [];
  const mtl: PriceLine[] = [];
  let drehSumme = 0;

  const addOption = (f: Field & { quelle: string }, o: Option) => {
    const label = f.posten ? `${f.posten} · ${o.label}` : o.label;
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
          ein.push({ key: f.id, label: `${f.label}: ${n} × ${f.einheit}`, detail: `je ${f.preisProEinheit} €`, betrag });
          if (f.dreh) drehSumme += betrag;
        }
      }
    }
  });

  if (festival && drehSumme > 0) {
    ein.push({
      key: "festival",
      label: "Festival- & Nachtdreh-Zuschlag",
      detail: `+${Math.round((konfig.festivalFaktor - 1) * 100)} % auf Dreh-Leistungen`,
      betrag: drehSumme * (konfig.festivalFaktor - 1),
    });
  }

  let summeEin = ein.reduce((a, l) => a + l.betrag, 0);
  const expressAnswered = steps.findIndex((st) => st.felder.some((f) => f.id === "express")) <= upto;
  if (s.express === true && expressAnswered && summeEin > 0) {
    const auf = summeEin * konfig.expressAufschlag;
    ein.push({ key: "express", label: "Express-Lieferung (72 h)", detail: `+${Math.round(konfig.expressAufschlag * 100)} %`, betrag: auf });
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
  const min = (quelle: string, dreh: boolean) =>
    Math.min(...(data.optionen[quelle] ?? []).map((o) => o.preis ?? Infinity)) * (dreh ? f : 1);
  let sum = 0;
  if (leistungen.includes("video")) sum += min("videoUmfang", true);
  if (leistungen.includes("foto")) sum += min("fotoUmfang", true);
  if (leistungen.includes("web")) sum += min("webArt", false);
  if (leistungen.includes("ki")) sum += min("kiWorkflows", false);
  return Math.round(sum);
}

/** "+ 490 €", "+ 49 €/Monat", "inklusive" – Preishinweis auf jeder Karte */
export function priceHint(o: Option): string {
  const eur = (n: number) => new Intl.NumberFormat("de-DE").format(n) + " €";
  const parts: string[] = [];
  if (o.preis) parts.push(`${eur(o.preis)}`);
  if (o.mtl) parts.push(`${eur(o.mtl)}/Monat`);
  if (!parts.length && (o.preis === 0 || o.mtl === 0)) return "inklusive";
  return parts.join(" · ");
}

/** Lesbare Auswahl-Liste – für PDF, "Zusammenfassung kopieren", Lead-Payload & Supabase */
export function summaryRows(s: CalcState, data: PricingData = DEFAULT_DATA): { id: string; label: string; wert: string }[] {
  const rows: { id: string; label: string; wert: string }[] = [];
  for (const st of visibleSteps(s)) {
    if (st.ergebnis) continue;
    for (const f of st.felder) {
      if (!fieldVisible(f, s)) continue;
      let wert: string;
      if (f.typ === "radio") wert = opt(f.quelle, s[f.id], data)?.label ?? "–";
      else if (f.typ === "check")
        wert = (s[f.id] as string[]).map((id) => opt(f.quelle, id, data)?.label).filter(Boolean).join(", ") || "keine";
      else if (f.typ === "schalter") wert = s[f.id] ? "ja" : "nein";
      else wert = Number(s[f.id]) === 0 ? "keine" : String(s[f.id]);
      // Leistungs-Schritte bekommen ein Präfix, sonst gäbe es "Umfang" für Video UND Foto
      const generic = ["start", "extras", "laufend"].includes(st.id);
      const label = generic ? (f.label ?? st.kurz) : `${st.kurz} · ${f.label ?? "Auswahl"}`;
      rows.push({ id: f.id, label, wert });
    }
  }
  return rows;
}

export function summaryText(s: CalcState, e: Estimate): string {
  const eur = (n: number) => new Intl.NumberFormat("de-DE").format(n) + " €";
  const lines = ["TASWIQ MEDIA. – KOSTENRAHMEN", ""];
  summaryRows(s).forEach((r) => lines.push(`- ${r.label}: ${r.wert}`));
  lines.push("", "POSTEN EINMALIG");
  e.einmalig.forEach((l) => lines.push(`- ${l.label}: ${eur(l.betrag)}`));
  if (e.monatlich.length) {
    lines.push("", "POSTEN MONATLICH");
    e.monatlich.forEach((l) => lines.push(`- ${l.label}: ${eur(l.betrag)}/Monat`));
  }
  lines.push("", `Richtwert einmalig: ${eur(e.von)} – ${eur(e.bis)}`);
  lines.push(`Laufend: ${e.summeMtl > 0 ? eur(e.summeMtl) + " pro Monat" : "keine laufenden Kosten"}`);
  lines.push("", "Richtwert, kein Angebot. Endpreise gemäß § 19 UStG.");
  return lines.join("\n");
}
