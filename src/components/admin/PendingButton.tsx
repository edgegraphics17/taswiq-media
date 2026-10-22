"use client";

import { useFormStatus } from "react-dom";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/format";

/** Absende-Knopf für langsame Server Actions (Seiten-Check, PageSpeed): zeigt, dass gearbeitet wird. */
export function PendingButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-brand-200 disabled:opacity-60">
      <RefreshCw className={cn("size-4", pending && "animate-spin")} aria-hidden /> {pending ? pendingLabel : label}
    </button>
  );
}
