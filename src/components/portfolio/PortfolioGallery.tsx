import { getTranslations } from "next-intl/server";
import { Music2 } from "lucide-react";
import { BrandRail, FlyerRail, MotionRail } from "@/components/portfolio/Gallery";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { galleryFlyers, galleryMotion } from "@/config/gallery";
import { galleryBrands } from "@/config/gallery-brands";

/**
 * Events & Partys – bewusst kompakt: schmale Slider statt großer Karten.
 * Die Kundenprojekte (Software, Websites, Filme) bleiben oben die Hauptsache.
 */
export async function PortfolioGallery() {
  const t = await getTranslations("portfolio");
  const series = new Set([...galleryFlyers, ...galleryMotion].map((i) => i.series)).size;

  return (
    <section aria-labelledby="gallery-title" className="py-10 sm:py-14">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <Eyebrow icon={Music2}>{t("gallery.tag")}</Eyebrow>
            <h2 id="gallery-title" className="mt-3 text-[clamp(1.7rem,3.6vw,2.5rem)] leading-[1.08] font-medium text-balance">
              {t("gallery.title")} <span className="text-brand-500">{t("gallery.titleAccent")}</span>
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">{t("gallery.text")}</p>
          </div>
          <p className="num text-sm text-muted">{t("gallery.stats", { flyers: galleryFlyers.length, motion: galleryMotion.length, series })}</p>
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-ink">{t("gallery.flyerTitle")}</h3>
        <FlyerRail items={galleryFlyers} />

        <h3 className="mt-6 mb-3 text-sm font-semibold tracking-wide text-ink">{t("gallery.motionTitle")}</h3>
        <MotionRail items={galleryMotion} dense />

        <h3 className="mt-6 mb-3 text-sm font-semibold tracking-wide text-ink">{t("gallery.brandTitle")}</h3>
        <BrandRail items={galleryBrands} />
      </div>
    </section>
  );
}
