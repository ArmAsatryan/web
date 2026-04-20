/**
 * Minimal Worker + static assets so `wrangler deploy` works (Cloudflare Workers build).
 * Serves files from [assets]; on 404, returns the correct SPA shell for /admin-console/* vs /.
 */
interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const method = request.method;
    if (method !== "GET" && method !== "HEAD") {
      return env.ASSETS.fetch(request);
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

    return env.ASSETS.fetch(new Request(`${origin}/index.html`, request));
  },
};
