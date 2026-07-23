import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import {
  buildReferralStoreUrls,
  detectMobilePlatform,
  normalizeReferralCode,
  trackReferralClick,
} from "@/lib/storeLinks";
import { setPageMeta } from "@/lib/seo";

const REFERRAL_STORAGE_KEY = "ballistiq_referral_code";

type ReferralStatus = "loading" | "invalid" | "ready";

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
  const [status, setStatus] = useState<ReferralStatus>("loading");

  useEffect(() => {
    if (!code) {
      window.location.replace("/");
      return;
    }

    let cancelled = false;

    void (async () => {
      const attributed = await trackReferralClick(code);
      if (cancelled) return;

      if (!attributed) {
        setStatus("invalid");
        setPageMeta({
          title: "Get BALLISTiQ | Referral",
          description: "Download BALLISTiQ on the App Store or Google Play.",
          path: `/r/${code}`,
          index: false,
        });
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

      setStatus("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!code) {
    return null;
  }

  const urls = buildReferralStoreUrls(code);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 gap-4 text-center">
      <h1 className="text-xl font-semibold">Download BALLISTiQ</h1>
      {status === "loading" && (
        <p className="text-sm text-muted-foreground">Checking referral code…</p>
      )}
      {status === "invalid" && (
        <p className="text-sm text-destructive">
          This referral code isn&apos;t valid. You can still download BALLISTiQ below.
        </p>
      )}
      {status === "ready" && (
        <p className="text-sm text-muted-foreground">
          Referral code: <strong>{code}</strong>
        </p>
      )}
      {(status === "invalid" || status === "ready") && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a className="underline" href={urls.ios}>
            App Store (iOS)
          </a>
          <a className="underline" href={urls.android}>
            Google Play (Android)
          </a>
        </div>
      )}
      {status === "ready" && (
        <p className="text-sm text-muted-foreground">Choose a store to download the app.</p>
      )}
    </div>
  );
}
