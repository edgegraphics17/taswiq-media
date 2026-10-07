"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sendHit } from "@/lib/track";

/** Meldet jeden Seitenaufruf (auch Client-Navigation). Herkunft (Referrer, UTM) nur beim Einstieg. */
export function PageViews() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      const q = new URLSearchParams(window.location.search);
      const utm = (k: string) => q.get(k)?.slice(0, 120) || undefined;
      sendHit({ type: "pageview", path: pathname, referrer: document.referrer.slice(0, 500) || undefined, utm_source: utm("utm_source"), utm_medium: utm("utm_medium"), utm_campaign: utm("utm_campaign") });
      first.current = false;
    } else {
      // Folgeseiten zählen zum Einstiegskanal – der Server ordnet sie über den Tages-Hash demselben Besuch zu.
      sendHit({ type: "pageview", path: pathname, internal: true });
    }
  }, [pathname]);
  return null;
}
