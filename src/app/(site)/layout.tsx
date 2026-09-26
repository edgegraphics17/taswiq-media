import { SiteShell } from "@/components/layout/SiteShell";
import { Footer } from "@/components/layout/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell footer={<Footer />}>{children}</SiteShell>;
}
