import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

interface InViewAnimationOptions {
  threshold?: number;
  delay?: number;
  y?: number;
}

const REVEAL_FALLBACK_MS = 2500;

export function useInViewAnimation(options: InViewAnimationOptions = {}) {
  const { threshold = 0.15, delay = 0, y = 12 } = options;
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const reduced = useReducedMotion();

  const reveal = useCallback(() => {
    setHasEntered(true);
  }, []);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    if (reduced) {
      reveal();
      return;
    }

    const node = nodeRef.current;
    if (!node) return;

    let revealed = false;
    const safeReveal = () => {
      if (revealed) return;
      revealed = true;
      reveal();
    };

    const fallbackTimer = window.setTimeout(safeReveal, REVEAL_FALLBACK_MS);

    if (typeof IntersectionObserver === "undefined") {
      safeReveal();
      return () => window.clearTimeout(fallbackTimer);
    }

    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            safeReveal();
            observer?.disconnect();
          }
        },
        { threshold, rootMargin: "40px 0px" },
      );
      observer.observe(node);
    } catch {
      safeReveal();
    }

    return () => {
      window.clearTimeout(fallbackTimer);
      observer?.disconnect();
    };
  }, [threshold, reduced, reveal]);

  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y },
        animate: hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y },
        transition: {
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay,
        },
      };

  return { ref: setRef, motionProps, hasEntered };
}

export function useStaggerChildren(count: number, baseDelay = 0, staggerDelay = 0.08) {
  return Array.from({ length: count }, (_, i) => ({
    delay: baseDelay + i * staggerDelay,
  }));
}
