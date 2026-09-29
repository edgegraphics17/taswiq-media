"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Live-Updates: neuer oder geänderter Lead → Dashboard lädt Server-Daten neu.
 * Hört auf den Server-Sent-Events-Stream unter /admin/api/live (Proxy zum Backend, nur mit Admin-Session).
 * EventSource verbindet sich bei Abbruch (z. B. Sprite-Kaltstart) selbstständig neu.
 */
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    if (typeof EventSource === "undefined") return;
    const source = new EventSource("/admin/api/live");
    source.addEventListener("change", () => router.refresh());
    return () => source.close();
  }, [router]);
  return null;
}
