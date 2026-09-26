import type { Metadata, Viewport } from "next";
import { Exo_2, League_Spartan } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, baseKeywords } from "@/lib/seo";
import { site } from "@/config/site";
import "./globals.css";

/** Exo 2 = Hausschrift der Rechnung; League Spartan = Wortmarke im Logo */
const exo = Exo_2({ subsets: ["latin", "latin-ext"], variable: "--font-exo", display: "swap" });
const spartan = League_Spartan({ subsets: ["latin"], weight: ["700"], variable: "--font-spartan", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "TasWiq Media. – Medienagentur für Gastronomie, Festivals & KI-Content",
    template: "%s | TasWiq Media.",
  },
  description:
    "Premium-Video und Fotografie für Restaurants, Bars und Festivals – skaliert mit KI: aus einem Drehtag werden Dutzende Reels, Ads und Posts. Festpreise, erste Clips in 72 Stunden.",
  keywords: baseKeywords,
  applicationName: site.name,
  authors: [{ name: site.owner }],
  creator: site.owner,
  alternates: { canonical: "/", languages: { "de-DE": "/" } },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: "TasWiq Media. – Content, der satt macht. Content, der laut ist.",
    description: "Medienagentur für Gastronomie, Festivals & Musik. Kino-Look vor Ort, KI-Tempo in der Postproduktion.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 } },
  formatDetection: { telephone: false },
  category: "Marketing",
};

export const viewport: Viewport = {
  themeColor: "#18222e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${exo.variable} ${spartan.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
