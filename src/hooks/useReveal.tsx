import {
  createElement,
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

type ObservedEl = HTMLElement;

let sharedObserver: IntersectionObserver | null = null;

function activate(el: HTMLElement) {
  // Force a paint of the initial (.reveal) state before flipping to .reveal-in
  // Two rAFs guarantee the browser commits the starting styles first.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add("reveal-in");
    });
  });
}

function getObserver() {
  if (typeof window === "undefined") return null;
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as ObservedEl;
          activate(el);
          sharedObserver?.unobserve(el);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );
  return sharedObserver;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Attach reveal-on-scroll behavior to an existing element ref.
 * Adds `.reveal` and, when in viewport (or immediately if requested), `.reveal-in`.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  delayMs = 0,
  immediate = false
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal");
    if (delayMs) el.style.transitionDelay = `${delayMs}ms`;
    if (prefersReducedMotion()) {
      el.classList.add("reveal-in");
      return;
    }
    if (immediate) {
      activate(el);
      return;
    }
    const obs = getObserver();
    if (!obs) {
      activate(el);
      return;
    }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [delayMs, immediate]);
  return ref;
}

type RevealProps = {
  as?: ElementType;
  delay?: number;
  /** Force immediate reveal on mount (useful for above-the-fold hero) */
  immediate?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">;

// Props that should never be forwarded to a generic wrapper element
const INVALID_WRAPPER_PROPS = new Set([
  "fetchPriority",
  "fetchpriority",
  "loading",
  "decoding",
  "srcSet",
  "sizes",
]);

export const Reveal = forwardRef<HTMLElement, RevealProps>(function Reveal(
  { as, delay = 0, immediate = false, children, className, style, ...rest },
  _forwardedRef
) {
  const ref = useReveal<HTMLElement>(delay, immediate);
  const Tag: ElementType = as || "div";
  const safeRest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (!INVALID_WRAPPER_PROPS.has(k)) safeRest[k] = v;
  }
  return createElement(
    Tag,
    { ref, className, style, ...safeRest },
    children
  );
});
