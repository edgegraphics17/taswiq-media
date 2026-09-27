import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { AppHref } from "@/config/site";
import { ArrowRight, BadgeCheck, Globe } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard, MiniBars } from "@/components/ui/FloatCard";
import { PartnerBadge } from "@/components/ui/PartnerBadge";

/**
 * Hero der Landingpages: zentrierte Headline, Pillen-Buttons, darunter echtes Projekt –
 * Software im Browser-Rahmen, Media/Immobilien als Foto – mit schwebenden Stat-Karten.
 */
export async function ProductHero({
  badge,
  titleStart,
  titleHighlight,
  text,
  primary,
  secondary,
  stats,
  image,
  imageAlt,
  frame = "browser",
  url,
}: {
  badge: string;
  titleStart: string;
  titleHighlight: string;
  text: string;
  primary: { label: string; href: AppHref | `#${string}` };
  secondary: { label: string; href: AppHref | `#${string}` };
  stats?: { value: string; label: string }[];
  image: string;
  imageAlt: string;
  frame?: "browser" | "photo";
  url?: string;
}) {
  const t = await getTranslations("product");
  const [s1, s2] = stats ?? (t.raw("defaultStats") as { value: string; label: string }[]);
  return (
    <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.13),transparent)]" aria-hidden />
      <div className="container-x text-center">
        <div className="flex animate-rise justify-center">
          <Eyebrow>{badge}</Eyebrow>
        </div>
        <h1 className="mx-auto mt-5 max-w-4xl animate-rise text-[clamp(2.3rem,6vw,4.6rem)] leading-[1.04] font-medium text-balance [animation-delay:0.08s]">
          {titleStart} <span className="text-brand-500">{titleHighlight}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl animate-rise text-[15.5px] leading-relaxed text-muted [animation-delay:0.16s]">{text}</p>
        <div className="mt-8 flex animate-rise flex-wrap justify-center gap-3 [animation-delay:0.24s]">
          <ButtonLink href={primary.href}>
            {primary.label} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href={secondary.href} variant="soft">
            {secondary.label}
          </ButtonLink>
        </div>
        <div className="mt-6 flex animate-rise justify-center [animation-delay:0.28s]">
          <PartnerBadge />
        </div>
      </div>

      <div className="container-x mt-12 animate-rise [animation-delay:0.32s]">
        <div className="relative mx-auto max-w-4xl">
          {frame === "browser" ? (
            <div className="overflow-hidden rounded-[1.6rem] border border-line bg-white shadow-[var(--shadow-float)] sm:rounded-[2rem]">
              <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                {["bg-blush-500/70", "bg-amber-400/80", "bg-mint-500/70"].map((c) => (
                  <span key={c} className={`size-2.5 rounded-full ${c}`} aria-hidden />
                ))}
                {url && (
                  <span className="ml-3 flex min-w-0 items-center gap-1.5 truncate rounded-full bg-canvas px-3 py-1 text-xs text-muted">
                    <Globe className="size-3 shrink-0" aria-hidden /> {url}
                  </span>
                )}
              </div>
              <div className="relative aspect-[16/9]">
                <Image src={image} alt={imageAlt} fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover object-top" />
              </div>
            </div>
          ) : (
            <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] shadow-[var(--shadow-float)] sm:rounded-[2.5rem]">
              <Image src={image} alt={imageAlt} fill priority sizes="(min-width:1024px) 900px, 100vw" className="object-cover" />
            </div>
          )}
          <FloatCard tone="night" className="top-14 -left-2 w-40 text-left sm:-left-8 sm:w-44">
            <p className="num text-2xl font-medium">{s1.value}</p>
            <p className="text-[11px] text-night-muted">{s1.label}</p>
            <MiniBars className="mt-2" />
          </FloatCard>
          <FloatCard slow className="right-3 -bottom-5 flex items-center gap-3 !rounded-full py-2 pr-5 pl-2 sm:-right-6">
            <span className="grid size-9 place-items-center rounded-full bg-mint-500 text-white">
              <BadgeCheck className="size-4.5" aria-hidden />
            </span>
            <span className="text-left leading-tight">
              <span className="num block text-sm font-medium">{s2.value}</span>
              <span className="text-[11px] text-muted">{s2.label}</span>
            </span>
          </FloatCard>
        </div>
      </div>
    </section>
  );
}
