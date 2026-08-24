"use client";

/**
 * Sticky header with a full-screen mobile menu.
 *
 * Menu behaviour:
 *   - focus is trapped inside the panel while it is open, and returns to the
 *     toggle button on close
 *   - Escape closes
 *   - the panel is removed from the accessibility tree when closed
 *   - opening it registers with OverlayProvider, which stops Lenis, locks
 *     document scrolling and suppresses the cookie banner, so the banner can
 *     never sit on top of the menu or eat a tap meant for it
 *   - navigating from inside the menu closes it first, then runs the curtain
 *
 * Layering uses the z-token scale only. Header sits at --z-header, the menu at
 * --z-menu, both below modal, cookie and skip-link.
 */

import { useEffect, useId, useRef } from "react";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";
import { TransitionLink } from "./TransitionLink";
import { Wordmark } from "./Wordmark";
import { useOverlay } from "./OverlayProvider";

export function Header() {
  const { menuOpen, setMenuOpen } = useOverlay();
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on route change so the panel never survives a navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  // Escape to close, and a focus trap while open.
  useEffect(() => {
    if (!menuOpen) return;

    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, setMenuOpen]);

  return (
    <>
      <a href="#main" className="skip-link z-skip">
        Lewati ke konten utama
      </a>

      <header className="site-header z-header">
        <div className="shell flex h-16 items-center justify-between gap-6 md:h-20">
          <TransitionLink
            href="/"
            className="text-[1.0625rem] leading-none tracking-[-0.03em] md:text-[1.1875rem]"
            aria-label={`${site.name} — beranda`}
          >
            <Wordmark text={site.name} flat />
          </TransitionLink>

          {/* Desktop navigation. */}
          <nav aria-label="Navigasi utama" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    markCurrent
                    className="link-draw text-meta uppercase tracking-[0.1em] text-ink-soft hover:text-ink aria-[current=page]:text-ink"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Hamburger. */}
          <button
            ref={toggleRef}
            type="button"
            className="burger md:hidden"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="visually-hidden">
              {menuOpen ? "Tutup menu" : "Buka menu"}
            </span>
            <span aria-hidden="true" className="burger-bar" />
            <span aria-hidden="true" className="burger-bar" />
          </button>
        </div>
      </header>

      {/* Mobile menu panel. */}
      <div
        id={panelId}
        ref={panelRef}
        className="menu-panel z-menu md:hidden"
        data-open={menuOpen ? "true" : "false"}
        // Removed from the a11y tree and from tab order when closed.
        aria-hidden={!menuOpen}
        {...(!menuOpen ? { inert: "" as unknown as boolean } : {})}
      >
        <nav aria-label="Navigasi utama (menu)" className="shell pt-24 pb-12">
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.href} className="menu-item" style={{ ["--i" as string]: i }}>
                <TransitionLink
                  href={item.href}
                  markCurrent
                  className="menu-link"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="menu-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-meta uppercase tracking-[0.12em] text-paper/60">
            {site.areaLabel}
          </p>
        </nav>
      </div>
    </>
  );
}
