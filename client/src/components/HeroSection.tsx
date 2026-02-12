import { SiApple, SiGoogleplay } from "react-icons/si";
import { FileText, Crosshair, Wind, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useMagneticButton } from "@/hooks/use-magnetic-button";
import { useTiltCard } from "@/hooks/use-tilt-card";
import { HeroBackground } from "./HeroBackground";
import bgImage from "@assets/Background1_1770884231570.jpg";

function MagneticWrapper({ children }: { children: React.ReactNode }) {
  const { ref, style } = useMagneticButton(8);
  return (
    <div ref={ref} style={style} className="inline-block">
      {children}
    </div>
  );
}

function AppMockup() {
  const { ref, style, glareStyle } = useTiltCard(6);

  return (
    <div
      ref={ref}
      style={style}
      className="relative hidden lg:block w-[280px] xl:w-[320px] flex-shrink-0"
    >
      <div className="relative rounded-md overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div style={glareStyle} />
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-white/80 text-xs font-semibold tracking-wider">BALLISTiQ PRO</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
            <Crosshair className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="text-white/80 text-xs">Distance</div>
              <div className="text-white text-sm font-semibold">1,247 m</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
            <Wind className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="text-white/80 text-xs">Wind</div>
              <div className="text-white text-sm font-semibold">3.2 m/s @ 45</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
            <Mountain className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="text-white/80 text-xs">Elevation</div>
              <div className="text-white text-sm font-semibold">+8.4 MOA</div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-md bg-primary/20 border border-primary/30 text-center">
            <div className="text-primary text-xs">Solution Ready</div>
            <div className="text-white font-bold text-lg">24.3 clicks</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const { t } = useI18n();

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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <HeroBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="flex items-center gap-12 xl:gap-16">
          <div className="max-w-2xl flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#13CE66] animate-pulse" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              {t("hero.title1")}{" "}
              <span className="text-primary">{t("hero.title2")}</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-lg">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <MagneticWrapper>
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
                      <div className="text-[10px] font-normal leading-none opacity-70">{t("hero.appstore.top")}</div>
                      <div className="text-sm leading-tight">{t("hero.appstore.bottom")}</div>
                    </div>
                  </a>
                </Button>
              </MagneticWrapper>

              <MagneticWrapper>
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
                      <div className="text-[10px] font-normal leading-none opacity-70">{t("hero.google.top")}</div>
                      <div className="text-sm leading-tight">{t("hero.google.bottom")}</div>
                    </div>
                  </a>
                </Button>
              </MagneticWrapper>
            </div>

            <Button
              asChild
              variant="ghost"
              className="text-white/60"
            >
              <a href="#" data-testid="link-user-manual">
                <FileText className="w-4 h-4" />
                {t("hero.manual")}
              </a>
            </Button>
          </div>

          <AppMockup />
        </div>
      </div>
    </section>
  );
}