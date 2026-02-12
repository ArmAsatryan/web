import { features } from "@/data/siteContent";
import { Crosshair, Database, Focus, LayoutGrid, Wind, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";

const iconMap: Record<string, any> = {
  Crosshair,
  Database,
  Focus,
  LayoutGrid,
  Wind,
  WifiOff,
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32" data-testid="section-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Powerful <span className="text-[rgb(0,151,178)]">Features</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Everything you need for precision shooting, from ballistic calculations to comprehensive ammo data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon];
            return (
              <Card
                key={i}
                className="group p-6 bg-card border-card-border hover-elevate transition-all duration-300"
                data-testid={`card-feature-${i}`}
              >
                <div className="w-12 h-12 rounded-md bg-[rgb(0,151,178)]/10 flex items-center justify-center mb-5 group-hover:bg-[rgb(0,151,178)]/20 transition-colors">
                  {Icon && <Icon className="w-6 h-6 text-[rgb(0,151,178)]" />}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}