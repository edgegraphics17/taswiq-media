import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Sprachbewusste Ersatz-APIs für next/link & next/navigation.
 * `usePathname()` liefert die INTERNE Route (z. B. "/preisrechner" auch auf /en/pricing-calculator).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
