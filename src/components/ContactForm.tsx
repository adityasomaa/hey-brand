"use client";

/**
 * Contact form.
 *
 * Fields: nama, nama brand, nomor WhatsApp, layanan yang diminati, catatan.
 *
 * Flow: submit -> server action validates -> on success the assembled WhatsApp
 * message is presented for sending. The message is built by the server from
 * the validated values and carries every field plus the URL of the page the
 * form was submitted from.
 *
 * Validation runs twice on purpose. Inline on blur for feedback, and again in
 * the server action, which is the one that decides. See src/lib/validation.ts.
 *
 * Draft persistence is gated on cookie consent: with consent granted the
 * in-progress brief is kept in localStorage so a refresh does not lose it;
 * without it, nothing is written at all.
 */

import { useActionState, useEffect, useRef, useState } from "react";
import { submitContact, type ContactResult } from "@/app/kontak/actions";
import { services } from "@/data/content";
import {
  EMPTY_CONTACT,
  validateField,
  type ContactErrors,
  type ContactValues,
} from "@/lib/validation";
import { Listbox } from "./Listbox";
import { useConsentStorage } from "./ConsentProvider";

const DRAFT_KEY = "heybrand.contact-draft" as const;

const initialState: ContactResult = {
  status: "idle",
  errors: {},
  values: EMPTY_CONTACT,
};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT);
  const [touched, setTouched] = useState<Partial<Record<keyof ContactValues, boolean>>>({});
  const [clientErrors, setClientErrors] = useState<ContactErrors>({});
  const [pageUrl, setPageUrl] = useState("");

  const storage = useConsentStorage();
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const successRef = useRef<HTMLDivElement | null>(null);

  /* --- page URL, captured client-side so it carries the real origin ------- */
  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  /* --- draft restore (consent-gated) -------------------------------------- */
  useEffect(() => {
    if (!storage.allowed) return;
    const raw = storage.read(DRAFT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<ContactValues>;
      setValues((v) => ({ ...v, ...parsed }));
    } catch {
      storage.clear(DRAFT_KEY);
    }
    // Run once consent becomes known.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage.allowed]);

  /* --- draft save (consent-gated, debounced) ------------------------------ */
  useEffect(() => {
    if (!storage.allowed) return;
    const isEmpty = Object.values(values).every((v) => v.trim() === "");
    if (isEmpty) return;
    const timer = setTimeout(() => {
      storage.write(DRAFT_KEY, JSON.stringify(values));
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, storage.allowed]);

  /* --- after a submit ------------------------------------------------------ */
  useEffect(() => {
    if (state.status === "error") {
      setValues(state.values);
      summaryRef.current?.focus();
    }
    if (state.status === "success") {
      storage.clear(DRAFT_KEY);
      successRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const setField = (field: keyof ContactValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (touched[field]) {
      setClientErrors((e) => ({ ...e, [field]: validateField(field, value) }));
    }
  };

  const blurField = (field: keyof ContactValues) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setClientErrors((e) => ({ ...e, [field]: validateField(field, values[field]) }));
  };

  /** Server errors win: they are the authoritative pass. */
  const errorFor = (field: keyof ContactValues) =>
    state.errors[field] ?? clientErrors[field];

  /* --- success state ------------------------------------------------------- */
  if (state.status === "success" && state.href) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="rounded-lg border border-line bg-paper-sunk p-6 md:p-8"
        role="status"
      >
        <p className="eyebrow">Siap dikirim</p>
        <h3 className="mt-5 text-h3 headline">Pesan sudah tersusun</h3>
        <p className="mt-4 measure text-ink-soft">
          Isian Anda sudah dirangkum menjadi satu pesan WhatsApp, lengkap dengan
          halaman asal pengiriman. Tekan tombol di bawah untuk membuka WhatsApp
          dan mengirimkannya.
        </p>

        <a
          href={state.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid mt-7"
        >
          Buka WhatsApp
        </a>

        <details className="mt-7">
          <summary className="cursor-pointer text-meta uppercase tracking-[0.1em] text-ink-faint">
            Lihat isi pesan
          </summary>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-line bg-paper p-4 text-meta text-ink-soft">
            {decodeURIComponent(state.href.split("text=")[1] ?? "")}
          </pre>
        </details>
      </div>
    );
  }

  /* --- form ---------------------------------------------------------------- */
  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {/* Error summary, focused on failure so keyboard and screen reader users
          are told what happened rather than left at the bottom of the form. */}
      {state.status === "error" ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-accent-ink/40 bg-paper-sunk p-4"
        >
          <p className="text-accent-ink">{state.message}</p>
        </div>
      ) : null}

      <input type="hidden" name="pageUrl" value={pageUrl} />

      {/* Honeypot. Clipped, not offset: an absolutely positioned element at
          left:-9999px without a positioned ancestor is a classic source of
          horizontal overflow. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="company">Perusahaan</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="name">
            Nama
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="field-input"
            autoComplete="name"
            required
            value={values.name}
            aria-invalid={errorFor("name") ? true : undefined}
            aria-describedby={errorFor("name") ? "name-error" : undefined}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => blurField("name")}
          />
          {errorFor("name") ? (
            <span className="field-error" id="name-error">
              {errorFor("name")}
            </span>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor="brand">
            Nama brand
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            className="field-input"
            autoComplete="organization"
            required
            value={values.brand}
            aria-invalid={errorFor("brand") ? true : undefined}
            aria-describedby={errorFor("brand") ? "brand-error" : undefined}
            onChange={(e) => setField("brand", e.target.value)}
            onBlur={() => blurField("brand")}
          />
          {errorFor("brand") ? (
            <span className="field-error" id="brand-error">
              {errorFor("brand")}
            </span>
          ) : null}
        </div>

        <div>
          <label className="field-label" htmlFor="whatsapp">
            Nomor WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            className="field-input"
            autoComplete="tel"
            placeholder="08123456789"
            required
            value={values.whatsapp}
            aria-invalid={errorFor("whatsapp") ? true : undefined}
            aria-describedby={
              errorFor("whatsapp") ? "whatsapp-error whatsapp-hint" : "whatsapp-hint"
            }
            onChange={(e) => setField("whatsapp", e.target.value)}
            onBlur={() => blurField("whatsapp")}
          />
          <span id="whatsapp-hint" className="mt-1.5 block text-meta text-ink-faint">
            Dipakai untuk membalas pesan Anda.
          </span>
          {errorFor("whatsapp") ? (
            <span className="field-error" id="whatsapp-error">
              {errorFor("whatsapp")}
            </span>
          ) : null}
        </div>

        <Listbox
          name="service"
          label="Layanan yang diminati"
          required
          value={values.service}
          error={errorFor("service")}
          onChange={(v) => {
            setField("service", v);
            setTouched((t) => ({ ...t, service: true }));
            setClientErrors((e) => ({ ...e, service: validateField("service", v) }));
          }}
          options={services.map((s) => ({
            value: s.id,
            label: s.name,
            hint: s.summary,
          }))}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="note">
          Catatan
        </label>
        <textarea
          id="note"
          name="note"
          rows={5}
          className="field-input resize-y"
          placeholder="Kondisi brand sekarang, dan apa yang ingin dicapai."
          value={values.note}
          aria-invalid={errorFor("note") ? true : undefined}
          aria-describedby={errorFor("note") ? "note-error" : undefined}
          onChange={(e) => setField("note", e.target.value)}
          onBlur={() => blurField("note")}
        />
        {errorFor("note") ? (
          <span className="field-error" id="note-error">
            {errorFor("note")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-solid" disabled={pending}>
          {pending ? "Menyusun pesan…" : "Susun pesan WhatsApp"}
        </button>
        <p className="text-meta text-ink-faint">
          Isian akan dirangkum menjadi satu pesan WhatsApp untuk Anda kirim.
        </p>
      </div>
    </form>
  );
}
