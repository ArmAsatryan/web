import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "./use-reduced-motion";

interface InViewAnimationOptions {
  threshold?: number;
  delay?: number;
  y?: number;
}

export function useInViewAnimation(options: InViewAnimationOptions = {}) {
  const { threshold = 0.15, delay = 0, y = 12 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, reduced]);

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

  return { ref, motionProps, hasEntered };
}

export function useStaggerChildren(count: number, baseDelay = 0, staggerDelay = 0.08) {
  return Array.from({ length: count }, (_, i) => ({
    delay: baseDelay + i * staggerDelay,
  }));
}