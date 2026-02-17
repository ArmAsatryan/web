import { useEffect } from "react";
import { setPageMeta, type PageMetaOptions } from "@/lib/seo";

/**
 * Set document title, meta description, canonical, robots, and OG/Twitter meta for the current page.
 * Call once per page (e.g. in the top-level page component).
 */
export function usePageMeta(options: PageMetaOptions) {
  useEffect(() => {
    setPageMeta(options);
  }, [options.title, options.description, options.path, options.index, options.image]);
}
