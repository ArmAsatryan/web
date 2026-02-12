import { useRef, useState, useCallback, useEffect } from "react";
import { useReducedMotion } from "./use-reduced-motion";

interface TiltState {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

export function useTiltCard(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const reduced = useReducedMotion();
  const rafRef = useRef<number>(0);
  const isMobile = useRef(false);

  useEffect(() => {
    isMobile.current = window.matchMedia("(pointer: coarse)").matches;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (reduced || isMobile.current || !ref.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = ref.current!.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setTilt({
          rotateX: (y - 0.5) * -maxTilt,
          rotateY: (x - 0.5) * maxTilt,
          glareX: x * 100,
          glareY: y * 100,
        });
      });
    },
    [maxTilt, reduced]
  );

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setIsHovering(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || isMobile.current) return;

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, reduced]);

  const style: React.CSSProperties =
    reduced || isMobile.current
      ? {}
      : {
          transform: `perspective(800px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          transition: isHovering ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
        };

  const glareStyle: React.CSSProperties =
    reduced || isMobile.current
      ? { display: "none" }
      : {
          position: "absolute" as const,
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none" as const,
          opacity: isHovering ? 0.12 : 0,
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.4), transparent 60%)`,
          transition: "opacity 0.3s ease-out",
        };

  return { ref, style, glareStyle, isHovering };
}