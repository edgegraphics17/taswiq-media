"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { navMenus } from "@/config/seo-pages";
import { contactHref, nav, site } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

/** Mobiles Menü als weiches Sheet unter der Navigationskapsel – inkl. Sprach-Toggle für schmale Screens. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  // Schlüssel entstehen aus nav-Key + Seiten-ID → lose typisiert
  const tMenu = tNav as unknown as (key: string) => string;
  const tLang = useTranslations("languageSwitcher");
  const locale = useLocale() as Locale;
  const firstLink = useRef<HTMLElement | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    if (open) setTimeout(() => firstLink.current?.focus(), 120);
    else setExpanded(null);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 top-[5.25rem] z-40 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-[2rem] border border-line bg-white p-3 shadow-[var(--shadow-float)] lg:hidden"
          >
            <nav aria-label={t("mobileNav")} className="flex flex-col">
              {nav.map((n, i) => {
                const pages = navMenus[n.key];
                const isOpen = expanded === n.key;
                const setFirst = i === 0 ? (el: HTMLElement | null) => void (firstLink.current = el) : undefined;
                return (
                  <motion.div key={n.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.035 } }}>
                    {pages ? (
                      <>
                        <button
                          ref={setFirst}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`mobile-menu-${n.key}`}
                          onClick={() => setExpanded(isOpen ? null : n.key)}
                          className="flex min-h-14 w-full items-center justify-between rounded-2xl px-4 text-left text-lg font-medium text-ink hover:bg-canvas"
                        >
                          {tNav(n.key)}
                          <ChevronDown className={`size-5 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`mobile-menu-${n.key}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
                              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <ul className="mx-2 mb-2 rounded-2xl bg-canvas p-1.5">
                                {pages.map((p) => (
                                  <li key={p.id}>
                                    <Link
                                      href={{ pathname: "/leistungen/[slug]", params: { slug: p.slugs[locale] } }}
                                      onClick={onClose}
                                      className="flex min-h-12 items-center gap-3 rounded-xl px-2.5 text-[15px] font-medium text-ink hover:bg-white"
                                    >
                                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-brand-600">
                                        <Icon name={p.icon} className="size-4" />
                                      </span>
                                      {tMenu(`menus.${n.key}.items.${p.id}.label`)}
                                    </Link>
                                  </li>
                                ))}
                                <li>
                                  <Link href={n.href} onClick={onClose} className="flex min-h-12 items-center justify-between rounded-xl px-3.5 text-[15px] font-medium text-brand-600 hover:bg-white">
                                    {tMenu(`menus.${n.key}.all`)}
                                    <ArrowUpRight className="size-4" aria-hidden />
                                  </Link>
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        ref={setFirst}
                        href={n.href}
                        onClick={onClose}
                        className="flex min-h-14 items-center justify-between rounded-2xl px-4 text-lg font-medium text-ink hover:bg-canvas"
                      >
                        {tNav(n.key)}
                        <ArrowUpRight className="size-5 text-muted" aria-hidden />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </nav>
            <div className="mt-2 grid gap-2 border-t border-line p-2 pt-4">
              <div className="flex items-center justify-between gap-3 rounded-full bg-white px-2 min-[400px]:hidden">
                <span className="pl-2 text-sm font-medium text-muted">{tLang("label")}</span>
                <LanguageSwitcher />
              </div>
              <Link href={contactHref} onClick={onClose} className="flex min-h-12 items-center justify-center rounded-full bg-brand-500 font-medium text-white shadow-[var(--shadow-brand)]">
                {t("startProject")}
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <a href={site.phoneHref} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-canvas text-sm font-medium text-ink">
                  <Phone className="size-4 text-brand-600" aria-hidden /> {t("call")}
                </a>
                <a href={`mailto:${site.email}`} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-canvas text-sm font-medium text-ink">
                  <Mail className="size-4 text-brand-600" aria-hidden /> {t("email")}
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
