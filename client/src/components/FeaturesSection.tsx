import * as LucideIcons from "lucide-react";
import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { useMarketingSitePayload } from "@/context/MarketingSiteContext";
import { pickLocalized } from "@/lib/localized-text";
import { AnimatedSection, StaggeredGrid } from "./AnimatedSection";

const icons = [
  LucideIcons.Crosshair,
  LucideIcons.Database,
  LucideIcons.Focus,
  LucideIcons.LayoutGrid,
  LucideIcons.Wind,
  LucideIcons.WifiOff,
];

export function FeaturesSection() {
  const { t, locale } = useI18n();
  const cms = useMarketingSitePayload();
  const cmsCards = cms?.featureCards?.length ? cms.featureCards : null;

  const resolveIcon = (name: string) => {
    const Cmp = (LucideIcons as unknown as Record<string, ComponentType<{ className?: string }>>)[name];
    return Cmp ?? LucideIcons.Crosshair;
  };

  return (
    <section
      id="features"
      className="relative pb-6 pt-24 sm:pb-8 sm:pt-32"
      data-testid="section-features"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            {t("features.title1")}{" "}
            <span className="text-primary">{t("features.title2")}</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("features.subtitle")}
          </p>
        </AnimatedSection>

        <StaggeredGrid className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cmsCards
            ? cmsCards.map((card, i) => {
                const Icon = resolveIcon(card.icon);
                return (
                  <Card
                    key={i}
                    className="group glass-card p-6"
                    data-testid={`card-feature-${i}`}
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-foreground">
                      {pickLocalized(card.title, locale)}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {pickLocalized(card.description, locale)}
                    </p>
                  </Card>
                );
              })
            : icons.map((Icon, i) => (
            <Card
              key={i}
              className="group glass-card p-6"
              data-testid={`card-feature-${i}`}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">
                {t(`features.${i}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`features.${i}.desc`)}
              </p>
            </Card>
          ))}
        </StaggeredGrid>
      </div>
    </section>
  );
}
