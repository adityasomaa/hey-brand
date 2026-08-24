"use server";

/**
 * Server action for the contact form.
 *
 * The client validates as you type for feedback, but this is the call that
 * decides. It re-runs the identical rules from src/lib/validation.ts against
 * the raw FormData, so a submission that never touched the browser UI — curl,
 * a tampered DOM, a disabled-JS post — is checked exactly the same way.
 *
 * On success it returns the assembled WhatsApp link. The message is composed
 * here, server-side, from the validated values, so what gets sent is what
 * passed validation rather than whatever the client happened to have in state.
 */

import { buildWhatsAppHref } from "@/lib/whatsapp";
import { site } from "@/lib/site";
import {
  serviceLabel,
  validateAll,
  type ContactErrors,
  type ContactValues,
} from "@/lib/validation";

export type ContactResult = {
  status: "idle" | "error" | "success";
  errors: ContactErrors;
  /** Assembled wa.me URL, present only on success. */
  href?: string;
  /** Echoed back so the form can repopulate after a failed submit. */
  values: ContactValues;
  message?: string;
};

const str = (form: FormData, key: string) => String(form.get(key) ?? "").slice(0, 4000);

export async function submitContact(
  _prev: ContactResult,
  formData: FormData
): Promise<ContactResult> {
  const values: ContactValues = {
    name: str(formData, "name"),
    brand: str(formData, "brand"),
    whatsapp: str(formData, "whatsapp"),
    service: str(formData, "service"),
    note: str(formData, "note"),
  };

  // Honeypot. A real visitor never fills this; a bot fills every field it
  // finds. Answer with the generic failure rather than naming the trap.
  if (str(formData, "company").trim().length > 0) {
    return {
      status: "error",
      errors: {},
      values,
      message: "Pengiriman tidak dapat diproses. Coba lagi.",
    };
  }

  const errors = validateAll(values);
  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      errors,
      values,
      message: "Periksa kembali isian yang ditandai.",
    };
  }

  // The page the form was submitted from, so the WhatsApp message says where
  // it came from. Falls back to the canonical contact URL.
  const rawPageUrl = str(formData, "pageUrl").trim();
  let pageUrl = new URL("/kontak", site.url).toString();
  if (rawPageUrl) {
    try {
      const parsed = new URL(rawPageUrl);
      // Only accept http(s); never reflect an arbitrary scheme into a link.
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        pageUrl = parsed.toString();
      }
    } catch {
      /* keep the canonical fallback */
    }
  }

  const href = buildWhatsAppHref({
    label: "Formulir kontak",
    pageUrl,
    fields: [
      { label: "Nama", value: values.name },
      { label: "Nama brand", value: values.brand },
      { label: "Nomor WhatsApp", value: values.whatsapp },
      { label: "Layanan yang diminati", value: serviceLabel(values.service) },
      { label: "Catatan", value: values.note },
    ],
  });

  return {
    status: "success",
    errors: {},
    values,
    href,
    message: "Pesan siap dikirim lewat WhatsApp.",
  };
}
