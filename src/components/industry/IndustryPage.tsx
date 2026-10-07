import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BadgeCheck, Check, Mail, MessageCircle, Phone, Send, Sparkles, Users } from "lucide-react";
import type { IndustryPageId, SeoPage } from "@/config/seo-pages";
import { industryPackages, rentPerMonth } from "@/config/packages";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { Process, type ProcessContent } from "@/components/home/Process";
import { FaqSection } from "@/components/product/FaqSection";
import { PricingSection, type Pack } from "@/components/product/PricingSection";
import { ButtonLink } from "@/components/ui/Button";
import { ICONS } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { AudienceTabs, type Audience } from "@/components/industry/AudienceTabs";
import { CaseStudies, type CasesContent } from "@/components/industry/CaseStudies";
import { CompareSection, type CompareContent } from "@/components/industry/CompareSection";
import { DirectContact } from "@/components/industry/DirectContact";
import { ModuleExplorer, type Module } from "@/components/industry/ModuleExplorer";
import { IndustryHero, type IndustryHeroContent } from "@/components/industry/IndustryHero";

type PackText = { name: string; audience: string; meta: string; features: string[] };
type Dict = Record<string, unknown>;

/**
 * Branchen-Landingpage mit eigenem Aufbau je Branche:
 * Hero (echtes Projekt) → Für wen → Module → Anwendungsfälle → Ablauf → Pakete (+ Referenz)
 * → Einordnung/Vergleich → FAQ → direkte Anfrage.
 * Texte: messages → seoPages.<id>, gemeinsame Beschriftungen → industryPage.
 */
export async function IndustryPage({ page, locale }: { page: SeoPage; locale: Locale }) {
  const id = page.id as IndustryPageId;
  const t = await getTranslations(`seoPages.${id}`);
  const ts = await getTranslations("industryPage");
  const tpk = await getTranslations("packages");
  const tc = await getTranslations("common");
  /** Gemeinsame Beschriftungen + Texte der Branche zu einem Inhaltsblock zusammenführen */
  type Section = "hero" | "cases" | "process" | "compare";
  const raw = (fn: unknown, key: Section) => (fn as (k: string) => Dict)(key);
  const merged = <T,>(key: Section) => ({ ...raw(ts.raw, key), ...raw(t.raw, key) }) as T;

  const audiences = (t.raw("audiences.items") as Audience[]).map((a, i) => ({ ...a, image: `/images/sectors/${id}-${i}.webp` }));
  const modules = t.raw("modules.items") as Module[];
  const def = industryPackages[id];
  const packTexts = t.raw("packages.items") as Record<string, PackText>;
  const packs: Pack[] = def.items.map((p) => ({ id: p.id, price: p.price, unit: tpk("units.once"), from: tpk("from"), rent: rentPerMonth(p.price), ...packTexts[p.id] }));
  const points = ts.raw("contact.points") as string[];
  const contacts = [
    { href: site.phoneHref, icon: Phone, label: tc("phone"), value: site.phone },
    { href: site.whatsappHref, icon: MessageCircle, label: tc("whatsapp"), value: tc("whatsappCta") },
    { href: `mailto:${site.email}`, icon: Mail, label: tc("email"), value: site.email },
  ];

  return (
    <>
      <IndustryHero content={merged<IndustryHeroContent>("hero")} audiences={audiences.map((a) => a.label)} media={page.hero} modules={modules} />

      <section id="fuer-wen" aria-labelledby="fuer-wen-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading id="fuer-wen-title" eyebrow={ts("audiences.tag")} icon={Users} title={t("audiences.title")} accent={t("audiences.accent")} text={t("audiences.text")} className="max-w-3xl" />
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <AudienceTabs items={audiences} painsLabel={ts("audiences.painsLabel")} buildsLabel={ts("audiences.buildsLabel")} ariaLabel={ts("audiences.tabsAria")} />
          </Reveal>
        </div>
      </section>

      <section id="funktionen" aria-labelledby="funktionen-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading id="funktionen-title" eyebrow={ts("modules.tag")} icon={Sparkles} title={t("modules.title")} accent={t("modules.accent")} text={t("modules.text")} />
          </Reveal>
          <Reveal delay={0.08}>
            <ModuleExplorer
              items={modules}
              labels={{ list: ts("modules.listAria"), before: ts("modules.beforeLabel"), after: ts("modules.afterLabel"), mockNote: ts("modules.mockNote") }}
            />
          </Reveal>
        </div>
      </section>

      <CaseStudies content={merged<CasesContent>("cases")} locale={locale} />

      <Process content={merged<ProcessContent>("process")} />

      <PricingSection
        tag={t("packages.tag")}
        title={t("packages.title")}
        accent={t("packages.accent")}
        text={t("packages.text")}
        packages={packs}
        trust={tpk.raw("softwareSection.trust") as string[]}
        highlight={def.highlight}
        icons={def.items.map((p) => ICONS[p.icon])}
      />

      {/* Referenz oder Ergänzung, die zur Branche gehört – statt einer allgemeinen Portfolio-Sektion */}
      {page.spotlight && (
        <section className="pb-16 sm:pb-20">
          <div className="container-x">
            <Reveal className="card-night mx-auto grid max-w-5xl items-center gap-2 overflow-hidden p-2 md:grid-cols-[0.8fr_1.2fr]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem] md:aspect-auto md:h-full md:min-h-56">
                <Image src={page.spotlight.image} alt={t("spotlight.imageAlt")} fill sizes="(min-width:768px) 400px, 100vw" className="object-cover object-top" />
              </div>
              <div className="p-5 sm:p-7">
                <Eyebrow tone="dark" icon={BadgeCheck}>
                  {t("spotlight.tag")}
                </Eyebrow>
                <h3 className="mt-3 text-2xl font-medium text-white">{t("spotlight.title")}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-night-muted">{t("spotlight.text")}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="num rounded-full bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white">{t("spotlight.badge")}</span>
                  <ButtonLink href={page.spotlight.href} variant="ghost-night">
                    {t("spotlight.cta")} <ArrowRight className="size-4" aria-hidden />
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <CompareSection content={merged<CompareContent>("compare")} guides={page.blog} />

      <FaqSection items={t.raw("faq") as { q: string; a: string }[]} />

      <section id="anfrage" aria-labelledby="anfrage-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal className="lg:sticky lg:top-28">
            <Eyebrow icon={Send}>{ts("contact.tag")}</Eyebrow>
            <h2 id="anfrage-title" className="mt-4 text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.04] font-medium">
              {t("contact.title")} <span className="text-brand-500">{t("contact.accent")}</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{t("contact.text")}</p>
            <ul className="mt-6 grid gap-2">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[14.5px] text-body">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
                    <Check className="size-3" strokeWidth={3.5} aria-hidden />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <ul className="mt-7 space-y-2.5">
              {contacts.map((p) => (
                <li key={p.href}>
                  <a href={p.href} className="group flex items-center gap-3 rounded-full border border-line bg-white p-1.5 pr-5 shadow-[var(--shadow-soft)] transition hover:border-brand-200">
                    <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                      <p.icon className="size-4.5" aria-hidden />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-xs text-muted">{p.label}</span>
                      <span className="num text-[15px] font-medium text-ink">{p.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <DirectContact title={ts("contact.formTitle")} text={ts("contact.formText")} submitLabel={ts("contact.submit")} industry={page.industry} interests={page.interests} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
