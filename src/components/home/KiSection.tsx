import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { kiCards, kiSplit, posterOf } from "@/config/content";
import { getSeoPageById } from "@/config/seo-pages";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { InView } from "@/components/ui/InView";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FloatCard, MiniBars } from "@/components/ui/FloatCard";

/** KI-Lösungen: schwarze Flaggschiff-Karte mit Bild + schwebenden Karten, 4 Feature-Karten, 2 Einstiege. */
export async function KiSection() {
  const locale = await getLocale();
  const t = await getTranslations("home.ki");
  return (
    <section id="ki" aria-labelledby="ki-title" className="py-16 sm:py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="ki-title" eyebrow={t("tag")} icon={Sparkles} title={t("title")} text={t("text")} />
        </Reveal>

        <Reveal className="card-night mt-12 grid items-center gap-8 p-5 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-mint-500/15 px-3 py-1 text-xs font-medium text-mint-400">
              <span className="size-1.5 rounded-full bg-mint-400" aria-hidden /> {t("flagship.badge")}
            </span>
            <h3 className="mt-5 text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.08] font-medium text-white">{t("flagship.title")}</h3>
            <p className="mt-4 max-w-lg leading-relaxed text-night-muted">{t("flagship.text")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/content-pipeline">
                {t("flagship.primary")} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/preisrechner" variant="ghost-night">
                {t("flagship.secondary")}
              </ButtonLink>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem]">
              <Image src={posterOf("the-sphere")} alt={t("flagship.imageAlt")} fill sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
            </div>
            <FloatCard className="top-4 -left-3 w-44 sm:-left-6">
              <p className="text-xs text-muted">{t("flagship.floatLabel")}</p>
              <p className="num text-2xl font-medium">{t("flagship.floatValue")}</p>
              <MiniBars className="mt-2" values={[30, 45, 60, 72, 88, 100]} />
            </FloatCard>
            <FloatCard slow className="right-3 -bottom-5 flex gap-1.5 !rounded-full p-1.5">
              {["DE", "EN", "AR", "TR"].map((l, i) => (
                <span key={l} className={i === 0 ? "rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white" : "rounded-full px-2.5 py-1 text-xs font-medium text-body"}>
                  {l}
                </span>
              ))}
            </FloatCard>
          </div>
        </Reveal>

        <InView className="stagger mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kiCards.map((c, i) => (
            <article key={c.id} style={{ "--i": i } as React.CSSProperties} className="card p-6 transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-1">
              <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Icon name={c.icon} className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{t(`cards.${c.id}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`cards.${c.id}.text`)}</p>
            </article>
          ))}
        </InView>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {kiSplit.map((w, i) => (
            <Reveal
              key={w.id}
              delay={i * 0.08}
              className={i === 0 ? "card flex flex-col p-7 sm:p-9" : "flex flex-col rounded-[2rem] bg-brand-500 p-7 text-white shadow-[var(--shadow-brand)] sm:p-9"}
            >
              <p className={i === 0 ? "text-sm font-medium text-brand-600" : "text-sm font-medium text-brand-100"}>{t(`split.${w.id}.tag`)}</p>
              <h3 className={i === 0 ? "mt-3 text-2xl font-medium" : "mt-3 text-2xl font-medium text-white"}>{t(`split.${w.id}.title`)}</h3>
              <p className={i === 0 ? "mt-3 flex-1 leading-relaxed text-muted" : "mt-3 flex-1 leading-relaxed text-brand-100"}>{t(`split.${w.id}.text`)}</p>
              <Link
                href={{ pathname: "/leistungen/[slug]", params: { slug: getSeoPageById(w.seoPage).slugs[locale] } }}
                className={
                  i === 0
                    ? "mt-6 inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-night px-6 font-medium text-white transition hover:-translate-y-0.5"
                    : "mt-6 inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-white px-6 font-medium text-ink transition hover:-translate-y-0.5"
                }
              >
                {t(`split.${w.id}.cta`)} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
