"use client";

/**
 * Lenis smooth scroll — desktop pointer devices only.
 *
 * Deliberately NOT mounted when:
 *   - the viewport is under 1024px (phones and tablets keep native scrolling,
 *     which is what their compositors are tuned for; hijacking it costs frames
 *     and breaks pull-to-refresh and momentum)
 *   - the pointer is coarse (touch)
 *   - prefers-reduced-motion is set
 *
 * and it is stopped, not merely ignored, while an overlay is open.
 *
 * When Lenis is not mounted the page scrolls natively and nothing else on the
 * site depends on it, so the no-Lenis path is the plain, fully working site.
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { useDesktopWidth, useFinePointer, useReducedMotion } from "./useMotionPrefs";
import { useOverlay } from "./OverlayProvider";

export function LenisProvider() {
  const desktop = useDesktopWidth();
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const { anyOpen } = useOverlay();

  const enabled = desktop && fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      // Never take over touch: on a hybrid device the finger must still get
      // native scrolling even though the mouse gets Lenis.
      syncTouch: false,
      touchMultiplier: 0,
    });

    document.documentElement.classList.add("lenis-active");

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Expose the instance so the transition provider can hard-reset scroll
    // position while the curtain is closed without Lenis animating back.
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("lenis-active");
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, [enabled]);

  // Stop/start on overlay changes rather than tearing the instance down, so
  // scroll position is preserved across an open/close cycle.
  useEffect(() => {
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    if (!lenis) return;
    if (anyOpen) lenis.stop();
    else lenis.start();
  }, [anyOpen]);

  // Lock the document itself too, so the page cannot scroll behind an overlay
  // on the devices where Lenis is not running at all.
  useEffect(() => {
    const root = document.documentElement;
    if (anyOpen) root.classList.add("lenis-stopped");
    else root.classList.remove("lenis-stopped");
    return () => root.classList.remove("lenis-stopped");
  }, [anyOpen]);

  return null;
}
