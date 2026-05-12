export type MarketingLocale = "en" | "fr" | "it" | "es" | "hy";

export type LocalizedText = Partial<Record<MarketingLocale, string>>;

export interface MarketingHeroLines {
  title1?: string;
  title2?: string;
  subtitle?: string;
}

export interface MarketingFeatureCard {
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface MarketingPricingTier {
  highlighted: boolean;
  price: string;
  name: LocalizedText;
  perMonthLabel: LocalizedText;
}

export interface MarketingPricingFeatureRow {
  free: boolean;
  premium: boolean;
  label: LocalizedText;
}

export interface MarketingPricingBlock {
  tiers: MarketingPricingTier[];
  featureRows: MarketingPricingFeatureRow[];
}

export interface MarketingB2BCard {
  imageUrl: string;
  title: LocalizedText;
  description: LocalizedText;
}

export interface MarketingReviewItem {
  name: string;
  date: string;
  rating: number;
  title: LocalizedText;
  text: LocalizedText;
}

export interface MarketingReviewsBlock {
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
  items: MarketingReviewItem[];
}

export interface MarketingTeamMember {
  name: string;
  role: LocalizedText;
  imageUrl: string;
}

export interface MarketingSitePayload {
  version?: number;
  heroBackgroundImageUrl?: string | null;
  hero?: Partial<Record<MarketingLocale, MarketingHeroLines>>;
  featureCards?: MarketingFeatureCard[];
  pricing?: MarketingPricingBlock;
  b2bSectionBackgroundImageUrl?: string | null;
  b2bCards?: MarketingB2BCard[];
  reviews?: MarketingReviewsBlock;
  teamMembers?: MarketingTeamMember[];
}
