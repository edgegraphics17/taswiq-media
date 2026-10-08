import Image from "next/image";
import NextLink from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, MousePointerClick } from "lucide-react";
import { DemoLink } from "@/components/ui/DemoLink";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { demos, getDemo, type DemoSlug } from "@/demos/registry";
import { cn } from "@/lib/format";

/**
 * Software-Demos als kleine Einladung zum Ausprobieren – bewusst kompakt, keine eigene große Sektion:
 *  - DemoStrip:   eine Karte mit kurzem Text und sechs schmalen Kacheln (Startseite, Ratgeber-Übersicht)
 *  - DemoCallout: ein Hinweis auf die Demo, die zum Thema passt (im Ratgeber-Artikel)
 * Die Demos selbst liegen unter /demo (nur Deutsch); Namen der Software-Art kommen aus portfolio.items.demo-<slug>.tag.
 */
export async function DemoStrip({ className }: { className?: string }) {
  const t = await getTranslations("demoStrip");
  const tp = await getTranslations("portfolio");
  return (
    <section aria-labelledby="demos-title" className={cn("py-8 sm:py-10", className)}>
      <div className="container-x">
        <Reveal className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:items-center lg:gap-10">
          <div>
            <Eyebrow icon={MousePointerClick}>{t("tag")}</Eyebrow>
            <h2 id="demos-title" className="mt-3 text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.08] font-medium text-balance">
              {t("title")} <span className="text-brand-500">{t("accent")}</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("text")}</p>
            <NextLink href="/demo" prefetch={false} className="mt-4 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-brand-600 hover:text-brand-700">
              {t("all")} <ArrowRight className="size-4" aria-hidden />
            </NextLink>
          </div>
          <ul className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {demos.map((d) => (
              <li key={d.slug} className="w-44 shrink-0 snap-start sm:w-auto">
                <DemoLink slug={d.slug} variant="bare" className="group block rounded-2xl border border-line bg-white p-1.5 transition-[border-color,box-shadow] hover:border-brand-200 hover:shadow-[var(--shadow-soft)]">
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-xl" style={{ background: d.theme.deep }}>
                    <Image src={d.image} alt="" fill sizes="(min-width:1024px) 220px, (min-width:640px) 30vw, 176px" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
                  </span>
                  <span className="flex items-center justify-between gap-2 px-2 pt-2.5 pb-1.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{tp(`items.demo-${d.slug}.tag`)}</span>
                      <span className="block truncate text-xs text-muted">{d.firm}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted transition-colors group-hover:text-brand-600" aria-hidden />
                  </span>
                </DemoLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** Hinweis im Ratgeber-Artikel: die passende Demo – oder, wenn es keine gibt, die Übersicht aller Demos. */
export async function DemoCallout({ slug, className }: { slug?: DemoSlug; className?: string }) {
  const t = await getTranslations("demoStrip");
  const tp = await getTranslations("portfolio");
  const d = slug ? getDemo(slug) : undefined;
  const body = (
    <>
      <span className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl sm:w-52" style={{ background: (d ?? demos[0]).theme.deep }}>
        <Image src={(d ?? demos[0]).image} alt="" fill sizes="(min-width:640px) 208px, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600">
          <MousePointerClick className="size-4" aria-hidden /> {t("calloutTag")}
        </span>
        <span className="mt-1 block text-lg leading-snug font-medium text-ink">{d ? t("calloutTitle", { kind: tp(`items.demo-${d.slug}.tag`), firm: d.firm }) : t("calloutAllTitle")}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{d ? t("calloutText") : t("text")}</span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
          {d ? t("calloutCta") : t("all")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </span>
    </>
  );
  const cls = cn("card group flex flex-col gap-5 p-3 pr-5 transition-shadow hover:shadow-[var(--shadow-float)] sm:flex-row sm:items-center", className);
  return d ? (
    <DemoLink slug={d.slug} variant="bare" className={cls}>
      {body}
    </DemoLink>
  ) : (
    <NextLink href="/demo" prefetch={false} className={cls}>
      {body}
    </NextLink>
  );
}
