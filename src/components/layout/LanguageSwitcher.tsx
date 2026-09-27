"use client";

import { useEffect, useId, useState } from "react";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LayoutGroup, motion } from "framer-motion";
import { getPathname, usePathname } from "@/i18n/navigation";
import { routing, LOCALE_META, type AppPathname, type Locale } from "@/i18n/routing";
import { translateSeoSlug } from "@/config/seo-pages";
import { cn } from "@/lib/format";

/**
 * Soft-UI-Sprachumschalter (DE/EN) als Pillen-Toggle:
 *  - Spur: helle Kapsel (Canvas #F6F6F6), aktive Sprache als weiße Pille mit weichem Schatten + Violett-Text
 *  - Die Pille gleitet per Framer-Motion-Spring (layoutId) sofort beim Klick zur neuen Sprache,
 *    während Next die neue Sprachfassung als Transition im Hintergrund lädt – kein Flackern.
 *  - Echte <a hreflang>-Links auf die kanonischen URLs (ohne Redirect-Umweg) → crawlbar, auch ohne JS.
 *  - Bleibt auf derselben Seite (übersetzte Pfade + Slugs) und an derselben Scroll-Position.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const [active, setActive] = useState<Locale>(locale);
  const groupId = useId();

  // Falls die Sprache anders wechselt (Browser-Zurück), Pille nachziehen
  useEffect(() => setActive(locale), [locale]);

  /** Gleiche Seite in der Zielsprache, z. B. /preisrechner → /en/pricing-calculator (SEO-Slugs werden mitübersetzt) */
  const hrefFor = (target: Locale) =>
    getPathname({
      locale: target,
      href:
        pathname === "/leistungen/[slug]" && params.slug
          ? { pathname, params: { slug: translateSeoSlug(params.slug, target) ?? params.slug } }
          : pathname === "/blog/[slug]"
            ? // Ratgeber-Artikel gibt es nur auf Deutsch → in der anderen Sprache zur Übersicht
              target === "de" && params.slug
              ? { pathname, params: { slug: params.slug } }
              : "/blog"
            : (pathname as Exclude<AppPathname, "/leistungen/[slug]" | "/blog/[slug]">),
    });

  return (
    <LayoutGroup id={groupId}>
      <div role="group" aria-label={t("label")} className={cn("relative inline-flex shrink-0 items-center gap-0.5 rounded-full bg-canvas p-1", className)}>
        {routing.locales.map((l) => {
          const isActive = l === active;
          const { hreflang } = LOCALE_META[l];
          const label = t(`languages.${l}`);
          return (
            <NextLink
              key={l}
              href={hrefFor(l)}
              scroll={false}
              replace
              hrefLang={hreflang}
              lang={l}
              aria-current={isActive ? "true" : undefined}
              aria-label={isActive ? label : t("switchTo", { language: label })}
              onClick={(e) => {
                if (isActive) return e.preventDefault();
                setActive(l); // Pille gleitet sofort, Navigation läuft parallel
              }}
              className={cn(
                "relative grid h-9 min-w-11 place-items-center rounded-full px-3 text-[13px] font-semibold tracking-wide transition-colors duration-200",
                // Trefferfläche auf 44 px Höhe erweitern, ohne die Pille optisch zu vergrößern
                "after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
                isActive ? "cursor-default" : "cursor-pointer text-muted hover:text-ink",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="lang-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-white shadow-[var(--shadow-soft)] ring-1 ring-black/[0.04]"
                  transition={{ type: "spring", stiffness: 520, damping: 38, mass: 0.8 }}
                />
              )}
              <span className={cn("relative", isActive && "text-brand-600")}>{l.toUpperCase()}</span>
            </NextLink>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
