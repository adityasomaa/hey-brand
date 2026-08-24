"use client";

/**
 * The single WhatsApp control used by every button on the site.
 *
 * It builds its own href, and automatically attaches:
 *   - the absolute URL of the page it is rendered on
 *   - its own label, so an incoming message says which button was pressed
 *
 * Nothing else assembles a wa.me URL anywhere in this codebase, which is the
 * point: the message format cannot drift between the hero button, the footer
 * button and the contact form.
 *
 * The href is computed on the client after mount so it carries the real origin
 * (including a custom domain), and falls back to the configured canonical URL
 * during SSR so the link is never empty or relative in the initial HTML.
 */

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { absoluteUrl, buildWhatsAppHref } from "@/lib/whatsapp";

type WhatsAppLinkProps = {
  /** Identifies the button in the outgoing message. Keep it human-readable. */
  label: string;
  children: ReactNode;
  className?: string;
  /** Structured contact-form contents, when this link submits a form. */
  fields?: Array<{ label: string; value: string }>;
  /** Overrides the origin page, used by the contact form's success state. */
  pageUrlOverride?: string;
};

export function WhatsAppLink({
  label,
  children,
  className = "",
  fields,
  pageUrlOverride,
}: WhatsAppLinkProps) {
  const pathname = usePathname();
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const pageUrl =
    pageUrlOverride ??
    (origin ? new URL(pathname || "/", origin).toString() : absoluteUrl(pathname || "/"));

  const href = buildWhatsAppHref({ label, pageUrl, fields });

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-wa-label={label}
    >
      {children}
      <span className="visually-hidden"> (membuka WhatsApp di tab baru)</span>
    </a>
  );
}
