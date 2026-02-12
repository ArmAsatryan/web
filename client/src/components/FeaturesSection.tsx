import { Crosshair, Database, Focus, LayoutGrid, Wind, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { AnimatedSection, StaggeredGrid } from "./AnimatedSection";

const icons = [Crosshair, Database, Focus, LayoutGrid, Wind, WifiOff];

export function FeaturesSection() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-24 sm:py-32" data-testid="section-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("features.title1")}{" "}
            <span className="text-primary">{t("features.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </AnimatedSection>

        <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {icons.map((Icon, i) => (
            <Card
              key={i}
              className="group p-6 glass-card hover-elevate transition-all duration-300"
              data-testid={`card-feature-${i}`}
            >
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {t(`features.${i}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`features.${i}.desc`)}
              </p>
            </Card>
          ))}
        </StaggeredGrid>
      </div>
    </section>
  );
}