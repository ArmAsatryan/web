import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { MetricsStrip } from "@/components/MetricsStrip";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FeaturesPricingDivider } from "@/components/FeaturesPricingDivider";
import { PricingSection } from "@/components/PricingSection";
import { B2BSection } from "@/components/B2BSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TeamSection } from "@/components/TeamSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PageBackground } from "@/components/PageBackground";
import {
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_KEYWORDS,
  HOME_PAGE_TITLE,
} from "@/data/home-seo";
import { usePageMeta } from "@/hooks/use-page-meta";

const HOME_META = {
  title: HOME_PAGE_TITLE,
  description: HOME_PAGE_DESCRIPTION,
  keywords: HOME_PAGE_KEYWORDS,
  imageAlt:
    "BALLISTiQ ballistic calculator and ballistics app for precision shooting, bullet drop, and long-range trajectory",
  path: "/",
};

export function HomePage() {
  usePageMeta(HOME_META);
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <PageBackground />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <MetricsStrip />
        <FeaturesSection />
        <FeaturesPricingDivider />
        <PricingSection />
        <B2BSection />
        <ReviewsSection />
        <TeamSection />
        <ContactSection />
        <Footer />
        <ScrollProgress />
      </div>
    </div>
  );
}
