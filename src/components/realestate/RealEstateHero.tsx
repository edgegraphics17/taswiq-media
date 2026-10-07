import Image from "next/image";
import { ArrowRight, BellRing, CalendarCheck, Clapperboard, Wrench } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard } from "@/components/ui/FloatCard";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { HeroVideo } from "@/components/home/HeroVideo";
import { WordRotator } from "@/components/home/WordRotator";

export type RealEstateHeroContent = {
  badge: string;
  titleStart: string;
  rotating: string[];
  text: string;
  primary: string;
  secondary: string;
  audienceLabel: string;
  imageAlt: string;
  videoCaption: string;
  cardsNote: string;
  cards: {
    lead: { label: string; value: string; text: string };
    viewing: { title: string; text: string };
    ticket: { title: string; text: string };
  };
};

/**
 * Hero der Immobilien-Seite: wechselndes Ergebnis ("Mehr vermietete Objekte."),
 * Sprungmarken für die Zielgruppen und der AGILE-Objektfilm als laufender Loop.
 * Die schwebenden Karten zeigen typische Meldungen aus einem Immobilien-System.
 */
export function RealEstateHero({ content: c, audiences, poster, video }: { content: RealEstateHeroContent; audiences: string[]; poster: string; video: string }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.13),transparent)]" aria-hidden />
      <div className="container-x text-center">
        <div className="flex animate-rise justify-center">
          <Eyebrow>{c.badge}</Eyebrow>
        </div>
        <h1 className="mx-auto mt-5 max-w-4xl animate-rise text-[clamp(1.9rem,7.6vw,4.6rem)] leading-[1.06] font-medium [animation-delay:0.08s]">
          <span aria-hidden>
            <span className="block">{c.titleStart}</span>
            <WordRotator words={c.rotating} />
          </span>
          <span className="sr-only">
            {c.titleStart} {c.rotating.join(", ")}
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl animate-rise text-[15.5px] leading-relaxed text-muted [animation-delay:0.16s]">{c.text}</p>
        <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:0.24s]">
          <ButtonLink href="#anfrage">
            {c.primary} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="#anwendungsfaelle" variant="soft">
            {c.secondary}
          </ButtonLink>
        </div>

        <div className="mt-8 flex animate-rise flex-wrap items-center justify-center gap-2 [animation-delay:0.28s]">
          <span className="mr-1 text-[13px] text-muted">{c.audienceLabel}</span>
          {audiences.map((a) => (
            <a key={a} href="#fuer-wen" className="inline-flex min-h-9 items-center rounded-full border border-line bg-white px-3.5 text-[13px] font-medium text-body transition-colors hover:border-brand-200 hover:text-ink">
              {a}
            </a>
          ))}
        </div>
        <div className="mt-5 flex animate-rise justify-center [animation-delay:0.3s]">
          <PartnerBadge />
        </div>
      </div>

      <div className="container-x mt-12 animate-rise [animation-delay:0.34s]">
        <div className="relative mx-auto max-w-4xl pb-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-night shadow-[var(--shadow-float)] sm:aspect-[16/9] sm:rounded-[2.5rem]">
            <Image src={poster} alt={c.imageAlt} fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover" />
            <HeroVideo src={video} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
            <p className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/45 py-1.5 pr-3.5 pl-2 text-xs font-medium text-white backdrop-blur-md sm:bottom-5 sm:left-5">
              <span className="grid size-6 place-items-center rounded-full bg-white/15">
                <Clapperboard className="size-3.5" aria-hidden />
              </span>
              {c.videoCaption}
            </p>
          </div>

          <p className="sr-only">{c.cardsNote}</p>
          <FloatCard tone="night" className="-top-5 -left-1 w-44 !p-3 text-left sm:top-10 sm:-left-10 sm:w-56 sm:!p-4">
            <p className="flex items-center gap-1.5 text-[11px] text-night-muted">
              <BellRing className="size-3.5 shrink-0 text-mint-400" aria-hidden /> {c.cards.lead.label}
            </p>
            <p className="mt-1.5 text-[15px] leading-tight font-medium sm:text-lg">{c.cards.lead.value}</p>
            <p className="mt-1 text-[11px] text-night-muted">{c.cards.lead.text}</p>
          </FloatCard>

          <FloatCard slow className="right-2 -bottom-2 flex items-center gap-3 !rounded-full py-2 pr-5 pl-2 sm:-right-8 sm:bottom-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
              <CalendarCheck className="size-4.5" aria-hidden />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-medium">{c.cards.viewing.title}</span>
              <span className="num text-[11px] text-muted">{c.cards.viewing.text}</span>
            </span>
          </FloatCard>

          <FloatCard className="top-[46%] -right-10 hidden w-52 text-left lg:block">
            <span className="grid size-9 place-items-center rounded-full bg-blush-100 text-blush-600">
              <Wrench className="size-4" aria-hidden />
            </span>
            <p className="mt-2.5 text-sm font-medium">{c.cards.ticket.title}</p>
            <p className="text-xs leading-snug text-muted">{c.cards.ticket.text}</p>
          </FloatCard>
        </div>
      </div>
    </section>
  );
}
