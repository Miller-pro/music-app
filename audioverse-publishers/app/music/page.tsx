import { redirect } from "next/navigation";

// The old /music prototype is superseded by the merged music site.
// Redirect to the real library at /browse.
export default function MusicPage() {
  redirect("/browse");
}
