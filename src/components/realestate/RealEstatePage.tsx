import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Boxes, Check, Clapperboard, KeyRound, Mail, Megaphone, MessageCircle, Phone, Send, Sparkles, Users } from "lucide-react";
import type { SeoPage } from "@/config/seo-pages";
import { realEstatePackages } from "@/config/packages";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { Process, type ProcessContent } from "@/components/home/Process";
import { FaqSection } from "@/components/product/FaqSection";
import { PricingSection, type Pack } from "@/components/product/PricingSection";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { AudienceTabs, type Audience } from "@/components/realestate/AudienceTabs";
import { CaseStudies, type CasesContent } from "@/components/realestate/CaseStudies";
import { CompareSection, type CompareContent } from "@/components/realestate/CompareSection";
import { DirectContact } from "@/components/realestate/DirectContact";
import { ModuleExplorer, type Module } from "@/components/realestate/ModuleExplorer";
import { RealEstateHero, type RealEstateHeroContent } from "@/components/realestate/RealEstateHero";

type PackText = { name: string; audience: string; meta: string; features: string[] };

/**
 * Immobilien-Landingpage mit eigenem Aufbau:
 * Hero (Objektfilm) → Für wen → Module → Anwendungsfälle → Ablauf → Pakete (+ Objektfilm)
 * → Einordnung/Vergleich → FAQ → direkte Anfrage. Texte: messages → seoPages.immobilien.
 */
export async function RealEstatePage({ page, locale }: { page: SeoPage; locale: Locale }) {
  const t = await getTranslations("seoPages.immobilien");
  const tpk = await getTranslations("packages");
  const tc = await getTranslations("common");

  const audiences = t.raw("audiences.items") as Audience[];
  const packTexts = t.raw("packages.items") as Record<string, PackText>;
  const packs: Pack[] = realEstatePackages.map((p) => ({ id: p.id, price: p.price, unit: tpk("units.once"), from: tpk("from"), ...packTexts[p.id] }));
  const points = t.raw("contact.points") as string[];
  const contacts = [
    { href: site.phoneHref, icon: Phone, label: tc("phone"), value: site.phone },
    { href: site.whatsappHref, icon: MessageCircle, label: tc("whatsapp"), value: tc("whatsappCta") },
    { href: `mailto:${site.email}`, icon: Mail, label: tc("email"), value: site.email },
  ];

  return (
    <>
      <RealEstateHero content={t.raw("hero") as RealEstateHeroContent} audiences={audiences.map((a) => a.label)} poster={page.hero.image} video={page.hero.video ?? ""} />

      <section id="fuer-wen" aria-labelledby="fuer-wen-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading id="fuer-wen-title" eyebrow={t("audiences.tag")} icon={Users} title={t("audiences.title")} accent={t("audiences.accent")} text={t("audiences.text")} className="max-w-3xl" />
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <AudienceTabs items={audiences} painsLabel={t("audiences.painsLabel")} buildsLabel={t("audiences.buildsLabel")} ariaLabel={t("audiences.tabsAria")} />
          </Reveal>
        </div>
      </section>

      <section id="funktionen" aria-labelledby="funktionen-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading id="funktionen-title" eyebrow={t("modules.tag")} icon={Sparkles} title={t("modules.title")} accent={t("modules.accent")} text={t("modules.text")} />
          </Reveal>
          <Reveal delay={0.08}>
            <ModuleExplorer
              items={t.raw("modules.items") as Module[]}
              labels={{ list: t("modules.listAria"), before: t("modules.beforeLabel"), after: t("modules.afterLabel"), mockNote: t("modules.mockNote") }}
            />
          </Reveal>
        </div>
      </section>

      <CaseStudies content={t.raw("cases") as CasesContent} locale={locale} />

      <Process content={t.raw("process") as ProcessContent} />

      <PricingSection
        tag={t("packages.tag")}
        title={t("packages.title")}
        accent={t("packages.accent")}
        text={t("packages.text")}
        packages={packs}
        trust={tpk.raw("softwareSection.trust") as string[]}
        highlight="portal"
        icons={[Megaphone, KeyRound, Boxes]}
      />

      {/* Objektfilm als Ergänzung – die einzige Referenz, die wir hier zeigen, gehört zur Branche */}
      <section className="pb-16 sm:pb-20">
        <div className="container-x">
          <Reveal className="card-night mx-auto grid max-w-5xl items-center gap-2 overflow-hidden p-2 md:grid-cols-[0.8fr_1.2fr]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem] md:aspect-auto md:h-full md:min-h-56">
              <Image src={page.hero.image} alt={t("hero.imageAlt")} fill sizes="(min-width:768px) 400px, 100vw" className="object-cover" />
            </div>
            <div className="p-5 sm:p-7">
              <Eyebrow tone="dark" icon={Clapperboard}>
                {t("packages.film.tag")}
              </Eyebrow>
              <h3 className="mt-3 text-2xl font-medium text-white">{t("packages.film.title")}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-night-muted">{t("packages.film.text")}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="num rounded-full bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white">{t("packages.film.price")}</span>
                <ButtonLink href="/portfolio" variant="ghost-night">
                  {t("packages.film.cta")} <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CompareSection content={t.raw("compare") as CompareContent} guides={page.blog} />

      <FaqSection items={t.raw("faq") as { q: string; a: string }[]} />

      <section id="anfrage" aria-labelledby="anfrage-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal className="lg:sticky lg:top-28">
            <Eyebrow icon={Send}>{t("contact.tag")}</Eyebrow>
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
            <DirectContact title={t("contact.formTitle")} text={t("contact.formText")} submitLabel={t("contact.submit")} industry={page.industry} interests={page.interests} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
