import { env } from "@/lib/env";

/** Admin = E-Mail steht in ADMIN_EMAILS (leere Liste = niemand). */
export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && env.adminEmails.includes(email!.toLowerCase());
}
