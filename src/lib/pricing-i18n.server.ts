import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { asTranslator, type CalcI18n } from "@/lib/pricing-i18n";

/** Rechner-Übersetzungen für Server Components, API-Routen & Dashboard (dort immer "de"). */
export async function getCalcI18n(locale: Locale): Promise<CalcI18n> {
  const t = await getTranslations({ locale, namespace: "calculator" });
  return { t: asTranslator(t), locale };
}
