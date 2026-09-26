import { Inter_Tight, League_Spartan } from "next/font/google";

/** Inter Tight = neutrale Grotesk der Design-Vorlage; League Spartan = Wortmarke im Logo */
export const inter = Inter_Tight({ subsets: ["latin", "latin-ext"], variable: "--font-inter-tight", display: "swap" });
export const spartan = League_Spartan({ subsets: ["latin"], weight: ["700"], variable: "--font-spartan", display: "swap" });
export const fontVars = `${inter.variable} ${spartan.variable}`;
