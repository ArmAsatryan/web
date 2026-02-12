import { reviews } from "@/data/siteContent";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { AnimatedSection, StaggeredGrid } from "./AnimatedSection";

export function ReviewsSection() {
  const { t } = useI18n();

  return (
    <section id="reviews" className="py-24 sm:py-32" data-testid="section-reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("reviews.title1")}{" "}
            <span className="text-primary">{t("reviews.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("reviews.subtitle")}
          </p>
        </AnimatedSection>

        <StaggeredGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <Card
              key={i}
              className="p-6 glass-card"
              data-testid={`card-review-${i}`}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${
                      j < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                &ldquo;{review.text}&rdquo;
              </p>
              <div>
                <p className="text-foreground font-semibold text-sm">{review.name}</p>
                <p className="text-muted-foreground/60 text-xs">{review.handle}</p>
              </div>
            </Card>
          ))}
        </StaggeredGrid>
      </div>
    </section>
  );
}