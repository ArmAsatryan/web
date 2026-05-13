import type { MarketingSitePayload } from '@shared/marketing-site-types';

/** English source strings aligned with the shipped marketing site (ballistiq.xyz). */
export function createInitialMarketingPayload(): MarketingSitePayload {
  return {
    version: 1,
    heroBackgroundImageUrl: '',
    hero: {
      en: {
        title1: 'Your Shooter',
        title2: 'Assistant',
        subtitle:
          'Precision ballistic calculator, comprehensive ammo database, and advanced shooting tools — all in one app.',
      },
    },
    featureCards: [
      {
        icon: 'Crosshair',
        title: { en: 'Ballistic Calculator' },
        description: {
          en:
            'Advanced trajectory computation engine with atmospheric corrections, Coriolis effect, spin drift, and more. Get precise firing solutions in real time.',
        },
      },
      {
        icon: 'Database',
        title: { en: 'Ammo Database' },
        description: {
          en:
            'Comprehensive ammunition library with detailed ballistic data for thousands of cartridges. Search, compare, and select with confidence.',
        },
      },
      {
        icon: 'Focus',
        title: { en: 'Reticle Database' },
        description: {
          en:
            'Extensive collection of reticle patterns with overlay visualization. Match your optic to your ammunition for perfect subtensions.',
        },
      },
      {
        icon: 'LayoutGrid',
        title: { en: 'BALLISTiQ Premium Mini-Apps' },
        description: {
          en:
            'Specialized tools including unit converters, wind calculators, range estimation, and target log. Everything a precision shooter needs.',
        },
      },
      {
        icon: 'Wind',
        title: { en: 'Kestrel Integration' },
        description: {
          en:
            'Seamless integration with Kestrel weather meters for live atmospheric data. Automatic environmental updates for maximum accuracy.',
        },
      },
      {
        icon: 'WifiOff',
        title: { en: 'Offline Ready' },
        description: {
          en:
            'Full functionality without internet connection. All calculations run locally on your device, ensuring reliability in the field.',
        },
      },
    ],
    pricing: {
      tiers: [
        {
          highlighted: true,
          price: '$3.99',
          name: { en: 'Monthly' },
          perMonthLabel: { en: '$3.99 / month' },
        },
        {
          highlighted: false,
          price: '$34.99',
          name: { en: 'Yearly' },
          perMonthLabel: { en: '$2.92 / month' },
        },
      ],
      featureRows: [
        { free: true, premium: true, label: { en: 'Ballistic Calculator' } },
        { free: true, premium: true, label: { en: 'Customizable Table' } },
        { free: true, premium: true, label: { en: 'Trajectory Validator' } },
        { free: false, premium: true, label: { en: 'Shot Timer' } },
        { free: false, premium: true, label: { en: 'Score Calculator' } },
        { free: false, premium: true, label: { en: 'WEATERmeter' } },
        { free: false, premium: true, label: { en: 'WEZ Analyzer' } },
        { free: false, premium: true, label: { en: 'Watch App' } },
        { free: false, premium: true, label: { en: 'Unit Convertor' } },
      ],
    },
    b2bSectionBackgroundImageUrl: '',
    b2bCards: [],
    reviews: {
      average: 4.8,
      total: 214,
      distribution: [
        { stars: 5, count: 48 },
        { stars: 4, count: 7 },
        { stars: 3, count: 2 },
        { stars: 2, count: 1 },
        { stars: 1, count: 0 },
      ],
      items: [
        {
          name: 'Mike R.',
          date: 'Dec 3, 2025',
          rating: 5,
          title: { en: 'Best ballistic calculator out there' },
          text: {
            en:
              "BALLISTiQ is hands down the best ballistic calculator I've used. The accuracy of the trajectory predictions is remarkable, and the Kestrel integration is a game-changer.",
          },
        },
        {
          name: 'David K.',
          date: 'Nov 28, 2025',
          rating: 5,
          title: { en: 'Works perfectly offline' },
          text: {
            en:
              'Finally a ballistic app that works offline in the field. The ammo database is comprehensive, and the reticle overlay feature saved me hours of manual calculation.',
          },
        },
        {
          name: 'Sarah T.',
          date: 'Nov 22, 2025',
          rating: 5,
          title: { en: 'Perfect for competitions' },
          text: {
            en:
              'The premium features are incredible. The mini-apps suite covers everything I need during competitions. Clean interface and reliable calculations every time.',
          },
        },
      ],
    },
    teamMembers: [
      { name: 'Armen Asatryan', role: { en: 'Co-Founder & CEO' }, imageUrl: '' },
      { name: 'Gerasim Israyelyan', role: { en: 'Co-Founder & CTO' }, imageUrl: '' },
      { name: 'Spartak Kyureghyan', role: { en: 'Co-Founder & CFO' }, imageUrl: '' },
      { name: 'Ishkhan Gevorgyan', role: { en: 'Co-Founder & CPO' }, imageUrl: '' },
      { name: 'Andranik Yeghoyan', role: { en: 'Android Magician' }, imageUrl: '' },
      { name: 'Arame Avetisyan', role: { en: 'Software Test Engineer' }, imageUrl: '' },
    ],
  };
}
