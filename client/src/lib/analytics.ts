/**
 * Optional Google Search Console and GA4 integration.
 * Set VITE_GSC_VERIFICATION (meta content value) and/or VITE_GA4_MEASUREMENT_ID in env to enable.
 * Do not hardcode secrets.
 */
const env = typeof import.meta !== "undefined" ? (import.meta as unknown as { env?: Record<string, string> }).env : undefined;

export function initAnalytics() {
  if (!env) return;

  const gsc = env.VITE_GSC_VERIFICATION;
  if (gsc) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="google-site-verification"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "google-site-verification";
      document.head.appendChild(meta);
    }
    meta.content = gsc;
  }

  const ga4Id = env.VITE_GA4_MEASUREMENT_ID;
  if (ga4Id) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script);
    (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag = function () {
      ((window as unknown as { dataLayer?: unknown[] }).dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer || []).push(arguments);
    };
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("js", new Date());
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("config", ga4Id);
  }
}
