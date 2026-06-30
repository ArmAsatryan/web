import type { NewsItem, NewsPageResponse } from "@shared/news-types";

function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const fromMarketing = import.meta.env.VITE_MARKETING_SITE_PUBLIC_URL?.replace(
    /\/admin\/api\/marketing-site\/public\/?$/,
    "",
  );
  if (fromMarketing) return fromMarketing.replace(/\/+$/, "");

  // Local dev: BallisticBE runs on 8080 (see admin-console README).
  if (import.meta.env.DEV) return "http://localhost:8080";

  return "https://api.ballistiq.xyz";
}

const API_BASE = resolveApiBase();
const NEWS_PUBLIC_URL = `${API_BASE}/admin/api/news/public`;

export async function fetchPublishedNews(page = 1, size = 20): Promise<NewsPageResponse> {
  const url = new URL(NEWS_PUBLIC_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  const res = await fetch(url.toString(), { credentials: "omit" });
  if (!res.ok) {
    throw new Error(`Failed to load news (${res.status})`);
  }
  return res.json() as Promise<NewsPageResponse>;
}

export async function fetchPublishedNewsBySlug(slug: string): Promise<NewsItem> {
  const res = await fetch(`${NEWS_PUBLIC_URL}/${encodeURIComponent(slug)}`, {
    credentials: "omit",
  });
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!res.ok) {
    throw new Error(`Failed to load news (${res.status})`);
  }
  return res.json() as Promise<NewsItem>;
}
