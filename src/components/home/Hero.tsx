import type { StaticImageData } from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Star } from "lucide-react";
import { contactHref } from "@/config/site";
import { industryPages, type IndustryPageId } from "@/config/seo-pages";
import type { Locale } from "@/i18n/routing";
import { ButtonLink } from "@/components/ui/Button";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { HeroShowcase, type HeroScene } from "@/components/home/HeroShowcase";
import gastro from "../../../public/images/sectors/gastro-2.webp";
import beauty from "../../../public/images/sectors/beauty-0.webp";
import immobilien from "../../../public/images/sectors/immobilien-0.webp";
import automotive from "../../../public/images/sectors/automotive-1.webp";
import kanzlei from "../../../public/images/sectors/kanzlei-2.webp";
import handwerk from "../../../public/images/sectors/handwerk-5.webp";

/** Reihenfolge der Szenen + Foto des Betriebs (object-position hält das Motiv im Ausschnitt) */
const SCENES: { id: IndustryPageId; image: StaticImageData; position: string }[] = [
  { id: "gastro", image: gastro, position: "50% 50%" },
  { id: "beauty", image: beauty, position: "50% 50%" },
  { id: "handwerk", image: handwerk, position: "85% 50%" },
  { id: "automotive", image: automotive, position: "70% 50%" },
  { id: "kanzlei", image: kanzlei, position: "75% 50%" },
  { id: "immobilien", image: immobilien, position: "22% 50%" },
];

/**
 * Hero: "Dein eigenes …" – die Besucher:innen wählen ihren Betrieb, Headline, Foto und
 * Beispiel-System wechseln gemeinsam (HeroShowcase). Statt Kunden-Screenshots zeigt die Bühne
 * den Betrieb selbst und daneben, was bei ihm im System ankommt.
 * Darunter: zwei Pillen-Buttons, Social Proof aus der Media-Zeit, "backed by winsym.ai".
 */
export async function Hero() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.hero");
  const ti = await getTranslations("home.industries");

  const scenes: HeroScene[] = SCENES.map(({ id, image, position }) => {
    const page = industryPages.find((p) => p.id === id)!;
    const title = ti(`items.${id}.title`);
    return {
      id,
      icon: page.icon,
      image,
      position,
      title,
      href: { pathname: "/leistungen/[slug]", params: { slug: page.slugs[locale] } },
      linkLabel: t("sceneLink", { industry: title }),
      pill: t(`scenes.${id}.pill`),
      word: t(`scenes.${id}.word`),
      alt: t(`scenes.${id}.alt`),
      app: t(`scenes.${id}.app`),
      rows: t.raw(`scenes.${id}.rows`) as HeroScene["rows"],
      toastLabel: t(`scenes.${id}.toastLabel`),
      toastValue: t(`scenes.${id}.toastValue`),
      win: t(`scenes.${id}.win`),
    };
  });

  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-14 sm:pt-36 sm:pb-16 lg:pt-40">
      <div className="pointer-events-none absolute -top-40 left-0 -z-10 h-[520px] w-[900px] -translate-x-1/4 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.14),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute top-40 -right-40 -z-10 size-[460px] rounded-full bg-[radial-gradient(closest-side,rgb(249_207_212/0.6),transparent)]" aria-hidden />

      <div className="container-x">
        <HeroShowcase
          scenes={scenes}
          eyebrow={t("eyebrow")}
          titleStart={t("titleStart")}
          sub={t("sub")}
          question={t("question")}
          questionHint={t("questionHint")}
          pickerLabel={t("pickerLabel")}
          live={t("live")}
          actions={
            <>
              <ButtonLink href={contactHref}>
                {t("primary")} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/portfolio" variant="soft">
                {t("secondary")}
              </ButtonLink>
            </>
          }
          proof={
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="flex items-center gap-2 text-[13px] leading-tight text-muted">
                <span className="flex text-amber-400" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </span>
                <span>
                  <span className="font-medium text-ink">{t("proofTitle")}</span> {t("proofText")}
                </span>
              </p>
              <PartnerBadge />
            </div>
          }
        />
      </div>
    </section>
  );
}
