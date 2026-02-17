/**
 * SEO config and utilities. Use SITE_URL for all absolute URLs (sitemap, canonical, OG, JSON-LD).
 * Set VITE_SITE_URL in env or leave unset to use default production domain.
 */
export const SITE_URL =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { VITE_SITE_URL?: string } }).env?.VITE_SITE_URL) ||
  "https://ballistiq.xyz";

export interface PageMetaOptions {
  title: string;
  description: string;
  /** Path (e.g. "/privacy-policy"). No trailing slash except for "/". */
  path: string;
  /** Default true. Set false for 404 / noindex pages. */
  index?: boolean;
  /** Override OG/Twitter image (absolute URL). */
  image?: string;
}

function getOrCreateMeta(name: string, attr: "name" | "property"): HTMLMetaElement {
  const selector = attr === "name" ? `meta[name="${name}"]` : `meta[property="${name}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  const el = getOrCreateMeta(name, attr);
  el.setAttribute("content", content);
}

export function setPageMeta({ title, description, path, index = true, image }: PageMetaOptions) {
  const canonical = path === "/" ? SITE_URL + "/" : SITE_URL + path;
  const imageUrl = image || `${SITE_URL}/og-image.png`;

  document.title = title;
  setMeta("description", description);
  setMeta("robots", index ? "index, follow" : "noindex, nofollow");

  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement("link");
    linkCanonical.rel = "canonical";
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.href = canonical;

  setMeta("og:title", title, "property");
  setMeta("og:description", description, "property");
  setMeta("og:url", canonical, "property");
  setMeta("og:image", imageUrl, "property");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", imageUrl);
}
