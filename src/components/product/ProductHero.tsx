import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { FloatCard, MiniBars } from "@/components/ui/FloatCard";
import poster from "../../../public/images/cases/zuan-yuan.jpg";

/** Hero der Unterseiten: zentrierte Headline, Pillen-Buttons, Bild-Karte mit schwebenden Stat-Karten. */
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
  const [s1, s2] = stats ?? [
    { value: "72 h", label: "bis zu den ersten Clips" },
    { value: "450+", label: "Projekte" },
  ];
  return (
    <section className="relative overflow-hidden pt-32 pb-12 sm:pt-40">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(120_64_254/0.13),transparent)]" aria-hidden />
      <div className="container-x text-center">
        <div className="flex animate-rise justify-center">
          <Eyebrow>{badge}</Eyebrow>
        </div>
        <h1 className="mx-auto mt-5 max-w-4xl animate-rise text-[clamp(2.4rem,6.4vw,4.8rem)] leading-[1.03] font-medium [animation-delay:0.08s]">
          {titleStart} <span className="text-brand-500">{titleHighlight}</span>.
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
      </div>

      <div className="container-x mt-12 animate-rise [animation-delay:0.32s]">
        <div className="relative mx-auto max-w-4xl">
          <div className="relative aspect-[16/8] overflow-hidden rounded-[2rem] shadow-[var(--shadow-float)] sm:rounded-[2.5rem]">
            <Image src={poster} alt="Dim-Sum-Service im Zuan Yuan Restaurant" fill priority placeholder="blur" sizes="(min-width:1024px) 900px, 100vw" className="object-cover" />
          </div>
          <FloatCard tone="night" className="top-4 -left-2 w-40 text-left sm:-left-8 sm:w-44">
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

      {stats && stats.length > 2 && (
        <dl className="container-x mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card flex flex-col-reverse p-5 text-left">
              <dt className="mt-1 text-xs text-muted">{s.label}</dt>
              <dd className="num text-3xl font-medium tracking-tight text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
