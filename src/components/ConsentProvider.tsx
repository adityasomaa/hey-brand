"use client";

/**
 * ============================================================================
 * Cookie consent that actually controls something.
 * ============================================================================
 *
 * A banner that sets a flag and changes nothing is theatre. This one gates the
 * only local storage the site performs:
 *
 *   GRANTED  the contact form keeps a draft in localStorage, so a half-written
 *            brief survives a refresh or an accidental back gesture.
 *
 *   DENIED   nothing is written except the consent decision itself, and any
 *            draft stored under a previous grant is deleted immediately. Not
 *            ignored — deleted.
 *
 * The decision itself is stored under a versioned key so it can be re-asked by
 * bumping `site.consent.version`.
 *
 * `useConsentStorage` is the only way anything in this app touches
 * localStorage; there are no direct calls elsewhere. That is what makes the
 * banner enforceable rather than decorative.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { site } from "@/lib/site";

export type ConsentState = "granted" | "denied" | "unset";

/** Keys the app may write, and which are purged on denial. */
export const CONSENT_SCOPED_KEYS = ["heybrand.contact-draft"] as const;

type ConsentContextValue = {
  consent: ConsentState;
  /** True once the stored decision has been read, so the UI can avoid a flash. */
  ready: boolean;
  grant: () => void;
  deny: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

const KEY = `${site.consent.storageKey}.v${site.consent.version}`;

function purgeScopedKeys() {
  try {
    for (const key of CONSENT_SCOPED_KEYS) window.localStorage.removeItem(key);
  } catch {
    // Private mode or storage disabled. Nothing was stored, so nothing to do.
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>("unset");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored === "granted" || stored === "denied") setConsent(stored);
    } catch {
      // Storage unavailable: behave exactly as if the visitor had declined.
      setConsent("denied");
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: Exclude<ConsentState, "unset">) => {
    setConsent(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* nothing else to do */
    }
    if (next === "denied") purgeScopedKeys();
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      ready,
      grant: () => persist("granted"),
      deny: () => persist("denied"),
    }),
    [consent, ready, persist]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used inside <ConsentProvider>");
  return ctx;
}

/**
 * Consent-aware storage. Reads and writes are no-ops unless consent was
 * granted, so a feature cannot accidentally bypass the banner.
 */
export function useConsentStorage() {
  const { consent } = useConsent();
  const allowed = consent === "granted";

  return useMemo(
    () => ({
      allowed,
      read(key: (typeof CONSENT_SCOPED_KEYS)[number]): string | null {
        if (!allowed) return null;
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      write(key: (typeof CONSENT_SCOPED_KEYS)[number], value: string) {
        if (!allowed) return;
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* ignore */
        }
      },
      clear(key: (typeof CONSENT_SCOPED_KEYS)[number]) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          /* ignore */
        }
      },
    }),
    [allowed]
  );
}
