import { z } from "zod";

/**
 * Gemeinsame Schemas für Client (Inline-Validierung) und Server (API-Routen).
 * Fehler sind sprachneutrale CODES (z. B. "nameRequired") – die UI übersetzt sie über
 * messages → contactForm.errors.<code>. So spricht dieselbe Validierung Deutsch und Englisch.
 */

export type ValidationCode =
  | "nameRequired"
  | "nameTooLong"
  | "emailInvalid"
  | "phoneTooLong"
  | "phoneInvalid"
  | "textTooLong"
  | "consentRequired"
  | "interestsRequired"
  | "invalid";

const optionalText = (max: number) => z.string().trim().max(max, "textTooLong").optional().or(z.literal(""));

export const attributionSchema = z
  .object({
    utm_source: z.string().max(200).optional(),
    utm_medium: z.string().max(200).optional(),
    utm_campaign: z.string().max(200).optional(),
    utm_term: z.string().max(200).optional(),
    utm_content: z.string().max(200).optional(),
    referrer: z.string().max(500).optional(),
    landingPage: z.string().max(500).optional(),
  })
  .partial();

export type Attribution = z.infer<typeof attributionSchema>;

export const contactFields = {
  name: z.string("nameRequired").trim().min(2, "nameRequired").max(120, "nameTooLong"),
  email: z.string("emailInvalid").trim().toLowerCase().max(200, "emailInvalid").email("emailInvalid"),
  phone: z
    .string()
    .trim()
    .max(40, "phoneTooLong")
    .regex(/^[+\d\s()/-]*$/, "phoneInvalid")
    .optional()
    .or(z.literal("")),
  company: optionalText(160),
  message: optionalText(2000),
  consent: z.literal(true, { message: "consentRequired" }),
};

const calcStateSchema = z.record(z.string().max(40), z.union([z.string().max(60), z.array(z.string().max(60)).max(20), z.number(), z.boolean()]));

export const leadSchema = z.object({
  source: z.enum(["funnel", "rechner", "ki_seite", "branchen_seite"]).default("funnel"),
  industry: z.enum(["gastro", "musik", "andere"]),
  interests: z
    .array(z.enum(["aftermovie", "reels", "foto", "social", "ki_content", "automation", "web", "musikvideo", "unsicher"]))
    .min(1, "interestsRequired")
    .max(9),
  projectStatus: z.enum(["neustart", "gelegentlich", "regelmaessig", "projekt", "dringend"]).nullable().optional(),
  budget: z.enum(["unter_1k", "1k_2_5k", "2_5k_5k", "ueber_5k", "keine_angabe"]),
  ...contactFields,
  /** Honeypot – für Menschen unsichtbar. Wird in der API separat geprüft. */
  website: z.string().max(500).optional(),
  /** Nur bei source = "rechner": die Konfiguration, serverseitig neu berechnet */
  calculator: z
    .object({ state: calcStateSchema, requestId: z.string().uuid().nullable().optional() })
    .nullable()
    .optional(),
  attribution: attributionSchema.optional(),
  /** Sprache der Website beim Absenden → n8n schickt die Bestätigung in derselben Sprache */
  locale: z.enum(["de", "en"]).default("de"),
});

export type LeadPayload = z.input<typeof leadSchema>;

export const calculatorSchema = z.object({
  state: calcStateSchema,
  sessionId: z.string().max(64).optional(),
  attribution: attributionSchema.optional(),
});

export type ContactField = keyof typeof contactFields;

const CODES = new Set<string>(["nameRequired", "nameTooLong", "emailInvalid", "phoneTooLong", "phoneInvalid", "textTooLong", "consentRequired", "interestsRequired"]);
/** Unbekannte/Zod-Standardmeldungen auf einen generischen Code abbilden */
export const toValidationCode = (message: string | undefined): ValidationCode => (message && CODES.has(message) ? (message as ValidationCode) : "invalid");

/** Validiert ein einzelnes Kontaktfeld (on blur) – gibt Fehler-Code oder null zurück. */
export function validateContactField(field: ContactField, value: unknown): ValidationCode | null {
  const result = contactFields[field].safeParse(value);
  return result.success ? null : toValidationCode(result.error.issues[0]?.message);
}
