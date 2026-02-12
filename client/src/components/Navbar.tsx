import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { Menu, X, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useI18n, type Locale, localeFlags } from "@/hooks/use-i18n";

const navKeys = [
  { key: "nav.features", href: "#features" },
  { key: "nav.pricing", href: "#pricing" },
  { key: "nav.business", href: "#b2b" },
  { key: "nav.reviews", href: "#reviews" },
  { key: "nav.team", href: "#team" },
  { key: "nav.contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navKeys.map((l) => l.href.replace("#", ""));
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.getElementById(href.replace("#", ""));
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const locales: Locale[] = ["en", "fr", "it", "es"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-testid="link-home">
            <Logo size="md" />
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navKeys.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(link.href)}
                className={activeSection === link.href.replace("#", "")
                  ? "text-primary"
                  : "text-muted-foreground"
                }
                data-testid={`link-${link.href.replace("#", "")}`}
              >
                {t(link.key)}
              </Button>
            ))}

            <div className="relative ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLangOpen(!langOpen)}
                className="text-muted-foreground"
                data-testid="button-language"
              >
                <Globe className="w-4 h-4" />
                {localeFlags[locale]}
              </Button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md overflow-hidden shadow-lg z-50">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        locale === l
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:bg-muted"
                      }`}
                      data-testid={`button-lang-${l}`}
                    >
                      {localeFlags[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
              aria-label="Toggle theme"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              onClick={() => handleNavClick("#hero")}
              className="ml-2"
              data-testid="link-download-nav"
            >
              {t("nav.download")}
            </Button>
          </div>

          <div className="flex lg:hidden items-center gap-1">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLangOpen(!langOpen)}
                className="text-muted-foreground"
                data-testid="button-language-mobile"
              >
                <Globe className="w-4 h-4" />
              </Button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md overflow-hidden shadow-lg z-50">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                        locale === l
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:bg-muted"
                      }`}
                      data-testid={`button-lang-mobile-${l}`}
                    >
                      {localeFlags[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground"
              aria-label="Toggle theme"
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="px-4 py-4 space-y-1">
            {navKeys.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                onClick={() => handleNavClick(link.href)}
                className={`w-full justify-start ${
                  activeSection === link.href.replace("#", "")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                data-testid={`link-mobile-${link.href.replace("#", "")}`}
              >
                {t(link.key)}
              </Button>
            ))}
            <Button
              onClick={() => { handleNavClick("#hero"); setMobileOpen(false); }}
              className="w-full mt-3"
              data-testid="link-download-mobile"
            >
              {t("nav.download")}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}