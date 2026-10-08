import { Archivo, Fraunces, IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Serif } from "next/font/google";

/**
 * Schriften der Software-Demos – nur im Demo-Bereich geladen (src/app/demo/layout.tsx), nie vorab:
 * Die Hauptseite bleibt davon unberührt, und jede Demo lädt nur die Schnitte, die sie wirklich zeigt.
 *  - IBM Plex Sans/Mono: Verwaltungsansichten (nüchtern, gut lesbare Ziffern)
 *  - Fraunces, Instrument Serif, Archivo: Markenschriften der Musterfirmen
 */
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans", display: "swap", preload: false });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono-face", display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap", preload: false });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap", preload: false });
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap", preload: false });

export const demoFontVars = [plex, plexMono, fraunces, instrument, archivo].map((f) => f.variable).join(" ");
