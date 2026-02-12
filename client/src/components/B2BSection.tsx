import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { b2bSolutions } from "@/data/siteContent";
import { ArrowRight, Shield } from "lucide-react";
import thermalImg from "@assets/ThermalScope_1770884062208.png";
import ugvImg from "@assets/UGV_1770884064333.png";
import turretImg from "@assets/SmartTurret_1770884055178.png";
import bg2 from "@assets/Background_2_1770884266453.png";

const imageMap: Record<string, string> = {
  ThermalScope: thermalImg,
  UGV: ugvImg,
  SmartTurret: turretImg,
};

export function B2BSection() {
  return (
    <section id="b2b" className="relative py-24 sm:py-32 overflow-hidden" data-testid="section-b2b">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${bg2})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[rgb(0,151,178)]/10 border border-[rgb(0,151,178)]/20 text-sm text-[rgb(0,151,178)] mb-6">
            <Shield className="w-4 h-4" />
            Enterprise Solutions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            BALLISTiQ <span className="text-[rgb(0,151,178)]">B2B</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-3">
            Integrate the BALLISTiQ C++ Ballistic Module into thermal scopes, UGVs, smart optics, and defense systems.
          </p>
          <p className="text-white/30 text-sm">
            Works online or fully offline (embedded)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {b2bSolutions.map((solution, i) => (
            <Card
              key={i}
              className="group overflow-visible bg-card border-card-border hover-elevate transition-all duration-300"
              data-testid={`card-b2b-${i}`}
            >
              <div className="aspect-[4/3] relative overflow-hidden rounded-t-[inherit]">
                <img
                  src={imageMap[solution.image]}
                  alt={solution.title}
                  className="w-full h-full object-contain bg-black/50 p-4"
                  loading="lazy"
                  width={400}
                  height={300}
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {solution.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {solution.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild data-testid="button-b2b-contact">
            <a href="#contact">
              Contact Us for B2B
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}