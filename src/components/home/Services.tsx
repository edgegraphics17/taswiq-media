import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, Layers } from "lucide-react";
import { serviceItems } from "@/config/content";
import { contactHref } from "@/config/site";
import { getSeoPageById } from "@/config/seo-pages";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { InView } from "@/components/ui/InView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FloatCard } from "@/components/ui/FloatCard";
import { cn } from "@/lib/format";
import booking from "../../../public/images/demo/friseur.jpg";
import portal from "../../../public/images/demo/steuerkanzlei.jpg";

type Item = { id: string; icon: string; title: string; text: string; tags: string[]; href: { pathname: "/leistungen/[slug]"; params: { slug: string } } };

/**
 * Bento: sechs Software-Säulen, jede Karte führt auf ihre Landingpage.
 *   Desktop (3 Spalten):  [ 01 Bestell- & Buchungssysteme (2) ][ 02 Individualsoftware (schwarz, 2 Zeilen) ]
 *                         [ 03 Dashboards ][ 04 Web-Apps     ][ 02 ]
 *                         [ 05 KI ][ 06 Websites (2) ]
 */
export async function Services() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.services");
  const [systems, custom, dashboards, portals, ai, web]: Item[] = serviceItems.map((s) => ({
    id: s.id,
    icon: s.icon,
    title: t(`items.${s.id}.title`),
    text: t(`items.${s.id}.text`),
    tags: t.raw(`items.${s.id}.tags`) as string[],
    href: { pathname: "/leistungen/[slug]", params: { slug: getSeoPageById(s.page).slugs[locale] } },
  }));

  return (
    <section id="services" aria-labelledby="services-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="services-title" eyebrow={t("tag")} icon={Layers} title={t("title")} accent={t("accent")} text={t("text")} />
        </Reveal>

        <InView className="stagger mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 01 – groß mit Screenshot + schwebender Karte */}
          <article style={{ "--i": 0 } as React.CSSProperties} className="card group relative grid gap-6 overflow-visible p-6 sm:p-7 md:col-span-2 md:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col">
              <Head n="01" icon={systems.icon} />
              <h3 className="mt-5 text-2xl font-medium">
                <CardLink item={systems} />
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{systems.text}</p>
              <Tags tags={systems.tags} className="mt-auto pt-6" />
            </div>
            <div className="relative min-h-56">
              <div className="absolute inset-0 overflow-hidden rounded-[1.5rem] border border-line">
                <Image src={booking} alt={t("systemsImageAlt")} fill sizes="(min-width:1024px) 420px, 100vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              </div>
              <FloatCard className="-bottom-4 -left-3 !rounded-full px-4 py-2">
                <p className="text-xs font-medium">{t("systemsBadge")}</p>
              </FloatCard>
            </div>
          </article>

          {/* 02 – schwarze Hochkant-Karte */}
          <article style={{ "--i": 1 } as React.CSSProperties} className="card-night group relative flex flex-col p-6 sm:p-7 lg:row-span-2">
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-full bg-mint-500 text-white">
                <Icon name={custom.icon} className="size-5" />
              </span>
              <span className="num text-4xl font-light text-white/25">02</span>
            </div>
            <h3 className="mt-6 text-2xl font-medium text-white">
              <CardLink item={custom} dark />
            </h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-night-muted">{custom.text}</p>
            <Tags tags={custom.tags} dark className="mt-5" />
            <div className="relative mt-6 min-h-52 flex-1 overflow-hidden rounded-[1.5rem]">
              <Image src={portal} alt={t("customImageAlt")} fill sizes="(min-width:1024px) 400px, 100vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
            </div>
          </article>

          {[dashboards, portals].map((s, i) => (
            <SoftCard key={s.id} i={i + 2} n={`0${i + 3}`} item={s} />
          ))}

          <SoftCard i={4} n="05" item={ai} tint />

          {/* 06 – breite Karte mit Tag-Pillen */}
          <article style={{ "--i": 5 } as React.CSSProperties} className="card relative flex flex-col gap-6 p-6 sm:p-7 md:col-span-2 md:flex-row md:items-end md:justify-between">
            <span className="num absolute top-6 right-7 text-4xl font-light text-ink/15">06</span>
            <div className="max-w-md">
              <Head icon={web.icon} />
              <h3 className="mt-5 text-2xl font-medium">
                <CardLink item={web} />
              </h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{web.text}</p>
            </div>
            <ul className="flex max-w-xs flex-wrap gap-2 md:justify-end">
              {web.tags.map((tag) => (
                <li key={tag} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-ink">
                  {tag}
                </li>
              ))}
            </ul>
          </article>
        </InView>

        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href={contactHref}>
            {t("cta")} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/preisrechner" variant="white">
            {t("ctaSecondary")}
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

/** Titel als Link, dessen Klickfläche die ganze Karte abdeckt */
function CardLink({ item, dark }: { item: Item; dark?: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "inline-flex items-start gap-1.5 after:absolute after:inset-0 after:rounded-[2rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-500",
        dark ? "text-white" : "text-ink",
      )}
    >
      {item.title}
      <ArrowUpRight className={cn("mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", dark ? "text-mint-400" : "text-brand-500")} aria-hidden />
    </Link>
  );
}

function Head({ n, icon }: { n?: string; icon: string }) {
  return (
    <div className="flex items-start justify-between">
      <span className="grid size-12 place-items-center rounded-full bg-blush-100 text-blush-600">
        <Icon name={icon} className="size-5" />
      </span>
      {n && <span className="num text-4xl font-light text-ink/15">{n}</span>}
    </div>
  );
}

function Tags({ tags, dark, className }: { tags: string[]; dark?: boolean; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <li key={tag} className={cn("rounded-full px-3 py-1 text-xs font-medium", dark ? "bg-white/10 text-white" : "bg-canvas text-ink")}>
          {tag}
        </li>
      ))}
    </ul>
  );
}

function SoftCard({ i, n, item, tint }: { i: number; n: string; item: Item; tint?: boolean }) {
  return (
    <article
      style={{ "--i": i } as React.CSSProperties}
      className={cn(
        "group relative flex flex-col rounded-[2rem] border p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] sm:p-7",
        tint ? "border-brand-100 bg-brand-50" : "border-line bg-white shadow-[var(--shadow-soft)]",
      )}
    >
      <Head n={n} icon={item.icon} />
      <h3 className="mt-5 text-xl font-medium">
        <CardLink item={item} />
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
      <Tags tags={item.tags} className="mt-auto pt-5" />
    </article>
  );
}
