"use client";

// Global error boundary — catches errors from layout.tsx and below.
// Must include its own <html> / <body> since it replaces the root layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white">
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <div className="av-card w-full max-w-md text-center">
            <h1 className="text-xl font-semibold text-white">Something broke</h1>
            <p className="mt-2 text-sm text-white/60">
              An unexpected error happened. The team has been notified.
            </p>
            {error.digest ? (
              <p className="mt-3 font-mono text-xs text-white/40">ref: {error.digest}</p>
            ) : null}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button onClick={reset} className="av-btn-primary">
                Try again
              </button>
              <a href="/dashboard" className="av-btn-secondary">
                Dashboard
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
