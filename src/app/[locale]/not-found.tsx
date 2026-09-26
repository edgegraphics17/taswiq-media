import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 text-center">
      <div className="card max-w-md p-10">
        <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">{t("badge")}</p>
        <h1 className="mt-4 text-4xl font-medium">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("text")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <ButtonLink href="/">{t("home")}</ButtonLink>
          <ButtonLink href="/preisrechner" variant="soft">
            {t("calculator")}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
