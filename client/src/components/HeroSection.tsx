import { SiApple, SiGoogleplay } from "react-icons/si";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import bgImage from "@assets/Background1_1770884231570.jpg";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      data-testid="section-hero"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,15%,5%)] via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#13CE66] animate-pulse" />
            Available on iOS & Android
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Your Shooter{" "}
            <span className="text-[rgb(0,151,178)]">Assistant</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-lg">
            Precision ballistic calculator, comprehensive ammo database, and
            advanced shooting tools — all in one app.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              asChild
              variant="outline"
              className="bg-white text-black border-white/80 backdrop-blur-sm"
            >
              <a
                href="https://apps.apple.com/app/ballistiq"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-appstore"
              >
                <SiApple className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] font-normal leading-none opacity-70">Download on the</div>
                  <div className="text-sm leading-tight">App Store</div>
                </div>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="bg-white text-black border-white/80 backdrop-blur-sm"
            >
              <a
                href="https://play.google.com/store/apps/details?id=com.ballistiq"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-googleplay"
              >
                <SiGoogleplay className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-[10px] font-normal leading-none opacity-70">Get it on</div>
                  <div className="text-sm leading-tight">Google Play</div>
                </div>
              </a>
            </Button>
          </div>

          <Button
            asChild
            variant="ghost"
            className="text-white/60"
          >
            <a href="#" data-testid="link-user-manual">
              <FileText className="w-4 h-4" />
              Download User Manual
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}