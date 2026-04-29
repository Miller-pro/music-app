import Link from "next/link";

export const metadata = { title: "Privacy Policy — AudioVerse Publishers" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-white/50 hover:text-white">
        ← Back
      </Link>
      <article className="prose prose-invert mt-4">
        <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-white/60">
          Placeholder — full Privacy Policy drafted in Phase 2.
        </p>
        <div className="mt-6 space-y-3 text-sm text-white/70">
          <p>
            We collect the minimum data needed to operate publisher accounts: email, phone,
            domain/bundle, payout details, and traffic-related signals (IP, user agent,
            reCAPTCHA score) at signup for fraud prevention.
          </p>
          <p>
            We do not sell personal data. Data processing for revenue sharing is performed under
            your GDPR consent captured during onboarding.
          </p>
          <p className="text-white/40">(Draft — final legal text pending.)</p>
        </div>
      </article>
    </main>
  );
}
