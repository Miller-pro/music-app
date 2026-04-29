import Link from "next/link";

export const metadata = { title: "Terms of Service — AudioVerse Publishers" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-white/50 hover:text-white">
        ← Back
      </Link>
      <article className="prose prose-invert mt-4">
        <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-white/60">Placeholder — full ToS drafted in Phase 2.</p>
        <div className="mt-6 space-y-3 text-sm text-white/70">
          <p>
            By signing up for an AudioVerse publisher account, you agree to integrate AudioVerse
            content honestly, honor the 60/40 revenue share, and comply with IAB ads.txt and
            app-ads.txt standards.
          </p>
          <p>
            AudioVerse may suspend accounts that violate these terms, engage in click fraud, or
            misrepresent traffic.
          </p>
          <p className="text-white/40">(Draft — final legal text pending.)</p>
        </div>
      </article>
    </main>
  );
}
