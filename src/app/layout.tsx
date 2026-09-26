import type { Viewport } from "next";

/**
 * Root-Layout ist bewusst ein Durchreicher: <html lang> hängt von der Sprache ab und wird
 * in src/app/[locale]/layout.tsx gesetzt – das Dashboard hat sein eigenes in src/app/admin/layout.tsx.
 */
export const viewport: Viewport = {
  themeColor: "#f6f6f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
