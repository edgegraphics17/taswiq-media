"use client";

import { createContext, useContext } from "react";
import type { DemoDef } from "@/demos/registry";

/** Was jede Demo-App von ihrer Hülle bekommt: aktuelle Ansicht, Bereich und ein Hinweis-Toast. */
export interface DemoCtx {
  def: DemoDef;
  view: string;
  tab: string;
  /** Ansicht wechseln (optional direkt in einen Bereich) */
  go: (view: string, tab?: string) => void;
  setTab: (tab: string) => void;
  toast: (text: string) => void;
}

export const DemoContext = createContext<DemoCtx | null>(null);

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo außerhalb der Demo-Hülle");
  return ctx;
}
