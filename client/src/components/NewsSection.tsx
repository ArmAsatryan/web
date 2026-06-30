import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { AnimatedSection, StaggeredGrid } from "@/components/AnimatedSection";
import { useI18n } from "@/hooks/use-i18n";
import { fetchPublishedNews } from "@/lib/news-api";
import type { NewsItem } from "@shared/news-types";

const HOME_NEWS_LIMIT = 3;

export function NewsSection() {
  const { t } = useI18n();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPublishedNews(1, HOME_NEWS_LIMIT)
      .then((data) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="news" className="py-24 sm:py-32" data-testid="section-news">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            {t("news.title1")}{" "}
            <span className="text-primary">{t("news.title2")}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("news.subtitle")}
          </p>
        </AnimatedSection>

        {loading && (
          <p className="text-center text-muted-foreground">{t("news.loading")}</p>
        )}

        {!loading && error && (
          <p className="text-center text-muted-foreground">{t("news.loadError")}</p>
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

        <AnimatedSection className="mt-12 text-center" delay={0.15}>
          <Button variant="outline" size="lg" asChild className="group/btn">
            <Link href="/news">
              {t("news.viewAll")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
}
