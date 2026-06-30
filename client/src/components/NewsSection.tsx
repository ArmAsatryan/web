import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { AnimatedSection } from "@/components/AnimatedSection";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/use-i18n";
import { fetchPublishedNews } from "@/lib/news-api";
import { sortNewsByDateDesc, type NewsItem } from "@shared/news-types";

/** Max items loaded for the home page carousel (newest first). */
const HOME_NEWS_FETCH_SIZE = 50;

function NewsCarouselControls({ api, itemCount }: { api: CarouselApi | undefined; itemCount: number }) {
  const [current, setCurrent] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };

    setSnapCount(api.scrollSnapList().length);
    onSelect();
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  if (itemCount <= 1) return null;

  const navButtonClass =
    "h-11 w-11 shrink-0 rounded-full border border-primary/25 bg-background/80 text-foreground shadow-md shadow-primary/10 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35";

  return (
    <div
      className="mt-8 flex flex-col items-center gap-4 sm:mt-10"
      data-testid="news-carousel-controls"
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={navButtonClass}
          disabled={!canPrev}
          onClick={() => api?.scrollPrev()}
          aria-label="Previous news"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex min-w-[4.5rem] items-center justify-center gap-2 px-2">
          {snapCount > 0 && snapCount <= 12 ? (
            Array.from({ length: snapCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  index === current
                    ? "h-2.5 w-8 bg-primary shadow-sm shadow-primary/30"
                    : "h-2.5 w-2.5 bg-muted-foreground/25 hover:bg-primary/40",
                )}
              />
            ))
          ) : (
            <span className="text-sm tabular-nums text-muted-foreground">
              {current + 1} / {snapCount || itemCount}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={navButtonClass}
          disabled={!canNext}
          onClick={() => api?.scrollNext()}
          aria-label="Next news"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export function NewsSection() {
  const { t } = useI18n();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

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
          <AnimatedSection>
            <div className="relative mx-auto w-full max-w-6xl">
              <Carousel
                setApi={setCarouselApi}
                opts={{
                  align: "start",
                  loop: items.length > 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 md:-ml-5">
                  {items.map((item) => (
                    <CarouselItem
                      key={item.id}
                      className="pl-4 md:pl-5 basis-full md:basis-1/2 lg:basis-1/3"
                    >
                      <NewsCard item={item} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              <NewsCarouselControls api={carouselApi} itemCount={items.length} />
            </div>
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
