import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Clapperboard, Play } from "lucide-react";
import { mediaPackages } from "@/config/packages";
import { mediaPage } from "@/config/seo-pages";
import { site } from "@/config/site";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { HeroVideo } from "@/components/home/HeroVideo";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard } from "@/components/ui/FloatCard";
import { formatEUR } from "@/lib/format";
import poster from "../../../public/images/showreel-poster.jpg";

/**
 * "Wo wir herkommen": Premium-Media als bewusst kleines Angebot – drei Pakete,
 * Showreel, Link zur Media-Seite. Social Proof für alles andere.
 */
export async function MediaSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.media");
  const tp = await getTranslations("packages");
  return (
    <section id="media" aria-labelledby="media-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal className="card-night grid items-center gap-10 p-5 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-10">
          <div className="order-2 p-2 lg:order-1">
            <Eyebrow tone="dark" icon={Clapperboard}>
              {t("tag")}
            </Eyebrow>
            <h2 id="media-title" className="mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.06] font-medium text-white">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-night-muted">{t("text")}</p>
            <ul className="mt-7 grid gap-2">
              {mediaPackages.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 rounded-full bg-white/[0.07] py-2 pr-2 pl-5">
                  <span className="text-[15px] text-white">{tp(`${p.id}.name`)}</span>
                  <span className="num shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-ink">
                    {tp("from")} {formatEUR(p.price, locale)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-night-muted">{t("note")}</p>
            <Link
              href={{ pathname: "/leistungen/[slug]", params: { slug: mediaPage.slugs[locale] } }}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-500 px-6 font-medium text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              {t("cta")} <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[16/11] overflow-hidden rounded-[1.6rem]">
              <Image src={poster} alt={t("posterAlt")} fill placeholder="blur" sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
              {site.heroVideo && <HeroVideo src={site.heroVideo} />}
            </div>
            <FloatCard className="right-3 -bottom-5 flex items-center gap-2.5 !rounded-full py-2 pr-4 pl-2 sm:-right-4">
              <span className="grid size-9 place-items-center rounded-full bg-brand-500 text-white">
                <Play className="size-4 translate-x-px fill-current" aria-hidden />
              </span>
              <span className="text-left text-[13px] leading-tight font-medium">
                {t("showreel")}
                <span className="block text-[11px] font-normal text-muted">{t("showreelMeta")}</span>
              </span>
            </FloatCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
