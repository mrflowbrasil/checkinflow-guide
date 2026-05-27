import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function MetaPixelTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    window.fbq("track", "PageView");
  }, [location.pathname, location.search]);

  return null;
}
