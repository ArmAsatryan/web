import { useState, useEffect } from "react";

function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }

  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readReducedMotion);

  useEffect(() => {
    const update = () => setReduced(readReducedMotion());
    update();
    return subscribeReducedMotion(update);
  }, []);

  return reduced;
}
