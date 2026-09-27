import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Building } from "lucide-react";
import { industryPages, mediaPage, type IndustryPageId } from "@/config/seo-pages";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Icon } from "@/components/ui/Icon";
import { InView } from "@/components/ui/InView";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * "Für wen wir bauen": sechs Branchen-Obergruppen, jede mit Beispielen und dem typischen System –
 * damit sich Inhaber:innen sofort wiedererkennen. Siebte Karte: Events & Artists (Premium-Media).
 */
export async function Industries() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home.industries");
  const ts = await getTranslations("seoPages");
  return (
    <section id="branchen" aria-labelledby="branchen-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="branchen-title" eyebrow={t("tag")} icon={Building} title={t("title")} accent={t("accent")} text={t("text")} />
        </Reveal>

        <InView className="stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industryPages.map((page, i) => {
            const p = { ...page, id: page.id as IndustryPageId };
            return (
            <article
              key={p.id}
              style={{ "--i": i } as React.CSSProperties}
              className="card group relative flex flex-col p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-float)] sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                  <Icon name={p.icon} className="size-5" />
                </span>
                <ArrowUpRight className="size-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-medium">
                <Link
                  href={{ pathname: "/leistungen/[slug]", params: { slug: p.slugs[locale] } }}
                  className="after:absolute after:inset-0 after:rounded-[2rem] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand-500"
                >
                  {t(`items.${p.id}.title`)}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted">{t(`items.${p.id}.who`)}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-body">{t(`items.${p.id}.text`)}</p>
              <p className="mt-auto pt-5">
                <span className="inline-flex rounded-full bg-canvas px-3.5 py-1.5 text-[13px] font-medium text-ink">{ts(`${p.id}.navLabel`)}</span>
              </p>
            </article>
            );
          })}
        </InView>

        <Reveal className="card-night mt-4 flex flex-col items-start justify-between gap-5 p-7 sm:flex-row sm:items-center sm:p-9">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
              <Icon name={mediaPage.icon} className="size-5" />
            </span>
            <div>
              <p className="text-xl font-medium text-white">{t("events.title")}</p>
              <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-night-muted">{t("events.text")}</p>
            </div>
          </div>
          <Link
            href={{ pathname: "/leistungen/[slug]", params: { slug: mediaPage.slugs[locale] } }}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-white px-6 font-medium text-ink transition hover:-translate-y-0.5"
          >
            {t("events.cta")} <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Reveal>

        <Reveal className="mt-6 text-center text-sm text-muted">{t("other")}</Reveal>
      </div>
    </section>
  );
}
