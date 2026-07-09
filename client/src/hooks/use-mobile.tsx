import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function readIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function subscribeMobileQuery(onChange: () => void): () => void {
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY);

  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }

  mql.addListener(onChange);
  return () => mql.removeListener(onChange);
}

/** `undefined` until mounted — avoids layout flip on first paint (mobile/Firefox). */
export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const update = () => setIsMobile(readIsMobile());
    update();
    return subscribeMobileQuery(update);
  }, []);

  return isMobile;
}
