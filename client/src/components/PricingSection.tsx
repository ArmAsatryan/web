import { pricingPlans } from "@/data/siteContent";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32" data-testid="section-pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-[rgb(0,151,178)]">Version</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Start free and upgrade to PRO for advanced features. Currently in beta — all features are free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <Card
              key={i}
              className={`relative p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-card border-[rgb(0,151,178)]/30 border-2"
                  : "bg-card border-card-border"
              }`}
              data-testid={`card-pricing-${i}`}
            >
              {plan.badge && (
                <Badge className="absolute top-4 right-4 bg-[rgb(0,151,178)] text-white no-default-hover-elevate no-default-active-elevate">
                  {plan.badge}
                </Badge>
              )}

              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-white/50 text-sm mb-6">{plan.description}</p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.priceSuffix && (
                  <span className="text-white/40 text-sm">{plan.priceSuffix}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-[rgb(0,151,178)] flex-shrink-0" />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlighted ? "default" : "secondary"}
                className="w-full"
                data-testid={`button-pricing-cta-${i}`}
              >
                <a href="#hero">{plan.cta}</a>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}