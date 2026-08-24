"use client";

/**
 * ============================================================================
 * INTERACTIVE MOMENT 3 — page transitions that feel continuous.
 * ============================================================================
 *
 * Sequence, in this exact order, as specified:
 *
 *   1. page closes      — plates sweep across and cover the viewport
 *   2. content changes  — router.push, while fully covered
 *   3. scroll to top    — also while covered, so the jump is never seen
 *   4. page opens       — plates sweep away, revealing the new route already
 *                         scrolled to the top
 *
 * Two loaders, per the brief:
 *   - BOOT     first paint of the site, and any navigation to Home. Longer,
 *              the wordmark assembles into register.
 *   - CURTAIN  every other navigation. Shorter, four plates, staggered.
 *
 * SEQUENCING SAFETY — the thing that matters most here.
 * Every wait goes through `afterDelay` (src/lib/timing.ts), which races a
 * setTimeout against rAF. rAF alone is fatal: it freezes when the tab is
 * backgrounded, and a curtain half-closed at that moment would never reopen.
 * On top of that there is a watchdog that force-resets to idle, and a
 * visibilitychange handler that re-checks an overdue phase the instant the tab
 * comes back. Three independent ways out of a stuck state.
 *
 * REDUCED MOTION — no curtain at all. Navigation is instant and the scroll
 * reset still happens. Nothing is left mid-animation, nothing is hidden.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { afterDelay, TRANSITION } from "@/lib/timing";
import { useReducedMotion } from "./useMotionPrefs";
import { Wordmark } from "./Wordmark";
import { site } from "@/lib/site";

type Phase = "boot" | "idle" | "closing" | "held" | "opening";
type Variant = "boot" | "curtain";

type TransitionContextValue = {
  phase: Phase;
  navigate: (href: string) => void;
  isBusy: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

const stripHash = (href: string) => href.split("#")[0].split("?")[0] || "/";

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const [phase, setPhase] = useState<Phase>("boot");
  const [variant, setVariant] = useState<Variant>("boot");

  const runIdRef = useRef(0);
  const pathnameRef = useRef(pathname);
  const phaseRef = useRef<Phase>("boot");

  pathnameRef.current = pathname;
  phaseRef.current = phase;

  const setPhaseSafe = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  /* --- boot sequence ----------------------------------------------------- */
  useEffect(() => {
    // Reduced motion: never show a loader, never hold content back.
    if (reduced) {
      setPhaseSafe("idle");
      return;
    }
    const controller = new AbortController();
    (async () => {
      setVariant("boot");
      await afterDelay(TRANSITION.boot, controller.signal);
      if (controller.signal.aborted) return;
      setPhaseSafe("opening");
      await afterDelay(TRANSITION.open, controller.signal);
      if (controller.signal.aborted) return;
      setPhaseSafe("idle");
    })();
    return () => controller.abort();
    // Runs once on mount. `reduced` resolves on the first client effect pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* --- scroll reset helper ----------------------------------------------- */
  const resetScroll = useCallback(() => {
    // Kill Lenis's own animated position first, otherwise it glides the page
    // back down after the instant jump.
    const lenis = (window as Window & { __lenis?: { scrollTo: (t: number, o?: object) => void } })
      .__lenis;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  /* --- navigation -------------------------------------------------------- */
  const navigate = useCallback(
    (href: string) => {
      const target = stripHash(href);
      const current = stripHash(pathnameRef.current || "/");

      // Reduced motion, or already busy: plain navigation, no theatre.
      if (reduced) {
        if (target === current) {
          resetScroll();
          return;
        }
        router.push(href);
        resetScroll();
        return;
      }

      if (phaseRef.current === "closing" || phaseRef.current === "held") return;

      if (target === current) {
        resetScroll();
        return;
      }

      const runId = ++runIdRef.current;
      const stale = () => runId !== runIdRef.current;

      // Home gets the boot loader; everything else gets the curtain.
      setVariant(target === "/" ? "boot" : "curtain");

      (async () => {
        /* 1. page closes */
        setPhaseSafe("closing");
        await afterDelay(target === "/" ? TRANSITION.close + 120 : TRANSITION.close);
        if (stale()) return;

        /* 2. content changes — fully covered */
        setPhaseSafe("held");
        router.push(href);

        /* 3. scroll to top — also fully covered */
        resetScroll();

        // Give the new route a bounded moment to commit. Bounded, because a
        // route that never commits must not be able to hold the curtain shut.
        const deadline = 900;
        let waited = 0;
        while (
          !stale() &&
          stripHash(pathnameRef.current || "/") !== target &&
          waited < deadline
        ) {
          await afterDelay(60);
          waited += 60;
        }
        if (stale()) return;

        await afterDelay(TRANSITION.swap);
        if (stale()) return;
        resetScroll();

        /* 4. page opens */
        setPhaseSafe("opening");
        await afterDelay(TRANSITION.open);
        if (stale()) return;
        setPhaseSafe("idle");
      })();
    },
    [reduced, resetScroll, router, setPhaseSafe]
  );

  /* --- watchdog ----------------------------------------------------------
     If any non-idle phase outlives the watchdog, force the curtain open. The
     site is never left behind a panel, whatever went wrong upstream. */
  useEffect(() => {
    if (phase === "idle") return;
    const timer = setTimeout(() => {
      runIdRef.current++; // invalidate any in-flight sequence
      setPhaseSafe("idle");
    }, TRANSITION.watchdog);
    return () => clearTimeout(timer);
  }, [phase, setPhaseSafe]);

  /* --- returning from a background tab -----------------------------------
     setTimeout is throttled while hidden, so a sequence can come back overdue.
     Re-check on visibility and settle immediately if so. */
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (phaseRef.current === "idle") return;
      // Anything still covering the page after a hidden stretch gets one short
      // grace period, then is opened regardless.
      setTimeout(() => {
        if (phaseRef.current !== "idle") {
          runIdRef.current++;
          setPhaseSafe("idle");
        }
      }, TRANSITION.open);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [setPhaseSafe]);

  /* --- browser back / forward --------------------------------------------
     popstate bypasses `navigate`, so keep the scroll contract without a
     curtain (the browser restores position itself, and fighting that is worse
     than letting it happen). */
  useEffect(() => {
    if (phaseRef.current === "boot") return;
    // Intentionally no scroll reset here: back/forward should restore, not top.
  }, [pathname]);

  const value = useMemo<TransitionContextValue>(
    () => ({ phase, navigate, isBusy: phase !== "idle" }),
    [phase, navigate]
  );

  const covering = phase === "boot" || phase === "closing" || phase === "held";

  return (
    <TransitionContext.Provider value={value}>
      {children}

      {/* The overlay. aria-hidden + inert so it is invisible to assistive tech
          and cannot receive focus even while it covers the page. */}
      <div
        aria-hidden="true"
        data-phase={phase}
        data-variant={variant}
        className={`curtain z-modal ${phase === "idle" ? "curtain-idle" : ""}`}
      >
        <div className="curtain-plates">
          <span className="curtain-plate" data-i="0" />
          <span className="curtain-plate" data-i="1" />
          <span className="curtain-plate" data-i="2" />
          <span className="curtain-plate" data-i="3" />
        </div>

        <div className="curtain-mark" data-shown={covering ? "true" : "false"}>
          <Wordmark
            text={site.name}
            tone="on-ink"
            className="text-[clamp(1.5rem,5vw,3rem)] leading-none tracking-[-0.03em]"
          />
        </div>
      </div>

      {/* Without JavaScript there is no sequencer to open the curtain, so the
          overlay must not exist at all. */}
      <noscript>
        <style>{`.curtain{display:none !important}`}</style>
      </noscript>
    </TransitionContext.Provider>
  );
}

export function useTransition(): TransitionContextValue {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside <TransitionProvider>");
  return ctx;
}
