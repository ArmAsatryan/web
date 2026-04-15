import { SiApple, SiGoogleplay } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { useMagneticButton } from "@/hooks/use-magnetic-button";
import { HeroBackground } from "./HeroBackground";
import bgImage from "@assets/Background1_1770884231570.jpg";
import garminIqLogo from "@assets/Garmin_Connect_IQ_logo.png";

const HERO_YOUTUBE_VIDEO_ID = "J4DlqiyZ69U";

/** Params tuned for a clean player; larger iframe width (below) helps YouTube pick higher rungs. */
const HERO_YOUTUBE_EMBED_PARAMS =
  "rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&theme=dark&color=white";

/** Shared layout for App Store / Google Play / Garmin hero CTAs */
const heroStoreButtonClass =
  "bg-white text-black border-white/80 backdrop-blur-sm h-9 min-h-9 w-full justify-center gap-1.5 rounded-md px-1.5 sm:gap-2 sm:px-2.5 lg:h-10 lg:min-h-10 lg:justify-start lg:px-3 [&_svg]:!size-3.5";

function StoreIconSlot({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center [&_img]:max-h-full [&_img]:max-w-full [&_img]:object-contain">
      {children}
    </span>
  );
}

function MagneticWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, style } = useMagneticButton(8);
  return (
    <div ref={ref} style={style} className={cn("inline-block", className)}>
      {children}
    </div>
  );
}

function HeroVideo({ title }: { title: string }) {
  return (
    <div
      className="mx-auto w-full overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-[2px]"
      data-testid="hero-youtube"
    >
      <div className="relative aspect-video w-full">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${HERO_YOUTUBE_VIDEO_ID}?${HERO_YOUTUBE_EMBED_PARAMS}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      data-testid="section-hero"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[min(115vh,115%)] w-[min(115vw,115%)] max-w-none -translate-x-1/2 -translate-y-1/2 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <HeroBackground />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 pb-8 pt-24 sm:px-6 lg:min-h-screen lg:justify-center lg:py-16 lg:pb-16">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-none lg:flex-row lg:items-center lg:gap-10 xl:gap-14">
          <div className="flex min-h-0 w-full max-w-2xl flex-1 flex-col text-center lg:flex-1 lg:text-left">

            <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {t("hero.title1")}{" "}
              <span className="text-primary">{t("hero.title2")}</span>
            </h1>

            <p className="mx-auto mb-6 max-w-lg text-lg leading-relaxed text-white/70 sm:text-xl lg:mx-0 lg:mb-8">
              {t("hero.subtitle")}
            </p>

            <div className="mb-6 w-full lg:hidden">
              <HeroVideo title={t("hero.video.iframeTitle")} />
            </div>

            {/* Grows on phone/tablet so store CTAs sit toward the bottom of the viewport */}
            <div className="min-h-8 flex-1 lg:hidden" aria-hidden />

            <div className="mx-auto mb-4 grid w-full max-w-[min(17.5rem,88vw)] grid-cols-1 gap-2 pb-1 lg:mx-0 lg:mb-8 lg:max-w-none lg:grid-cols-3 lg:gap-3 lg:pb-0">
              <div className="min-w-0">
                <MagneticWrapper className="block w-full min-w-0">
                  <Button
                    asChild
                    variant="outline"
                    className={heroStoreButtonClass}
                  >
                    <a
                      href="https://apps.apple.com/us/app/ballistiq-shooters-assistant/id6476917854"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-appstore"
                    >
                      <StoreIconSlot>
                        <SiApple className="size-3.5" />
                      </StoreIconSlot>
                      <div className="min-w-0 flex-1 text-center lg:text-left">
                        <div className="text-[9px] font-normal leading-none opacity-70 sm:text-[10px]">{t("hero.appstore.top")}</div>
                        <div className="text-xs leading-tight sm:text-[13px] lg:text-sm">{t("hero.appstore.bottom")}</div>
                      </div>
                    </a>
                  </Button>
                </MagneticWrapper>
              </div>

              <div className="min-w-0">
                <MagneticWrapper className="block w-full min-w-0">
                  <Button
                    asChild
                    variant="outline"
                    className={heroStoreButtonClass}
                  >
                    <a
                      href="https://play.google.com/store/apps/details?id=com.zeniq.ballistiq.mobile"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-googleplay"
                    >
                      <StoreIconSlot>
                        <SiGoogleplay className="size-3.5" />
                      </StoreIconSlot>
                      <div className="min-w-0 flex-1 text-center lg:text-left">
                        <div className="text-[9px] font-normal leading-none opacity-70 sm:text-[10px]">{t("hero.google.top")}</div>
                        <div className="text-xs leading-tight sm:text-[13px] lg:text-sm">{t("hero.google.bottom")}</div>
                      </div>
                    </a>
                  </Button>
                </MagneticWrapper>
              </div>

              <div className="min-w-0">
                <MagneticWrapper className="block w-full min-w-0">
                  <Button
                    asChild
                    variant="outline"
                    className={heroStoreButtonClass}
                  >
                    <a
                      href="https://apps.garmin.com/apps/718c49c2-19cf-4ac7-9d7e-65084e038f36?tid=2"
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="link-garmin-iq"
                    >
                      <StoreIconSlot>
                        <img
                          src={garminIqLogo}
                          alt=""
                          width={28}
                          height={28}
                          aria-hidden
                        />
                      </StoreIconSlot>
                      <div className="min-w-0 flex-1 text-center lg:text-left">
                        <div className="text-[9px] font-normal leading-none opacity-70 sm:text-[10px]">{t("hero.garmin.top")}</div>
                        <div className="text-xs leading-tight sm:text-[13px] lg:text-sm">{t("hero.garmin.bottom")}</div>
                      </div>
                    </a>
                  </Button>
                </MagneticWrapper>
              </div>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex lg:max-w-[min(100%,32rem)] xl:max-w-[min(100%,38rem)] 2xl:max-w-[min(100%,44rem)]">
            <HeroVideo title={t("hero.video.iframeTitle")} />
          </div>
        </div>
      </div>
    </section>
  );
}
