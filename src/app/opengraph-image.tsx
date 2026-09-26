import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "TasWiq Media. – Content, der satt macht.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social-Vorschaubild im Rechnungs-Look: Showreel-Standbild, Navy-Verlauf, Teal-Label. */
export default async function OpengraphImage() {
  const poster = await readFile(path.join(process.cwd(), "public/images/showreel-poster.jpg"));
  const src = `data:image/jpeg;base64,${poster.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#141414" }}>
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,20,20,0.35), rgba(20,20,20,0.95))" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72, width: "100%" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#b9a0ff", fontWeight: 700 }}>MEDIENAGENTUR FÜR GASTRONOMIE, FESTIVALS & MUSIK</div>
          <div style={{ fontSize: 96, color: "white", fontWeight: 600, lineHeight: 1, marginTop: 18, letterSpacing: -3 }}>Content, der</div>
          <div style={{ fontSize: 96, color: "#9a70ff", fontWeight: 600, lineHeight: 1.05, letterSpacing: -3 }}>satt macht.</div>
          <div style={{ display: "flex", marginTop: 36, height: 6, width: 120, background: "#7840fe", borderRadius: 3 }} />
          <div style={{ fontSize: 30, color: "white", fontWeight: 700, marginTop: 22 }}>TasWiq Media.</div>
        </div>
      </div>
    ),
    size,
  );
}
