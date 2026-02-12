import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { MetricsStrip } from "@/components/MetricsStrip";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { B2BSection } from "@/components/B2BSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TeamSection } from "@/components/TeamSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { PageBackground } from "@/components/PageBackground";

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageBackground />
      <Navbar />
      <HeroSection />
      <MetricsStrip />
      <FeaturesSection />
      <PricingSection />
      <B2BSection />
      <ReviewsSection />
      <TeamSection />
      <ContactSection />
      <Footer />
      <ScrollProgress />
    </div>
  );
}
