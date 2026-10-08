"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { isAdminAuthConfigured, isDemoMode } from "@/lib/env";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
import { isAdminEmail } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getAdminUser } from "@/lib/admin/data";
import { INTERNAL_COOKIE, internalCookieOptions } from "@/lib/internal";
import { addLeadNote, setCalculatorTest, setLeadTest, deleteTask, insertTask, moveTask, setPassword, setTeamSettings, updateLead as updateLeadInBackend, updateTask, upsertServices, verifyPassword } from "@/lib/db";
import { LEAD_STATUSES, TASK_CATEGORIES, TASK_STATUSES } from "@/types/database";
import { DEPARTMENT_IDS, departmentFor } from "@/config/team";

/** Jede Mutation prüft die Admin-Berechtigung erneut – Server Actions sind öffentliche Endpunkte. */
async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login?error=forbidden");
  return user;
}

/** Login mit E-Mail + Passwort. Fehlermeldung ist bewusst immer dieselbe – verrät nicht, ob die Adresse existiert. */
export async function signIn(formData: FormData) {
  const parsed = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/login?error=credentials");
  if (!isAdminAuthConfigured()) redirect("/admin/login?error=config");
  // Zusätzlich zur Sperre im Backend (pro Konto): Bremse pro IP.
  if (!rateLimit(`login:${clientIp(await headers())}`, 10, 15 * 60_000)) redirect("/admin/login?error=locked");

  const { email, password } = parsed.data;
  const result = await verifyPassword(email, password).catch((e) => {
    console.error("[admin] Login fehlgeschlagen", e);
    return "error" as const;
  });
  if (result === "error") redirect("/admin/login?error=backend");
  if (result === "locked") redirect("/admin/login?error=locked");
  if (result !== "ok" || !isAdminEmail(email)) redirect("/admin/login?error=credentials");

  (await cookies()).set(SESSION_COOKIE, await signSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  const next = String(formData.get("next") ?? "");
  redirect(/^\/admin(\/[\w\-/]*)?$/.test(next) ? next : "/admin");
}

export async function changePassword(formData: FormData) {
  if (isDemoMode()) redirect("/admin/konto?demo=1");
  const user = await requireAdminUser();
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) redirect("/admin/konto?error=weak");
  if (password !== String(formData.get("repeat") ?? "")) redirect("/admin/konto?error=mismatch");
  const result = await setPassword(user.email, current, password).catch((e) => {
    console.error("[admin] changePassword", e);
    return "error" as const;
  });
  if (result !== "ok") redirect(`/admin/konto?error=${result === "invalid" ? "current" : result}`);
  redirect("/admin/konto?saved=1");
}

export async function signOut() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(LEAD_STATUSES as [string, ...string[]]),
  deal_value: z.coerce.number().int().min(0).max(1_000_000).optional().or(z.literal("").transform(() => undefined)),
  next_action_at: z.string().optional(),
  owner_notes: z.string().max(5000).optional(),
});

