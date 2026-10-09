import { Archivo, Big_Shoulders, Bricolage_Grotesque, Fraunces, Hanken_Grotesk, IBM_Plex_Mono, IBM_Plex_Sans, Instrument_Sans, Manrope, Rajdhani, Red_Hat_Display, Urbanist } from "next/font/google";

/**
 * Schriften der Software-Demos – nur im Demo-Bereich geladen (src/app/demo/layout.tsx), nie vorab:
 * Die Hauptseite bleibt davon unberührt, und jede Demo lädt nur die Schnitte, die sie wirklich zeigt.
 * Jede Musterfirma hat ihre eigene Schrift (registry.ts → theme.display / theme.ui); IBM Plex Mono für Nummern und Kennzeichen.
 */
/* Hinweis: next/font liest die Optionen statisch aus – je Schrift vollständig hinschreiben, kein Spread. */
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans", display: "swap", preload: false });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono-face", display: "swap", preload: false });
const urbanist = Urbanist({ subsets: ["latin"], variable: "--font-urbanist", display: "swap", preload: false });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap", preload: false });
const redhat = Red_Hat_Display({ subsets: ["latin"], variable: "--font-redhat", display: "swap", preload: false });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-rajdhani", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: false });
const shoulders = Big_Shoulders({ subsets: ["latin"], variable: "--font-shoulders", display: "swap", preload: false });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap", preload: false });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", preload: false });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", preload: false });

export const demoFontVars = [plex, plexMono, urbanist, hanken, redhat, rajdhani, manrope, shoulders, instrument, fraunces, bricolage, archivo].map((f) => f.variable).join(" ");
