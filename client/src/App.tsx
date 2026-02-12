import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { PricingSection } from "@/components/PricingSection";
import { B2BSection } from "@/components/B2BSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { TeamSection } from "@/components/TeamSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ThemeContext, useThemeProvider } from "@/hooks/use-theme";
import { I18nContext, useI18nProvider } from "@/hooks/use-i18n";

function App() {
  const themeValue = useThemeProvider();
  const i18nValue = useI18nProvider();

  return (
    <ThemeContext.Provider value={themeValue}>
      <I18nContext.Provider value={i18nValue}>
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
      </I18nContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;