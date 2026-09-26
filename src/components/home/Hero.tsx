import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { hero } from "@/config/content";
import { site } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Typewriter } from "@/components/home/Typewriter";
import { HeroVideo } from "@/components/home/HeroVideo";
import poster from "../../../public/images/showreel-poster.jpg";

/**
 * Hero nach asap (#home): ein Wort als H1 + Typewriter-Zeile, Subline, 2 CTAs,
 * 3 Kennzahlen, Scroll-Indikator. Gestaffeltes fadeUp per CSS (0.2 → 1.4 s),
 * damit der LCP-Text ohne JavaScript sichtbar wird.
 * Hintergrund: Showreel aus echten Projekten unter dem Navy-Verlauf der Rechnung,
 * dazu schwebende Teal-Glows + Filmkorn.
 */
export function Hero() {
  const fadeUp = "animate-hero-up";
  return (
    <section id="home" className="grain relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink-900">
      {/* Showreel aus echten Projekten (Kuala Lumpur) – Poster sofort, Video blendet ein */}
      <Image src={poster} alt="" fill priority placeholder="blur" sizes="100vw" className="-z-20 object-cover" />
      {site.heroVideo && <HeroVideo src={site.heroVideo} />}
      {/* Navy-Verlauf wie im Rechnungskopf: oben Nebel sichtbar, unten tief */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(24_34_46/0.72)_0%,rgb(24_34_46/0.78)_45%,rgb(15_23_32/0.97)_100%)]" />
      <div
        className="absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgb(90_174_184/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(90_174_184/0.05)_1px,transparent_1px)] [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute -top-24 -right-24 -z-10 size-[600px] rounded-full bg-[radial-gradient(circle,rgb(90_174_184/0.16)_0%,transparent_70%)] animate-orb" aria-hidden />
      <div className="pointer-events-none absolute -bottom-12 -left-24 -z-10 size-[420px] rounded-full bg-[radial-gradient(circle,rgb(143_211_220/0.1)_0%,transparent_70%)] animate-orb [animation-direction:reverse] [animation-duration:11s]" aria-hidden />

      <div className="w-full max-w-[960px] px-5 pt-28 pb-32 text-center sm:px-8">
        <p className={`eyebrow-dark ${fadeUp} [animation-delay:0.2s]`}>Medienagentur für Gastronomie, Festivals & Musik</p>

        <h1 className={`mt-6 font-extrabold tracking-[-0.03em] text-white ${fadeUp} [animation-delay:0.4s]`}>
          <span className="block text-[clamp(3.4rem,11vw,7.5rem)] leading-[0.95]">{hero.word}</span>
          <span className="mt-2 block text-[clamp(1.7rem,5.2vw,3.6rem)] leading-[1.15]">
            <Typewriter words={hero.typewriter} />
            <span className="sr-only">Content für Gastronomie, Festivals und Musik – {hero.typewriter.join(" ")}</span>
          </span>
        </h1>

        <p className={`mx-auto mt-7 max-w-[600px] text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-mist ${fadeUp} [animation-delay:0.6s]`}>
          {hero.sub}
        </p>

        <div className={`mt-10 flex flex-wrap justify-center gap-4 ${fadeUp} [animation-delay:0.8s]`}>
          <ButtonLink href={hero.primary.href}>
            {hero.primary.label} <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href={hero.secondary.href} variant="ghost-dark">
            {hero.secondary.label}
          </ButtonLink>
        </div>

        <dl className={`mx-auto mt-14 flex max-w-2xl flex-wrap justify-center gap-x-12 gap-y-6 border-t border-white/10 pt-9 ${fadeUp} [animation-delay:1s]`}>
          {hero.stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse items-center">
              <dt className="mt-1.5 text-[12px] font-semibold tracking-[0.12em] text-haze uppercase">{s.label}</dt>
              <dd className="num text-[2.4rem] leading-none font-extrabold tracking-tight text-teal-light">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <a href="#about" className={`absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 ${fadeUp} [animation-delay:1.4s]`} aria-label="Weiter nach unten scrollen">
        <span className="text-[11px] tracking-[0.12em] text-haze uppercase">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-teal to-transparent animate-scroll" />
      </a>
    </section>
  );
}
