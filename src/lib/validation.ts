/**
 * ============================================================================
 * Contact form validation — one schema, run on BOTH sides.
 * ============================================================================
 *
 * The client imports it for instant inline feedback. The server action imports
 * the same functions and runs them again on the submitted FormData, so a
 * request that skips the browser entirely (curl, a disabled-JS post, a tampered
 * DOM) is validated identically. Client-side validation here is a convenience;
 * the server call is the one that decides.
 */

import { services, type ServiceId } from "@/data/content";

export type ContactValues = {
  name: string;
  brand: string;
  whatsapp: string;
  service: string;
  note: string;
};

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const EMPTY_CONTACT: ContactValues = {
  name: "",
  brand: "",
  whatsapp: "",
  service: "",
  note: "",
};

const VALID_SERVICE_IDS = new Set<string>(services.map((s) => s.id));

/** Indonesian mobile numbers, tolerant of spaces, dashes, +62, 62 and 08. */
const PHONE_SHAPE = /^(?:\+?62|0)8[1-9][0-9]{6,11}$/;

export function normalisePhone(raw: string): string {
  return raw.replace(/[\s()-]/g, "");
}

/**
 * Validates one field. Returning `undefined` means the field is acceptable.
 * Pure and side-effect free so the identical call is safe on the server.
 */
export function validateField(
  field: keyof ContactValues,
  value: string
): string | undefined {
  const v = value.trim();

  switch (field) {
    case "name":
      if (!v) return "Nama wajib diisi.";
      if (v.length < 2) return "Nama terlalu pendek.";
      if (v.length > 80) return "Nama maksimal 80 karakter.";
      return undefined;

    case "brand":
      if (!v) return "Nama brand wajib diisi.";
      if (v.length > 80) return "Nama brand maksimal 80 karakter.";
      return undefined;

    case "whatsapp": {
      if (!v) return "Nomor WhatsApp wajib diisi.";
      const p = normalisePhone(v);
      if (!/^[+0-9]+$/.test(p)) return "Nomor hanya boleh berisi angka.";
      if (!PHONE_SHAPE.test(p))
        return "Format nomor belum sesuai. Contoh: 08123456789.";
      return undefined;
    }

    case "service":
      if (!v) return "Pilih salah satu layanan.";
      if (!VALID_SERVICE_IDS.has(v)) return "Layanan tidak dikenali.";
      return undefined;

    case "note":
      if (v.length > 1200) return "Catatan maksimal 1200 karakter.";
      return undefined;

    default:
      return undefined;
  }
}

export function validateAll(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  (Object.keys(values) as Array<keyof ContactValues>).forEach((k) => {
    const message = validateField(k, values[k]);
    if (message) errors[k] = message;
  });
  return errors;
}

export function serviceLabel(id: string): string {
  return services.find((s) => s.id === (id as ServiceId))?.name ?? id;
}
