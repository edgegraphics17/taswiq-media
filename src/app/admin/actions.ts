"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode, isSupabaseConfigured } from "@/lib/env";
import { isAdminUser } from "@/lib/auth";
import { site } from "@/config/site";
import { LEAD_STATUSES } from "@/types/database";

/** Jede Mutation prüft die Admin-Rolle erneut – Server Actions sind öffentliche Endpunkte. */
async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) redirect("/admin/login?error=forbidden");
  return { supabase, user };
}

export async function signIn(formData: FormData) {
  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) redirect("/admin/login?error=email");
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  const supabase = await createClient();
  // shouldCreateUser: false → nur bestehende (angelegte) Admins bekommen einen Link
  await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${site.url}/admin/auth/callback`, shouldCreateUser: false },
  });
  // Immer dieselbe Antwort – verrät nicht, ob die Adresse existiert
  redirect("/admin/login?sent=1");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
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

  const { supabase } = await adminClient();
  const { error } = await supabase
    .from("leads")
    .update({
      status: status as (typeof LEAD_STATUSES)[number],
      deal_value: deal_value ?? null,
      next_action_at: next_action_at ? new Date(next_action_at).toISOString() : null,
      owner_notes: owner_notes || null,
    })
    .eq("id", id);
  if (error) redirect(`/admin/leads/${id}?error=1`);
  revalidatePath("/admin");
  redirect(`/admin/leads/${id}?saved=1`);
}

export async function addNote(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const body = z.string().trim().min(1).max(5000).safeParse(formData.get("body"));
  if (!body.success) redirect(`/admin/leads/${id}?error=note`);
  if (isDemoMode()) redirect(`/admin/leads/${id}?demo=1`);
  const { supabase, user } = await adminClient();
  await supabase.from("lead_events").insert({ lead_id: id, type: "note", body: body.data, created_by: user.id });
  redirect(`/admin/leads/${id}?saved=1`);
}

/** Preis-Editor: überschreibt die Werte aus pricing.ts – live nach Cache-Invalidierung. */
export async function updatePrices(formData: FormData) {
  if (isDemoMode()) redirect("/admin/preise?demo=1");
  const { supabase } = await adminClient();
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
  const { error } = await supabase.from("services").upsert([...rows.values()], { onConflict: "group_id,option_id" });
  if (error) redirect("/admin/preise?error=1");
  revalidateTag("pricing");
  redirect("/admin/preise?saved=1");
}
