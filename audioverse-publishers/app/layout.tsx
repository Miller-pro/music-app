import type { Metadata } from "next";
import "./globals.css";
import { ToastHost } from "@/components/dashboard/ToastHost";

// Canonical/OG base URL. Reuses NEXT_PUBLIC_APP_URL (already the app's base-URL
// var, used for auth redirects) so there's a single source of truth. Falls back
// to localhost ONLY in dev; in prod, if unset, metadataBase is omitted (Next
// uses relative URLs) rather than emitting a wrong localhost URL.
const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3001");

export const metadata: Metadata = {
  title: "AudioVerse Publishers",
  description:
    "Monetize your app or website with AudioVerse. 1,749 tracks, 450 radio stations, 60% revenue share.",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg font-sans">
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
