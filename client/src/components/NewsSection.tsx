import { useCallback, useEffect, useState } from "react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchPublishedNews } from "@/lib/news-api";
import { HOME_NEWS_CAROUSEL_SIZE, sortNewsByDateDesc, type NewsItem } from "@shared/news-types";

function useCarouselIndex(api: CarouselApi | undefined) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setIndex(api.selectedScrollSnap());

    onSelect();
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return index;
}

function useCarouselVisibleSlides(api: CarouselApi | undefined) {
  const [visible, setVisible] = useState<number[]>([0]);

  useEffect(() => {
    if (!api) return;

    const update = () => setVisible(api.slidesInView());

    update();
    api.on("reInit", update);
    api.on("select", update);
    api.on("slidesInView", update);

    return () => {
      api.off("reInit", update);
      api.off("select", update);
      api.off("slidesInView", update);
    };
  }, [api]);

  return visible;
}

function shouldLoadCarouselImage(index: number, visible: number[]): boolean {
  if (visible.includes(index)) return true;
  return visible.some((slideIndex) => Math.abs(slideIndex - index) <= 1);
}

function NewsCarouselControls({
  api,
  itemCount,
  current,
  snapCount,
}: {
  api: CarouselApi | undefined;
  itemCount: number;
  current: number;
  snapCount: number;
}) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };

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

  const showDots = !isMobile && snapCount > 0 && snapCount <= 12;

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
          className={cn(navButtonClass, "hidden sm:inline-flex")}
          disabled={!canPrev}
          onClick={() => api?.scrollPrev()}
          aria-label="Previous news"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex min-w-[4.5rem] items-center justify-center gap-2 px-2">
          {showDots ? (
            Array.from({ length: snapCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "rounded-full",
                  index === current
                    ? "h-2.5 w-8 bg-primary"
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
          className={cn(navButtonClass, "hidden sm:inline-flex")}
          disabled={!canNext}
          onClick={() => api?.scrollNext()}
          aria-label="Next news"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground sm:hidden">{t("news.swipeHint")}</p>
    </div>
  );
}

export function NewsSection() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [snapCount, setSnapCount] = useState(0);
  const selectedIndex = useCarouselIndex(carouselApi);
  const visibleSlides = useCarouselVisibleSlides(carouselApi);

  const handleSetApi = useCallback((api: CarouselApi) => {
    setCarouselApi(api);
    setSnapCount(api.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const onReInit = () => setSnapCount(carouselApi.scrollSnapList().length);
    carouselApi.on("reInit", onReInit);
    return () => carouselApi.off("reInit", onReInit);
  }, [carouselApi]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPublishedNews(1, HOME_NEWS_CAROUSEL_SIZE)
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

  const imageLoadRadius = isMobile ? 1 : 2;

  const shouldLoadImage = (index: number) => {
    if (shouldLoadCarouselImage(index, visibleSlides)) return true;
    return Math.abs(index - selectedIndex) <= imageLoadRadius;
  };

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
          <div className="relative mx-auto w-full max-w-6xl">
            <Carousel
              setApi={handleSetApi}
              opts={{
                align: "start",
                loop: items.length > 1 && items.length <= 6,
                dragFree: false,
                containScroll: "trimSnaps",
                breakpoints: {
                  "(max-width: 767px)": {
                    align: "center",
                    loop: false,
                  },
                },
              }}
              className="w-full touch-manipulation"
            >
              <CarouselContent className="-ml-4 md:-ml-5">
                {items.map((item, index) => {
                  const distance = Math.abs(index - selectedIndex);

                  return (
                    <CarouselItem
                      key={item.id}
                      className="select-none pl-4 md:pl-5 basis-[88%] sm:basis-full md:basis-1/2 lg:basis-1/3"
                      style={
                        distance > (isMobile ? 3 : 5)
                          ? {
                              contentVisibility: "auto",
                              containIntrinsicSize: "0 420px",
                            }
                          : undefined
                      }
                    >
                      <NewsCard
                        item={item}
                        compact
                        loadImage={shouldLoadImage(index)}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
            </Carousel>

            <NewsCarouselControls
              api={carouselApi}
              itemCount={items.length}
              current={selectedIndex}
              snapCount={snapCount}
            />
          </div>
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
