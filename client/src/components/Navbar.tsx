import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "./Logo";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useI18n, type Locale, localeFlags } from "@/hooks/use-i18n";

type NavItem =
  | { key: string; href: string; type: "anchor" }
  | { key: string; href: string; type: "route" };

const navKeys: NavItem[] = [
  { key: "nav.news", href: "#news", type: "anchor" },
  { key: "nav.pricing", href: "#pricing", type: "anchor" },
  { key: "nav.business", href: "#b2b", type: "anchor" },
  { key: "nav.reviews", href: "#reviews", type: "anchor" },
  { key: "nav.team", href: "#team", type: "anchor" },
  { key: "nav.features", href: "#features", type: "anchor" },
  { key: "nav.contact", href: "#contact", type: "anchor" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navKeys
        .filter((l) => l.type === "anchor")
        .map((l) => l.href.replace("#", ""));
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
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (href.startsWith("#")) {
      window.location.href = `/${href}`;
    }
  };

  const isNavActive = (link: NavItem) => {
    if (link.type === "route") {
      return location === link.href || location.startsWith(`${link.href}/`);
    }
    return activeSection === link.href.replace("#", "");
  };

  const navTestId = (link: NavItem) =>
    link.type === "route"
      ? link.href.replace(/^\//, "")
      : link.href.replace("#", "");

  const renderNavButton = (link: NavItem, mobile = false) => {
    const active = isNavActive(link);
    const className = mobile
      ? `w-full justify-start ${active ? "text-primary" : "text-muted-foreground"}`
      : active
        ? "text-primary"
        : "text-muted-foreground";

    if (link.type === "route") {
      return (
        <Button
          key={link.href}
          variant="ghost"
          size={mobile ? "default" : "sm"}
          className={className}
          asChild
          data-testid={mobile ? `link-mobile-${navTestId(link)}` : `link-${navTestId(link)}`}
        >
          <Link href={link.href} onClick={() => setMobileOpen(false)}>
            {t(link.key)}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        key={link.href}
        variant="ghost"
        size={mobile ? "default" : "sm"}
        onClick={() => handleNavClick(link.href)}
        className={className}
        data-testid={mobile ? `link-mobile-${navTestId(link)}` : `link-${navTestId(link)}`}
      >
        {t(link.key)}
      </Button>
    );
  };

  const locales: Locale[] = ["en", "fr", "it", "es", "hy"];

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
            <Logo size="md" invert={!isScrolled && theme === "light"} />
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navKeys.map((link) => renderNavButton(link))}

            <div className="relative ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLangOpen(!langOpen)}
                className="text-muted-foreground"
                data-testid="button-language"
              >
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
              <a href="https://apps.apple.com/us/app/ballistiq-shooters-assistant/id6476917854" target="_blank">{t("nav.download")}</a>
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
            {navKeys.map((link) => renderNavButton(link, true))}
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
