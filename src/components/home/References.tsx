import { getTranslations } from "next-intl/server";
import { referenceArtists, referenceGroups } from "@/config/content";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Referenz-Laufbänder im Stil der Logo-Reihe der Vorlage ("maze · Culture Amp"):
 * Namen typografisch statt Fremd-Logos, zwei gegenläufige Bänder, pausieren beim Hover.
 */
export async function References() {
  const t = await getTranslations("home.references");
  const brands = referenceGroups.flatMap((g) => [{ label: t(`groups.${g.id}`) }, ...g.names.map((n) => ({ name: n }))]);
  const artists = [{ label: t("groups.artists") }, ...referenceArtists.map((n) => ({ name: n }))];

  const Row = ({ items, reverse }: { items: ({ label: string } | { name: string })[]; reverse?: boolean }) => (
    <div className="group/marquee relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {[0, 1].map((copy) => (
        <ul
          key={copy}
          aria-hidden={copy === 1 || undefined}
          className="flex shrink-0 animate-marquee items-center gap-x-8 pr-8 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
          style={reverse ? { animationDirection: "reverse" } : undefined}
        >
          {items.map((it, i) =>
            "label" in it ? (
              <li key={`l-${i}`} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium whitespace-nowrap text-brand-600">
                {it.label}
              </li>
            ) : (
              <li key={`n-${i}`} className="text-[clamp(1.2rem,2.2vw,1.7rem)] font-medium tracking-tight whitespace-nowrap text-ink/35 transition-colors hover:text-ink">
                {it.name}
              </li>
            ),
          )}
        </ul>
      ))}
    </div>
  );

  return (
    <div className="mt-20">
      <Reveal className="container-x text-center">
        <p className="text-lg font-medium text-ink">{t("title")}</p>
        <p className="mt-1 text-sm text-muted">{(t.raw("partners") as string[]).join(" · ")}</p>
      </Reveal>
      <div className="mt-8 space-y-5">
        <Row items={brands} />
        <Row items={artists} reverse />
      </div>
    </div>
  );
}
