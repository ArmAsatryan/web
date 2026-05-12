import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/hooks/use-i18n";
import { useI18n } from "@/hooks/use-i18n";
import type { MarketingSitePayload, MarketingLocale } from "@shared/marketing-site-types";

const MarketingSiteDataContext = createContext<MarketingSitePayload | null>(null);

const LOCALES: MarketingLocale[] = ["en", "fr", "it", "es", "hy"];

function buildStringOverridesFromPayload(payload: MarketingSitePayload | null): Partial<
  Record<Locale, Record<string, string>>
> | null {
  if (!payload?.hero) return null;
  const out: Partial<Record<Locale, Record<string, string>>> = {};
  for (const loc of LOCALES) {
    const h = payload.hero[loc];
    if (!h) continue;
    const row: Record<string, string> = {};
    if (h.title1?.trim()) row["hero.title1"] = h.title1;
    if (h.title2?.trim()) row["hero.title2"] = h.title2;
    if (h.subtitle?.trim()) row["hero.subtitle"] = h.subtitle;
    if (Object.keys(row).length) out[loc] = row;
  }
  return Object.keys(out).length ? out : null;
}

const defaultPublicUrl = "https://api.ballistiq.xyz/admin/api/marketing-site/public";

export function MarketingSiteProvider({ children }: { children: ReactNode }) {
  const { applyMarketingStrings } = useI18n();
  const [payload, setPayload] = useState<MarketingSitePayload | null>(null);

  const refresh = useCallback(async () => {
    const url =
      (import.meta as ImportMeta & { env?: { VITE_MARKETING_SITE_PUBLIC_URL?: string } }).env
        ?.VITE_MARKETING_SITE_PUBLIC_URL ?? defaultPublicUrl;
    try {
      const res = await fetch(url, { credentials: "omit" });
      if (!res.ok) {
        setPayload(null);
        applyMarketingStrings(null);
        return;
      }
      const data = (await res.json()) as MarketingSitePayload;
      setPayload(data);
      applyMarketingStrings(buildStringOverridesFromPayload(data));
    } catch {
      setPayload(null);
      applyMarketingStrings(null);
    }
  }, [applyMarketingStrings]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(() => payload, [payload]);

  return (
    <MarketingSiteDataContext.Provider value={value}>
      {children}
    </MarketingSiteDataContext.Provider>
  );
}

export function useMarketingSitePayload(): MarketingSitePayload | null {
  return useContext(MarketingSiteDataContext);
}
