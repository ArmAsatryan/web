import { memo } from "react";
import { Link } from "wouter";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  formatNewsDate,
  newsDisplayDateValue,
  newsExcerpt,
  newsNeedsReadMore,
  NEWS_CAROUSEL_EXCERPT_LENGTH,
  NEWS_EXCERPT_LENGTH,
  parseNewsDate,
  type NewsItem,
} from "@shared/news-types";
import { useI18n } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  item: NewsItem;
  /** When true, show full content (detail page). */
  full?: boolean;
  /** Lighter styling for carousel slides (no blur/hover effects). */
  compact?: boolean;
  /** When false, skip loading the cover image (carousel lazy load). */
  loadImage?: boolean;
}

function NewsDateLine({
  item,
  locale,
  className = "mb-3 flex items-center gap-2 text-sm text-muted-foreground",
}: {
  item: NewsItem;
  locale?: string;
  className?: string;
}) {
  const displayDate = newsDisplayDateValue(item);
  const dateLabel = formatNewsDate(displayDate, locale);
  const dateTimeAttr = parseNewsDate(displayDate)?.toISOString();
  if (!dateLabel) return null;

  return (
    <div className={className}>
      <CalendarDays className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
      {dateTimeAttr ? (
        <time dateTime={dateTimeAttr}>{dateLabel}</time>
      ) : (
        <span>{dateLabel}</span>
      )}
    </div>
  );
}

export const NewsCard = memo(function NewsCard({
  item,
  full = false,
  compact = false,
  loadImage = true,
}: NewsCardProps) {
  const { t, locale } = useI18n();
  const excerptLength = compact ? NEWS_CAROUSEL_EXCERPT_LENGTH : NEWS_EXCERPT_LENGTH;
  const showReadMore = !full && newsNeedsReadMore(item.content, excerptLength);
  const body = full ? item.content : newsExcerpt(item.content, excerptLength);

  return (
    <Card
      className={cn(
        "group overflow-hidden flex flex-col h-full",
        compact ? "bg-card border border-border/50 shadow-sm" : "glass-card",
      )}
      data-testid={`news-card-${item.slug}`}
    >
      {item.imageUrl && (
        <div
          className={cn(
            "relative flex w-full items-center justify-center overflow-hidden bg-muted/30",
            compact ? "min-h-[9rem]" : "",
          )}
        >
          {loadImage ? (
            <img
              src={item.imageUrl}
              alt=""
              draggable={false}
              decoding="async"
              className={cn(
                "h-auto w-full object-contain",
                compact ? "max-h-52" : "max-h-[min(70vh,28rem)]",
                !compact && "transition-transform duration-500 group-hover:scale-[1.02]",
              )}
              loading="lazy"
            />
          ) : (
            <div
              className={cn("w-full bg-muted/40", compact ? "h-52" : "h-48")}
              aria-hidden
            />
          )}
        </div>
      )}

      <div className={cn("flex flex-1 flex-col", compact ? "p-4" : "p-5 sm:p-6")}>
        <NewsDateLine item={item} locale={locale} />

        <h2 className={cn("mb-3 font-semibold text-foreground", compact ? "text-lg" : "text-xl sm:text-2xl")}>
          {full ? (
            item.title
          ) : (
            <Link
              href={`/news/${item.slug}`}
              className="hover:text-primary transition-colors"
            >
              {item.title}
            </Link>
          )}
        </h2>

        <p className="flex-1 whitespace-pre-wrap text-muted-foreground leading-relaxed text-sm sm:text-base">
          {body}
        </p>

        {showReadMore && (
          <div className="mt-4 pt-1">
            <Button variant="outline" size="sm" asChild className="group/btn">
              <Link href={`/news/${item.slug}`}>
                {t("news.readMore")}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
});
