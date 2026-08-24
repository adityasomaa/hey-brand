"use client";

/**
 * Internal link that routes through the curtain sequence.
 *
 * Falls through to normal browser behaviour for everything a link is allowed
 * to do besides a plain left click: modifier-click, middle click, target
 * attributes, download links, external hrefs. Those must keep working exactly
 * as the browser intends, otherwise the transition has quietly broken the web.
 *
 * With JavaScript off, this renders as a plain <a> and navigates natively.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useTransition } from "./TransitionProvider";

type TransitionLinkProps = {
  href: string;
  children: ReactNode;
  /** Marks the link as the current page for styling and aria-current. */
  markCurrent?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function TransitionLink({
  href,
  children,
  markCurrent = false,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const { navigate } = useTransition();
  const pathname = usePathname();

  const isExternal = /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
  const isCurrent =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (isExternal) return;
    // Let the browser handle every non-plain click.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      rest.target
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  if (isExternal) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={markCurrent && isCurrent ? "page" : undefined}
      data-current={markCurrent && isCurrent ? "true" : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}
