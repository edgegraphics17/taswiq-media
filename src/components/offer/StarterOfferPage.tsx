import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, FileText, Globe, KeyRound, ListChecks, Mail, MessageCircle, Phone, Plus, Repeat, Send, Tag } from "lucide-react";
import { getPortfolioItem } from "@/config/content";
import { starterOffer } from "@/config/packages";
import { site } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { DirectContact } from "@/components/industry/DirectContact";
import { FaqSection } from "@/components/product/FaqSection";
import { ProblemSection } from "@/components/product/ProblemSection";
import { Timeline, type TimelineContent } from "@/components/service/ServiceSections";
import { ButtonLink } from "@/components/ui/Button";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { Reveal } from "@/components/ui/Reveal";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { fillOffer, starterOfferVars } from "@/lib/starter-offer";

type Hero = { badge: string; title: string; accent: string; text: string; primary: string; secondary: string; imageAlt: string; refNote: string; facts: { value: string; label: string }[] };
type Problem = { tag: string; title: string; text: string; points: string[]; story: { label: string; quote: string; text: string }; note: string };
type Scope = { tag: string; title: string; accent: string; text: string; includedTitle: string; included: { title: string; text: string }[]; laterTitle: string; laterText: string; later: { label: string; hint: string; price: string }[] };
type Way = { title: string; lead: string; unit: string; points: string[]; cta: string; badge?: string };
type Price = { tag: string; title: string; accent: string; text: string; buy: Way; rent: Way };
type Reference = { tag: string; title: string; accent: string; note: string; visit: string; opensNewTab: string };
type Contact = { title: string; accent: string; text: string; points: string[]; formTitle: string; formText: string; submit: string };

/**
 * Einstiegsangebot: ein Paket, das ein Inhaber in einem Gespräch versteht.
 * Aufbau: Hero mit beiden Preisen → Problem & Lösung → fester Umfang → Kaufen oder mieten → Referenz → Ablauf → FAQ → Anfrage.
 * Texte: messages → starterOffer, Zahlen: config/packages.ts (starterOffer, rental).
 */
