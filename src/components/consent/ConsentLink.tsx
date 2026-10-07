"use client";

import { openConsentSettings } from "@/lib/consent";

/** Öffnet das Einwilligungs-Fenster erneut – Widerruf muss so einfach sein wie die Zustimmung. */
export function ConsentLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {children}
    </button>
  );
}
