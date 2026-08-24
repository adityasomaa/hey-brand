"use client";

/**
 * ============================================================================
 * INTERACTIVE MOMENT 1 — the hero responds to the pointer, or to device tilt.
 * ============================================================================
 *
 * The object is a set of printing plates slightly out of register. Moving the
 * pointer pulls them further apart or back together. It is a branding-studio
 * metaphor rather than generic parallax, and it is deliberately small in
 * amplitude: a few pixels, not a swooping 3D tilt.
 *
 * PERFORMANCE
 *   - one pointermove listener on the section, which only records coordinates
 *   - one rAF loop, which is the only thing that touches the DOM
 *   - writes go to CSS custom properties on a single node; React never
 *     re-renders during the interaction
 *   - only transform is animated, so there is no layout or paint work
 *   - an IntersectionObserver tears the loop and the listener down completely
 *     when the hero leaves the viewport, and rebuilds them when it returns
 *   - will-change is set on the four plate nodes and nothing else
 *
 * FALLBACKS
 *   - coarse pointer (touch): no pointer listener at all. Where the device
 *     exposes orientation without a permission prompt, gentle tilt drives the
 *     same two variables. Where it does not, the plates simply rest in
 *     register — which is the composition's resolved state, not a broken one.
 *   - prefers-reduced-motion: nothing is attached, at all. The variables stay
 *     at 0 and the hero is a still composition.
 *   - no JavaScript: identical still composition, server-rendered.
 *
 * The hero is exactly one viewport tall using svh, so it does not resize when
 * mobile browser chrome collapses during scroll, and nothing here is bound to
 * scroll position, so the graphic never zooms as the page moves.
 */

import { useEffect, useRef } from "react";
import { SectionHeader } from "./SectionHeader";
import { TransitionLink } from "./TransitionLink";
import { WhatsAppLink } from "./WhatsAppLink";
import { useReducedMotion, useFinePointer } from "./useMotionPrefs";

/** Peak plate separation in px. Small on purpose. */
const MAX_SHIFT = 16;
const MAX_SHIFT_FIELD = 26;

type HeroProps = {
  label: string;
  headline: string;
  description: string;
};

export function Hero({ label, headline, description }: HeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // Custom properties are written on the section and inherit down to every
    // plate, so one style write per frame drives the whole composition.
    const stage = section;
    if (reduced) return; // no listeners, no loop, no exceptions

    // Target and current values, eased toward each other in the loop so the
    // plates trail the pointer instead of snapping to it.
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let running = false;
    let dirty = false;

    const apply = () => {
      stage.style.setProperty("--plate-a-x", `${(currentX * MAX_SHIFT).toFixed(2)}px`);
      stage.style.setProperty("--plate-a-y", `${(currentY * MAX_SHIFT).toFixed(2)}px`);
      stage.style.setProperty("--plate-b-x", `${(-currentX * MAX_SHIFT * 0.62).toFixed(2)}px`);
      stage.style.setProperty("--plate-b-y", `${(-currentY * MAX_SHIFT * 0.62).toFixed(2)}px`);
      stage.style.setProperty("--field-x", `${(-currentX * MAX_SHIFT_FIELD).toFixed(2)}px`);
      stage.style.setProperty("--field-y", `${(-currentY * MAX_SHIFT_FIELD).toFixed(2)}px`);
    };

    const loop = () => {
      if (!running) return;
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.085;
      currentY += dy * 0.085;

      if (Math.abs(dx) > 0.0008 || Math.abs(dy) > 0.0008 || dirty) {
        apply();
        dirty = false;
        rafId = requestAnimationFrame(loop);
      } else {
        // Settled. Stop burning frames until the next input arrives.
        running = false;
        rafId = 0;
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      dirty = true;
      rafId = requestAnimationFrame(loop);
    };

    /* --- input sources --------------------------------------------------- */
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = section.getBoundingClientRect();
      // -1..1 from the centre of the hero.
      targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      wake();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      // gamma: left/right tilt, beta: front/back. Clamped hard so a phone held
      // at an angle does not park the plates at full separation.
      targetX = Math.max(-1, Math.min(1, event.gamma / 30));
      targetY = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
      wake();
    };

    let detach: (() => void) | null = null;

    const attach = () => {
      if (detach) return;
      if (fine) {
        section.addEventListener("pointermove", onPointerMove, { passive: true });
        section.addEventListener("pointerleave", onPointerLeave, { passive: true });
        detach = () => {
          section.removeEventListener("pointermove", onPointerMove);
          section.removeEventListener("pointerleave", onPointerLeave);
        };
        return;
      }

      // Touch device. Only use orientation where it needs no permission
      // prompt; asking for motion access on arrival would be hostile.
      const DOE = (
        window as Window & {
          DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
        }
      ).DeviceOrientationEvent;
      const needsPermission = typeof DOE?.requestPermission === "function";
      if (DOE && !needsPermission) {
        window.addEventListener("deviceorientation", onOrientation, { passive: true });
        detach = () => window.removeEventListener("deviceorientation", onOrientation);
      }
    };

    const teardown = () => {
      detach?.();
      detach = null;
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      // Return to register so an off-screen hero is never parked mid-effect.
      targetX = 0;
      targetY = 0;
      currentX = 0;
      currentY = 0;
      apply();
    };

    /* --- only run while the hero is actually on screen -------------------- */
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) attach();
            else teardown();
          }
        },
        { threshold: 0.01 }
      );
      observer.observe(section);
    } else {
      attach();
    }

    return () => {
      observer?.disconnect();
      teardown();
    };
  }, [reduced, fine]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen-stable w-full overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Field of registration hairlines. Full bleed, moves counter to the
          plates. The custom properties the effect writes live on the section,
          so they inherit to every layer below without a second ref. */}
      <div
        aria-hidden="true"
        className="hero-field absolute z-base"
        style={{ transform: "translate3d(var(--field-x, 0px), var(--field-y, 0px), 0)" }}
      />

      <div className="shell relative z-raised h-full">
        <div className="hero-grid grid h-full grid-rows-[minmax(0,1fr)_auto] gap-7 lg:grid-cols-[1.06fr_0.94fr] lg:grid-rows-1 lg:items-center lg:gap-16">
          {/* Plate composition. Its own column on desktop, above the copy on
              small screens, so it never sits behind the text and the copy
              needs no scrim to stay readable. */}
          <div className="order-1 flex min-h-0 items-center justify-center lg:order-2 lg:justify-end">
            <div aria-hidden="true" className="hero-stage">
              <span
                className="hero-plate hero-plate-a"
                style={{
                  transform:
                    "translate3d(var(--plate-a-x, 0px), var(--plate-a-y, 0px), 0)",
                }}
              />
              <span
                className="hero-plate hero-plate-b"
                style={{
                  transform:
                    "translate3d(var(--plate-b-x, 0px), var(--plate-b-y, 0px), 0)",
                }}
              />
              <span className="hero-plate hero-plate-c" />
              <span className="hero-plate hero-plate-mark" />
            </div>
          </div>

          {/* Copy. Never gated behind the effect. */}
          <div className="order-2 lg:order-1">
            <SectionHeader
              headingLevel={1}
              headingId="hero-heading"
              label={label}
              headline={headline}
              description={description}
              wide
              cta={
                <div className="flex flex-wrap items-center gap-3">
                  <WhatsAppLink label="Hero — Mulai percakapan" className="btn btn-solid">
                    Mulai percakapan
                  </WhatsAppLink>
                  <TransitionLink href="/karya" className="btn btn-outline">
                    Lihat karya
                  </TransitionLink>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
