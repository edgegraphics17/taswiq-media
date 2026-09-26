import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import fog from "../../../public/images/fog.jpg";

/** Hero der Unterseiten (asap ki-telefonassistent #hero): Badge, H1 mit Teal-Highlight, 2 CTAs, Kennzahlen. */
export function ProductHero({
  badge,
  titleStart,
  titleHighlight,
  text,
  primary,
  secondary,
  stats,
}: {
  badge: string;
  titleStart: string;
  titleHighlight: string;
  text: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  stats?: { value: string; label: string }[];
}) {
  return (
    <section className="grain relative isolate overflow-hidden bg-ink-900 pt-32 pb-20 sm:pt-40 sm:pb-24">
      <Image src={fog} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-20 object-cover object-[50%_65%]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(24_34_46/0.6),rgb(15_23_32/0.96))]" />
      <div className="pointer-events-none absolute -top-24 -right-24 -z-10 size-[560px] animate-orb rounded-full bg-[radial-gradient(circle,rgb(90_174_184/0.16)_0%,transparent_70%)]" aria-hidden />
      <div className="container-x">
        <p className="inline-flex animate-hero-up items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-[12px] font-semibold tracking-[0.14em] text-teal-light uppercase [animation-delay:0.1s]">
          {badge}
        </p>
        <h1 className="mt-6 max-w-4xl animate-hero-up text-[clamp(2.4rem,6vw,4.6rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-white [animation-delay:0.25s]">
          {titleStart} <span className="shine-text">{titleHighlight}</span>.
        </h1>
        <p className="mt-6 max-w-2xl animate-hero-up text-[clamp(1rem,2vw,1.15rem)] leading-relaxed text-mist [animation-delay:0.4s]">{text}</p>
        <div className="mt-9 flex animate-hero-up flex-wrap gap-4 [animation-delay:0.55s]">
          <ButtonLink href={primary.href}>
            {primary.label} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href={secondary.href} variant="ghost-dark">
            {secondary.label}
          </ButtonLink>
        </div>
        {stats && (
          <dl className="mt-14 grid max-w-3xl animate-hero-up grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4 [animation-delay:0.7s]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-[12px] font-semibold tracking-[0.1em] text-haze uppercase">{s.label}</dt>
                <dd className="num text-3xl font-extrabold tracking-tight text-teal-light">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
