"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Settings, Users } from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  disabled?: boolean;
}

const ITEMS: SidebarItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/publishers", label: "Publishers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings, disabled: true },
];

export function AdminSidebar({ mobileOpen = false, onNavigate }: { mobileOpen?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={onNavigate}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed bottom-0 left-0 top-14 z-30 w-60 transform border-r border-white/5 bg-bg-elevated transition-transform md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col gap-1 p-3">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.href : (pathname ?? "").startsWith(item.href);
            const isDisabled = !!item.disabled;
            const baseClasses =
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
            if (isDisabled) {
              return (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className={`${baseClasses} cursor-not-allowed text-white/30`}
                  title="Coming soon"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <span className="ml-auto rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white/40">
                    Soon
                  </span>
                </span>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`${baseClasses} ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <div className="mt-auto rounded-lg border border-white/5 p-3 text-xs text-white/40">
            <p className="font-semibold text-white/60">AudioVerse Admin</p>
            <p className="mt-0.5">Phase 1A · v0.1</p>
          </div>
        </nav>
      </aside>
    </>
  );
}
