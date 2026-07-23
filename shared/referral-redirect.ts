const IOS_APP_STORE_URL =
  "https://apps.apple.com/app/ballistiq-shooters-assistant/id6476917854";
const ANDROID_PACKAGE_ID = "com.zeniq.ballistiq.mobile";
const ADAPTY_ATTRIBUTION_CLICK_URL =
  "https://api-ua.adapty.io/api/v1/attribution/click";
const ADAPTY_CAMPAIGN_ID = "NzEwODo2NzEzOjY3NA";

/** Backend generates 8-char codes; allow 6–12 for redirects (typos / legacy). */
const REFERRAL_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{6,12}$/i;

export function normalizeReferralCode(raw: string | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

export function extractReferralCodeFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/r\/([^/]+)\/?$/);
  return normalizeReferralCode(match?.[1]);
}

export type MobilePlatform = "ios" | "android" | "other";

type PlatformHints = {
  secChUaMobile?: string | null;
  secChUaPlatform?: string | null;
};

/** Server-side detection from User-Agent and optional Client Hints. */
export function detectMobilePlatform(
  userAgent: string,
  hints: PlatformHints = {},
): MobilePlatform {
  const ua = userAgent;
  const platform = hints.secChUaPlatform?.replace(/"/g, "").toLowerCase() ?? "";

  if (/iPhone|iPod|iPad|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) return "ios";
  if (platform === "ios") return "ios";
  if (/Android/i.test(ua)) return "android";
  if (platform === "android") return "android";

  // iPhone/iPad with "Request Desktop Website" can send a Mac-like UA.
  if (hints.secChUaMobile === "?1" && /Safari/i.test(ua) && !/Chrome|Chromium/i.test(ua)) {
    return "ios";
  }

  return "other";
}

/** Browser-side detection; handles iPad and iOS desktop-mode UA. */
export function detectMobilePlatformFromNavigator(nav: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}): MobilePlatform {
  const ua = nav.userAgent;
  if (/iPhone|iPod|iPad|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) return "ios";
  if (nav.platform === "MacIntel" && nav.maxTouchPoints > 1) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function buildMobileAutoRedirectScript(iosUrl: string, androidUrl: string): string {
  return `<script>
(function () {
  var ua = navigator.userAgent || "";
  var isIOS = /iPhone|iPod|iPad|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  if (isIOS) { window.location.replace(${JSON.stringify(iosUrl)}); return; }
  if (isAndroid) { window.location.replace(${JSON.stringify(androidUrl)}); return; }
})();
</script>`;
}

export function buildReferralStoreUrls(code: string) {
  const referrer = encodeURIComponent(`referral_code=${code}`);
  return {
    ios: IOS_APP_STORE_URL,
    android: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}&referrer=${referrer}`,
  };
}

function buildAdaptyAttributionUrl(code: string): string {
  const url = new URL(ADAPTY_ATTRIBUTION_CLICK_URL);
  url.searchParams.set("adpt_cid", ADAPTY_CAMPAIGN_ID);
  url.searchParams.set("channel", "referral");
  url.searchParams.set("deferred_data_sub1", code);
  return url.toString();
}

export async function trackReferralClick(code: string): Promise<boolean> {
  try {
    const res = await fetch(buildAdaptyAttributionUrl(code), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function referralCookieHeader(code: string): string {
  return `ballistiq_referral=${code}; Path=/; Max-Age=2592000; Secure; SameSite=Lax`;
}

function redirectResponse(url: string, code: string): Response {
  const headers = new Headers({
    Location: url,
    "Cache-Control": "no-store",
    "Set-Cookie": referralCookieHeader(code),
  });
  return new Response(null, { status: 302, headers });
}

function referralHtmlResponse(code: string, invalid: boolean): Response {
  const safeCode = escapeHtml(code);
  const { ios, android } = buildReferralStoreUrls(code);
  const message = invalid
    ? `<p class="error">This referral code isn&apos;t valid. You can still download BALLISTiQ below.</p>`
    : `<p>Referral code: <strong>${safeCode}</strong></p>`;
  const autoRedirect = invalid ? "" : buildMobileAutoRedirectScript(ios, android);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Get BALLISTiQ</title>
  ${autoRedirect}
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fff; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; padding: 1.5rem; }
    .card { max-width: 28rem; text-align: center; }
    a { color: #fff; }
    .error { color: #f87171; margin-bottom: 0.5rem; }
    .stores { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
    .stores a { display: block; padding: 0.75rem 1rem; border: 1px solid rgba(255,255,255,.25); border-radius: 0.5rem; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Download BALLISTiQ</h1>
    ${message}
    <div class="stores">
      <a href="${ios}">App Store (iOS)</a>
      <a href="${android}">Google Play (Android)</a>
      <a href="/">Continue to ballistiq.xyz</a>
    </div>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      ...(invalid ? {} : { "Set-Cookie": referralCookieHeader(code) }),
    },
  });
}

export async function buildReferralRedirectResponse(
  request: Request,
  code: string,
): Promise<Response> {
  const attributed = await trackReferralClick(code);
  if (!attributed) {
    return referralHtmlResponse(code, true);
  }

  const userAgent = request.headers.get("User-Agent") ?? "";
  const platform = detectMobilePlatform(userAgent, {
    secChUaMobile: request.headers.get("Sec-CH-UA-Mobile"),
    secChUaPlatform: request.headers.get("Sec-CH-UA-Platform"),
  });
  const urls = buildReferralStoreUrls(code);

  if (platform === "ios") {
    return redirectResponse(urls.ios, code);
  }
  if (platform === "android") {
    return redirectResponse(urls.android, code);
  }

  return referralHtmlResponse(code, false);
}
