import { reviews } from "@/data/siteContent";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 sm:py-32" data-testid="section-reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What Shooters <span className="text-[rgb(0,151,178)]">Say</span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Trusted by precision shooters, hunters, and professionals worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <Card
              key={i}
              className="p-6 bg-card border-card-border"
              data-testid={`card-review-${i}`}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${
                      j < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                &ldquo;{review.text}&rdquo;
              </p>
              <div>
                <p className="text-white font-semibold text-sm">{review.name}</p>
                <p className="text-white/40 text-xs">{review.handle}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}