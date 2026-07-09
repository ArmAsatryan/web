import { useEffect, useMemo } from "react";
import { setPageMeta, type PageMetaOptions } from "@/lib/seo";

function jsonLdKey(jsonLd: PageMetaOptions["jsonLd"]): string {
  if (!jsonLd) return "";
  try {
    return JSON.stringify(jsonLd);
  } catch {
    return "json-ld";
  }
}

/**
 * Set document title, meta description, canonical, robots, and OG/Twitter meta for the current page.
 * Call once per page (e.g. in the top-level page component).
 */
export function usePageMeta(options: PageMetaOptions) {
  const jsonLdSignature = jsonLdKey(options.jsonLd);

  useEffect(() => {
    setPageMeta(options);
  }, [
    options.title,
    options.description,
    options.path,
    options.index,
    options.image,
    options.keywords,
    options.imageAlt,
    options.ogType,
    options.publishedTime,
    options.modifiedTime,
    options.section,
    jsonLdSignature,
  ]);
}
