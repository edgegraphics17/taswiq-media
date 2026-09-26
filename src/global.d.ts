import type { routing } from "@/i18n/routing";
import type de from "../messages/de.json";

/** Typsichere Übersetzungs-Keys: de.json ist die Referenz, en.json muss dieselben Keys haben. */
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof de;
  }
}
