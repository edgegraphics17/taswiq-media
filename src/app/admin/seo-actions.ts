"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminUser } from "@/lib/admin/data";
import { crawl, googleSources, matchSite, normalizeDomain, pageSpeed } from "@/lib/admin/seo";
import { checkMetaToken } from "@/lib/admin/ads";
import { deleteSeoDomain, saveSeoDomain, saveSeoGoogle } from "@/lib/db";

async function guard() {
  if (!(await getAdminUser())) redirect("/admin/login?error=forbidden");
}
const field = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);

export async function saveGoogleClient(f: FormData) {
  await guard();
  const clientId = field(f, "clientId");
  const clientSecret = field(f, "clientSecret");
  if (!clientId.endsWith(".apps.googleusercontent.com") || clientSecret.length < 10) redirect("/admin/seo?google=" + encodeURIComponent("Client-ID oder Secret ungültig."));
  await saveSeoGoogle({ clientId, clientSecret, refreshToken: null, email: null });
  redirect("/admin/seo/google");
}

export async function addDomain(f: FormData) {
  await guard();
  const domain = normalizeDomain(field(f, "domain"));
  if (!domain) redirect("/admin/seo?fehler=domain");
  // Search Console automatisch zuordnen, falls schon verbunden.
  const gscSite = await googleSources().then((s) => matchSite(domain, s.sites)).catch(() => undefined);
  await saveSeoDomain(domain, gscSite ? { gscSite } : {});
  revalidatePath("/admin/seo");
  redirect(`/admin/seo/${domain}`);
}

export async function removeDomain(f: FormData) {
  await guard();
  const domain = normalizeDomain(field(f, "domain"));
  if (domain) await deleteSeoDomain(domain);
  revalidatePath("/admin/seo");
  redirect("/admin/seo");
}

export async function setSources(f: FormData) {
  await guard();
  const domain = normalizeDomain(field(f, "domain"));
  if (!domain) return;
  await saveSeoDomain(domain, { gscSite: field(f, "gscSite") || null, ga4: field(f, "ga4") || null });
  revalidatePath(`/admin/seo/${domain}`);
}

export async function runCrawl(f: FormData) {
  await guard();
  const domain = normalizeDomain(field(f, "domain"));
  if (!domain) return;
  await saveSeoDomain(domain, { crawl: await crawl(domain) });
  revalidatePath(`/admin/seo/${domain}`);
}

export async function runPageSpeed(f: FormData) {
  await guard();
  const domain = normalizeDomain(field(f, "domain"));
  if (!domain) return;
  const url = `https://${domain}/`;
  const [mobile, desktop] = await Promise.allSettled([pageSpeed(url, "mobile"), pageSpeed(url, "desktop")]);
  const error = [mobile, desktop].find((r) => r.status === "rejected")?.reason;
  await saveSeoDomain(domain, {
    psi: {
      at: new Date().toISOString(),
      mobile: mobile.status === "fulfilled" ? mobile.value : undefined,
      desktop: desktop.status === "fulfilled" ? desktop.value : undefined,
      error: error ? String(error.message ?? error).slice(0, 300) : undefined,
    },
  });
  revalidatePath(`/admin/seo/${domain}`);
}

// ─── Ads ────────────────────────────────────────────────────────────
export async function saveMetaToken(f: FormData) {
  await guard();
  const token = field(f, "metaToken", 600);
  const ok = token.length > 50 && (await checkMetaToken(token).then(() => true, () => false));
  if (!ok) redirect("/admin/ads?meta=" + encodeURIComponent("Token ungültig oder ohne Berechtigung."));
  await saveSeoGoogle({ metaToken: token });
  revalidateTag("ads");
  redirect("/admin/ads?meta=ok");
}

export async function refreshAds() {
  await guard();
  revalidateTag("ads");
  revalidatePath("/admin/ads");
}
