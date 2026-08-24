/**
 * ============================================================================
 * SITE CONFIG — every fact about the business lives here, nothing is hardcoded
 * in components. Blank any field and the UI stops rendering the thing that
 * depends on it; nothing breaks and nothing is invented in its place.
 * ============================================================================
 *
 * Deliberately NOT present anywhere in this project, because they were not
 * confirmed: founding year, team size, team member names, client count,
 * project count, client names, testimonials, ratings, prices, opening hours,
 * street address, campaign result figures.
 *
 * Fill these in when you have them. Nothing else needs to change.
 */

export const site = {
  name: "Hey._.Brand!",

  /** Used in <title>, structured data, and the wordmark's accessible name. */
  legalName: "Hey._.Brand!",

  /**
   * Canonical production origin. Update in ONE place and metadata, canonical
   * tags, sitemap.xml, robots.txt and the OG image URL all follow.
   */
  url: "https://hey-brand.vercel.app",

  /**
   * WhatsApp number in international format, digits only, no "+" and no
   * leading zero. Example for Indonesia: "628123456789".
   *
   * LEFT EMPTY ON PURPOSE — the real number has not been confirmed, and a
   * made-up number on a live site would dial a stranger. While it is empty,
   * WhatsAppLink builds `https://wa.me/?text=...`, which is WhatsApp's own
   * supported "pre-filled message, pick your own recipient" link: the composed
   * message is still complete and correct. Paste the number here and every
   * button on the site addresses it directly. No other file changes.
   */
  whatsappNumber: "",

  /**
   * Public email address. Left empty until confirmed; every place that would
   * print it renders nothing instead of a placeholder.
   */
  email: "",

  /** Service area. This is the one location fact that is confirmed. */
  areas: ["Jakarta", "Tangerang"] as const,
  areaLabel: "Jakarta dan Tangerang",

  /** Social profiles. Blank entries are skipped by the footer. */
  social: {
    threads: "",
    instagram: "",
  },

  /** Cookie consent storage key and version. Bump to re-ask everyone. */
  consent: {
    storageKey: "heybrand.consent",
    version: 1,
  },
} as const;

/** Primary navigation. Four pages, matching the brief. */
export const nav = [
  { href: "/", label: "Home" },
  { href: "/karya", label: "Karya" },
  { href: "/layanan", label: "Layanan" },
  { href: "/kontak", label: "Kontak" },
] as const;

export const legalNav = [
  { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
  { href: "/ketentuan-layanan", label: "Ketentuan Layanan" },
] as const;

/** Every route that exists, for the sitemap. */
export const routes = [
  { path: "/", priority: 1, changeFrequency: "monthly" as const },
  { path: "/karya", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/layanan", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/kontak", priority: 0.8, changeFrequency: "yearly" as const },
  { path: "/kebijakan-privasi", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/ketentuan-layanan", priority: 0.2, changeFrequency: "yearly" as const },
];
