/**
 * Marketing site SEO / Open Graph copy shared by the SPA (usePageMeta), static
 * index.html defaults, and server-side HTML injection for social crawlers.
 */

export const DEFAULT_SITE_URL = "https://ballistiq.xyz";

export const OG_SITE_NAME = "BALLISTiQ";
export const OG_IMAGE_PATH = "/og-image.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Natural-language meta description (primary SEO signal; avoid raw keyword lists). */
export const HOME_PAGE_TITLE =
  "BALLISTiQ | Ballistic Calculator App — Bullet Drop, Trajectory & Long Range Shooting";

export const HOME_PAGE_DESCRIPTION =
  "BALLISTiQ is a ballistic calculator and ballistics app for precision shooting: bullet drop, trajectory, long-range rifle solutions, and sniper-style firing solutions—offline on iOS & Android. Shooting calculator with ammo data and reticles; rimfire to precision rifle.";

export const HOME_PAGE_KEYWORDS = [
  "app for shooters",
  "ballistic app",
  "ballistic calculator",
  "ballistic calculator app",
  "ballistics",
  "ballistics app",
  "bullet drop calculator",
  "bullet trajectory calculator",
  "long range shooting",
  "long range shooting calculator",
  "precision rifle",
  "precision shooting",
  "rimfire",
  "rifle ballistic calculator",
  "shooting calculator",
  "sniper app",
  "sniper ballistic calculator",
  "trajectory calculator",
].join(", ");

export const HOME_OG_IMAGE_ALT =
  "BALLISTiQ ballistic calculator and ballistics app for precision shooting, bullet drop, and long-range trajectory";

export interface CrawlerPageMeta {
  title: string;
  description: string;
  /** Path segment only, e.g. "/privacy-policy". */
  path: string;
  index?: boolean;
  keywords?: string;
  image?: string;
  imageAlt?: string;
}

export const PRIVACY_POLICY_PAGE_META: CrawlerPageMeta = {
  title: "Privacy Policy | BALLISTiQ",
  description:
    "BALLISTiQ Privacy Policy: how we collect, use, and protect your information when you use our ballistic calculator app.",
  path: "/privacy-policy",
};

export const TERMS_OF_SERVICE_PAGE_META: CrawlerPageMeta = {
  title: "Terms of Service | BALLISTiQ",
  description:
    "Terms and conditions for using BALLISTiQ ballistic calculator and sniper assistant app. Service description and user responsibilities.",
  path: "/terms-of-service",
};

export function resolvePublicSiteUrl(): string {
  if (typeof process !== "undefined" && process.env?.VITE_SITE_URL) {
    return String(process.env.VITE_SITE_URL).replace(/\/+$/, "");
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) {
    return String(import.meta.env.VITE_SITE_URL).replace(/\/+$/, "");
  }
  return DEFAULT_SITE_URL;
}

export function normalizeMarketingPathname(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function getCrawlerPageMeta(pathname: string): CrawlerPageMeta | null {
  const p = normalizeMarketingPathname(pathname);
  if (p === "/") {
    return {
      title: HOME_PAGE_TITLE,
      description: HOME_PAGE_DESCRIPTION,
      path: "/",
      keywords: HOME_PAGE_KEYWORDS,
      imageAlt: HOME_OG_IMAGE_ALT,
      index: true,
    };
  }
  if (p === "/privacy-policy") return PRIVACY_POLICY_PAGE_META;
  if (p === "/terms-of-service") return TERMS_OF_SERVICE_PAGE_META;
  return null;
}

export function escapeHtmlAttributeValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function absoluteImageUrl(siteUrl: string, meta: CrawlerPageMeta): string {
  if (meta.image) {
    return meta.image.startsWith("http://") || meta.image.startsWith("https://")
      ? meta.image
      : `${siteUrl}${meta.image.startsWith("/") ? "" : "/"}${meta.image}`;
  }
  return `${siteUrl}${OG_IMAGE_PATH}`;
}

function canonicalUrl(siteUrl: string, meta: CrawlerPageMeta): string {
  return meta.path === "/" ? `${siteUrl}/` : `${siteUrl}${meta.path}`;
}

/**
 * HTML fragment for document head: title, description, canonical, robots, Open Graph, Twitter.
 * Used by SPA shell injection for link-preview crawlers.
 */
export function renderCrawlerSocialHeadHtml(siteUrl: string, meta: CrawlerPageMeta): string {
  const canonical = canonicalUrl(siteUrl, meta);
  const imageUrl = absoluteImageUrl(siteUrl, meta);
  const index = meta.index !== false;
  const robots = index ? "index, follow" : "noindex, nofollow";
  const imageAlt = meta.imageAlt ?? HOME_OG_IMAGE_ALT;
  const et = escapeHtmlAttributeValue;

  const keywordsLine =
    meta.keywords !== undefined
      ? `    <meta name="keywords" content="${et(meta.keywords)}" />\n`
      : "";

  return `    <title>${et(meta.title)}</title>
    <meta name="description" content="${et(meta.description)}" />
${keywordsLine}    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${et(canonical)}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${et(meta.title)}" />
    <meta property="og:description" content="${et(meta.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${et(canonical)}" />
    <meta property="og:image" content="${et(imageUrl)}" />
    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
    <meta property="og:image:alt" content="${et(imageAlt)}" />
    <meta property="og:site_name" content="${et(OG_SITE_NAME)}" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${et(meta.title)}" />
    <meta name="twitter:description" content="${et(meta.description)}" />
    <meta name="twitter:image" content="${et(imageUrl)}" />
    <meta name="twitter:image:alt" content="${et(imageAlt)}" />
`;
}

const CRAWLER_HEAD_MARKER =
  /<!--\s*app:crawler-social-meta\s*-->[\s\S]*?<!--\s*\/app:crawler-social-meta\s*-->/;

export function injectCrawlerSocialMetaIntoHtml(
  html: string,
  pathname: string,
  siteUrl?: string,
): string {
  const base = siteUrl ?? resolvePublicSiteUrl();
  const meta = getCrawlerPageMeta(pathname);
  if (!meta) return html;
  const block = `<!-- app:crawler-social-meta -->\n${renderCrawlerSocialHeadHtml(base, meta)}    <!-- /app:crawler-social-meta -->`;
  if (!CRAWLER_HEAD_MARKER.test(html)) return html;
  return html.replace(CRAWLER_HEAD_MARKER, block);
}
