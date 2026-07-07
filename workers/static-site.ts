/**
 * Minimal Worker + static assets so `wrangler deploy` works (Cloudflare Workers build).
 * Serves files from [assets]; on 404, returns the correct SPA shell for /admin-console/* vs /.
 */
import {
  fetchPublishedNewsListForSeo,
  injectCrawlerSocialMetaForPath,
  renderMarketingSitemapXml,
} from "../shared/news-seo";
import { resolvePublicSiteUrl } from "../shared/marketing-seo";

interface Env {
  ASSETS: Fetcher;
}

async function htmlResponseWithOg(
  source: Response,
  pathname: string,
): Promise<Response> {
  if (source.status !== 200) {
    return source;
  }
  const html = await source.text();
  if (!html) {
    return source;
  }
  const injected = await injectCrawlerSocialMetaForPath(html, pathname);
  const headers = new Headers(source.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.delete("Content-Length");
  return new Response(injected, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const method = request.method;
    if (method !== "GET" && method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/sitemap.xml") {
      try {
        const siteUrl = resolvePublicSiteUrl();
        const newsItems = await fetchPublishedNewsListForSeo();
        const xml = renderMarketingSitemapXml(siteUrl, newsItems);
        return new Response(xml, {
          status: 200,
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      } catch {
        return new Response(renderMarketingSitemapXml(), {
          status: 200,
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      }
    }

    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) {
      return res;
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const origin = url.origin;

    if (path === "/admin-console" || path.startsWith("/admin-console/")) {
      const adminIndex = new Request(`${origin}/admin-console/index.html`, request);
      const adminRes = await env.ASSETS.fetch(adminIndex);
      if (adminRes.status === 200 || adminRes.status === 304) {
        return adminRes;
      }
    }

    const mainIndex = new Request(`${origin}/index.html`, request);
    const mainRes = await env.ASSETS.fetch(mainIndex);
    return htmlResponseWithOg(mainRes, path);
  },
};
