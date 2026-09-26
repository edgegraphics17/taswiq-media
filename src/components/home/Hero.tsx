import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BadgeCheck, Play, Star } from "lucide-react";
import { portfolioItems } from "@/config/content";
import { contactHref, site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard, MiniBars } from "@/components/ui/FloatCard";
import { HeroVideo } from "@/components/home/HeroVideo";
import { WordRotator } from "@/components/home/WordRotator";
import poster from "../../../public/images/showreel-poster.jpg";

/**
 * Hero im Soft-UI-Stil: zentrierte, leichte Headline mit rotierendem Wort,
 * zwei Pillen-Buttons, darunter das Showreel als abgerundete Karte mit
 * schwebenden Info-Karten (Stat-Karte schwarz, Qualitäts-Karte weiß, Play-Pille).
 *
 * Server Component: Texte kommen per getTranslations() aus messages/{de,en}.json –
 * die Sprache liefert das [locale]-Segment, es wird kein Übersetzungs-JS an den Client geschickt.
 */
export async function Hero() {
  const t = await getTranslations("home.hero");
  const rotating = t.raw("rotating") as string[];
  const thumbs = portfolioItems.filter((p) => p.poster).slice(0, 4);

  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      {/* weiche Farbnebel im Hintergrund */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.14),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute top-40 -right-40 -z-10 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(249_207_212/0.6),transparent)]" aria-hidden />

      <div className="container-x text-center">
        <div className="flex animate-rise justify-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
        </div>
        <h1 className="mx-auto mt-5 max-w-4xl animate-rise text-[clamp(2.6rem,7vw,5.4rem)] leading-[1.02] font-medium [animation-delay:0.08s]">
          {t("titleStart")} <WordRotator words={rotating} />
          <span className="sr-only">
            {t("titleStart")} {rotating.join(", ")}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl animate-rise text-[15.5px] leading-relaxed text-muted [animation-delay:0.16s]">{t("sub")}</p>
        <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:0.24s]">
          <ButtonLink href={contactHref}>
            {t("primary")} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/preisrechner" variant="soft">
            {t("secondary")}
          </ButtonLink>
        </div>

        {/* Social Proof: Projekt-Thumbnails als Avatar-Reihe */}
        <div className="mt-8 flex animate-rise items-center justify-center gap-3 [animation-delay:0.3s]">
          <div className="flex -space-x-2.5">
            {thumbs.map((p) => (
              <span key={p.id} className="relative size-9 overflow-hidden rounded-full ring-2 ring-canvas">
                <Image src={p.poster!} alt="" fill sizes="36px" className="object-cover" />
              </span>
            ))}
          </div>
          <p className="text-left text-[13px] leading-tight text-muted">
            <span className="flex items-center gap-1 font-medium text-ink">
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden /> {t("proofTitle")}
            </span>
            {t("proofText")}
          </p>
        </div>
      </div>

      {/* Medien-Collage mit schwebenden Karten */}
      <div className="container-x mt-14 animate-rise [animation-delay:0.36s]">
        <div className="relative mx-auto max-w-5xl">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-night shadow-[var(--shadow-float)] sm:aspect-[16/9] sm:rounded-[2.5rem]">
            <Image src={poster} alt={t("posterAlt")} fill priority placeholder="blur" sizes="(min-width:1024px) 1000px, 100vw" className="object-cover" />
            {site.heroVideo && <HeroVideo src={site.heroVideo} />}
          </div>

          <FloatCard tone="night" className="top-3 -left-2 w-32 !p-3 text-left sm:top-10 sm:-left-10 sm:w-48 sm:!p-3.5">
            <p className="num text-2xl font-medium tracking-tight sm:text-3xl">
              450<span className="text-lg text-brand-300">+</span>
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-night-muted">{t("statCard")}</p>
            <MiniBars className="mt-3 hidden sm:flex" />
          </FloatCard>

          <FloatCard slow className="-bottom-6 left-4 hidden w-52 text-left sm:block lg:-left-8">
            <span className="grid size-10 place-items-center rounded-full bg-mint-500 text-white">
              <BadgeCheck className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium">{t("qualityTitle")}</p>
            <p className="text-xs text-muted">{t("qualityText")}</p>
          </FloatCard>

          <FloatCard className="right-4 -bottom-5 flex items-center gap-2.5 !rounded-full py-2 pr-4 pl-2 sm:-right-6">
            <span className="grid size-9 place-items-center rounded-full bg-brand-500 text-white">
              <Play className="size-4 translate-x-px fill-current" aria-hidden />
            </span>
            <span className="text-left text-[13px] leading-tight font-medium">
              {t("showreel")}
              <span className="block text-[11px] font-normal text-muted">{t("showreelMeta")}</span>
            </span>
          </FloatCard>
        </div>
      </div>
    </section>
  );
}
