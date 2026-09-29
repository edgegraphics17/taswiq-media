/**
 * Branding & Logos: Marken, die wir für Partyreihen, Clubs, Artists und Labels gestaltet haben.
 * Dateien: public/portfolio/brands/*.webp (transparent, max. 560 px). "tone" = Untergrund der Kachel,
 * damit helle und dunkle Logos lesbar bleiben. Namen sind Eigennamen und werden nicht übersetzt.
 */

export interface GalleryBrand {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  tone: "dark" | "light";
}

export const galleryBrands: GalleryBrand[] = [
  { id: "alba-turk", name: "Alba Türk", src: "/portfolio/brands/alba-turk.webp", width: 560, height: 256, tone: "dark" },
  { id: "are-you-ready", name: "Are You Ready", src: "/portfolio/brands/are-you-ready.webp", width: 560, height: 373, tone: "dark" },
  { id: "bglm", name: "Bad Girlz Luv Money", src: "/portfolio/brands/bglm.webp", width: 560, height: 390, tone: "dark" },
  { id: "cash-n-curves", name: "Cash N' Curves", src: "/portfolio/brands/cash-n-curves.webp", width: 560, height: 259, tone: "dark" },
  { id: "catch-me", name: "Catch Me", src: "/portfolio/brands/catch-me.webp", width: 560, height: 314, tone: "dark" },
  { id: "hot-n-brownie", name: "Hot'n Brownie", src: "/portfolio/brands/hot-n-brownie.webp", width: 427, height: 420, tone: "dark" },
  { id: "juice-club", name: "Juice Club", src: "/portfolio/brands/juice-club.webp", width: 560, height: 325, tone: "dark" },
  { id: "la-luna", name: "La Luna", src: "/portfolio/brands/la-luna.webp", width: 420, height: 420, tone: "dark" },
  { id: "dj-letrix", name: "DJ Letrix", src: "/portfolio/brands/dj-letrix.webp", width: 560, height: 290, tone: "light" },
  { id: "luvsick", name: "LUVSICK", src: "/portfolio/brands/luvsick.webp", width: 420, height: 420, tone: "dark" },
  { id: "money-talkz", name: "Money Talkz", src: "/portfolio/brands/money-talkz.webp", width: 378, height: 420, tone: "dark" },
  { id: "nonstop-events", name: "Nonstop Events", src: "/portfolio/brands/nonstop-events.webp", width: 560, height: 107, tone: "light" },
  { id: "seeliebe", name: "Seeliebe", src: "/portfolio/brands/seeliebe.webp", width: 560, height: 145, tone: "dark" },
  { id: "sydi-gonzales", name: "Sydi Gonzales", src: "/portfolio/brands/sydi-gonzales.webp", width: 560, height: 379, tone: "dark" },
  { id: "vibe-club", name: "Vibe · The Danceclub", src: "/portfolio/brands/vibe-club.webp", width: 560, height: 404, tone: "dark" },
];
