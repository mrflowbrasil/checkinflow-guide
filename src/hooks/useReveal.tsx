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

function getObserver() {
  if (typeof window === "undefined") return null;
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as ObservedEl;
          el.classList.add("reveal-in");
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
 * Adds `.reveal` and, when in viewport, `.reveal-in`.
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
    if (prefersReducedMotion() || immediate) {
      el.classList.add("reveal-in");
      return;
    }
    const obs = getObserver();
    if (!obs) {
      el.classList.add("reveal-in");
      return;
    }
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [delayMs, immediate]);
  return ref;
}

type RevealProps<T extends ElementType = "div"> = {
  as?: T;
  delay?: number;
  /** Force immediate reveal on mount (useful for above-the-fold hero) */
  immediate?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">;

export const Reveal = forwardRef<HTMLElement, RevealProps>(function Reveal(
  { as, delay = 0, immediate = false, children, className, style, ...rest },
  _forwardedRef
) {
  const ref = useReveal<HTMLElement>(delay, immediate);
  const Tag = (as || "div") as ElementType;
  return createElement(
    Tag,
    { ref, className, style, ...rest },
    children
  );
});
