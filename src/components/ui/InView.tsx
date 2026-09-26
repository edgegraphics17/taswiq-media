"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "@/lib/format";

/**
 * Setzt einmalig die Klasse "visible", sobald das Element sichtbar wird
 * (asap: IntersectionObserver .reveal → .visible, Threshold 0.15).
 */
export const InView = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function InView(
  { className, children, ...rest },
  ref,
) {
  const inner = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useImperativeHandle(ref, () => inner.current as HTMLDivElement);

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={inner} className={cn(className, visible && "visible")} {...rest}>
      {children}
    </div>
  );
});
