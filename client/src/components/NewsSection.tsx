import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useI18n } from "@/hooks/use-i18n";
import { fetchPublishedNews } from "@/lib/news-api";
import { sortNewsByDateDesc, type NewsItem } from "@shared/news-types";

/** Max items loaded for the home page carousel (newest first). */
const HOME_NEWS_FETCH_SIZE = 50;

export function NewsSection() {
  const { t } = useI18n();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPublishedNews(1, HOME_NEWS_FETCH_SIZE)
      .then((data) => {
        if (!cancelled) setItems(sortNewsByDateDesc(data.items ?? []));
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
        <AnimatedSection className="mb-12 text-center sm:mb-16">
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
          <AnimatedSection className="px-8 sm:px-12">
            <Carousel
              opts={{
                align: "start",
                loop: items.length > 1,
              }}
              className="mx-auto w-full max-w-6xl"
            >
              <CarouselContent className="-ml-4">
                {items.map((item) => (
                  <CarouselItem
                    key={item.id}
                    className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <NewsCard item={item} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {items.length > 1 && (
                <>
                  <CarouselPrevious
                    variant="outline"
                    className="left-0 top-[calc(50%-1rem)] h-10 w-10 border-border/60 bg-background/90 backdrop-blur-sm sm:-left-4"
                  />
                  <CarouselNext
                    variant="outline"
                    className="right-0 top-[calc(50%-1rem)] h-10 w-10 border-border/60 bg-background/90 backdrop-blur-sm sm:-right-4"
                  />
                </>
              )}
            </Carousel>
          </AnimatedSection>
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
