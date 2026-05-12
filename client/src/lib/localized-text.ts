import type { Locale } from "@/hooks/use-i18n";
import type { LocalizedText } from "@shared/marketing-site-types";

export function pickLocalized(text: LocalizedText | undefined, loc: Locale, fallback = ""): string {
  if (!text) return fallback;
  const v = text[loc as keyof LocalizedText] ?? text.en;
  if (typeof v === "string" && v.trim() !== "") return v;
  const en = text.en;
  if (typeof en === "string" && en.trim() !== "") return en;
  return fallback;
}
