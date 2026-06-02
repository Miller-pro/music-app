import type { Metadata } from "next";
import { AppProvider } from "@/src/context/AppContext";
import SiteShell from "./SiteShell";
import "./site.css";

// SEO metadata for the public music site, ported from the old Vite index.html.
// This overrides the publisher-app defaults from the root layout for /(site) routes.
export const metadata: Metadata = {
  title: "AudioVerse - Free Music Player",
  description:
    "AudioVerse - Free Music Player. Thousands of copyright-free tracks for content creators, YouTubers, and businesses. Download anytime, no attribution required.",
  keywords: [
    "free music",
    "copyright free",
    "royalty free",
    "download music",
    "creative commons",
    "background music",
    "youtube music",
  ],
  openGraph: {
    title: "AudioVerse - Free Music Player",
    description: "Thousands of copyright-free tracks. Download anytime.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AudioVerse",
  description: "Free Music Player - Thousands of Copyright-Free Tracks",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // `site-scope` activates the music-site-only global styles (site.css); the
    // font classes + Google Fonts link below only exist on (site) routes, so
    // the dashboard/admin keep their system-font rendering.
    <div className="site-scope font-sans">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AppProvider>
        <SiteShell>{children}</SiteShell>
      </AppProvider>
    </div>
  );
}
