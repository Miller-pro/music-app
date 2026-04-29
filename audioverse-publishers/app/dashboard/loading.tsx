export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8" aria-busy="true">
      <div className="mb-6 h-6 w-40 animate-pulse rounded bg-white/5" />
      <div className="av-card mb-6">
        <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-4 w-48 animate-pulse rounded bg-white/5" />
        <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-white/5" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="av-card lg:col-span-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-white/5 py-3 first:border-0 first:pt-0">
              <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
        <div className="av-card">
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-10 w-full animate-pulse rounded bg-white/5" />
          <div className="mt-3 h-10 w-full animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </main>
  );
}
