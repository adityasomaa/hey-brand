/**
 * ============================================================================
 * WhatsApp message assembly.
 * ============================================================================
 *
 * One builder, used by every WhatsApp button and by the contact form, so the
 * message format can never drift between them.
 *
 * Every link automatically carries:
 *   - which button was pressed (`label`)
 *   - the absolute URL of the page it was pressed on (`pageUrl`)
 *
 * so an incoming message always says where it came from without the sender
 * having to explain.
 */

import { site } from "./site";

export type WhatsAppPayload = {
  /** Which control the visitor used, e.g. "Hero — Mulai percakapan". */
  label: string;
  /** Absolute URL of the originating page. */
  pageUrl: string;
  /** Optional structured contact-form contents, in display order. */
  fields?: Array<{ label: string; value: string }>;
};

/**
 * Builds the message body. Kept plain-text and line-broken so it stays
 * readable in the WhatsApp composer on a phone.
 */
export function buildMessage({ label, pageUrl, fields }: WhatsAppPayload): string {
  const lines: string[] = [`Halo ${site.name}, saya ingin bertanya soal layanan branding.`];

  if (fields?.length) {
    lines.push("");
    for (const f of fields) {
      const value = f.value.trim();
      lines.push(`${f.label}: ${value.length ? value : "-"}`);
    }
  }

  lines.push("");
  lines.push(`Dikirim dari: ${pageUrl}`);
  lines.push(`Tombol: ${label}`);

  return lines.join("\n");
}

/**
 * Builds the href.
 *
 * With a number configured this is a direct `wa.me/<number>` link. With the
 * number left blank — which is the current state, because the real number was
 * never confirmed — it falls back to `wa.me/?text=`, WhatsApp's own supported
 * form for "open the composer with this message, pick the recipient yourself".
 * The composed message is identical either way, so nothing about the flow is
 * fake: only the addressee is missing, and adding it is a one-line change in
 * src/lib/site.ts.
 */
export function buildWhatsAppHref(payload: WhatsAppPayload): string {
  const text = encodeURIComponent(buildMessage(payload));
  const number = site.whatsappNumber.replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}

/**
 * Resolves a possibly-relative pathname to an absolute URL. Runs on the client
 * where `location` exists, and falls back to the configured canonical origin
 * during SSR so the server-rendered href is never relative or empty.
 */
export function absoluteUrl(pathname: string): string {
  if (typeof window !== "undefined") {
    return new URL(pathname || "/", window.location.origin).toString();
  }
  return new URL(pathname || "/", site.url).toString();
}
