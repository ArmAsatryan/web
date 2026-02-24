import { useState, useEffect } from "react";
import { Check, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/hooks/use-theme";
import { AnimatedSection } from "./AnimatedSection";
import { pricingTiers, pricingFeatures } from "@/data/siteContent";
import logoImg from "@assets/Logo_1770890960676.png";

function useScrollRotation() {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setRotation(window.scrollY * 0.15);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return rotation;
}

export function PricingSection() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const rotation = useScrollRotation();

  return (
    <section id="pricing" className="py-24 sm:py-32" data-testid="section-pricing">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("pricing.title1")}{" "}
            <span className="text-primary">{t("pricing.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <Card className="glass-card border-primary/20 border overflow-hidden" data-testid="card-pricing-main">
            <div className="p-8 text-center border-b border-border/50">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src={logoImg}
                  alt="BALLISTiQ logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 flex-shrink-0"
                  style={{
                    filter: theme === "dark" ? "brightness(0) invert(1)" : "brightness(0)",
                    transform: `rotate(${rotation}deg)`,
                    transition: "filter 0.3s ease",
                  }}
                />
                <h3 className="text-2xl font-bold text-foreground">BALLISTiQ</h3>
              </div>
              <p className="text-muted-foreground text-sm">{t("pricing.desc")}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 p-6 sm:p-8">
              {pricingTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl p-4 sm:p-6 text-center transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-primary/10 border-2 border-primary/30 shadow-lg"
                      : "bg-card/50 border border-border/50"
                  }`}
                  data-testid={`card-pricing-tier-${i}`}
                >
                  {tier.highlighted && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs no-default-hover-elevate no-default-active-elevate">
                      {t("pricing.popular")}
                    </Badge>
                  )}
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {t(tier.nameKey)}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                    {tier.price}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t(tier.perMonthKey)}
                  </p>
                </div>
              ))}
            </div>

            <div className="px-6 sm:px-8 pb-8">
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <div className="grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] items-center px-4 sm:px-6 py-3 bg-muted/30 border-b border-border/50">
                  <span className="text-sm font-semibold text-foreground">{t("pricing.options")}</span>
                  <span className="text-xs font-semibold text-muted-foreground text-center">{t("pricing.free")}</span>
                  <span className="text-xs font-semibold text-primary text-center">{t("pricing.premium")}</span>
                </div>
                {pricingFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[1fr_60px_60px] sm:grid-cols-[1fr_80px_80px] items-center px-4 sm:px-6 py-3 ${
                      i < pricingFeatures.length - 1 ? "border-b border-border/30" : ""
                    }`}
                    data-testid={`row-pricing-feature-${i}`}
                  >
                    <span className="text-sm text-muted-foreground">{t(feature.nameKey)}</span>
                    <div className="flex justify-center">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-primary" />
                      ) : (
                        <Minus className="w-5 h-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-8">
              <Button
                asChild
                variant="default"
                className="w-full"
                data-testid="button-pricing-cta"
              >
                <a
                  href="https://apps.apple.com/us/app/ballistiq-shooters-assistant/id6476917854"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("pricing.cta")}
                </a>
              </Button>
            </div>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
}
