import { useI18n } from "@/hooks/use-i18n";
import { AnimatedSection } from "./AnimatedSection";
import calypsoLogoLight from "@assets/partner-calypso-instruments.png";
import calypsoLogoDark from "@assets/partner-calypso-instruments-dark.png";
import kestrelLogoLight from "@assets/partner-kestrel-instruments.png";
import kestrelLogoDark from "@assets/partner-kestrel-instruments-dark.png";

type PartnerLogo = { light: string; dark?: string };

const partners: {
  name: string;
  href: string;
  logo: PartnerLogo;
}[] = [
  {
    name: "Calypso Instruments",
    href: "https://www.calypsoinstruments.com/",
    logo: { light: calypsoLogoLight, dark: calypsoLogoDark },
  },
  {
    name: "Kestrel Instruments",
    href: "https://kestrelballistics.com/kestrel-ballistics-3rd-party-software-and-applications",
    logo: { light: kestrelLogoLight, dark: kestrelLogoDark },
  },
];

function PartnerLogoImage({
  name,
  logo,
}: {
  name: string;
  logo: PartnerLogo;
}) {
  if (!logo.dark) {
    return (
      <img
        src={logo.light}
        alt={name}
        className="h-10 sm:h-12 w-auto max-w-[200px] object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        loading="lazy"
      />
    );
  }

  return (
    <>
      <img
        src={logo.light}
        alt={name}
        className="h-10 sm:h-12 w-auto max-w-[200px] object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100 dark:hidden"
        loading="lazy"
      />
      <img
        src={logo.dark}
        alt={name}
        className="hidden h-10 sm:h-12 w-auto max-w-[200px] object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100 dark:block"
        loading="lazy"
      />
    </>
  );
}

export function PartnersSection() {
  const { t } = useI18n();

  return (
    <section id="partners" className="py-10 sm:py-12" data-testid="section-partners">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-5 sm:mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("partners.title1")}{" "}
            <span className="text-primary">{t("partners.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("partners.subtitle")}
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {partners.map((partner) => (
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center rounded-lg border border-border/60 bg-card/40 px-5 py-3 sm:px-6 sm:py-3.5 transition-all duration-300 hover:border-primary/40 hover:bg-card/70"
                aria-label={partner.name}
                data-testid={`partner-link-${partner.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <PartnerLogoImage name={partner.name} logo={partner.logo} />
              </a>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
