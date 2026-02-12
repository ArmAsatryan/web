import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { B2BSection } from "@/components/B2BSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TeamSection } from "@/components/TeamSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <B2BSection />
      <ReviewsSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;