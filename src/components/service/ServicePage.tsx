import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BadgeCheck, Check, Globe, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { getSeoPageById, type IndustryPageId, type SeoPage, type ServicePageId } from "@/config/seo-pages";
import { serviceOffers } from "@/config/packages";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { FaqSection } from "@/components/product/FaqSection";
import { DirectContact } from "@/components/industry/DirectContact";
import { TONES, type Tone } from "@/components/industry/tones";
import { ButtonLink } from "@/components/ui/Button";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { CalcSection, FlowSection, IndustryLinks, TierMatrix, Timeline, type CalcContent, type FlowContent, type TiersContent, type TimelineContent } from "@/components/service/ServiceSections";
import { cn } from "@/lib/format";

type Dict = Record<string, unknown>;
/** Repräsentatives Foto je Branche (aus den Zielgruppen-Bildern der Branchenseite) */
const SECTOR_COVER: Record<IndustryPageId, string> = {
  gastro: "/images/sectors/gastro-0.webp",
  immobilien: "/images/sectors/immobilien-1.webp",
  automotive: "/images/sectors/automotive-1.webp",
  kanzlei: "/images/sectors/kanzlei-3.webp",
  beauty: "/images/sectors/beauty-0.webp",
  handwerk: "/images/sectors/handwerk-0.webp",
};
type Hero = {
  badge: string;
  title: string;
  accent: string;
  text: string;
  imageAlt: string;
  /** Hinweis auf die echte Referenz im Bild, z. B. "Live bei Daron Brot II" */
  refNote?: string;
  facts: { value: string; label: string }[];
  mockUrl?: string;
  mock?: { title: string; rows: { label: string; meta: string; status: string; tone: Tone }[] };
};

/**
 * Leistungs-Landingpage: für Suchende mit konkretem Bedarf ("Bestellsystem ohne Provision").
 * Aufbau: Hero (links Versprechen + Eckdaten, rechts das Produkt) → So funktioniert's →
 * Umfang & Preise als Stufen-Matrix → Beispielrechnung → Branchen → Zeitplan → FAQ → Anfrage.
 * Texte: messages → seoPages.<id>, gemeinsame Beschriftungen → servicePage, Preise → config/packages.ts.
 */
