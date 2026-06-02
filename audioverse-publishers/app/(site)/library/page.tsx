import { Suspense } from "react";
import Library from "@/src/screens/Library";

// Library reads/writes query params via useSearchParams(), so it must sit
// inside a Suspense boundary (Next requirement for static rendering).
export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="px-4 lg:px-6 pt-4 text-sm text-gray-400">Loading…</div>}>
      <Library />
    </Suspense>
  );
}
