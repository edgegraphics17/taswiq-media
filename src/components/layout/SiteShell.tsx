"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/MobileMenu";

/** Seiten-Hülle: Header, Mobile-Sheet, Inhalt, Footer. */
export function SiteShell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <Header menuOpen={open} onToggleMenu={() => (open ? close() : setOpen(true))} toggleRef={toggleRef} />
      <MobileMenu open={open} onClose={close} />
      <main id="main">{children}</main>
      {footer}
    </>
  );
}
