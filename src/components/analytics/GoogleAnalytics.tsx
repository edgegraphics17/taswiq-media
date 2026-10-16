"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { CONSENT_EVENT, hasStatisticsConsent } from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 – lädt ausschließlich nach ausdrücklicher Statistik-Einwilligung.
 *
 * Ohne NEXT_PUBLIC_GA_ID oder ohne Zustimmung wird kein Skript geladen und nichts gesendet.
 * Zustimmung und Widerruf laufen über lib/consent (CONSENT_EVENT); ein Widerruf über die
 * Cookie-Einstellungen greift sofort, weitere Aufrufe werden nicht mehr gemeldet.
 * Die eigene cookiefreie Zählung (components/consent/PageViews) läuft unabhängig weiter,
 * damit das Dashboard auch ohne Einwilligung Zahlen hat.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(hasStatisticsConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  // Client-Navigationen (App Router) melden – den ersten Aufruf zählt gtag('config') selbst.
  useEffect(() => {
    if (!GA_ID || !allowed) return;
    if (first.current) {
      first.current = false;
      return;
    }
    window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname, allowed]);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
