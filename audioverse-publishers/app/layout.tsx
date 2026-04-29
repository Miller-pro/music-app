import type { Metadata } from "next";
import "./globals.css";
import { ToastHost } from "@/components/dashboard/ToastHost";

export const metadata: Metadata = {
  title: "AudioVerse Publishers",
  description:
    "Monetize your app or website with AudioVerse. 1,749 tracks, 450 radio stations, 60% revenue share.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"),
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
