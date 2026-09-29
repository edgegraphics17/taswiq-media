import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { FlyerRail } from "@/components/portfolio/Gallery";
import { Link } from "@/i18n/navigation";
import { galleryFlyers } from "@/config/gallery";

/** Kleiner Event-Streifen für die Startseite: die stärksten Flyer, ein Klick zur ganzen Galerie. */
export async function EventStrip() {
  const t = await getTranslations("portfolio");
  const picks = ["vibe-russki", "ayr-flyer", "firstclass-haupt", "hnb-flyer", "jade-ggg-planet", "wuwh-dawn", "allin-flyer", "money-neby", "vibe-reopening"]
    .map((id) => galleryFlyers.find((f) => f.id === id))
    .filter((f) => f !== undefined);

  return (
    <section aria-labelledby="event-strip-title" className="py-6 sm:py-10">
      <div className="container-x">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 id="event-strip-title" className="text-sm font-semibold tracking-wide text-ink">
            {t("gallery.stripTitle")}
          </h2>
          <Link href="/portfolio" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:text-brand-700">
            {t("gallery.cta")} <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <FlyerRail items={picks} dense filter={false} />
      </div>
    </section>
  );
}
