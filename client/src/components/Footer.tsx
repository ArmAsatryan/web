import { Link } from "wouter";
import { Logo } from "./Logo";
import { useI18n } from "@/hooks/use-i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <Logo size="sm" />
            <p className="text-muted-foreground/60 text-xs">
              &copy; {new Date().getFullYear()} BALLISTiQ. {t("footer.rights")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors" data-testid="link-privacy">
              {t("footer.privacy")}
            </Link>
            <span className="text-border">|</span>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors" data-testid="link-terms">
              {t("footer.terms")}
            </Link>
            <span className="text-border">|</span>
            <a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-features">
              {t("nav.features")}
            </a>
            <span className="text-border">|</span>
            <a href="#contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">
              {t("nav.contact")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}