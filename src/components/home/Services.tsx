import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Layers } from "lucide-react";
import { posterOf, serviceItems } from "@/config/content";
import { contactHref } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { InView } from "@/components/ui/InView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FloatCard } from "@/components/ui/FloatCard";
import { cn } from "@/lib/format";

type Item = { icon: string; title: string; text: string; tags: string[] };

/**
 * Bento-Box: sechs Services in unterschiedlich großen Karten, die sich nahtlos fügen.
 *   Desktop (3 Spalten):  [ 01 Video (2) ][ 02 Foto (schwarz, 2 Zeilen) ]
 *                         [ 03 ][ 04    ][ 02 ]
 *                         [ 05 ][ 06 Web & Automatisierung (2) ]
 */
export async function Services() {
  const t = await getTranslations("home.services");
  const [video, foto, social, audio, visuals, web]: Item[] = serviceItems.map((s) => ({
    icon: s.icon,
    title: t(`items.${s.id}.title`),
    text: t(`items.${s.id}.text`),
    tags: t.raw(`items.${s.id}.tags`) as string[],
  }));

  return (
    <section id="services" aria-labelledby="services-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="services-title" eyebrow={t("tag")} icon={Layers} title={t("title")} text={t("text")} />
        </Reveal>

        <InView className="stagger mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 01 – groß mit Medium + schwebender Karte */}
          <article style={{ "--i": 0 } as React.CSSProperties} className="card group grid gap-6 overflow-visible p-6 sm:p-7 md:col-span-2 md:grid-cols-[1fr_1.1fr]">
            <div className="flex flex-col">
              <Head n="01" icon={video.icon} />
              <h3 className="mt-5 text-2xl font-medium">{video.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{video.text}</p>
              <Tags tags={video.tags} className="mt-auto pt-6" />
            </div>
            <div className="relative min-h-56">
              <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
                <Image src={posterOf("il-forno")} alt={t("videoImageAlt")} fill sizes="(min-width:1024px) 420px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <FloatCard className="-bottom-4 -left-3 !rounded-full px-4 py-2">
                <p className="text-xs font-medium">{t("videoBadge")}</p>
              </FloatCard>
            </div>
          </article>

          {/* 02 – schwarze Hochkant-Karte */}
          <article style={{ "--i": 1 } as React.CSSProperties} className="card-night group flex flex-col p-6 sm:p-7 lg:row-span-2">
            <div className="flex items-start justify-between">
              <span className="grid size-12 place-items-center rounded-full bg-mint-500 text-white">
                <Icon name={foto.icon} className="size-5" />
              </span>
              <span className="num text-4xl font-light text-white/25">02</span>
            </div>
            <h3 className="mt-6 text-2xl font-medium text-white">{foto.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-night-muted">{foto.text}</p>
            <Tags tags={foto.tags} dark className="mt-5" />
            <div className="relative mt-6 min-h-52 flex-1 overflow-hidden rounded-[1.5rem]">
              <Image src={posterOf("zuan-yuan")} alt={t("fotoImageAlt")} fill sizes="(min-width:1024px) 400px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </article>

          {[social, audio].map((s, i) => (
            <SoftCard key={s.title} i={i + 2} n={`0${i + 3}`} item={s} />
          ))}

          <SoftCard i={4} n="05" item={visuals} tint />

          {/* 06 – breite Karte mit Tag-Pillen */}
          <article style={{ "--i": 5 } as React.CSSProperties} className="card relative flex flex-col gap-6 p-6 sm:p-7 md:col-span-2 md:flex-row md:items-end md:justify-between">
            <span className="num absolute top-6 right-7 text-4xl font-light text-ink/15">06</span>
            <div className="max-w-md">
              <Head icon={web.icon} />
              <h3 className="mt-5 text-2xl font-medium">{web.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{web.text}</p>
            </div>
            <ul className="flex max-w-xs flex-wrap gap-2 md:justify-end">
              {(t.raw("webTags") as string[]).map((tag) => (
                <li key={tag} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] font-medium text-ink">
                  {tag}
                </li>
              ))}
            </ul>
          </article>
        </InView>

        <Reveal className="mt-10 flex justify-center">
          <ButtonLink href={contactHref} variant="white">
            {t("cta")} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
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
        "flex flex-col rounded-[2rem] border p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] sm:p-7",
        tint ? "border-brand-100 bg-brand-50" : "border-line bg-white shadow-[var(--shadow-soft)]",
      )}
    >
      <Head n={n} icon={item.icon} />
      <h3 className="mt-5 text-xl font-medium">{item.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{item.text}</p>
      <Tags tags={item.tags} className="mt-auto pt-5" />
    </article>
  );
}