export async function StarterOfferPage({ locale }: { locale: Locale }) {
  const t = await getTranslations("starterOffer");
  const tc = await getTranslations("common");
  const tv = await getTranslations("site");
  const tp = await getTranslations("portfolio");
  const vars = starterOfferVars(locale);
  const get = <T,>(key: string) => fillOffer(t.raw(key) as T, vars);

  const hero = get<Hero>("hero");
  const problem = get<Problem>("problem");
  const scope = get<Scope>("scope");
  const price = get<Price>("price");
  const reference = get<Reference>("reference");
  const contact = get<Contact>("contact");
  const ref = getPortfolioItem(starterOffer.reference);
  const refSite = ref.media.type === "site" ? ref.media : null;
  const refHost = refSite?.url.replace(/^https?:\/\//, "");
  const contacts = [
    { href: site.phoneHref, icon: Phone, label: tc("phone"), value: site.phone },
    { href: site.whatsappHref, icon: MessageCircle, label: tc("whatsapp"), value: tc("whatsappCta") },
    { href: `mailto:${site.email}`, icon: Mail, label: tc("email"), value: site.email },
  ];

  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="pointer-events-none absolute -top-40 right-0 -z-10 h-[560px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.13),transparent)]" aria-hidden />
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <div className="animate-rise">
              <Eyebrow icon={Tag}>{hero.badge}</Eyebrow>
            </div>
            <h1 className="mt-5 animate-rise text-[clamp(2.3rem,4.9vw,4rem)] leading-[1.04] font-medium text-balance [animation-delay:0.08s]">
              {hero.title} <span className="text-brand-500">{hero.accent}</span>
            </h1>
            <p className="mt-5 max-w-xl animate-rise text-[16px] leading-relaxed text-muted [animation-delay:0.16s]">{hero.text}</p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3 [animation-delay:0.24s]">
              <ButtonLink href="#anfrage">
                {hero.primary} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/einstiegsangebot/kurzfassung" variant="soft">
                <FileText className="size-4" aria-hidden /> {hero.secondary}
              </ButtonLink>
            </div>
            <dl className="mt-9 grid max-w-xl animate-rise grid-cols-3 divide-x divide-line rounded-[1.6rem] border border-line bg-white shadow-[var(--shadow-soft)] [animation-delay:0.3s]">
              {hero.facts.map((f) => (
                <div key={f.label} className="flex flex-col-reverse justify-end px-4 py-4 sm:px-5">
                  <dt className="mt-1 text-xs leading-snug text-muted">{f.label}</dt>
                  <dd className="num text-[1.15rem] leading-tight font-medium text-ink sm:text-2xl">{f.value}</dd>
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
                {refHost && (
                  <span className="ml-3 flex min-w-0 items-center gap-1.5 truncate rounded-full bg-canvas px-3 py-1 text-xs text-muted">
                    <Globe className="size-3 shrink-0" aria-hidden /> {refHost}
                  </span>
                )}
              </div>
              {refSite && (
                <div className="relative aspect-[4/3]">
                  <Image src={refSite.image} alt={hero.imageAlt} fill priority sizes="(min-width:1024px) 620px, 100vw" className="object-cover object-top" />
                </div>
              )}
            </div>
            <p className="absolute bottom-0 left-4 inline-flex animate-float-slow items-center gap-2.5 rounded-full border border-line bg-white py-2 pr-5 pl-2 text-sm font-medium text-ink shadow-[var(--shadow-float)] sm:-left-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
                <BadgeCheck className="size-4" aria-hidden />
              </span>
              {hero.refNote}
            </p>
          </div>
        </div>
      </section>

      <ProblemSection tag={problem.tag} title={problem.title} text={problem.text} points={problem.points} story={problem.story} note={problem.note} />

      <section id="umfang" aria-labelledby="scope-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading id="scope-title" eyebrow={scope.tag} icon={ListChecks} title={scope.title} accent={scope.accent} text={scope.text} />
          </Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <Reveal delay={0.08} className="card p-6 sm:p-9">
              <h3 className="text-lg font-medium">{scope.includedTitle}</h3>
              <ul className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {scope.included.map((it) => (
                  <li key={it.title} className="flex gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{it.title}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-muted">{it.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.14} className="rounded-[2rem] bg-brand-50 p-6 sm:p-8">
              <h3 className="flex items-center gap-2.5 text-lg font-medium">
                <span className="grid size-8 place-items-center rounded-full bg-white text-brand-600">
                  <Plus className="size-4" aria-hidden />
                </span>
                {scope.laterTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-body">{scope.laterText}</p>
              <ul className="mt-5 grid gap-2.5">
                {scope.later.map((x) => (
                  <li key={x.label} className="flex items-center justify-between gap-3 rounded-3xl bg-white px-4 py-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{x.label}</span>
                      <span className="block text-xs leading-snug text-muted">{x.hint}</span>
                    </span>
                    <span className="num shrink-0 text-sm font-medium text-ink">{x.price}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="preis" aria-labelledby="price-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <SectionHeading id="price-title" eyebrow={price.tag} icon={Tag} title={price.title} accent={price.accent} text={price.text} />
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
            <Reveal delay={0.08} className="card flex flex-col p-7 sm:p-9">
              <p className="flex items-center gap-2.5 font-medium text-ink">
                <span className="grid size-8 place-items-center rounded-full bg-canvas text-ink">
                  <KeyRound className="size-4" aria-hidden />
                </span>
                {price.buy.title}
              </p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                <span className="num text-5xl font-medium tracking-tight text-ink">{vars.price}</span>
                <span className="text-sm text-muted">{price.buy.unit}</span>
              </p>
              <p className="mt-2 text-sm text-muted">{price.buy.lead}</p>
              <WayPoints points={price.buy.points} />
              <ButtonLink href="#anfrage" variant="white" className="mt-auto w-full">
                {price.buy.cta}
              </ButtonLink>
            </Reveal>
            <Reveal delay={0.14} className="card-night flex flex-col p-7 shadow-[var(--shadow-float)] sm:p-9">
              <p className="flex flex-wrap items-center gap-2.5 font-medium">
                <span className="grid size-8 place-items-center rounded-full bg-brand-500 text-white">
                  <Repeat className="size-4" aria-hidden />
                </span>
                {price.rent.title}
                <span className="num rounded-full bg-mint-500 px-2.5 py-1 text-xs font-medium text-white">{price.rent.badge}</span>
              </p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                <span className="num text-5xl font-medium tracking-tight">{vars.rent}</span>
                <span className="text-sm text-night-muted">{price.rent.unit}</span>
              </p>
              <p className="mt-2 text-sm text-night-muted">{price.rent.lead}</p>
              <WayPoints points={price.rent.points} dark />
              <ButtonLink href="#anfrage" className="mt-auto w-full">
                {price.rent.cta}
              </ButtonLink>
            </Reveal>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">{tv("vatNote")}</p>
        </div>
      </section>

      {refSite && (
        <section id="referenz" aria-labelledby="reference-title" className="scroll-mt-24 py-16 sm:py-20">
          <div className="container-x grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <Reveal className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[var(--shadow-soft)]">
              <div className="relative aspect-[4/3]">
                <Image src={refSite.image} alt={hero.imageAlt} fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover object-top" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <Eyebrow icon={BadgeCheck}>{reference.tag}</Eyebrow>
              <h2 id="reference-title" className="mt-4 text-[clamp(2rem,3.8vw,3rem)] leading-[1.06] font-medium text-balance">
                {reference.title} <span className="text-brand-500">{reference.accent}</span>
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-body">{tp(`items.${starterOffer.reference}.text`)}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-body">{tp(`items.${starterOffer.reference}.result`)}</p>
              <p className="mt-5 rounded-3xl bg-canvas p-4 text-sm leading-relaxed text-muted">{reference.note}</p>
              <a href={refSite.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-6 text-[15px] font-medium text-ink shadow-[var(--shadow-soft)] transition hover:border-brand-200">
                {reference.visit} <ArrowUpRight className="size-4" aria-hidden />
                <span className="sr-only">{reference.opensNewTab}</span>
              </a>
            </Reveal>
          </div>
        </section>
      )}

      <Timeline content={get<TimelineContent>("timeline")} />

      <FaqSection items={get<{ q: string; a: string }[]>("faq")} />

      <section id="anfrage" aria-labelledby="anfrage-title" className="scroll-mt-24 py-16 sm:py-20">
        <div className="container-x grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal className="lg:sticky lg:top-28">
            <Eyebrow icon={Send}>{hero.primary}</Eyebrow>
            <h2 id="anfrage-title" className="mt-4 text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.04] font-medium">
              {contact.title} <span className="text-brand-500">{contact.accent}</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{contact.text}</p>
            <ul className="mt-6 grid gap-2">
              {contact.points.map((p) => (
                <li key={p} className="num flex items-center gap-2.5 text-[14.5px] text-body">
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
            <DirectContact title={contact.formTitle} text={contact.formText} submitLabel={contact.submit} industry="gastro" interests={[starterOffer.service]} source="ki_seite" />
          </Reveal>
        </div>
      </section>
    </>
  );
}

function WayPoints({ points, dark }: { points: string[]; dark?: boolean }) {
  return (
    <ul className="mt-6 mb-8 space-y-2.5">
      {points.map((p) => (
        <li key={p} className={`num flex items-start gap-2.5 text-[15px] leading-snug ${dark ? "text-white/90" : "text-body"}`}>
          <Check className={`mt-0.5 size-4 shrink-0 ${dark ? "text-mint-400" : "text-mint-500"}`} strokeWidth={2.5} aria-hidden />
          {p}
        </li>
      ))}
    </ul>
  );
}
