import pricingPremiumBg from "@assets/pricing_premium_background.svg";

/**
 * Decorative device mockup in the band between the last feature cards and the Get Premium block.
 */
export function FeaturesPricingDivider() {
  return (
    <div
      className="relative isolate overflow-x-hidden bg-background/30 py-16 sm:py-20 lg:py-28"
      aria-hidden
      data-testid="between-features-pricing-art"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/20 to-background/60 dark:from-background/55 dark:via-background/25 dark:to-background/65" />
      <div className="relative z-[1] mx-auto flex max-w-[min(100vw,100rem)] justify-center px-4 sm:px-6">
        <img
          src={pricingPremiumBg}
          alt=""
          className="h-auto w-full max-h-[min(52vh,560px)] max-w-[min(100vw,64rem)] object-contain object-center opacity-100 contrast-100 [image-rendering:auto] sm:max-h-[min(58vh,640px)] sm:max-w-[72rem] md:max-h-[min(62vh,720px)] md:max-w-[min(100vw,84rem)] lg:max-h-[min(66vh,800px)] lg:max-w-[min(100vw,96rem)] dark:opacity-[0.98]"
        />
      </div>
    </div>
  );
}
