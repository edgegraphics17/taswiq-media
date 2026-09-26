import "server-only";
import { getTranslations } from "next-intl/server";
import { pipelinePackages } from "@/config/pipeline";
import type { Locale } from "@/i18n/routing";
import type { Pack } from "@/components/product/PricingSection";

/** Pakete = Preise aus config/pipeline.ts + Texte aus messages → pipeline.pricing */
export async function getPackages(locale: Locale): Promise<Pack[]> {
  const t = await getTranslations({ locale, namespace: "pipeline" });
  return pipelinePackages.map((p) => ({
    id: p.id,
    name: t(`pricing.packages.${p.id}.name`),
    audience: t(`pricing.packages.${p.id}.audience`),
    meta: t(`pricing.packages.${p.id}.meta`),
    features: t.raw(`pricing.packages.${p.id}.features`) as string[],
    price: p.price,
    unit: t(`pricing.units.${p.billing}`),
    featured: p.featured,
  }));
}
