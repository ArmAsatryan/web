/**
 * News page SEO: meta copy, JSON-LD, sitemap, and server-side article resolution for crawlers.
 */

import {
  OG_IMAGE_PATH,
  OG_SITE_NAME,
  escapeHtmlAttributeValue,
  resolvePublicSiteUrl,
  type CrawlerPageMeta,
} from "./marketing-seo";
import {
  newsDisplayDateValue,
  newsExcerpt,
  parseNewsDate,
  type NewsDateValue,
  type NewsItem,
} from "./news-types";

export const SEO_META_DESCRIPTION_LENGTH = 155;

export const NEWS_PAGE_KEYWORDS = [
  "BALLISTiQ news",
  "ballistic calculator updates",
  "ballistics app news",
  "precision shooting news",
  "long range shooting updates",
  "rifle ballistic calculator",
  "shooting app releases",
].join(", ");

export const NEWS_PAGE_META: CrawlerPageMeta = {
  title: "News & Updates | BALLISTiQ Ballistic Calculator",
  description:
    "Latest BALLISTiQ news and product updates for precision shooters: ballistic calculator features, app releases, long-range shooting tools, and company announcements.",
  path: "/news",
  keywords: NEWS_PAGE_KEYWORDS,
  imageAlt: "BALLISTiQ news and updates for ballistic calculator and precision shooting",
  index: true,
};

export function newsSeoDescription(content: string): string {
  return newsExcerpt(content, SEO_META_DESCRIPTION_LENGTH);
}

export function newsDetailPageTitle(title: string): string {
  const suffix = " | BALLISTiQ";
  const maxTitleLen = 60 - suffix.length;
  const trimmed = title.trim();
  if (trimmed.length <= maxTitleLen) return `${trimmed}${suffix}`;
  return `${trimmed.slice(0, maxTitleLen - 1).trim()}…${suffix}`;
}

export function newsDetailImageAlt(title: string): string {
  return `${title.trim()} — BALLISTiQ news`;
}

function toIsoDate(value: NewsDateValue | null | undefined): string | undefined {
  const parsed = parseNewsDate(value);
  return parsed ? parsed.toISOString() : undefined;
}

export function newsDetailPageMeta(
  item: Pick<NewsItem, "title" | "content" | "slug" | "imageUrl" | "publishedAt" | "created" | "updated">,
): CrawlerPageMeta {
  const displayDate = newsDisplayDateValue(item);
  return {
    title: newsDetailPageTitle(item.title),
    description: newsSeoDescription(item.content),
    path: `/news/${item.slug}`,
    image: item.imageUrl ?? undefined,
    imageAlt: newsDetailImageAlt(item.title),
    ogType: "article",
    publishedTime: toIsoDate(displayDate),
    modifiedTime: toIsoDate(item.updated ?? displayDate),
    section: "News",
    index: true,
  };
}

export function newsNotFoundPageMeta(slug: string): CrawlerPageMeta {
  return {
    title: "Article Not Found | BALLISTiQ",
    description: "This BALLISTiQ news article could not be found. Browse the latest ballistic calculator updates and announcements.",
    path: `/news/${slug}`,
    index: false,
  };
}

export function extractNewsSlugFromPath(pathname: string): string | null {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  if (!trimmed.startsWith("/news/")) return null;
  const slug = trimmed.slice("/news/".length);
  if (!slug || slug.includes("/")) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function resolveNewsApiBase(): string {
  if (typeof process !== "undefined") {
    const fromEnv =
      process.env.VITE_API_BASE_URL?.trim() ||
      process.env.API_BASE_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/+$/, "");
  }
  return "https://api.ballistiq.xyz";
}

