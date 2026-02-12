import { useRef, useState, useCallback, useEffect } from "react";
import { useReducedMotion } from "./use-reduced-motion";

interface MagneticState {
  x: number;
  y: number;
  isHovering: boolean;
}

export function useMagneticButton(strength = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<MagneticState>({ x: 0, y: 0, isHovering: false });
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
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) / (rect.width / 2);
        const dy = (e.clientY - centerY) / (rect.height / 2);
        setState({ x: dx * strength, y: dy * strength, isHovering: true });
      });
    },
    [strength, reduced]
  );

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setState({ x: 0, y: 0, isHovering: false });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || isMobile.current) return;

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove, handleMouseLeave, reduced]);

  const style: React.CSSProperties = reduced
    ? {}
    : {
        transform: `translate(${state.x}px, ${state.y}px)`,
        transition: state.isHovering ? "transform 0.15s ease-out" : "transform 0.4s ease-out",
      };

  return { ref, style, isHovering: state.isHovering };
}