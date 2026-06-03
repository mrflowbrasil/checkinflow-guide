import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function MetaPixelTracker() {
  const location = useLocation();
  // Skip the first PageView — index.html already fires it once on initial load.
  const skipFirst = useRef(
    typeof window !== "undefined" && (window as any).__mrflowPixelPageViewFired === true
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    window.fbq("track", "PageView");
  }, [location.pathname, location.search]);

  return null;
}
