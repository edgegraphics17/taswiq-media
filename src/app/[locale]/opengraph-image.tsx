import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateImageMetadata({ params }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "og" });
  return [{ id: "default", alt: t("alt"), size, contentType }];
}

/** Social-Vorschaubild je Sprache: Showreel-Standbild, dunkler Verlauf, violette Headline. */
export default async function OpengraphImage({ params }: { params: Promise<{ locale: Locale }> | { locale: Locale } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "og" });
  const poster = await readFile(path.join(process.cwd(), "public/images/showreel-poster.jpg"));
  const src = `data:image/jpeg;base64,${poster.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#141414" }}>
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,20,20,0.35), rgba(20,20,20,0.95))" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72, width: "100%" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: "#b9a0ff", fontWeight: 700 }}>{t("eyebrow")}</div>
          <div style={{ fontSize: 96, color: "white", fontWeight: 600, lineHeight: 1, marginTop: 18, letterSpacing: -3 }}>{t("line1")}</div>
          <div style={{ fontSize: 96, color: "#9a70ff", fontWeight: 600, lineHeight: 1.05, letterSpacing: -3 }}>{t("line2")}</div>
          <div style={{ display: "flex", marginTop: 36, height: 6, width: 120, background: "#7840fe", borderRadius: 3 }} />
          <div style={{ fontSize: 30, color: "white", fontWeight: 700, marginTop: 22 }}>TasWiq Media.</div>
        </div>
      </div>
    ),
    size,
  );
}
