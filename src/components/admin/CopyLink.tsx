"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/format";

/** Link-Feld mit „Kopieren“ – z. B. der Einladungslink eines Meetings. */
export function CopyLink({ url, compact = false }: { url: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  if (compact) {
    return (
      <button type="button" onClick={copy} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-300">
        {copied ? <Check className="size-4 text-mint-500" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? "Kopiert" : "Link kopieren"}</span>
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-1.5 pl-4">
      <span className="min-w-0 flex-1 truncate font-mono text-sm text-white">{url.replace(/^https?:\/\//, "")}</span>
      <button
        type="button"
        onClick={copy}
        className={cn("inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors", copied ? "bg-mint-500 text-white" : "bg-white text-ink hover:bg-brand-100")}
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? "Kopiert" : "Kopieren"}</span>
      </button>
    </div>
  );
}
