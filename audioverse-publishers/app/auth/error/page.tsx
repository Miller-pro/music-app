import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication error — AudioVerse Publishers",
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const message = searchParams.message || "Something went wrong during authentication.";
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="av-card w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-suspended/10 text-status-suspended">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">Authentication error</h1>
        <p className="mt-2 text-sm text-white/70">{message}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/auth/login" className="av-btn-primary w-full">
            Back to login
          </Link>
          <Link href="/auth/signup" className="av-btn-secondary w-full">
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
