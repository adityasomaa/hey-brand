/**
 * ============================================================================
 * Transition timing primitives.
 * ============================================================================
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE:
 *
 *   Never advance a transition sequence on requestAnimationFrame alone.
 *
 * rAF is paused by every browser when the tab is backgrounded or the page is
 * hidden. A curtain sequence chained on rAF callbacks will therefore stop
 * mid-close the moment the visitor switches tabs, and stay stopped — the page
 * is left permanently behind an opaque panel. On a site whose whole pitch is
 * that it feels alive, that is the single worst failure available.
 *
 * `afterDelay` races a setTimeout against an rAF deadline and resolves on
 * whichever arrives first:
 *
 *   - visible tab    -> rAF wins, frame-accurate, motion lands on a real frame
 *   - hidden tab     -> rAF is frozen, setTimeout still fires (throttled to
 *                       roughly 1s, but it fires) and the sequence continues
 *
 * So the sequence always terminates. Both timers are cleaned up by whichever
 * one loses, and an AbortSignal cancels the pair.
 */

export function afterDelay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }

    let settled = false;
    let rafId = 0;
    let timerId: ReturnType<typeof setTimeout>;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timerId);
      if (rafId) cancelAnimationFrame(rafId);
      signal?.removeEventListener("abort", finish);
      resolve();
    };

    // Guaranteed progression. Fires even when the tab is hidden.
    timerId = setTimeout(finish, ms);

    // Preferred progression. Lands the state change on a real painted frame.
    if (typeof requestAnimationFrame === "function") {
      const start = performance.now();
      const tick = (now: number) => {
        if (settled) return;
        if (now - start >= ms) finish();
        else rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    signal?.addEventListener("abort", finish, { once: true });
  });
}

/**
 * Resolves on the next painted frame, with a hard timeout so a hidden tab
 * cannot stall the caller. Used to let the browser commit a class change
 * before the next phase starts.
 */
export function nextFrame(maxWaitMs = 120): Promise<void> {
  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, maxWaitMs);
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(finish));
    }
  });
}

/** Duration tokens for the curtain, in ms. Mirrored by CSS custom properties. */
export const TRANSITION = {
  /** Curtain covers the screen. */
  close: 560,
  /** Held closed while the new route commits and the scroll resets. */
  swap: 130,
  /** Curtain clears the screen. */
  open: 620,
  /** First-load / to-home loader. */
  boot: 1100,
  /**
   * Watchdog. If a phase has not resolved by this point something has gone
   * wrong upstream; the provider force-resets to idle so the site is never
   * left behind a stuck panel.
   */
  watchdog: 4200,
} as const;
