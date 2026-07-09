/**
 * SEO config and utilities. Use SITE_URL for all absolute URLs (sitemap, canonical, OG, JSON-LD).
 * Set VITE_SITE_URL in env or leave unset to use default production domain.
 */
import {
  OG_SITE_NAME,
  resolvePublicSiteUrl,
} from "@shared/marketing-seo";

export const SITE_URL = resolvePublicSiteUrl();

export interface PageMetaOptions {
  title: string;
  description: string;
  /** Path (e.g. "/privacy-policy"). No trailing slash except for "/". */
  path: string;
  /** Default true. Set false for 404 / noindex pages. */
  index?: boolean;
  /** Override OG/Twitter image (absolute URL or site path). */
  image?: string;
  /** Optional meta keywords (legacy / minor crawlers). */
  keywords?: string;
  /** Open Graph / Twitter image alt text. */
  imageAlt?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  /** Page-specific JSON-LD (single object or @graph items). */
  jsonLd?: object | object[];
}

const JSON_LD_SCRIPT_ID = "page-structured-data";

function absoluteAssetUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
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

function removeMeta(name: string, attr: "name" | "property" = "name") {
  const selector = attr === "name" ? `meta[name="${name}"]` : `meta[property="${name}"]`;
  document.querySelector(selector)?.remove();
}

function setArticleMeta(name: string, content: string | undefined) {
  if (content) {
    setMeta(name, content, "property");
  } else {
    removeMeta(name, "property");
  }
}

export function setJsonLd(data: object | object[] | null | undefined) {
  const existing = document.getElementById(JSON_LD_SCRIPT_ID);
  if (!data) {
    existing?.remove();
    return;
  }

  const items = Array.isArray(data) ? data : [data];
  const payload =
    items.length === 1
      ? items[0]
      : {
          "@context": "https://schema.org",
          "@graph": items,
        };

  let script = existing as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = JSON_LD_SCRIPT_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  try {
    script.textContent = JSON.stringify(payload);
  } catch {
    script.remove();
  }
}

export function setPageMeta({
  title,
  description,
  path,
  index = true,
  image,
  keywords,
  imageAlt,
  ogType = "website",
  publishedTime,
  modifiedTime,
  section,
  jsonLd,
}: PageMetaOptions) {
  const canonical = path === "/" ? SITE_URL + "/" : SITE_URL + path;
  const imageUrl = image ? absoluteAssetUrl(image) : `${SITE_URL}/og-image.png`;

  document.title = title;
  setMeta("description", description);
  if (keywords !== undefined) {
    setMeta("keywords", keywords);
  } else {
    removeMeta("keywords");
  }
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
  setMeta("og:type", ogType, "property");
  setMeta("og:url", canonical, "property");
  setMeta("og:image", imageUrl, "property");
  setMeta("og:image:width", "1200", "property");
  setMeta("og:image:height", "630", "property");
  setMeta("og:site_name", OG_SITE_NAME, "property");
  setMeta("og:locale", "en_US", "property");
  setArticleMeta("article:published_time", publishedTime);
  setArticleMeta("article:modified_time", modifiedTime);
  setArticleMeta("article:section", section);
  if (imageAlt) {
    setMeta("og:image:alt", imageAlt, "property");
    setMeta("twitter:image:alt", imageAlt);
  } else {
    removeMeta("og:image:alt", "property");
    removeMeta("twitter:image:alt");
  }
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", imageUrl);
  setJsonLd(jsonLd);
}
