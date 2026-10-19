import { setRequestLocale } from "next-intl/server";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import PainSection from "@/components/pain-section";
import SafeBrowsingSection from "@/components/safe-browsing-section";
import PricingSection from "@/components/pricing-section";
import ManifestoSection from "@/components/manifesto-section";
import FaqSection from "@/components/faq-section";
import Footer from "@/components/footer";
import MobileCta from "@/components/mobile-cta";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const q = await searchParams;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <HeroSection checkoutSuccess={q.checkout === "success"} />
        <FeaturesSection />
        <SafeBrowsingSection />
        <PainSection />
        <PricingSection />
        <ManifestoSection />
        <FaqSection />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
