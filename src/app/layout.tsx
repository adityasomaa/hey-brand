import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { ConsentProvider } from "@/components/ConsentProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LenisProvider } from "@/components/LenisProvider";
import { OverlayProvider } from "@/components/OverlayProvider";
import { TransitionProvider } from "@/components/TransitionProvider";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Agensi Branding Jakarta dan Tangerang`,
    template: `%s — ${site.name}`,
  },
  description:
    "Agensi branding di Jakarta dan Tangerang yang mengerjakan strategy, identity, dan social media management untuk brand yang sedang tumbuh.",
  keywords: [
    "agensi branding",
    "jasa branding Jakarta",
    "jasa branding Tangerang",
    "brand strategy",
    "brand identity",
    "social media management",
    "desain identitas brand",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — Agensi Branding Jakarta dan Tangerang`,
    description:
      "Strategy, identity, dan social media management untuk brand di Jakarta dan Tangerang.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Agensi Branding Jakarta dan Tangerang`,
    description:
      "Strategy, identity, dan social media management untuk brand di Jakarta dan Tangerang.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfaf7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/**
 * Organization structured data.
 * Contains only facts that were confirmed: the name, the site, and the service
 * area. No founding date, no employee count, no aggregate rating, no address,
 * no telephone — every one of those was unknown, and inventing them here would
 * put fabricated claims into Google's index, which is worse than omitting them.
 */
function OrganizationJsonLd() {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: new URL("/icon.svg", site.url).toString(),
    image: new URL("/opengraph-image", site.url).toString(),
    description:
      "Agensi branding yang mengerjakan strategy, identity, dan social media management.",
    areaServed: site.areas.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    knowsAbout: ["Brand strategy", "Brand identity", "Social media management"],
  };

  if (site.email) data.email = site.email;
  if (site.whatsappNumber) data.telephone = `+${site.whatsappNumber}`;
  const profiles = Object.values(site.social).filter(Boolean);
  if (profiles.length) data.sameAs = profiles;

  return (
    <script
      type="application/ld+json"
      // Serialised server-side from a literal object; no user input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <OrganizationJsonLd />
        <ConsentProvider>
          <OverlayProvider>
            <TransitionProvider>
              <LenisProvider />
              <Header />
              <main id="main">{children}</main>
              <Footer />
              <CookieBanner />
            </TransitionProvider>
          </OverlayProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
