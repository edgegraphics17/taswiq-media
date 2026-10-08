/**
 * IndexNow: meldet Bing, Yandex, Seznam und Naver (und damit auch ChatGPT-Suche und Copilot, die den Bing-Index nutzen),
 * dass sich Seiten geändert haben – ohne auf den nächsten Crawl zu warten. Google nimmt nicht teil (dort: Search Console).
 *
 *   npm run indexnow              → alle Adressen aus der Sitemap
 *   npm run indexnow -- /blog/x   → nur einzelne Pfade
 *
 * Der Schlüssel liegt öffentlich unter /<Schlüssel>.txt (public/) – so prüft IndexNow, dass die Meldung von uns kommt.
 */
const KEY = "bc370287c5c248d6875db02ba1c18ce2";
const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.taswiq-media.de").replace(/\/$/, "");

const paths = process.argv.slice(2);
let urlList = paths.map((p) => ORIGIN + p);
if (!urlList.length) {
  const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  urlList = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);
}
if (!urlList.length) throw new Error("Keine Adressen gefunden");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(ORIGIN).host, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }),
});
console.log(`${urlList.length} Adressen gemeldet – Antwort ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) process.exit(1);
