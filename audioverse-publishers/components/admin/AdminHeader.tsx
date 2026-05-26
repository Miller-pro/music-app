"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";

interface AdminHeaderProps {
  userEmail: string;
  onMenuToggle?: (open: boolean) => void;
  mobileMenuOpen?: boolean;
  onSignOut: () => void | Promise<void>;
}

export function AdminHeader({
  userEmail,
  onMenuToggle,
  mobileMenuOpen,
  onSignOut,
}: AdminHeaderProps) {
  const [open, setOpen] = useState(false);
  const isOpen = mobileMenuOpen ?? open;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-bg/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/5 md:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => {
            const next = !isOpen;
            setOpen(next);
            onMenuToggle?.(next);
          }}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white">
            Audio<span className="text-primary">Verse</span>
          </span>
          <span className="hidden rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline">
            Admin
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right text-xs sm:block">
          <p className="font-medium text-white/80">Admin</p>
          <p className="text-white/40">{userEmail}</p>
        </div>
        <form action={onSignOut}>
          <button
            type="submit"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-bg-elevated px-3 text-sm text-white/80 hover:bg-bg-muted"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
