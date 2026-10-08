import { rental, rentPerMonth, runningCosts, starterOffer } from "@/config/packages";
import type { Locale } from "@/i18n/routing";
import { formatEUR } from "@/lib/format";

/**
 * Zahlen des Einstiegsangebots als fertige Textbausteine – alle aus config/packages.ts,
 * damit Angebotsseite, Kurzfassung und Preisliste nie auseinanderlaufen.
 * Platzhalter in den Texten (messages → starterOffer): {price} {rent} {ops} {trial} {term} {pro} {whatsapp} {mehrsprachig} {seo}
 */
export function starterOfferVars(locale: Locale) {
  const eur = (n: number) => formatEUR(n, locale);
  return {
    price: eur(starterOffer.price),
    rent: eur(rentPerMonth(starterOffer.price)),
    ops: eur(runningCosts.hosting),
    trial: String(rental.trialMonths),
    term: String(rental.minTermMonths),
    pro: eur(starterOffer.proPrice),
    whatsapp: eur(starterOffer.extras.whatsapp),
    mehrsprachig: eur(starterOffer.extras.mehrsprachig),
    seo: eur(starterOffer.extras.seo),
  };
}

/** Setzt die Platzhalter in einem Text oder in einer ganzen Textstruktur ein. */
export function fillOffer<T>(value: T, vars: Record<string, string>): T {
  if (typeof value === "string") return value.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m) as T;
  if (Array.isArray(value)) return value.map((v) => fillOffer(v, vars)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillOffer(v, vars)])) as T;
  return value;
}