export async function updateLead(formData: FormData) {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/admin/leads/${formData.get("id")}?error=1`);
  const { id, status, deal_value, next_action_at, owner_notes } = parsed.data;
  if (isDemoMode()) redirect(`/admin/leads/${id}?demo=1`);

  const user = await requireAdminUser();
  try {
    await updateLeadInBackend(id, {
      status,
      deal_value: deal_value ?? null,
      next_action_at: next_action_at ? new Date(next_action_at).toISOString() : null,
      owner_notes: owner_notes || null,
      actor: user.email,
    });
  } catch (e) {
    console.error("[admin] updateLead", e);
    redirect(`/admin/leads/${id}?error=1`);
  }
  revalidatePath("/admin");
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function addNote(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const body = z.string().trim().min(1).max(5000).safeParse(formData.get("body"));
  if (!body.success) redirect(`/admin/leads/${id}?error=note`);
  if (isDemoMode()) redirect(`/admin/leads/${id}?demo=1`);
  const user = await requireAdminUser();
  try {
    await addLeadNote(id, body.data, user.email);
  } catch (e) {
    console.error("[admin] addNote", e);
    redirect(`/admin/leads/${id}?error=note`);
  }
  redirect(`/admin/leads/${id}?saved=1`);
}

/** Anfrage als Test kennzeichnen oder die Kennzeichnung entfernen – gelöscht wird nichts, sie zählt nur nicht mehr mit. */
export async function markLeadTest(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), test: z.enum(["0", "1"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin?error=1");
  const { id, test } = parsed.data;
  if (isDemoMode()) redirect(`/admin/leads/${id}?demo=1`);
  const user = await requireAdminUser();
  try {
    await setLeadTest(id, test === "1", user.email);
  } catch (e) {
    console.error("[admin] markLeadTest", e);
    redirect(`/admin/leads/${id}?error=1`);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function markCalculationTest(formData: FormData) {
  if (isDemoMode()) redirect("/admin/rechner?demo=1");
  await requireAdminUser();
  const parsed = z.object({ id: z.string().uuid(), test: z.enum(["0", "1"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/rechner?error=1");
  try {
    await setCalculatorTest(parsed.data.id, parsed.data.test === "1");
  } catch (e) {
    console.error("[admin] markCalculationTest", e);
    redirect("/admin/rechner?error=1");
  }
  revalidatePath("/admin", "layout");
}

/** Schalter unter Analytics: Zählt dieses Gerät in der Besucherstatistik mit? (Merkzeichen im Browser, siehe src/lib/internal.ts) */
export async function setDeviceCounted(formData: FormData) {
  if (!isDemoMode()) await requireAdminUser();
  (await cookies()).set(INTERNAL_COOKIE, formData.get("counted") === "1" ? "0" : "1", internalCookieOptions);
  revalidatePath("/admin/analytics");
}

/** Preis-Editor: überschreibt die Werte aus pricing.ts – live nach Cache-Invalidierung. */
export async function updatePrices(formData: FormData) {
  if (isDemoMode()) redirect("/admin/preise?demo=1");
  await requireAdminUser();
  const rows = new Map<string, { group_id: string; option_id: string; label: string; preis: number | null; mtl: number | null; is_active: boolean }>();
  for (const [key, raw] of formData.entries()) {
    const m = /^(label|preis|mtl|active):([\w]+):([\w]+)$/.exec(key);
    if (!m) continue;
    const [, field, group_id, option_id] = m;
    const id = `${group_id}:${option_id}`;
    const row = rows.get(id) ?? { group_id, option_id, label: "", preis: null, mtl: null, is_active: false };
    const v = String(raw).trim();
    if (field === "label") row.label = v.slice(0, 120);
    if (field === "preis") row.preis = v === "" ? null : Math.max(0, Math.round(Number(v)) || 0);
    if (field === "mtl") row.mtl = v === "" ? null : Math.max(0, Math.round(Number(v)) || 0);
    if (field === "active") row.is_active = v === "on";
    rows.set(id, row);
  }
  try {
    await upsertServices([...rows.values()]);
  } catch (e) {
    console.error("[admin] updatePrices", e);
    redirect("/admin/preise?error=1");
  }
  revalidateTag("pricing");
  redirect("/admin/preise?saved=1");
}

// ─── Aufgaben (Arbeits-Dashboard) ───────────────────────────────────
const taskSchema = z.object({
  title: z.string().trim().min(3).max(200),
  why: z.string().trim().max(4000).optional(),
  steps: z.string().trim().max(4000).optional(),
  category: z.enum(TASK_CATEGORIES),
  priority: z.coerce.number().int().min(1).max(3),
  effort: z.enum(["S", "M", "L"]),
  department: z.enum(DEPARTMENT_IDS).or(z.literal("")).optional(),
  client: z.string().trim().max(120).optional(),
});

export async function createTask(formData: FormData) {
  if (isDemoMode()) redirect("/admin/aufgaben?demo=1");
  await requireAdminUser();
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/aufgaben?error=1");
  const { priority, why, steps, department, client, ...rest } = parsed.data;
  try {
    // Was du hier anlegst, soll das Team erledigen: Die Abteilung übernimmt ohne weitere Rückfrage (im Modus „Selbstständig“ sofort).
    await insertTask({
      ...rest,
      priority: priority as 1 | 2 | 3,
      why: why || null,
      steps: steps || null,
      client: client || null,
      source: "karim",
      executor: "claude",
      department: department || departmentFor(rest.category),
    });
  } catch (e) {
    console.error("[admin] createTask", e);
    redirect("/admin/aufgaben?error=1");
  }
  revalidatePath("/admin/aufgaben");
  redirect("/admin/aufgaben?saved=1");
}

/** Status oder Priorität einer Aufgabe ändern (Buttons in der Liste). */
export async function setTask(formData: FormData) {
  if (isDemoMode()) redirect("/admin/aufgaben?demo=1");
  await requireAdminUser();
  const parsed = z
    .object({ id: z.string().uuid(), status: z.enum(TASK_STATUSES).optional(), priority: z.coerce.number().int().min(1).max(3).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/aufgaben?error=1");
  const { id, status, priority } = parsed.data;
  try {
    await updateTask(id, { ...(status ? { status } : {}), ...(priority ? { priority: priority as 1 | 2 | 3 } : {}) });
  } catch (e) {
    console.error("[admin] setTask", e);
    redirect("/admin/aufgaben?error=1");
  }
  revalidatePath("/admin", "layout");
}

export async function removeTask(formData: FormData) {
  if (isDemoMode()) redirect("/admin/aufgaben?demo=1");
  await requireAdminUser();
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/admin/aufgaben?error=1");
  try {
    await deleteTask(id.data);
  } catch (e) {
    console.error("[admin] removeTask", e);
    redirect("/admin/aufgaben?error=1");
  }
  revalidatePath("/admin", "layout");
}

/** Aufgabe an Claude übergeben (oder den Auftrag zurückziehen). Claude holt beauftragte Aufgaben ab und meldet das Ergebnis zurück. */
export async function requestRun(formData: FormData) {
  if (isDemoMode()) redirect("/admin/aufgaben?demo=1");
  await requireAdminUser();
  const parsed = z
    .object({ id: z.string().uuid(), cancel: z.string().optional(), defer: z.string().optional(), input: z.string().trim().max(4000).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/aufgaben?error=1");
  const { id, cancel, defer, input } = parsed.data;
  try {
    // zurueckgestellt = geparkt: bleibt sichtbar, wird aber nicht automatisch eingereiht
    await updateTask(id, cancel || defer ? { run_state: "zurueckgestellt" } : { run_state: "beauftragt", run_input: input || null, run_note: null });
  } catch (e) {
    console.error("[admin] requestRun", e);
    redirect("/admin/aufgaben?error=1");
  }
  revalidatePath("/admin", "layout");
}

/** Reihenfolge (hoch/runter/ganz nach oben) oder Dringlichkeit einer Aufgabe in der Warteschlange ändern. */
export async function reorderTask(formData: FormData) {
  if (isDemoMode()) redirect("/admin/team?demo=1");
  await requireAdminUser();
  const parsed = z.object({ id: z.string().uuid(), dir: z.enum(["up", "down", "top"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/team?error=1");
  try {
    await moveTask(parsed.data.id, parsed.data.dir);
  } catch (e) {
    console.error("[admin] reorderTask", e);
    redirect("/admin/team?error=1");
  }
  revalidatePath("/admin/team", "layout");
}

/** Schalter des Teams: ein/aus, Freigabe-Modus, Tageslimit je Abteilung. */
export async function setTeam(formData: FormData) {
  if (isDemoMode()) redirect("/admin/team?demo=1");
  await requireAdminUser();
  const parsed = z
    .object({ active: z.enum(["0", "1"]).optional(), autonomy: z.enum(["freigabe", "selbststaendig"]).optional(), max: z.coerce.number().int().min(1).max(10).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/team?error=1");
  const { active, autonomy, max } = parsed.data;
  try {
    await setTeamSettings({ ...(active ? { team_active: active === "1" } : {}), ...(autonomy ? { autonomy } : {}), ...(max ? { max_tasks_per_day: max } : {}) });
  } catch (e) {
    console.error("[admin] setTeam", e);
    redirect("/admin/team?error=1");
  }
  revalidatePath("/admin/team");
}
