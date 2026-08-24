"use client";

/**
 * Cookie banner.
 *
 * Layering rules this component exists to satisfy:
 *
 *   - it uses the --z-cookie token, per the shared scale
 *   - it SUPPRESSES ITSELF whenever a blocking overlay (mobile menu, modal) is
 *     open, so it can never appear on top of the menu even though it sits
 *     higher on the scale
 *   - the fixed wrapper is pointer-events: none and only the panel itself
 *     re-enables pointer events, so on a small screen the banner cannot
 *     swallow a tap aimed at anything floating beside it
 *   - it is anchored to the bottom with safe-area padding, and the page adds
 *     matching bottom padding while it is visible so it never covers the last
 *     line of the footer
 *
 * It is announced as a complementary landmark rather than a dialog: it does not
 * trap focus and does not block the page, so forcing it into the modal pattern
 * would misdescribe it.
 */

import { useEffect, useRef, useState } from "react";
import { useConsent } from "./ConsentProvider";
import { useOverlay } from "./OverlayProvider";
import { TransitionLink } from "./TransitionLink";

export function CookieBanner() {
  const { consent, ready, grant, deny } = useConsent();
  const { anyOpen } = useOverlay();
  const [afterLoader, setAfterLoader] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  // Held back until the boot loader has cleared. Landing a consent panel on
  // top of the hero call to action is a worse first impression than asking a
  // moment later, and the answer is the same either way.
  useEffect(() => {
    const timer = setTimeout(() => setAfterLoader(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  // Not decided yet, decision already read, nothing covering the page, and the
  // hero has had its moment.
  const visible = ready && afterLoader && consent === "unset" && !anyOpen;

  // Publish the banner's real height as --cookie-h so the hero can reserve
  // exactly that much space instead of guessing at a magic number. Measured
  // rather than hardcoded, because the panel's height changes with the text,
  // the viewport width and the visitor's font size.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.removeProperty("--cookie-h");
      return;
    }
    const node = panelRef.current;
    if (!node) return;
    const publish = () =>
      root.style.setProperty("--cookie-h", `${Math.ceil(node.getBoundingClientRect().height) + 20}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(node);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--cookie-h");
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="cookie-wrap z-cookie">
      <aside ref={panelRef} className="cookie-panel" aria-label="Persetujuan penyimpanan lokal">
        <p className="min-w-0 text-meta text-ink-soft">
          Simpan draf formulir kontak di peramban Anda?{" "}
          <TransitionLink href="/kebijakan-privasi" className="link-draw text-accent-ink">
            Detail
          </TransitionLink>
        </p>

        <div className="flex flex-none gap-2">
          <button type="button" className="btn btn-outline cookie-btn" onClick={deny}>
            Tolak
          </button>
          <button type="button" className="btn btn-solid cookie-btn" onClick={grant}>
            Izinkan
          </button>
        </div>
      </aside>
    </div>
  );
}
