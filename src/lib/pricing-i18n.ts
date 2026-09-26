import { OPTIONEN, KONFIG, type Field, type Option, type Step } from "@/config/pricing";
import type { Locale } from "@/i18n/routing";
import type { PricingData } from "@/lib/pricing-engine";

/**
 * Übersetzungs-Schicht des Preisrechners.
 * Die Engine ist rein & sprachneutral – alles Lesbare holt sie über `CalcI18n`.
 *  - Client:  useTranslations("calculator") + useLocale()
 *  - Server:  getTranslations({ locale, namespace: "calculator" })
 */
export interface Translator {
  (key: string, values?: Record<string, string | number>): string;
  has(key: string): boolean;
}
export interface CalcI18n {
  t: Translator;
  locale: Locale;
}

/** next-intl-Übersetzer (streng typisiert) → lockerer Engine-Typ, weil die Keys dynamisch aus IDs entstehen */
export const asTranslator = (t: unknown) => t as Translator;

export const stepCopy = ({ t }: CalcI18n, step: Step) => ({
  kurz: t(`steps.${step.id}.kurz`),
  titel: t(`steps.${step.id}.titel`),
  hint: t.has(`steps.${step.id}.hint`) ? t(`steps.${step.id}.hint`) : undefined,
});

export function fieldCopy({ t }: CalcI18n, field: Field) {
  const k = (name: string) => (t.has(`fields.${field.id}.${name}`) ? `fields.${field.id}.${name}` : null);
  const label = k("label");
  const hint = k("hint");
  const posten = k("posten");
  const einheit = k("einheit");
  return {
    label: label ? t(label) : undefined,
    // Einziger Platzhalter: Express-Aufschlag in Prozent
    hint: hint ? t(hint, { pct: Math.round(KONFIG.expressAufschlag * 100) }) : undefined,
    posten: posten ? t(posten) : undefined,
    einheit: einheit ? t(einheit) : undefined,
  };
}

/**
 * Optionstexte übersetzen. Preise/Aktiv-Status kommen weiter aus Supabase.
 * Deutsch: hat jemand im Dashboard das Label geändert (≠ Stammdaten), gewinnt das Dashboard.
 */
export function localizeOptions(data: PricingData, { t, locale }: CalcI18n): PricingData {
  const optionen: Record<string, Option[]> = {};
  for (const [group, options] of Object.entries(data.optionen)) {
    optionen[group] = options.map((o) => {
      const base = OPTIONEN[group]?.find((b) => b.id === o.id);
      const key = `options.${group}.${o.id}`;
      const customized = locale === "de" && base && (o.label !== base.label || o.hint !== base.hint);
      if (customized || !t.has(`${key}.label`)) return o;
      return {
        ...o,
        label: t(`${key}.label`),
        hint: t.has(`${key}.hint`) ? t(`${key}.hint`) : undefined,
        badge: t.has(`${key}.badge`) ? t(`${key}.badge`) : undefined,
      };
    });
  }
  return { ...data, optionen };
}
