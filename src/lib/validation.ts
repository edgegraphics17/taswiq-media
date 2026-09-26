import { z } from "zod";

/**
 * Gemeinsame Schemas für Client (Inline-Validierung) und Server (API-Routen).
 * Fehlermeldungen sagen immer, was zu tun ist – nicht nur, dass etwas falsch ist.
 */

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

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
  name: z.string().trim().min(2, "Bitte gib deinen Namen an.").max(120, "Bitte kürze deinen Namen auf 120 Zeichen."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .email("Diese E-Mail-Adresse ist unvollständig – bitte prüfe sie noch einmal."),
  phone: z
    .string()
    .trim()
    .max(40, "Die Telefonnummer ist zu lang.")
    .regex(/^[+\d\s()/-]*$/, "Bitte nur Ziffern, Leerzeichen, + und - verwenden.")
    .optional()
    .or(z.literal("")),
  company: optionalText(160),
  message: optionalText(2000),
  consent: z.literal(true, { message: "Bitte bestätige kurz die Datenschutzhinweise." }),
};

const calcStateSchema = z.record(z.string().max(40), z.union([z.string().max(60), z.array(z.string().max(60)).max(20), z.number(), z.boolean()]));

export const leadSchema = z.object({
  source: z.enum(["funnel", "rechner", "ki_seite", "branchen_seite"]).default("funnel"),
  industry: z.enum(["gastro", "musik", "andere"]),
  interests: z
    .array(z.enum(["aftermovie", "reels", "foto", "social", "ki_content", "automation", "web", "musikvideo", "unsicher"]))
    .min(1, "Wähle mindestens einen Bereich.")
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
});

export type LeadPayload = z.input<typeof leadSchema>;

export const calculatorSchema = z.object({
  state: calcStateSchema,
  sessionId: z.string().max(64).optional(),
  attribution: attributionSchema.optional(),
});

export type ContactField = keyof typeof contactFields;

/** Validiert ein einzelnes Kontaktfeld (on blur) – gibt Fehlermeldung oder null zurück. */
export function validateContactField(field: ContactField, value: unknown): string | null {
  const result = contactFields[field].safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? "Bitte prüfe dieses Feld.");
}
