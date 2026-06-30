/** Shared news types for the public site and admin console. */

export type NewsStatus = "DRAFT" | "PUBLISHED";

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  status?: NewsStatus;
  publishedAt?: string | null;
  created: string;
  updated?: string | null;
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

/** Characters shown on list cards before "Read more". */
export const NEWS_EXCERPT_LENGTH = 220;

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

export function formatNewsDate(iso: string | null | undefined, locale?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
