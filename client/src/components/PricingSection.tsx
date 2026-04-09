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
    <section
      id="pricing"
      className="relative z-10 pb-24 pt-12 sm:pb-32 sm:pt-16"
      data-testid="section-pricing"
    >
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="flex flex-col gap-6">
          <Card
            className="border border-primary/20 bg-card shadow-md [backdrop-filter:none] [-webkit-backdrop-filter:none] dark:bg-card"
            data-testid="card-pricing-intro"
          >
            <div className="p-5 text-center sm:p-8">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                {t("pricing.title1")}{" "}
                <span className="text-primary">{t("pricing.title2")}</span>
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
                {t("pricing.subtitle")}
              </p>
              <div className="mt-8 flex items-center justify-center gap-3 sm:mt-10">
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
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4">{t("pricing.desc")}</p>
            </div>
          </Card>

          {/* Narrower column: smaller horizontal footprint, vertical spacing unchanged */}
          <div className="mx-auto flex w-full max-w-lg flex-col gap-6 sm:max-w-xl md:max-w-2xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
            {pricingTiers.map((tier, i) => (
              <Card
                key={i}
                data-testid={`card-pricing-tier-${i}`}
                className={`relative border bg-card shadow-md [backdrop-filter:none] [-webkit-backdrop-filter:none] dark:bg-card ${
                  tier.highlighted
                    ? "border-2 border-primary/40 shadow-lg ring-1 ring-primary/20"
                    : "border border-primary/20"
                }`}
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 z-[1] -translate-x-1/2 bg-primary text-primary-foreground text-xs no-default-hover-elevate no-default-active-elevate">
                    {t("pricing.popular")}
                  </Badge>
                )}
                <div className="p-5 text-center sm:p-6">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t(tier.nameKey)}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                    {tier.price}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(tier.perMonthKey)}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <Card
            className="border border-primary/20 bg-card shadow-md [backdrop-filter:none] [-webkit-backdrop-filter:none] dark:bg-card"
            data-testid="card-pricing-feature-legend"
          >
            <div className="grid grid-cols-[1fr_44px_44px] items-center gap-2 px-4 py-4 sm:grid-cols-[1fr_72px_72px] sm:px-6 sm:py-5">
              <span className="text-sm font-semibold text-foreground">{t("pricing.options")}</span>
              <span className="text-center text-xs font-semibold text-muted-foreground">{t("pricing.free")}</span>
              <span className="text-center text-xs font-semibold text-primary">{t("pricing.premium")}</span>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {pricingFeatures.map((feature, i) => (
              <Card
                key={i}
                data-testid={`row-pricing-feature-${i}`}
                className="border border-primary/20 bg-card shadow-md [backdrop-filter:none] [-webkit-backdrop-filter:none] dark:bg-card"
              >
                <div className="grid grid-cols-[1fr_44px_44px] items-center gap-2 px-4 py-4 sm:grid-cols-[1fr_72px_72px] sm:px-6 sm:py-5">
                  <span className="min-w-0 text-xs text-foreground sm:text-sm">{t(feature.nameKey)}</span>
                  <div className="flex justify-center">
                    {feature.free ? (
                      <Check className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <Minus className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card
            className="border border-primary/20 bg-card p-4 shadow-md [backdrop-filter:none] [-webkit-backdrop-filter:none] sm:p-6 dark:bg-card"
            data-testid="card-pricing-main"
          >
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
          </Card>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
