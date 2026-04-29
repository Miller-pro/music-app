import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="av-card w-full max-w-md text-center">
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-white/60">
          That URL doesn't exist. Try the dashboard or go back to signup.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="av-btn-primary">
            Dashboard
          </Link>
          <Link href="/auth/signup" className="av-btn-secondary">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
