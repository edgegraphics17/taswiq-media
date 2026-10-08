import type { BlogCategory, BlogPost } from "./types";
import { post as bestellsystem } from "./posts/eigenes-bestellsystem-statt-lieferando";
import { post as physio } from "./posts/buchungssystem-physiotherapie";
import { post as treatwell } from "./posts/treatwell-alternative";
import { post as softwareKosten } from "./posts/software-entwickeln-lassen-kosten";
import { post as individualVsStandard } from "./posts/individualsoftware-vs-standardsoftware";
import { post as websiteMonatlich } from "./posts/website-erstellen-lassen-monatliche-kosten";
import { post as handwerkKlein } from "./posts/handwerkersoftware-kleinbetriebe";
import { post as foerderung } from "./posts/digitalisierung-handwerk-foerderung";
import { post as kundenportal } from "./posts/kundenportal-erstellen-lassen";
import { post as werkstatt } from "./posts/werkstatt-termin-online-buchen";
import { post as mieterportal } from "./posts/mieterportal";
import { post as tischreservierung } from "./posts/tischreservierungssystem";
import { post as kurse } from "./posts/online-buchungssystem-fuer-kurse";
import { post as baeckerei } from "./posts/bestellsystem-baeckerei";
import { post as qrBestellung } from "./posts/qr-code-bestellsystem";
import { post as immobilien } from "./posts/software-fuer-makler-und-hausverwaltungen";
import { post as automotive } from "./posts/digitalisierung-autohaus-fahrschule";
import { post as kanzlei } from "./posts/mandantenportal-steuerberater";
import { post as beauty } from "./posts/buchungssystem-friseur-ohne-provision";
import { post as handwerk } from "./posts/software-fuer-handwerker-und-dienstleister";
import { post as individual } from "./posts/individualsoftware-mittelstand-kosten";
import { post as kiDev } from "./posts/software-mit-ki-entwickeln";
import { post as webapp } from "./posts/web-app-oder-native-app";
import { post as dashboard } from "./posts/unternehmens-dashboard-kennzahlen";
import { post as kiAuto } from "./posts/ki-automatisierung-mittelstand";
import { post as kiTelefon } from "./posts/ki-telefonassistent-kosten";
import { post as website } from "./posts/was-kostet-eine-website";
import { post as saas } from "./posts/saas-abo-oder-eigene-software";
import { post as aftermovie } from "./posts/aftermovie-premium-festivalfilm";

export type { BlogCategory, BlogPost, BlogBlock } from "./types";

/** Reihenfolge = Reihenfolge im Blog-Index (neueste/wichtigste zuerst) */
export const posts: BlogPost[] = [
  kurse,
  tischreservierung,
  mieterportal,
  werkstatt,
  kundenportal,
  foerderung,
  handwerkKlein,
  websiteMonatlich,
  individualVsStandard,
  softwareKosten,
  treatwell,
  physio,
  individual,
  qrBestellung,
  kiTelefon,
  baeckerei,
  bestellsystem,
  kiDev,
  beauty,
  kanzlei,
  saas,
  immobilien,
  kiAuto,
  handwerk,
  automotive,
  webapp,
  dashboard,
  website,
  aftermovie,
];

export const blogCategories: BlogCategory[] = ["branchen", "software", "ki", "ratgeber", "media"];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

/** Lesezeit bei ~200 Wörtern pro Minute */
export function readingMinutes(p: BlogPost): number {
  const text = [
    p.intro,
    ...p.takeaways,
    ...p.sections.flatMap((s) => [
      s.h2,
      ...s.blocks.flatMap((b) => ("p" in b ? [b.p] : "tip" in b ? [b.tip] : "ul" in b ? b.ul : "ol" in b ? b.ol : [...b.table.head, ...b.table.rows.flat()])),
    ]),
    ...p.faq.flatMap((f) => [f.q, f.a]),
  ].join(" ");
  return Math.max(3, Math.round(text.split(/\s+/).length / 200));
}

/** Verwandte Artikel: gleiche Kategorie oder gleiche Landingpage, ohne den Artikel selbst */
export function relatedPosts(p: BlogPost, n = 3): BlogPost[] {
  const score = (q: BlogPost) => (q.page === p.page ? 2 : 0) + (q.category === p.category ? 1 : 0);
  return posts
    .filter((q) => q.slug !== p.slug)
    .sort((a, b) => score(b) - score(a))
    .slice(0, n);
}
