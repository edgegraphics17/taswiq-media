#!/usr/bin/env node
// Veröffentlicht fällige Beiträge aus der Warteschlange. Es geht nur raus, was Karim freigegeben hat
// (status "freigegeben") und dessen Termin erreicht ist – pro Lauf höchstens ein Beitrag.
//
//   node linkedin/publish.mjs            fälligen Beitrag veröffentlichen
//   node linkedin/publish.mjs --liste    Warteschlange anzeigen, nichts veröffentlichen
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { api, escapeCommentary, resolveAuthor, uploadImage } from "./lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = process.env.LINKEDIN_QUEUE || join(ROOT, "kunden", "taswiq", "linkedin", "beitraege.json");

const queue = JSON.parse(await readFile(QUEUE, "utf8"));
const save = () => writeFile(QUEUE, `${JSON.stringify(queue, null, 2)}\n`);

if (process.argv.includes("--liste")) {
  for (const post of queue.beitraege) {
    console.log(`${post.termin}  ${post.status.padEnd(15)} ${post.thema.padEnd(9)} ${post.id}`);
  }
  process.exit(0);
}

const due = queue.beitraege
  .filter((post) => post.status === "freigegeben" && new Date(post.termin) <= new Date())
  .sort((a, b) => a.termin.localeCompare(b.termin))[0];

if (!due) {
  console.log("Kein freigegebener Beitrag fällig.");
  process.exit(0);
}

try {
  const author = await resolveAuthor(queue.absender ?? "me");
  const content = due.bild
    ? { media: { id: await uploadImage(author, join(ROOT, due.bild)), ...(due.bildtext ? { altText: due.bildtext } : {}) } }
    : undefined;
  const { id } = await api("POST", "/rest/posts", {
    body: {
      author,
      commentary: escapeCommentary(due.text),
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      ...(content ? { content } : {}),
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    },
  });
  Object.assign(due, { status: "veroeffentlicht", urn: id, veroeffentlichtAm: new Date().toISOString() });
  await save();
  console.log(`Veröffentlicht: ${due.id} → https://www.linkedin.com/feed/update/${id}/`);
} catch (error) {
  // Fehlgeschlagene Beiträge bleiben stehen und blockieren die folgenden nicht.
  Object.assign(due, { status: "fehler", fehler: error.message });
  await save();
  console.error(`Fehler bei ${due.id}: ${error.message}`);
  process.exit(1);
}
