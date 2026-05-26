"use client";

import { useState } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  userEmail,
  signOutAction,
  children,
}: {
  userEmail: string;
  signOutAction: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-white">
      <AdminHeader
        userEmail={userEmail}
        mobileMenuOpen={mobileOpen}
        onMenuToggle={setMobileOpen}
        onSignOut={signOutAction}
      />
      <div className="flex">
        <AdminSidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
