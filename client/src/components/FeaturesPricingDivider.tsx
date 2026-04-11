import pricingPremiumBg from "@assets/pricing_premium_background.svg";
import { Button } from "@/components/ui/button";
import { ReticleFinderDialog } from "@/components/ReticleFinderDialog";
import { USER_MANUAL_DOWNLOAD_URL } from "@/data/siteContent";
import { useI18n } from "@/hooks/use-i18n";

/**
 * Decorative device mockup in the band between the last feature cards and the Get Premium block,
 * with a manual download CTA under the center mockup.
 */
export function FeaturesPricingDivider() {
  const { t } = useI18n();

  return (
    <div
      className="relative isolate overflow-x-hidden bg-background/30 py-16 sm:py-20 lg:py-28"
      data-testid="between-features-pricing-art"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/20 to-background/60 dark:from-background/55 dark:via-background/25 dark:to-background/65" />
      <div className="relative z-[1] mx-auto flex max-w-[min(100vw,100rem)] flex-col items-center px-4 sm:px-6">
        <img
          src={pricingPremiumBg}
          alt=""
          className="h-auto w-full max-h-[min(52vh,560px)] max-w-[min(100vw,64rem)] object-contain object-center opacity-100 contrast-100 [image-rendering:auto] sm:max-h-[min(58vh,640px)] sm:max-w-[72rem] md:max-h-[min(62vh,720px)] md:max-w-[min(100vw,84rem)] lg:max-h-[min(66vh,800px)] lg:max-w-[min(100vw,96rem)] dark:opacity-[0.98]"
          aria-hidden
        />

        <div className="mt-2 flex w-full max-w-xl flex-col items-stretch gap-2 sm:mt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-2 border-foreground/80 bg-background/90 px-7 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background sm:px-8 sm:text-base dark:border-foreground/70 dark:bg-background/80"
          >
            <a
              href={USER_MANUAL_DOWNLOAD_URL}
              data-testid="link-features-pricing-manual"
              rel="noopener noreferrer"
            >
              {t("hero.manual")}
            </a>
          </Button>
          <ReticleFinderDialog />
        </div>
      </div>
    </div>
  );
}
