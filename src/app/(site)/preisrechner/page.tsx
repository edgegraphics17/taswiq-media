import { Calculator } from "@/components/calculator/Calculator";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPricingData } from "@/lib/pricing-source";
import { breadcrumbJsonLd, calculatorJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 300; // Preise aus Supabase max. 5 Min. alt

export const metadata = pageMetadata({
  title: "Preisrechner – Was kostet Video, Foto, Website & KI?",
  description:
    "Stell dein Projekt in zwei Minuten zusammen: Aftermovie, Food-Fotos, Website oder KI-Workflows. Du siehst sofort den Kostenrahmen – ohne Anmeldung, unverbindlich.",
  path: "/preisrechner",
  keywords: ["Aftermovie Kosten", "Food Fotograf Preise", "Videograf Preise", "Restaurant Website Kosten", "KI Automatisierung Kosten"],
});

export default async function PreisrechnerPage() {
  const data = await getPricingData();
  return (
    <div className="bg-fog pt-16 lg:pt-[72px]">
      <Calculator data={data} />
      <JsonLd data={calculatorJsonLd()} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Start", path: "/" }, { name: "Preisrechner", path: "/preisrechner" }])} />
    </div>
  );
}
