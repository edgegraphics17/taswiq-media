import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { referenceArtists, referenceGroups, referenceLogos, type ReferenceLogo } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";

type Item = { label: string } | { name: string };

/**
 * Optisch gleich große Logos: breite Wortmarken werden flacher, kompakte Marken höher
 * (Höhe ∝ Seitenverhältnis^-0.45), damit jedes Logo ungefähr gleich viel Fläche einnimmt.
 */
function logoSize({ w, h, scale = 1 }: ReferenceLogo) {
  const ratio = w / h;
  const height = Math.min(46, Math.max(19, 38 * Math.pow(ratio, -0.45))) * scale;
  return { width: Math.round(height * ratio), height: Math.round(height) };
}

/**
 * Referenz-Laufbänder: oben Marken als einheitlich graue Logos, unten Artists als Namen.
 * Zwei gegenläufige Bänder, pausieren beim Hover. Direkt unter dem Hero = Social Proof aus
 * 450+ Media-Projekten für Hotels, Festivals, Marken und Artists.
 */
export async function References({ className }: { className?: string }) {
  const t = await getTranslations("home.references");
  const brands: Item[] = referenceGroups.flatMap((g) => [{ label: t(`groups.${g.id}`) }, ...g.names.map((n) => ({ name: n }))]);
  const artists: Item[] = [{ label: t("groups.artists") }, ...referenceArtists.map((n) => ({ name: n }))];

  const Row = ({ items, reverse, logos }: { items: Item[]; reverse?: boolean; logos?: boolean }) => (
    <div className="group/marquee relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className={`flex shrink-0 animate-marquee items-center group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none ${logos ? "h-16 gap-x-12 pr-12" : "gap-x-8 pr-8"}`}
          style={reverse ? { animationDirection: "reverse" } : undefined}
        >
          {items.map((it, i) => {
            if ("label" in it)
              return (
                <li key={`l-${i}`} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium whitespace-nowrap text-brand-600">
                  {it.label}
                </li>
              );
            const logo = logos ? referenceLogos[it.name] : undefined;
            if (logo) {
              const size = logoSize(logo);
              return (
                <li key={`n-${i}`} className="flex shrink-0 items-center">
                  <Image
                    src={logo.src}
                    alt={copy === 1 ? "" : it.name}
                    width={size.width}
                    height={size.height}
                    unoptimized
                    loading="eager"
                    draggable={false}
                    className={`max-w-none opacity-45 transition-opacity duration-300 hover:opacity-90 ${logo.tone === "gray" ? "grayscale" : "brightness-0"}`}
                    style={{ width: size.width, height: size.height }}
                  />
                </li>
              );
            }
            return (
              <li key={`n-${i}`} className="text-[clamp(1.1rem,2vw,1.55rem)] font-medium tracking-tight whitespace-nowrap text-ink/40 transition-colors hover:text-ink">
                {it.name}
              </li>
            );
          })}
        </ul>
      ))}
    </div>
  );

  return (
    <section aria-labelledby="references-title" className={className ?? "py-12"}>
      <Reveal className="container-x text-center">
        <p id="references-title" className="text-lg font-medium text-ink">
          {t("title")}
        </p>
        <p className="mx-auto mt-1 max-w-2xl text-sm text-muted">{t("text")}</p>
      </Reveal>
      <div className="mt-8 space-y-5">
        <Row items={brands} logos />
        <Row items={artists} reverse />
      </div>
    </section>
  );
}
