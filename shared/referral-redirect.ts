const IOS_APP_STORE_URL =
  "https://apps.apple.com/app/ballistiq-shooters-assistant/id6476917854";
const ANDROID_PACKAGE_ID = "com.zeniq.ballistiq.mobile";
const REFERRAL_CODE_PATTERN = /^[A-HJ-NP-Z2-9]{8}$/i;

export function normalizeReferralCode(raw: string | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

export function extractReferralCodeFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/r\/([^/]+)\/?$/);
  return normalizeReferralCode(match?.[1]);
}

type MobilePlatform = "ios" | "android" | "other";

function detectMobilePlatform(userAgent: string): MobilePlatform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

function buildStoreUrl(platform: "ios" | "android", code: string): string {
  if (platform === "ios") {
    return IOS_APP_STORE_URL;
  }
  const referrer = encodeURIComponent(`referral_code=${code}`);
  return `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}&referrer=${referrer}`;
}

function redirectResponse(url: string, code: string): Response {
  const headers = new Headers({
    Location: url,
    "Cache-Control": "no-store",
    "Set-Cookie": `ballistiq_referral=${code}; Path=/; Max-Age=2592000; Secure; SameSite=Lax`,
  });
  return new Response(null, { status: 302, headers });
}

function desktopHtml(code: string): Response {
  const ios = IOS_APP_STORE_URL;
  const referrer = encodeURIComponent(`referral_code=${code}`);
  const android = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}&referrer=${referrer}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Get BALLISTiQ</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fff; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; padding: 1.5rem; }
    .card { max-width: 28rem; text-align: center; }
    a { color: #fff; }
    .stores { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
    .stores a { display: block; padding: 0.75rem 1rem; border: 1px solid rgba(255,255,255,.25); border-radius: 0.5rem; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Download BALLISTiQ</h1>
    <p>Referral code: <strong>${code}</strong></p>
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
      "Set-Cookie": `ballistiq_referral=${code}; Path=/; Max-Age=2592000; Secure; SameSite=Lax`,
    },
  });
}

export function buildReferralRedirectResponse(request: Request, code: string): Response {
  const userAgent = request.headers.get("User-Agent") ?? "";
  const platform = detectMobilePlatform(userAgent);

  if (platform === "ios") {
    return redirectResponse(buildStoreUrl("ios", code), code);
  }
  if (platform === "android") {
    return redirectResponse(buildStoreUrl("android", code), code);
  }

  return desktopHtml(code);
}
