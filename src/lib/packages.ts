import "server-only";
import { getTranslations } from "next-intl/server";
import { mediaPackages, rentPerMonth, runningCosts, softwarePackages } from "@/config/packages";
import type { Locale } from "@/i18n/routing";
import type { Pack } from "@/components/product/PricingSection";

/** Pakete = Preise aus config/packages.ts + Texte aus messages → packages */
export async function getPackages(locale: Locale, group: "software" | "media" = "software"): Promise<Pack[]> {
  const t = await getTranslations({ locale, namespace: "packages" });
  const list = group === "media" ? mediaPackages : softwarePackages;
  return list.map((p) => ({
    id: p.id,
    name: t(`${p.id}.name`),
    audience: t(`${p.id}.audience`),
    meta: t(`${p.id}.meta`),
    features: t.raw(`${p.id}.features`) as string[],
    price: p.price,
    unit: t(`units.${p.billing}`),
    from: p.from ? t("from") : undefined,
    featured: p.featured,
    rent: group === "software" ? rentPerMonth(p.price, p.id === "website" ? runningCosts.hosting : undefined) : undefined,
  }));
}
