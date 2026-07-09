import { useCallback, useEffect, useRef, useState } from "react";
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

function NewsCarouselControls({
  api,
  itemCount,
  current,
  snapCount,
  onPrev,
  onNext,
  onGoTo,
}: {
  api?: CarouselApi;
  itemCount: number;
  current: number;
  snapCount: number;
  onPrev?: () => void;
  onNext?: () => void;
  onGoTo?: (index: number) => void;
}) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) {
      setCanPrev(current > 0);
      setCanNext(current < itemCount - 1);
      return;
    }

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
  }, [api, current, itemCount]);

  if (itemCount <= 1) return null;

  const navButtonClass =
    "h-11 w-11 shrink-0 rounded-full border border-primary/25 bg-background/80 text-foreground shadow-md shadow-primary/10 backdrop-blur-md transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35";

  const showDots = isMobile === false && snapCount > 0 && snapCount <= 12;
  const scrollPrev = () => (api ? api.scrollPrev() : onPrev?.());
  const scrollNext = () => (api ? api.scrollNext() : onNext?.());
  const scrollTo = (index: number) => (api ? api.scrollTo(index) : onGoTo?.(index));

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
          onClick={scrollPrev}
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
                onClick={() => scrollTo(index)}
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
          className={navButtonClass}
          disabled={!canNext}
          onClick={scrollNext}
          aria-label="Next news"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground sm:hidden">{t("news.swipeHint")}</p>
    </div>
  );
}

function MobileNewsScrollCarousel({ items }: { items: NewsItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [current, setCurrent] = useState(0);

  const updateIndexFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(center - slideCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    setCurrent(nearest);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateIndexFromScroll);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    updateIndexFromScroll();

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items.length, updateIndexFromScroll]);

  const scrollToIndex = useCallback((index: number) => {
    slideRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    scrollToIndex(Math.min(items.length - 1, Math.max(0, current + direction)));
  }, [current, items.length, scrollToIndex]);

  return (
    <>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        data-testid="news-mobile-scroll-carousel"
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            className="w-[88%] max-w-md shrink-0 snap-center"
          >
            <NewsCard item={item} loadImage={Math.abs(index - current) <= 1} />
          </div>
        ))}
      </div>

      <NewsCarouselControls
        itemCount={items.length}
        current={current}
        snapCount={items.length}
        onPrev={() => scrollByStep(-1)}
        onNext={() => scrollByStep(1)}
        onGoTo={scrollToIndex}
      />
    </>
  );
}

function DesktopNewsCarousel({ items }: { items: NewsItem[] }) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [snapCount, setSnapCount] = useState(0);
  const selectedIndex = useCarouselIndex(carouselApi);

  const handleSetApi = useCallback((api: CarouselApi | undefined) => {
    if (!api) return;
    setCarouselApi(api);
    setSnapCount(api.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;

    const onReInit = () => setSnapCount(carouselApi.scrollSnapList().length);
    carouselApi.on("reInit", onReInit);
    return () => {
      carouselApi.off("reInit", onReInit);
    };
  }, [carouselApi]);

  return (
    <>
      <Carousel
        setApi={handleSetApi}
        opts={{
          align: "start",
          loop: items.length > 1 && items.length <= 6,
          dragFree: false,
          containScroll: "trimSnaps",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-5">
          {items.map((item, index) => (
            <CarouselItem
              key={item.id}
              className="pl-4 md:pl-5 basis-full md:basis-1/2 lg:basis-1/3"
            >
              <NewsCard
                item={item}
                loadImage={Math.abs(index - selectedIndex) <= 2}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <NewsCarouselControls
        api={carouselApi}
        itemCount={items.length}
        current={selectedIndex}
        snapCount={snapCount}
      />
    </>
  );
}

export function NewsSection() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
            {isMobile !== false ? (
              <MobileNewsScrollCarousel items={items} />
            ) : (
              <DesktopNewsCarousel items={items} />
            )}
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
