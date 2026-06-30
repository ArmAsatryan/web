/** Shared news types for the public site and admin console. */

export type NewsStatus = "DRAFT" | "PUBLISHED";

/** Backend may send ISO strings or Jackson LocalDateTime arrays. */
export type NewsDateValue = string | number | number[];

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  status?: NewsStatus;
  publishedAt?: NewsDateValue | null;
  created: NewsDateValue;
  updated?: NewsDateValue | null;
}

export interface NewsPageResponse {
  items: NewsItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface NewsCreateRequest {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface NewsUpdateRequest {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface NewsLinkedInImportRequest {
  url: string;
}

export interface NewsLinkedInImportResponse {
  title: string;
  content: string;
  imageUrl?: string | null;
  sourceUrl: string;
}

/** Characters shown on list cards before "Read more". */
export const NEWS_EXCERPT_LENGTH = 220;

/** Shorter excerpt for home carousel cards (especially on mobile). */
export const NEWS_CAROUSEL_EXCERPT_LENGTH = 100;

/** Home page carousel fetch size — keep small for fast mobile load. */
export const HOME_NEWS_CAROUSEL_SIZE = 12;

export function newsExcerpt(content: string, maxLength = NEWS_EXCERPT_LENGTH): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trim()}…`;
}

export function newsNeedsReadMore(content: string, maxLength = NEWS_EXCERPT_LENGTH): boolean {
  return content.trim().length > maxLength;
}

/** Published date when set, otherwise created date. */
export function newsDisplayDateValue(item: Pick<NewsItem, "publishedAt" | "created">): NewsDateValue | null | undefined {
  return item.publishedAt ?? item.created;
}

export function parseNewsDate(value: NewsDateValue | null | undefined): Date | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    const date = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const s = String(value).trim();
  if (!s || s === "[object Object]") return null;
  const space = s.indexOf(" ");
  let iso = s;
  if (space > 0) {
    iso = `${s.slice(0, space)}T${s.slice(space + 1)}`;
  }
  const fracMatch = iso.match(/(\.\d{3})\d*/);
  if (fracMatch) iso = iso.replace(/(\.\d{3})\d*/, fracMatch[1]!);
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatNewsDate(value: NewsDateValue | null | undefined, locale?: string): string {
  const d = parseNewsDate(value);
  if (!d) return "";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function sortNewsByDateDesc(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    const ta = parseNewsDate(newsDisplayDateValue(a))?.getTime() ?? 0;
    const tb = parseNewsDate(newsDisplayDateValue(b))?.getTime() ?? 0;
    return tb - ta;
  });
}
