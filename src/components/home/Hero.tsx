import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BadgeCheck, BellRing, Globe, Star } from "lucide-react";
import { contactHref } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard, MiniBars } from "@/components/ui/FloatCard";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { WordRotator } from "@/components/home/WordRotator";
import daron from "../../../public/images/portfolio/site-daron.jpg";
import omedMobile from "../../../public/images/portfolio/mobile-omed.jpg";

/**
 * Hero: Software-Versprechen mit rotierendem System-Typ ("Dein eigenes Bestellsystem."),
 * zwei Pillen-Buttons, Social Proof aus der Media-Zeit, "backed by winsym.ai".
 * Darunter echte Projekte als Produkt-Collage: Bestellsystem im Browser, Buchung auf dem Handy,
 * schwebende Karten mit Live-Bestellung und 0 % Provision.
 */
export async function Hero() {
  const t = await getTranslations("home.hero");
  const rotating = t.raw("rotating") as string[];

  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-16 sm:pt-40">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.14),transparent)]" aria-hidden />
      <div className="pointer-events-none absolute top-40 -right-40 -z-10 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(249_207_212/0.6),transparent)]" aria-hidden />

      <div className="container-x text-center">
        <div className="flex animate-rise justify-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
        </div>
        <h1 className="mx-auto mt-5 max-w-5xl animate-rise text-[clamp(2.5rem,6.6vw,5.2rem)] leading-[1.03] font-medium [animation-delay:0.08s]">
          <span aria-hidden>
            {t("titleStart")}{" "}
            <span className="text-brand-500">
              <WordRotator words={rotating} />
            </span>
          </span>
          <span className="sr-only">
            {t("titleStart")} {rotating.join(", ")}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl animate-rise text-[16px] leading-relaxed text-muted [animation-delay:0.16s]">{t("sub")}</p>
        <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:0.24s]">
          <ButtonLink href={contactHref}>
            {t("primary")} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/portfolio" variant="soft">
            {t("secondary")}
          </ButtonLink>
        </div>

        <div className="mt-8 flex animate-rise flex-wrap items-center justify-center gap-x-6 gap-y-3 [animation-delay:0.3s]">
          <p className="flex items-center gap-2 text-left text-[13px] leading-tight text-muted">
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
      </div>

      {/* Produkt-Collage aus echten Projekten */}
      <div className="container-x mt-14 animate-rise [animation-delay:0.36s]">
        <div className="relative mx-auto max-w-5xl pb-6 sm:pb-10">
          <div className="overflow-hidden rounded-[1.6rem] border border-line bg-white shadow-[var(--shadow-float)] sm:rounded-[2rem]">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              {["bg-blush-500/70", "bg-amber-400/80", "bg-mint-500/70"].map((c) => (
                <span key={c} className={`size-2.5 rounded-full ${c}`} aria-hidden />
              ))}
              <span className="ml-3 flex min-w-0 items-center gap-1.5 truncate rounded-full bg-canvas px-3 py-1 text-xs text-muted">
                <Globe className="size-3 shrink-0" aria-hidden /> {t("browserUrl")}
              </span>
            </div>
            <div className="relative aspect-[16/10]">
              <Image src={daron} alt={t("browserAlt")} fill priority placeholder="blur" sizes="(min-width:1024px) 1000px, 100vw" className="object-cover object-top" />
            </div>
          </div>

          {/* Handy mit Buchungssystem */}
          <div className="absolute -right-1 bottom-0 w-[30%] max-w-[210px] animate-float-slow sm:-right-8">
            <div className="rounded-[1.9rem] border-[5px] border-night bg-night shadow-[var(--shadow-float)] sm:rounded-[2.4rem] sm:border-[7px]">
              <div className="relative aspect-[390/844] overflow-hidden rounded-[1.5rem] sm:rounded-[1.9rem]">
                <Image src={omedMobile} alt={t("phoneAlt")} fill placeholder="blur" sizes="210px" className="object-cover object-top" />
              </div>
            </div>
          </div>

          <FloatCard tone="night" className="top-16 -left-2 w-40 !p-3 text-left sm:top-24 sm:-left-10 sm:w-52 sm:!p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] text-night-muted">
              <BellRing className="size-3.5 text-mint-400" aria-hidden /> {t("orderLabel")}
            </p>
            <p className="num mt-1 text-xl font-medium tracking-tight sm:text-2xl">{t("orderValue")}</p>
            <MiniBars className="mt-2 hidden sm:flex" values={[40, 55, 48, 70, 82, 100]} />
          </FloatCard>

          <FloatCard slow className="-bottom-2 left-4 hidden w-56 text-left sm:block lg:-left-8">
            <span className="grid size-10 place-items-center rounded-full bg-mint-500 text-white">
              <BadgeCheck className="size-5" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-medium">{t("feeTitle")}</p>
            <p className="text-xs text-muted">{t("feeText")}</p>
          </FloatCard>
        </div>
      </div>
    </section>
  );
}
