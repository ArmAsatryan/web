import { useState, useEffect, useCallback } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "features", label: "Features" },
  { id: "pricing", label: "Pricing" },
  { id: "b2b", label: "B2B" },
  { id: "reviews", label: "Reviews" },
  { id: "team", label: "Team" },
  { id: "contact", label: "Contact" },
];

export function ScrollProgress() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? scrollY / docHeight : 0);
    setVisible(scrollY > 200);

    let currentIdx = 0;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i].id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          currentIdx = i;
          break;
        }
      }
    }
    setActiveIndex(currentIdx);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  if (isMobile) return null;

  return (
    <div
      className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      data-testid="scroll-progress"
    >
      <div className="relative flex flex-col items-center gap-0">
        <div className="absolute top-0 bottom-0 w-px bg-border" />

        <div
          className="absolute top-0 w-px bg-primary origin-top transition-transform duration-300"
          style={{
            height: "100%",
            transform: `scaleY(${progress})`,
          }}
        />

        {sections.map((section, i) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="relative z-10 group flex items-center py-3"
            aria-label={`Scroll to ${section.label}`}
            data-testid={`scroll-node-${section.id}`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                i === activeIndex
                  ? "bg-primary border-primary shadow-[0_0_8px_hsl(188_100%_35%/0.6)]"
                  : i < activeIndex
                  ? "bg-primary/40 border-primary/40"
                  : "bg-muted border-border"
              }`}
            />
            <span
              className="absolute right-6 text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            >
              {section.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}