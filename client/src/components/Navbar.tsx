import { useState, useEffect } from "react";
import { Logo } from "./Logo";
import { navLinks } from "@/data/siteContent";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navLinks.map((link) => link.href.replace("#", ""));
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
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(link.href)}
                className={activeSection === link.href.replace("#", "")
                  ? "text-[rgb(0,151,178)]"
                  : "text-white/70"
                }
                data-testid={`link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Button>
            ))}
            <Button
              onClick={() => handleNavClick("#hero")}
              className="ml-3"
              data-testid="link-download-nav"
            >
              Download
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                onClick={() => handleNavClick(link.href)}
                className={`w-full justify-start ${
                  activeSection === link.href.replace("#", "")
                    ? "text-[rgb(0,151,178)]"
                    : "text-white/70"
                }`}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Button>
            ))}
            <Button
              onClick={() => { handleNavClick("#hero"); setMobileOpen(false); }}
              className="w-full mt-3"
              data-testid="link-download-mobile"
            >
              Download
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}