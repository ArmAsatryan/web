/** App Store / Play Store URLs used across the marketing site and referral redirects. */
export const IOS_APP_STORE_URL =
  "https://apps.apple.com/app/ballistiq-shooters-assistant/id6476917854";

export const ANDROID_PACKAGE_ID = "com.zeniq.ballistiq.mobile";

const REFERRAL_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6,12}$/i;

export function normalizeReferralCode(raw: string | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

export function buildReferralStoreUrls(code: string) {
  const referrer = encodeURIComponent(`referral_code=${code}`);
  return {
    ios: IOS_APP_STORE_URL,
    android: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}&referrer=${referrer}`,
  };
}

export type MobilePlatform = "ios" | "android" | "other";

export function detectMobilePlatform(userAgent: string): MobilePlatform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}
