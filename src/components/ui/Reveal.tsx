"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * asap-Reveal: translateY(50px) scale(.9) → 0 / 1 mit Wobble-Easing (0.8 s),
 * einmalig beim Einscrollen. Stagger per `delay` (asap: 150 ms-Schritte).
 * "Bewegung reduzieren" wird über MotionConfig global respektiert.
 */
export function Reveal({
  delay = 0,
  children,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        y: { duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] },
        scale: { duration: 0.8, delay, ease: [0.34, 1.56, 0.64, 1] },
        opacity: { duration: 0.5, delay, ease: "easeOut" },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
