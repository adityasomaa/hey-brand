"use client";

/**
 * Tracks which blocking overlays are open (mobile menu, modal dialogs).
 *
 * Two things read this:
 *   1. LenisProvider — smooth scroll must stop while an overlay is open,
 *      otherwise the page keeps gliding underneath the panel.
 *   2. CookieBanner — the layer scale puts the banner above the menu, so the
 *      banner suppresses itself while an overlay is up rather than fighting
 *      the scale. It also means the banner can never swallow a tap meant for
 *      the menu's close button on a small screen.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type OverlayContextValue = {
  menuOpen: boolean;
  modalOpen: boolean;
  /** True when anything is covering the page. */
  anyOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setModalOpen: (open: boolean) => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpenState] = useState(false);
  const [modalOpen, setModalOpenState] = useState(false);

  const setMenuOpen = useCallback((open: boolean) => setMenuOpenState(open), []);
  const setModalOpen = useCallback((open: boolean) => setModalOpenState(open), []);

  const value = useMemo<OverlayContextValue>(
    () => ({
      menuOpen,
      modalOpen,
      anyOpen: menuOpen || modalOpen,
      setMenuOpen,
      setModalOpen,
    }),
    [menuOpen, modalOpen, setMenuOpen, setModalOpen]
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error("useOverlay must be used inside <OverlayProvider>");
  }
  return ctx;
}
