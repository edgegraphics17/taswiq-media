import type { Metadata } from "next";
import { CalendarCheck, Check } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BookingForm } from "@/components/booking/BookingForm";
import { Eyebrow } from "@/components/ui/SectionHeading";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";

/**
 * Terminseite (eigene Buchung statt Calendly) → /termin (de) · /en/book-a-call (en).
 * Ein Werkzeug, keine Inhaltsseite: noindex, steht nicht in der Sitemap. Freie Zeiten kommen aus /api/booking/slots.
 */
type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return pageMetadata({ locale, href: "/termin", title: t("metaTitle"), description: t("metaDescription"), noindex: true });
}

export default async function TerminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");
  const points = t.raw("points") as string[];
  return (
    <section aria-labelledby="termin-title" className="pt-32 pb-16 sm:pt-36 sm:pb-24">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="lg:sticky lg:top-28">
          <Eyebrow icon={CalendarCheck}>{t("eyebrow")}</Eyebrow>
          <h1 id="termin-title" className="mt-4 text-[clamp(2.2rem,4.2vw,3.4rem)] leading-[1.04] font-medium">
            {t("title")} <span className="text-brand-500">{t("titleAccent")}</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">{t("text")}</p>
          <ul className="mt-6 grid gap-2">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[14.5px] text-body">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-mint-500 text-white">
                  <Check className="size-3" strokeWidth={3.5} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <BookingForm />
      </div>
    </section>
  );
}
