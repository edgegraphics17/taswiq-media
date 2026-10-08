#!/usr/bin/env node
// MCP-Server für LinkedIn (stdio, ohne Abhängigkeiten). Wird über .mcp.json von Claude Code gestartet.
// Anmeldung vorab mit `node linkedin/login.mjs`.
import { createInterface } from "node:readline";
import {
  API_VERSION,
  api,
  enc,
  escapeCommentary,
  loadApp,
  loadToken,
  resolveAuthor,
  uploadImage,
  whoami,
} from "./lib.mjs";

const orgUrn = (organization) =>
  organization.startsWith("urn:li:") ? organization : `urn:li:organization:${organization}`;
const orgId = (organization) => orgUrn(organization).split(":").pop();

// Fehlende Rechte sollen eine Teilauswertung nicht komplett verhindern.
const attempt = (promise) => promise.then((r) => r.data).catch((e) => ({ fehler: e.message }));

const tools = [
  {
    name: "linkedin_status",
    description: "Zeigt, ob LinkedIn verbunden ist, als wer, mit welchen Rechten und wie lange das Token gilt.",
    inputSchema: { type: "object", properties: {} },
    async run() {
      const [app, token] = await Promise.all([loadApp(), loadToken()]);
      if (!token) {
        return {
          verbunden: false,
          appHinterlegt: Boolean(app),
          hinweis: "Im Terminal `node linkedin/login.mjs` ausführen.",
        };
      }
      return {
        verbunden: token.expiresAt > Date.now() || Boolean(token.refreshToken),
        person: token.person ?? (await attempt(whoami().then((data) => ({ data })))),
        rechte: token.scope,
        tokenGueltigBis: new Date(token.expiresAt).toISOString(),
        automatischeVerlaengerung: Boolean(token.refreshToken),
        apiVersion: API_VERSION,
      };
    },
  },
  {
    name: "linkedin_list_pages",
    description: "Listet die Unternehmensseiten, die das angemeldete Mitglied verwaltet (ID, Name, Rolle).",
    inputSchema: { type: "object", properties: {} },
    async run() {
      const { data } = await api("GET", "/rest/organizationAcls?q=roleAssignee&state=APPROVED&count=100");
      return Promise.all(
        (data.elements ?? []).map(async (acl) => {
          const id = acl.organization.split(":").pop();
          const org = await attempt(api("GET", `/rest/organizations/${id}`));
          return {
            id,
            urn: acl.organization,
            rolle: acl.role,
            name: org.localizedName ?? null,
            kurzname: org.vanityName ?? null,
          };
        }),
      );
    },
  },
  {
    name: "linkedin_create_post",
    description:
      "Veröffentlicht einen Beitrag – im eigenen Profil oder auf einer Unternehmensseite, optional mit Bildern oder Link. " +
      "Der Beitrag ist sofort öffentlich sichtbar: vor dem Aufruf Text und Absender vom Nutzer bestätigen lassen.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string", description: "Beitragstext, Hashtags als #wort" },
        author: { type: "string", description: '"me" (Standard), Seiten-ID oder URN' },
        image_paths: { type: "array", items: { type: "string" }, description: "Lokale Bilddateien (JPG, PNG, GIF)" },
        alt_text: { type: "string", description: "Alternativtext der Bilder" },
        link_url: { type: "string", description: "Link-Vorschau statt Bild" },
        link_title: { type: "string" },
        link_description: { type: "string" },
        visibility: { type: "string", enum: ["PUBLIC", "CONNECTIONS"], description: "Standard: PUBLIC" },
      },
    },
    async run({ text, author, image_paths = [], alt_text, link_url, link_title, link_description, visibility }) {
      const authorUrn = await resolveAuthor(author);
      const images = [];
      for (const path of image_paths) images.push(await uploadImage(authorUrn, path));

      let content;
      if (images.length === 1) {
        content = { media: { id: images[0], ...(alt_text ? { altText: alt_text } : {}) } };
      } else if (images.length > 1) {
        content = { multiImage: { images: images.map((id) => ({ id, ...(alt_text ? { altText: alt_text } : {}) })) } };
      } else if (link_url) {
        content = {
          article: {
            source: link_url,
            title: link_title || link_url,
            ...(link_description ? { description: link_description } : {}),
          },
        };
      }

      const { id } = await api("POST", "/rest/posts", {
        body: {
          author: authorUrn,
          commentary: escapeCommentary(text),
          visibility: visibility || "PUBLIC",
          distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
          ...(content ? { content } : {}),
          lifecycleState: "PUBLISHED",
          isReshareDisabledByAuthor: false,
        },
      });
      return { beitrag: id, absender: authorUrn, url: `https://www.linkedin.com/feed/update/${id}/` };
    },
  },
  {
    name: "linkedin_list_posts",
    description: "Liest die letzten Beiträge eines Absenders (eigenes Profil oder Unternehmensseite).",
    inputSchema: {
      type: "object",
      properties: {
        author: { type: "string", description: '"me" (Standard), Seiten-ID oder URN' },
        count: { type: "number", description: "Anzahl, Standard 10" },
      },
    },
    async run({ author, count = 10 }) {
      const authorUrn = await resolveAuthor(author);
      const { data } = await api(
        "GET",
        `/rest/posts?q=author&author=${enc(authorUrn)}&count=${count}&sortBy=LAST_MODIFIED`,
        { headers: { "X-RestLi-Method": "FINDER" } },
      );
      return (data.elements ?? []).map((post) => ({
        id: post.id,
        text: post.commentary,
        status: post.lifecycleState,
        sichtbarkeit: post.visibility,
        veroeffentlicht: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
        inhalt: post.content ?? null,
      }));
    },
  },
  {
    name: "linkedin_delete_post",
    description: "Löscht einen Beitrag endgültig. Nur nach ausdrücklicher Bestätigung durch den Nutzer aufrufen.",
    inputSchema: {
      type: "object",
      required: ["post_urn"],
      properties: { post_urn: { type: "string", description: "urn:li:share:… oder urn:li:ugcPost:…" } },
    },
    async run({ post_urn }) {
      await api("DELETE", `/rest/posts/${enc(post_urn)}`, { headers: { "X-RestLi-Method": "DELETE" } });
      return { geloescht: post_urn };
    },
  },
  {
    name: "linkedin_post_stats",
    description:
      "Auswertung eines Beitrags: Reaktionen und Kommentare, bei Seitenbeiträgen zusätzlich Impressionen, Klicks und Interaktionsrate.",
    inputSchema: {
      type: "object",
      required: ["post_urn"],
      properties: {
        post_urn: { type: "string" },
        organization: { type: "string", description: "Seiten-ID, wenn es ein Seitenbeitrag ist" },
      },
    },
    async run({ post_urn, organization }) {
      const result = { reaktionen: await attempt(api("GET", `/rest/socialActions/${enc(post_urn)}`)) };
      if (organization) {
        const key = post_urn.includes(":ugcPost:") ? "ugcPosts" : "shares";
        result.reichweite = await attempt(
          api(
            "GET",
            `/rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${enc(orgUrn(organization))}&${key}=List(${enc(post_urn)})`,
          ),
        );
      }
      return result;
    },
  },
  {
    name: "linkedin_page_stats",
    description:
      "Auswertung einer Unternehmensseite: Follower-Zahl und -Zusammensetzung, Beitrags-Reichweite, Seitenaufrufe. " +
      "Mit `days` als Tagesverlauf über den Zeitraum, sonst als Gesamtwerte.",
    inputSchema: {
      type: "object",
      required: ["organization"],
      properties: {
        organization: { type: "string", description: "Seiten-ID oder URN" },
        days: { type: "number", description: "Zeitraum in Tagen für den Tagesverlauf (max. 365)" },
      },
    },
    async run({ organization, days }) {
      const urn = enc(orgUrn(organization));
      let range = "";
      if (days) {
        const end = Date.now();
        const start = end - Math.min(days, 365) * 86_400_000;
        range = `&timeIntervals=(timeRange:(start:${start},end:${end}),timeGranularityType:DAY)`;
      }
      const [follower, followerStatistik, beitraege, seitenaufrufe] = await Promise.all([
        attempt(api("GET", `/rest/networkSizes/${urn}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`)),
        attempt(api("GET", `/rest/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${urn}${range}`)),
        attempt(api("GET", `/rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${urn}${range}`)),
        attempt(api("GET", `/rest/organizationPageStatistics?q=organization&organization=${urn}${range}`)),
      ]);
      return { follower, followerStatistik, beitraege, seitenaufrufe };
    },
  },
  {
    name: "linkedin_update_page",
    description:
      "Ändert eine Unternehmensseite: Logo oder Titelbild aus lokalen Dateien, weitere Felder über `set`. " +
      "Die Änderung ist sofort öffentlich: vorher vom Nutzer bestätigen lassen.",
    inputSchema: {
      type: "object",
      required: ["organization"],
      properties: {
        organization: { type: "string", description: "Seiten-ID oder URN" },
        logo_path: { type: "string", description: "Lokale Bilddatei für das Logo" },
        cover_path: { type: "string", description: "Lokale Bilddatei für das Titelbild" },
        set: { type: "object", description: "Weitere Felder im Format der Organization-API, z. B. localizedWebsite" },
      },
    },
    async run({ organization, logo_path, cover_path, set = {} }) {
      const urn = orgUrn(organization);
      const patch = { ...set };
      if (logo_path) patch.logoV2 = { original: await uploadImage(urn, logo_path) };
      if (cover_path) patch.coverPhotoV2 = { original: await uploadImage(urn, cover_path) };
      if (!Object.keys(patch).length) throw new Error("Nichts zu ändern: logo_path, cover_path oder set angeben.");
      await api("POST", `/rest/organizations/${orgId(organization)}`, {
        headers: { "X-RestLi-Method": "PARTIAL_UPDATE" },
        body: { patch: { $set: patch } },
      });
      return { geaendert: Object.keys(patch), seite: urn };
    },
  },
  {
    name: "linkedin_api_request",
    description:
      "Freier Aufruf der LinkedIn-API für alles, was die anderen Werkzeuge nicht abdecken. " +
      "Pfad beginnt mit /rest/ oder /v2/ und enthält die fertige Query. Schreibende Aufrufe vorher bestätigen lassen.",
    inputSchema: {
      type: "object",
      required: ["method", "path"],
      properties: {
        method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"] },
        path: { type: "string" },
        body: { type: "object" },
        headers: { type: "object", description: "Zusätzliche Header, z. B. X-RestLi-Method" },
      },
    },
    run: ({ method, path, body, headers }) => api(method, path, { body, headers }),
  },
];

const send = (message) => process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);

async function handle({ id, method, params }) {
  switch (method) {
    case "initialize":
      return send({
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "taswiq-linkedin", version: "1.0.0" },
        },
      });
    case "ping":
      return send({ id, result: {} });
    case "tools/list":
      return send({
        id,
        result: { tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) },
      });
    case "tools/call": {
      const tool = tools.find((t) => t.name === params?.name);
      if (!tool) return send({ id, error: { code: -32602, message: `Unbekanntes Werkzeug: ${params?.name}` } });
      try {
        const result = await tool.run(params.arguments ?? {});
        return send({ id, result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] } });
      } catch (error) {
        return send({ id, result: { isError: true, content: [{ type: "text", text: error.message }] } });
      }
    }
    default:
      // Benachrichtigungen (ohne id) brauchen keine Antwort.
      if (id !== undefined) send({ id, error: { code: -32601, message: `Unbekannte Methode: ${method}` } });
  }
}

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  try {
    handle(JSON.parse(line));
  } catch {
    send({ id: null, error: { code: -32700, message: "Ungültiges JSON" } });
  }
});
