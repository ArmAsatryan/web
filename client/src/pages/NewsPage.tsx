import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Newspaper } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageBackground } from "@/components/PageBackground";
import { ScrollProgress } from "@/components/ScrollProgress";
import { AnimatedSection, StaggeredGrid } from "@/components/AnimatedSection";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { NEWS_PAGE_META } from "@shared/marketing-seo";
import { usePageMeta } from "@/hooks/use-page-meta";
import { useI18n } from "@/hooks/use-i18n";
import { fetchPublishedNews } from "@/lib/news-api";
import { sortNewsByDateDesc, type NewsItem } from "@shared/news-types";

export function NewsPage() {
  usePageMeta(NEWS_PAGE_META);
  const { t } = useI18n();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPublishedNews(1, 50)
      .then((data) => {
        if (!cancelled) setItems(sortNewsByDateDesc(data.items));
      })
      .catch(() => {
        if (!cancelled) setError(t("news.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <PageBackground />
      <ScrollProgress />
      <div className="relative z-10">
        <Navbar />
        <main className="pb-24 pt-24 sm:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("news.backHome")}
            </Link>

            <AnimatedSection className="mb-12 text-center sm:mb-16">
              <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                <Newspaper className="h-7 w-7 text-primary" aria-hidden />
              </div>
              <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                {t("news.title1")}{" "}
                <span className="text-primary">{t("news.title2")}</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {t("news.subtitle")}
              </p>
            </AnimatedSection>

            {loading && (
              <p className="text-center text-muted-foreground">{t("news.loading")}</p>
            )}

            {error && (
              <div className="mx-auto max-w-lg text-center">
                <p className="mb-4 text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  {t("news.retry")}
                </Button>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <p className="text-center text-muted-foreground">{t("news.empty")}</p>
            )}

            {!loading && !error && items.length > 0 && (
              <StaggeredGrid className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </StaggeredGrid>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
