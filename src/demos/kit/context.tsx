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
  /** An den Anfang der App springen – nach einem Abschluss (Bestätigungsseite) steht man sonst mitten im alten Formular */
  toTop: () => void;
  /** In der Handy-Ansicht die Fläche des Telefon-Rahmens: Dialoge rendert die App dorthin, statt ins Browserfenster */
  frame: HTMLElement | null;
}

export const DemoContext = createContext<DemoCtx | null>(null);

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo außerhalb der Demo-Hülle");
  return ctx;
}
