"use client";

/**
 * Scroll reveal.
 *
 * TWO TRAPS THIS COMPONENT IS BUILT AROUND:
 *
 * 1. An IntersectionObserver on an element whose ancestor is `overflow: hidden`
 *    reports intersectionRatio 0 forever, and the element never reveals — it
 *    just stays at opacity 0, which looks like a broken page rather than a
 *    missing animation. So on mount this walks up the ancestor chain, and if it
 *    finds a clipping ancestor it skips the observer entirely and shows the
 *    content immediately. Content visibility is never the animation's business.
 *
 * 2. If IntersectionObserver is missing (old browser), the same thing: show
 *    immediately.
 *
 * Under prefers-reduced-motion the CSS already neutralises the transform and
 * opacity, and this component marks everything shown on mount so nothing is
 * gated behind a scroll event that may never arrive.
 */

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useReducedMotion } from "./useMotionPrefs";

type RevealProps = {
  children: ReactNode;
  /** Stagger in ms, applied as a transition-delay. */
  delay?: number;
  className?: string;
  as?: ElementType;
};

function hasClippingAncestor(node: HTMLElement): boolean {
  let el: HTMLElement | null = node.parentElement;
  let depth = 0;
  while (el && el !== document.body && depth < 24) {
    const style = getComputedStyle(el);
    const clips = [style.overflow, style.overflowY, style.overflowX].some(
      (v) => v === "hidden" || v === "clip"
    );
    if (clips) return true;
    el = el.parentElement;
    depth++;
  }
  return false;
}

export function Reveal({ children, delay = 0, className = "", as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    // Guard 1: a clipping ancestor would pin the ratio at 0 forever.
    if (hasClippingAncestor(node)) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    observer.observe(node);

    // Guard 2: if nothing has fired by the time the page has settled, the
    // element is either already on screen or unobservable. Either way, show it.
    const failsafe = setTimeout(() => {
      setShown(true);
      observer.disconnect();
    }, 2500);

    return () => {
      clearTimeout(failsafe);
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-shown={shown ? "true" : "false"}
      style={delay && !reduced ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
