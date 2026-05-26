import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/utils/admin-auth";
import { signOut } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "AudioVerse Admin",
  description: "Internal command center for AudioVerse Publishers.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <AdminShell userEmail={user.email ?? ""} signOutAction={signOut}>
      {children}
    </AdminShell>
  );
}
