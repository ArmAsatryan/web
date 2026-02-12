import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { AnimatedSection, StaggeredGrid } from "./AnimatedSection";
import thermalImg from "@assets/ThermalScope_1770884062208.png";
import ugvImg from "@assets/UGV_1770884064333.png";
import turretImg from "@assets/SmartTurret_1770884055178.png";
import bg2 from "@assets/Background_2_1770884266453.png";

const images = [thermalImg, ugvImg, turretImg];

export function B2BSection() {
  const { t } = useI18n();

  return (
    <section id="b2b" className="relative py-24 sm:py-32 overflow-hidden" data-testid="section-b2b">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${bg2})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
            <Shield className="w-4 h-4" />
            {t("b2b.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("b2b.title1")}{" "}
            <span className="text-primary">{t("b2b.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-3">
            {t("b2b.subtitle")}
          </p>
          <p className="text-muted-foreground/60 text-sm">
            {t("b2b.offline")}
          </p>
        </AnimatedSection>

        <StaggeredGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[0, 1, 2].map((i) => (
            <Card
              key={i}
              className="group overflow-visible glass-card hover-elevate transition-all duration-300 flex flex-col h-full"
              data-testid={`card-b2b-${i}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden rounded-t-[inherit]">
                <img
                  src={images[i]}
                  alt={t(`b2b.${i}.title`)}
                  className="w-full h-full object-contain bg-black/50 p-4"
                  loading="lazy"
                  width={400}
                  height={300}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {t(`b2b.${i}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`b2b.${i}.desc`)}
                </p>
              </div>
            </Card>
          ))}
        </StaggeredGrid>

        <AnimatedSection className="text-center" delay={0.3}>
          <Button asChild data-testid="button-b2b-contact">
            <a href="#contact">
              {t("b2b.cta")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}