export async function fetchPublishedNewsBySlugForSeo(slug: string): Promise<NewsItem | null> {
  const url = `${resolveNewsApiBase()}/admin/api/news/public/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as NewsItem;
  } catch {
    return null;
  }
}

export async function fetchPublishedNewsListForSeo(size = 500): Promise<NewsItem[]> {
  const url = new URL(`${resolveNewsApiBase()}/admin/api/news/public`);
  url.searchParams.set("page", "1");
  url.searchParams.set("size", String(size));
  try {
    const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: NewsItem[] };
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function resolveCrawlerPageMetaForPath(pathname: string): Promise<CrawlerPageMeta | null> {
  const slug = extractNewsSlugFromPath(pathname);
  if (slug) {
    const item = await fetchPublishedNewsBySlugForSeo(slug);
    if (item) return newsDetailPageMeta(item);
    return newsNotFoundPageMeta(slug);
  }

  const { getCrawlerPageMeta } = await import("./marketing-seo");
  return getCrawlerPageMeta(pathname);
}

export async function injectCrawlerSocialMetaForPath(
  html: string,
  pathname: string,
  siteUrl?: string,
): Promise<string> {
  const meta = await resolveCrawlerPageMetaForPath(pathname);
  const { injectCrawlerSocialMetaIntoHtml } = await import("./marketing-seo");
  return injectCrawlerSocialMetaIntoHtml(html, pathname, siteUrl, meta);
}

function absolutePublicUrl(siteUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function organizationPublisher(siteUrl: string) {
  return {
    "@type": "Organization",
    name: OG_SITE_NAME,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}${OG_IMAGE_PATH}`,
    },
  };
}

export function buildNewsBreadcrumbJsonLd(
  slug: string | null,
  title: string | null,
  siteUrl: string = resolvePublicSiteUrl(),
): object {
  const items: Array<{ "@type": "ListItem"; position: number; name: string; item?: string }> = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "News", item: `${siteUrl}/news` },
  ];
  if (slug && title) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: title,
      item: `${siteUrl}/news/${slug}`,
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

export function buildNewsArticleJsonLd(
  item: Pick<NewsItem, "title" | "content" | "slug" | "imageUrl" | "publishedAt" | "created" | "updated">,
  siteUrl: string = resolvePublicSiteUrl(),
): object {
  const displayDate = newsDisplayDateValue(item);
  const published = toIsoDate(displayDate);
  const modified = toIsoDate(item.updated ?? displayDate);
  const canonical = `${siteUrl}/news/${item.slug}`;
  const images = item.imageUrl
    ? [absolutePublicUrl(siteUrl, item.imageUrl)]
    : [`${siteUrl}${OG_IMAGE_PATH}`];

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    description: newsSeoDescription(item.content),
    image: images,
    datePublished: published,
    dateModified: modified,
    author: organizationPublisher(siteUrl),
    publisher: organizationPublisher(siteUrl),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    url: canonical,
    isPartOf: {
      "@type": "WebSite",
      name: OG_SITE_NAME,
      url: siteUrl,
    },
  };
}

export function buildNewsListJsonLd(
  items: NewsItem[],
  siteUrl: string = resolvePublicSiteUrl(),
): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: NEWS_PAGE_META.title,
    description: NEWS_PAGE_META.description,
    url: `${siteUrl}/news`,
    isPartOf: {
      "@type": "WebSite",
      name: OG_SITE_NAME,
      url: siteUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/news/${item.slug}`,
        name: item.title,
      })),
    },
  };
}

function formatSitemapLastmod(value: NewsDateValue | null | undefined): string | undefined {
  const parsed = parseNewsDate(value);
  if (!parsed) return undefined;
  return parsed.toISOString().slice(0, 10);
}

const STATIC_SITEMAP_ENTRIES: Array<{
  path: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
}> = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: "2026-02-12" },
  { path: "/privacy-policy", changefreq: "monthly", priority: "0.5", lastmod: "2026-02-12" },
  { path: "/terms-of-service", changefreq: "monthly", priority: "0.5", lastmod: "2026-02-12" },
  { path: "/news", changefreq: "weekly", priority: "0.8" },
];

export function renderMarketingSitemapXml(
  siteUrl: string = resolvePublicSiteUrl(),
  newsItems: NewsItem[] = [],
): string {
  const urls: string[] = [];

  for (const entry of STATIC_SITEMAP_ENTRIES) {
    const loc = entry.path === "/" ? `${siteUrl}/` : `${siteUrl}${entry.path}`;
    const lastmodLine = entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : "";
    urls.push(`  <url>
    <loc>${escapeHtmlAttributeValue(loc)}</loc>${lastmodLine}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`);
  }

  for (const item of newsItems) {
    const loc = `${siteUrl}/news/${encodeURIComponent(item.slug)}`;
    const lastmod = formatSitemapLastmod(item.updated ?? newsDisplayDateValue(item));
    const lastmodLine = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
    urls.push(`  <url>
    <loc>${escapeHtmlAttributeValue(loc)}</loc>${lastmodLine}
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
