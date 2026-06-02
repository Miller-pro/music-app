import { Suspense } from "react";
import Browse from "@/src/screens/Browse";

// Browse reads query params via useSearchParams(), so it must sit inside a
// Suspense boundary (Next requirement; otherwise the route is forced dynamic).
export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 pt-4 text-sm text-gray-400">Loading…</div>}>
      <Browse />
    </Suspense>
  );
}
