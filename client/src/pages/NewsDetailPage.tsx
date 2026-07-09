import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageBackground } from "@/components/PageBackground";
import { ScrollProgress } from "@/components/ScrollProgress";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import {
  buildNewsArticleJsonLd,
  buildNewsBreadcrumbJsonLd,
  newsDetailImageAlt,
  newsDetailPageMeta,
  newsNotFoundPageMeta,
  NEWS_PAGE_META,
} from "@shared/news-seo";
import { usePageMeta } from "@/hooks/use-page-meta";
import { SITE_URL } from "@/lib/seo";
import { useI18n } from "@/hooks/use-i18n";
import { fetchPublishedNewsBySlug } from "@/lib/news-api";
import { formatNewsDate, newsDisplayDateValue, parseNewsDate, type NewsItem } from "@shared/news-types";

export function NewsDetailPage() {
  const [, params] = useRoute("/news/:slug");
  const slug = params?.slug ?? "";
  const { t, locale } = useI18n();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageMeta = useMemo(() => {
    if (notFound) return newsNotFoundPageMeta(slug);
    if (item) return newsDetailPageMeta(item);
    return NEWS_PAGE_META;
  }, [item, notFound, slug]);

  const jsonLd = useMemo(() => {
    if (!item) return undefined;
    return [
      buildNewsArticleJsonLd(item, SITE_URL),
      buildNewsBreadcrumbJsonLd(item.slug, item.title, SITE_URL),
    ];
  }, [item]);

  usePageMeta({ ...pageMeta, jsonLd });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);
    fetchPublishedNewsBySlug(slug)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        if (e.message === "NOT_FOUND") {
          setNotFound(true);
        } else {
          setError(t("news.loadError"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, t]);

  const dateLabel = item
    ? formatNewsDate(newsDisplayDateValue(item), locale)
    : "";
  const dateTimeAttr = item
    ? parseNewsDate(newsDisplayDateValue(item))?.toISOString()
    : undefined;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PageBackground />
      <ScrollProgress />
      <div className="relative z-10">
        <Navbar />
        <main className="pb-24 pt-24 sm:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/news"
              className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("news.backToList")}
            </Link>

            {loading && (
              <p className="text-center text-muted-foreground">{t("news.loading")}</p>
            )}

            {notFound && (
              <div className="mx-auto max-w-lg text-center">
                <h1 className="mb-3 text-2xl font-bold">{t("news.notFoundTitle")}</h1>
                <p className="mb-6 text-muted-foreground">{t("news.notFoundBody")}</p>
                <Button variant="outline" asChild>
                  <Link href="/news">{t("news.backToList")}</Link>
                </Button>
              </div>
            )}

            {error && (
              <div className="mx-auto max-w-lg text-center">
                <p className="mb-4 text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  {t("news.retry")}
                </Button>
              </div>
            )}

            {!loading && !notFound && !error && item && (
              <AnimatedSection>
                <article className="mx-auto max-w-3xl" itemScope itemType="https://schema.org/NewsArticle">
                  {item.imageUrl && (
                    <div className="mb-8 overflow-hidden rounded-lg border border-border/50 bg-muted/20">
                      <img
                        src={item.imageUrl}
                        alt={newsDetailImageAlt(item.title)}
                        itemProp="image"
                        className="h-auto w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
                    {dateTimeAttr ? (
                      <time dateTime={dateTimeAttr} itemProp="datePublished">
                        {dateLabel}
                      </time>
                    ) : (
                      <span>{dateLabel}</span>
                    )}
                  </div>

                  <h1 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl" itemProp="headline">
                    {item.title}
                  </h1>

                  <div
                    className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground sm:text-lg"
                    itemProp="articleBody"
                  >
                    {item.content}
                  </div>
                </article>
              </AnimatedSection>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
