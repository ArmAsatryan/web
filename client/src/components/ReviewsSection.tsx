import { reviews, ratingDistribution, ratingSummary } from "@/data/siteContent";
import { Star, ThumbsUp } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { AnimatedSection } from "./AnimatedSection";

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, j) => (
        <Star
          key={j}
          className={`${s} ${
            j < rating
              ? "text-[#FF9500] fill-[#FF9500]"
              : j < Math.ceil(rating)
                ? "text-[#FF9500] fill-[#FF9500]/50"
                : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

function RatingSummaryBlock() {
  const { t } = useI18n();
  const maxCount = Math.max(...ratingDistribution.map((r) => r.count));

  return (
    <div className="flex items-start gap-8" data-testid="rating-summary">
      <div className="text-center flex-shrink-0">
        <div className="text-6xl font-bold text-foreground leading-none">
          {ratingSummary.average}
        </div>
        <div className="text-muted-foreground text-xs mt-1">
          {t("reviews.outOf")}
        </div>
        <StarRating rating={Math.round(ratingSummary.average)} size="lg" />
        <div className="text-muted-foreground text-xs mt-2">
          {ratingSummary.total} {t("reviews.ratings")}
        </div>
      </div>

      <div className="flex-1 space-y-1.5 pt-1">
        {ratingDistribution.map((row) => (
          <div key={row.stars} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-3 text-right">
              {row.stars}
            </span>
            <Star className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
            <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-muted-foreground/50 rounded-full transition-all duration-500"
                style={{
                  width: maxCount > 0 ? `${(row.count / maxCount) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, index }: { review: typeof reviews[0]; index: number }) {
  return (
    <div
      className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-5 sm:p-6"
      data-testid={`card-review-${index}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <StarRating rating={review.rating} />
      </div>

      <h4 className="text-sm font-semibold text-foreground mb-2">
        {review.title}
      </h4>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground font-medium">
          {review.name}
        </span>
        <span className="text-xs text-muted-foreground/50">&middot;</span>
        <span className="text-xs text-muted-foreground/60">
          {review.date}
        </span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {review.text}
      </p>

      <div className="flex items-center gap-1.5 mt-3">
        <ThumbsUp className="w-3 h-3 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/40">
          Helpful
        </span>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const { t } = useI18n();

  return (
    <section id="reviews" className="py-24 sm:py-32" data-testid="section-reviews">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("reviews.title1")}{" "}
            <span className="text-primary">{t("reviews.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("reviews.subtitle")}
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-2xl p-6 sm:p-8 mb-8">
            <RatingSummaryBlock />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
