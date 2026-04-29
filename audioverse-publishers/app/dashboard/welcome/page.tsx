import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPublisher } from "@/lib/middleware/auth";
import { Confetti } from "@/components/dashboard/Confetti";
import { PublisherIdDisplay } from "@/components/dashboard/PublisherIdDisplay";

export const metadata: Metadata = { title: "Welcome — AudioVerse Publishers" };

export default async function WelcomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const publisher = await getPublisher(user.id);
  if (!publisher) redirect("/onboarding");

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <Confetti />
      <div className="mx-auto w-full max-w-xl">
        <div className="av-card text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-status-active/10 text-3xl">
            🎉
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome to AudioVerse Publishers
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Your account is set up. Here's what was saved:
          </p>

          <div className="mt-6 text-left">
            <PublisherIdDisplay publisherId={publisher.publisher_id} />
          </div>

          <div className="mt-6 rounded-lg border border-white/5 bg-bg p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-white">What's next</p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <span className="mr-2">☐</span>Install the SDK in your app/website
              </li>
              <li>
                <span className="mr-2">☐</span>
                {publisher.ads_txt_verified
                  ? "ads.txt is verified — no action needed"
                  : "ads.txt line pending — we re-check every 24h"}
              </li>
              <li>
                <span className="mr-2">☐</span>Connect a payout method (Phase 2)
              </li>
              <li>
                <span className="mr-2">☐</span>Start earning on the 60/40 split
              </li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/dashboard" className="av-btn-primary">
              Go to dashboard
            </Link>
            <Link href="/docs" className="av-btn-secondary">
              SDK documentation
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
