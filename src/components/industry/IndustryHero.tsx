import Image from "next/image";
import { ArrowRight, BellRing, Clapperboard, Globe, MousePointerClick } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { DemoLink } from "@/components/ui/DemoLink";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard } from "@/components/ui/FloatCard";
import { Icon } from "@/components/ui/Icon";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import { HeroVideo } from "@/components/home/HeroVideo";
import { WordRotator } from "@/components/home/WordRotator";
import type { Module } from "@/components/industry/ModuleExplorer";
import { TONES } from "@/components/industry/tones";
import type { DemoSlug } from "@/demos/registry";
import { cn } from "@/lib/format";

export type IndustryHeroContent = {
  badge: string;
  titleStart: string;
  rotating: string[];
  text: string;
  primary: string;
  secondary: string;
  audienceLabel: string;
  imageAlt: string;
  /** Nur bei Film im Hero (z. B. Immobilien) */
  videoCaption?: string;
  /** Nur bei Beispielansicht ("mock"): Adresse in der Browser-Leiste und Hinweis-Pille */
  mockUrl?: string;
  mockNote?: string;
  cardsNote: string;
  cards: {
    alert: { label: string; value: string; text: string };
    confirm: { icon: string; title: string; text: string };
    note: { icon: string; title: string; text: string };
  };
};

/**
 * Hero der Branchenseiten: wechselndes Ergebnis in der Headline, Sprungmarken für die
 * Zielgruppen und ein echtes Projekt – als Film-Loop (Foto-Rahmen) oder als System im
 * Browser-Rahmen. Die schwebenden Karten zeigen typische Meldungen aus dem System.
 */
export function IndustryHero({
  content: c,
  audiences,
  media,
  modules,
  demo,
  demoLabel,
}: {
  content: IndustryHeroContent;
  audiences: string[];
  media: { image: string; frame: "browser" | "photo" | "mock"; url?: string; video?: string };
  modules: Module[];
  /** Software-Demo dieser Branche: zusätzlicher Knopf, der Screenshot führt ebenfalls dorthin */
  demo?: DemoSlug;
  demoLabel?: string;
}) {
  const mock = media.frame === "mock";
  const url = mock ? c.mockUrl : media.url;
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
          {demo && demoLabel && (
            <DemoLink slug={demo}>
              <MousePointerClick className="size-4 text-brand-600" aria-hidden /> {demoLabel}
            </DemoLink>
          )}
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
          {media.frame !== "photo" ? (
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
                {media.frame === "mock" && c.mockNote && <span className="ml-auto hidden shrink-0 rounded-full bg-canvas px-3 py-1 text-xs text-muted sm:block">{c.mockNote}</span>}
              </div>
              {media.frame === "browser" ? (
                demo ? (
                  <DemoLink slug={demo} variant="bare" className="group/demo relative block aspect-[4/3] sm:aspect-[16/9]" aria-label={demoLabel}>
                    <Image src={media.image} alt={c.imageAlt} fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover object-top" />
                    <span className="absolute right-4 bottom-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-night px-5 text-sm font-medium text-white shadow-[var(--shadow-float)] transition-transform group-hover/demo:-translate-y-0.5" aria-hidden>
                      <MousePointerClick className="size-4" /> {demoLabel}
                    </span>
                  </DemoLink>
                ) : (
                  <div className="relative aspect-[4/3] sm:aspect-[16/9]">
                    <Image src={media.image} alt={c.imageAlt} fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover object-top" />
                  </div>
                )
              ) : (
                <div role="img" aria-label={c.imageAlt} className="grid bg-canvas text-left sm:grid-cols-[200px_1fr]">
                  <ul className="hidden content-start gap-1 border-r border-line bg-white p-4 sm:grid" aria-hidden>
                    {modules.map((m, i) => (
                      <li key={m.title} className={cn("flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[13px] font-medium", i === 0 ? "bg-brand-50 text-brand-700" : "text-body")}>
                        <Icon name={m.icon} className={cn("size-4 shrink-0", i === 0 ? "text-brand-600" : "text-muted")} />
                        <span className="truncate">{m.title}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-3 p-4 pt-14 pb-12 sm:p-6 sm:pb-14 lg:grid-cols-2" aria-hidden>
                    {modules.slice(0, 2).map((m, i) => (
                      <div key={m.title} className={cn("rounded-3xl border border-line bg-white p-4 shadow-[var(--shadow-soft)]", i === 1 && "hidden lg:block")}>
                        <p className="px-1 pb-3 text-sm font-medium text-ink">{m.mock.title}</p>
                        <ul className="grid gap-2">
                          {m.mock.rows.map((r) => (
                            <li key={r.label} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 rounded-2xl border border-line px-3.5 py-2.5">
                              <span className="min-w-0 flex-1 basis-32">
                                <span className="block text-sm leading-snug font-medium text-ink">{r.label}</span>
                                <span className="num block text-xs leading-snug text-muted">{r.meta}</span>
                              </span>
                              <span className={cn("num shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", TONES[r.tone])}>{r.status}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-night shadow-[var(--shadow-float)] sm:aspect-[16/9] sm:rounded-[2.5rem]">
              <Image src={media.image} alt={c.imageAlt} fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover" />
              {media.video && <HeroVideo src={media.video} />}
              {c.videoCaption && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
                  <p className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/45 py-1.5 pr-3.5 pl-2 text-xs font-medium text-white backdrop-blur-md sm:bottom-5 sm:left-5">
                    <span className="grid size-6 place-items-center rounded-full bg-white/15">
                      <Clapperboard className="size-3.5" aria-hidden />
                    </span>
                    {c.videoCaption}
                  </p>
                </>
              )}
            </div>
          )}

          <p className="sr-only">{c.cardsNote}</p>
          <FloatCard tone="night" className={cn("-top-5 -left-1 w-44 !p-3 text-left sm:-left-10 sm:w-56 sm:!p-4", mock ? "sm:-top-9" : "sm:top-16")}>
            <p className="flex items-center gap-1.5 text-[11px] text-night-muted">
              <BellRing className="size-3.5 shrink-0 text-mint-400" aria-hidden /> {c.cards.alert.label}
            </p>
            <p className="num mt-1.5 text-[15px] leading-tight font-medium sm:text-lg">{c.cards.alert.value}</p>
            <p className="num mt-1 text-[11px] text-night-muted">{c.cards.alert.text}</p>
          </FloatCard>

          <FloatCard slow className="right-2 -bottom-2 flex items-center gap-3 !rounded-full py-2 pr-5 pl-2 sm:-right-8 sm:bottom-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
              <Icon name={c.cards.confirm.icon} className="size-4.5" />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-medium">{c.cards.confirm.title}</span>
              <span className="num text-[11px] text-muted">{c.cards.confirm.text}</span>
            </span>
          </FloatCard>

          <FloatCard className={cn("top-[46%] -right-10 hidden w-52 text-left", !mock && "lg:block")}>
            <span className="grid size-9 place-items-center rounded-full bg-blush-100 text-blush-600">
              <Icon name={c.cards.note.icon} className="size-4" />
            </span>
            <p className="mt-2.5 text-sm font-medium">{c.cards.note.title}</p>
            <p className="text-xs leading-snug text-muted">{c.cards.note.text}</p>
          </FloatCard>
        </div>
      </div>
    </section>
  );
}
