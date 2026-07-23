import { useEffect } from "react";
import { useRoute } from "wouter";
import {
  buildReferralStoreUrls,
  detectMobilePlatform,
  normalizeReferralCode,
} from "@/lib/storeLinks";
import { setPageMeta } from "@/lib/seo";

const REFERRAL_STORAGE_KEY = "ballistiq_referral_code";

function persistReferralCode(code: string) {
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, code);
    document.cookie = `ballistiq_referral=${code}; path=/; max-age=2592000; samesite=lax; secure`;
  } catch {
    // ignore private browsing / storage errors
  }
}

export function ReferralRedirectPage() {
  const [, params] = useRoute("/r/:code");
  const code = normalizeReferralCode(params?.code);

  useEffect(() => {
    if (!code) {
      window.location.replace("/");
      return;
    }

    persistReferralCode(code);
    setPageMeta({
      title: "Get BALLISTiQ | Referral",
      description: "Download BALLISTiQ on the App Store or Google Play.",
      path: `/r/${code}`,
      index: false,
    });

    const platform = detectMobilePlatform(navigator.userAgent);
    const urls = buildReferralStoreUrls(code);

    if (platform === "ios") {
      window.location.replace(urls.ios);
      return;
    }
    if (platform === "android") {
      window.location.replace(urls.android);
      return;
    }
  }, [code]);

  if (!code) {
    return null;
  }

  const urls = buildReferralStoreUrls(code);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 gap-4 text-center">
      <h1 className="text-xl font-semibold">Download BALLISTiQ</h1>
      <p className="text-sm text-muted-foreground">
        Referral code: <strong>{code}</strong>
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a className="underline" href={urls.ios}>
          App Store (iOS)
        </a>
        <a className="underline" href={urls.android}>
          Google Play (Android)
        </a>
      </div>
      <p className="text-sm text-muted-foreground">Redirecting to the app store…</p>
    </div>
  );
}
