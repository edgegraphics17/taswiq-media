"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { nav, site } from "@/config/site";

/** Mobiles Menü als weiches Sheet unter der Navigationskapsel. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const firstLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => firstLink.current?.focus(), 120);
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
            aria-label="Menü"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 top-[5.25rem] z-40 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-[2rem] border border-line bg-white p-3 shadow-[var(--shadow-float)] lg:hidden"
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col">
              {nav.map((n, i) => (
                <motion.div key={n.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.035 } }}>
                  <Link
                    ref={i === 0 ? firstLink : undefined}
                    href={n.href}
                    onClick={onClose}
                    className="flex min-h-14 items-center justify-between rounded-2xl px-4 text-lg font-medium text-ink hover:bg-canvas"
                  >
                    {n.label}
                    <ArrowUpRight className="size-5 text-muted" aria-hidden />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-2 grid gap-2 border-t border-line p-2 pt-4">
              <Link href="/#kontakt" onClick={onClose} className="flex min-h-12 items-center justify-center rounded-full bg-brand-500 font-medium text-white shadow-[var(--shadow-brand)]">
                Projekt starten
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <a href={site.phoneHref} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-canvas text-sm font-medium text-ink">
                  <Phone className="size-4 text-brand-600" aria-hidden /> Anrufen
                </a>
                <a href={`mailto:${site.email}`} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-canvas text-sm font-medium text-ink">
                  <Mail className="size-4 text-brand-600" aria-hidden /> E-Mail
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
