"use client";

/**
 * Capability + preference hooks. Every interactive moment on this site gates
 * itself on these, so "turn the effect off" is one boolean in one place rather
 * than a condition scattered through each effect.
 */

import { useEffect, useState } from "react";

function useMediaQuery(query: string, initial = false): boolean {
  // Always false on the server so SSR markup matches the no-effect state; the
  // effect layer is additive, so hydrating into it never causes a visual jump.
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** True when the visitor has asked the OS to reduce motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * True only for a precise pointer that can hover. Excludes touch, excludes
 * stylus-only, excludes hybrid devices currently being driven by touch.
 */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** Desktop width. Used to keep Lenis off tablets and phones. */
export function useDesktopWidth(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

/**
 * The single gate for pointer-driven effects: a real mouse, and motion not
 * suppressed. When false, effects must not merely stop — they must never
 * attach a listener at all.
 */
export function usePointerEffectsEnabled(): boolean {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return fine && !reduced;
}
