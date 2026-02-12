import { useState, useEffect, useRef } from "react";
import { SiApple, SiGoogleplay } from "react-icons/si";
import { FileText, Crosshair, Wind, ArrowUpRight, ArrowUpLeft, ArrowRight, ArrowLeft, ArrowDownRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useMagneticButton } from "@/hooks/use-magnetic-button";
import { useTiltCard } from "@/hooks/use-tilt-card";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
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

const windIcons = [ArrowUpRight, ArrowUpLeft, ArrowRight, ArrowLeft, ArrowDownRight, ArrowDownLeft];

function useSmoothValue(target: number, duration = 1200, skipAnimation = false) {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (skipAnimation) {
      setCurrent(target);
      return;
    }
    const start = current;
    const diff = target - start;
    if (Math.abs(diff) < 0.01) return;
    let startTime: number;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(start + diff * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, skipAnimation]);

  return current;
}

function generateTargets() {
  return {
    windSpeed: Math.random() * 10,
    windIconIdx: Math.floor(Math.random() * windIcons.length),
    distance: 500 + Math.random() * 1000,
    hClicks: 10 + Math.random() * 30,
    vClicks: 10 + Math.random() * 30,
  };
}

function useRandomValues() {
  const [targets, setTargets] = useState(generateTargets);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => setTargets(generateTargets()), 4000);
    return () => clearInterval(interval);
  }, [reduced]);

  const distance = useSmoothValue(targets.distance, 1200, reduced);
  const windSpeed = useSmoothValue(targets.windSpeed, 1200, reduced);
  const hClicks = useSmoothValue(targets.hClicks, 1200, reduced);
  const vClicks = useSmoothValue(targets.vClicks, 1200, reduced);

  return {
    distance: Math.round(distance),
    windSpeed: windSpeed.toFixed(1),
    windIconIdx: targets.windIconIdx,
    hClicks: hClicks.toFixed(1),
    vClicks: vClicks.toFixed(1),
  };
}

function AppMockup() {
  const { ref, style, glareStyle } = useTiltCard(6);
  const { windSpeed, windIconIdx, distance, hClicks, vClicks } = useRandomValues();
  const WindIcon = windIcons[windIconIdx];

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
            <span className="text-primary text-xs font-semibold tracking-wider">BALLISTiQ PRO</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
            <Crosshair className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="text-white/80 text-xs">Distance</div>
              <div className="text-white text-sm font-semibold transition-all duration-700">{distance.toLocaleString()} m</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
            <Wind className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <div className="text-white/80 text-xs">Wind</div>
              <div className="text-white text-sm font-semibold flex items-center gap-1.5 transition-all duration-700">
                {windSpeed} m/s
                <WindIcon className="w-3.5 h-3.5 text-primary/80" />
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-md bg-primary/20 border border-primary/30">
            <div className="text-primary text-xs text-center mb-2">Solution Ready</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-white/60 text-[10px] uppercase tracking-wider">Horizontal</div>
                <div className="text-white font-bold text-lg transition-all duration-700">{hClicks}</div>
                <div className="text-white/40 text-[10px]">clicks</div>
              </div>
              <div className="text-center">
                <div className="text-white/60 text-[10px] uppercase tracking-wider">Vertical</div>
                <div className="text-white font-bold text-lg transition-all duration-700">{vClicks}</div>
                <div className="text-white/40 text-[10px]">clicks</div>
              </div>
            </div>
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
                    href="https://apps.apple.com/us/app/ballistiq-shooters-assistant/id6476917854"
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
                    href="https://play.google.com/store/apps/details?id=com.zeniq.ballistiq.mobile"
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
              <a href="https://drive.google.com/uc?export=download&id=1vfUtcI7Angr2WvJgG6oJtmSgend1ZPCi" data-testid="link-user-manual">
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