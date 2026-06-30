import { Link } from "wouter";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  formatNewsDate,
  newsDisplayDateValue,
  newsExcerpt,
  newsNeedsReadMore,
  parseNewsDate,
  type NewsItem,
} from "@shared/news-types";
import { useI18n } from "@/hooks/use-i18n";

interface NewsCardProps {
  item: NewsItem;
  /** When true, show full content (detail page). */
  full?: boolean;
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

export function NewsCard({ item, full = false }: NewsCardProps) {
  const { t, locale } = useI18n();
  const showReadMore = !full && newsNeedsReadMore(item.content);
  const body = full ? item.content : newsExcerpt(item.content);

  return (
    <Card
      className="glass-card group overflow-hidden flex flex-col h-full"
      data-testid={`news-card-${item.slug}`}
    >
      {item.imageUrl && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/30">
          <img
            src={item.imageUrl}
            alt=""
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <NewsDateLine item={item} locale={locale} />

        <h2 className="mb-3 text-xl font-semibold text-foreground sm:text-2xl">
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

        <p className="flex-1 whitespace-pre-wrap text-muted-foreground leading-relaxed">
          {body}
        </p>

        {showReadMore && (
          <div className="mt-5 pt-2">
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
}
