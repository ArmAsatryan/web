import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";

const freeFeatureKeys = [
  "pricing.feature.calc",
  "pricing.feature.ammo",
  "pricing.feature.reticle",
  "pricing.feature.offline",
  "pricing.feature.converters",
];

const proFeatureKeys = [
  "pricing.feature.everything",
  "pricing.feature.miniapps",
  "pricing.feature.kestrel",
  "pricing.feature.trajectory",
  "pricing.feature.custom",
  "pricing.feature.target",
  "pricing.feature.support",
];

export function PricingSection() {
  const { t } = useI18n();

  const plans = [
    {
      nameKey: "pricing.free.name",
      descKey: "pricing.free.desc",
      ctaKey: "pricing.free.cta",
      price: "Free",
      featureKeys: freeFeatureKeys,
      highlighted: false,
    },
    {
      nameKey: "pricing.pro.name",
      descKey: "pricing.pro.desc",
      ctaKey: "pricing.pro.cta",
      price: "Free",
      priceSuffix: "(Beta)",
      badgeKey: "pricing.pro.badge",
      featureKeys: proFeatureKeys,
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32" data-testid="section-pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("pricing.title1")}{" "}
            <span className="text-primary">{t("pricing.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-card border-primary/30 border-2"
                  : "bg-card border-card-border"
              }`}
              data-testid={`card-pricing-${i}`}
            >
              {plan.badgeKey && (
                <Badge className="absolute top-4 right-4 bg-primary text-white no-default-hover-elevate no-default-active-elevate">
                  {t(plan.badgeKey)}
                </Badge>
              )}

              <h3 className="text-xl font-bold text-foreground mb-2">{t(plan.nameKey)}</h3>
              <p className="text-muted-foreground text-sm mb-6">{t(plan.descKey)}</p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                {plan.priceSuffix && (
                  <span className="text-muted-foreground text-sm">{plan.priceSuffix}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.featureKeys.map((fk, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{t(fk)}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlighted ? "default" : "secondary"}
                className="w-full"
                data-testid={`button-pricing-cta-${i}`}
              >
                <a href="#hero">{t(plan.ctaKey)}</a>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}