export async function ServicePage({ page, locale }: { page: SeoPage; locale: Locale }) {
  const id = page.id as ServicePageId;
  const t = await getTranslations(`seoPages.${id}`);
  const ts = await getTranslations("servicePage");
  const tSeo = await getTranslations("seoPages");
  const tc = await getTranslations("common");
  const raw = (fn: unknown, key: string) => (fn as (k: string) => Dict)(key);
  const merged = <T,>(key: string) => ({ ...raw(ts.raw, key), ...raw(t.raw, key) }) as T;

  const hero = t.raw("hero") as Hero;
  const offer = serviceOffers[id];
  const tierTexts = t.raw("tiers.items") as Record<string, { name: string; audience: string }>;
  const extraLabels = raw(ts.raw, "extras.labels") as Record<string, { label: string; hint: string }>;
  const industries = (t.raw("industries.items") as { id: IndustryPageId; text: string }[]).map((it) => {
    const p = getSeoPageById(it.id);
    return { id: it.id, icon: p.icon, name: tSeo(`${it.id}.navLabel`), text: it.text, image: SECTOR_COVER[it.id], href: { pathname: "/leistungen/[slug]" as const, params: { slug: p.slugs[locale] } } };
  });
  const points = ts.raw("contact.points") as string[];
  const contacts = [
    { href: site.phoneHref, icon: Phone, label: tc("phone"), value: site.phone },
    { href: site.whatsappHref, icon: MessageCircle, label: tc("whatsapp"), value: tc("whatsappCta") },
    { href: `mailto:${site.email}`, icon: Mail, label: tc("email"), value: site.email },
  ];
  const mock = page.hero.frame === "mock" ? hero.mock : undefined;
  const url = mock ? hero.mockUrl : page.hero.url;

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="pointer-events-none absolute -top-40 right-0 -z-10 h-[560px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.13),transparent)]" aria-hidden />
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <div className="animate-rise">
              <Eyebrow>{hero.badge}</Eyebrow>
            </div>
            <h1 className="mt-5 animate-rise text-[clamp(2.3rem,4.9vw,4rem)] leading-[1.04] font-medium text-balance [animation-delay:0.08s]">
              {hero.title} <span className="text-brand-500">{hero.accent}</span>
            </h1>
            <p className="mt-5 max-w-xl animate-rise text-[16px] leading-relaxed text-muted [animation-delay:0.16s]">{hero.text}</p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:0.24s]">
              <ButtonLink href="#anfrage">
                {ts("hero.primary")} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="#pakete" variant="soft">
                {ts("hero.secondary")}
              </ButtonLink>
            </div>
            <dl className="mt-9 grid max-w-xl animate-rise grid-cols-3 divide-x divide-line rounded-[1.6rem] border border-line bg-white shadow-[var(--shadow-soft)] [animation-delay:0.3s]">
              {hero.facts.map((f) => (
                <div key={f.label} className="px-4 py-4 sm:px-5">
                  <dd className="num text-[1.15rem] leading-tight font-medium text-ink sm:text-2xl">{f.value}</dd>
                  <dt className="mt-1 text-xs leading-snug text-muted">{f.label}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-5 animate-rise [animation-delay:0.34s]">
              <PartnerBadge />
            </div>
          </div>

          <div className="relative animate-rise pb-6 [animation-delay:0.2s]">
            <div className="overflow-hidden rounded-[1.6rem] border border-line bg-white shadow-[var(--shadow-float)] sm:rounded-[2rem]">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                {["bg-blush-500/70", "bg-amber-400/80", "bg-mint-500/70"].map((dot) => (
                  <span key={dot} className={`size-2.5 rounded-full ${dot}`} aria-hidden />
                ))}
                {url && (
                  <span className="ml-3 flex min-w-0 items-center gap-1.5 truncate rounded-full bg-canvas px-3 py-1 text-xs text-muted">
                    <Globe className="size-3 shrink-0" aria-hidden /> {url}
                  </span>
                )}
              </div>
              {mock ? (
                <div role="img" aria-label={hero.imageAlt} className="bg-canvas p-4 pb-10 sm:p-6 sm:pb-12">
                  <div className="rounded-3xl border border-line bg-white p-4 shadow-[var(--shadow-soft)]" aria-hidden>
                    <p className="px-1 pb-3 text-sm font-medium text-ink">{mock.title}</p>
                    <ul className="grid gap-2">
                      {mock.rows.map((r) => (
                        <li key={r.label} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-2xl border border-line px-3.5 py-3">
                          <span className="min-w-0 flex-1 basis-36">
                            <span className="block text-sm leading-snug font-medium text-ink">{r.label}</span>
                            <span className="num block text-xs leading-snug text-muted">{r.meta}</span>
                          </span>
                          <span className={cn("num shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", TONES[r.tone])}>{r.status}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[4/3]">
                  <Image src={page.hero.image} alt={hero.imageAlt} fill priority sizes="(min-width:1024px) 620px, 100vw" className="object-cover object-top" />
                </div>
              )}
            </div>
            {hero.refNote && (
              <p className="absolute bottom-0 left-4 inline-flex animate-float-slow items-center gap-2.5 rounded-full border border-line bg-white py-2 pr-5 pl-2 text-sm font-medium text-ink shadow-[var(--shadow-float)] sm:-left-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
                  <BadgeCheck className="size-4" aria-hidden />
                </span>
                {hero.refNote}
              </p>
            )}
          </div>
        </div>
      </section>

      <FlowSection content={merged<FlowContent>("flow")} />

      <TierMatrix
        content={merged<TiersContent>("tiers")}
        tiers={offer.tiers.map((x) => ({ ...x, ...tierTexts[x.id] }))}
        highlight={offer.highlight}
        extras={offer.extras.map((x) => ({ ...x, ...extraLabels[x.id] }))}
        extrasLabel={ts("extras.tag")}
        extrasText={ts("extras.text")}
        locale={locale}
      />

      <CalcSection content={merged<CalcContent>("calc")} guides={page.blog} />

      <IndustryLinks tag={ts("industries.tag")} title={t("industries.title")} accent={t("industries.accent")} text={t("industries.text")} cta={ts("industries.cta")} items={industries} />

      <Timeline content={merged<TimelineContent>("timeline")} />

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
            <DirectContact title={ts("contact.formTitle")} text={ts("contact.formText")} submitLabel={ts("contact.submit")} industry={page.industry} interests={page.interests} source="ki_seite" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
