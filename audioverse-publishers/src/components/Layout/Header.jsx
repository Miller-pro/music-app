'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MenuIcon, SearchIcon } from '../UI/Icons';

// The publisher CTA only appears on the home and publishers pages; everywhere
// else the header carries just search + the "100% Free" badge.
const CTA_PATHS = new Set(['/', '/publishers']);
import { debounce } from '../../utils/helpers';

// Persistent header CTA aimed at publishers (listeners need no account). The
// small kicker qualifies the audience; the bold line leads with what they get.
// Brand orange-red (primary, #FF6B35); copy shortens on mobile so it never
// crowds the search field.
function PublisherCta() {
  return (
    <Link
      href="/auth/signup"
      className="inline-flex flex-col justify-center leading-tight px-3 sm:px-4 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white whitespace-nowrap shadow-lg shadow-primary-500/30 transition-colors"
    >
      <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white/80">
        For Publishers
      </span>
      <span className="text-xs sm:text-sm font-bold flex items-center gap-1">
        <span className="hidden sm:inline">Add Premium Music</span>
        <span className="sm:hidden">Add Music</span>
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default function Header({ onMenuToggle }) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const showPublisherCta = CTA_PATHS.has(pathname);

  const debouncedSearch = useCallback(
    debounce((q) => {
      if (q.trim()) {
        router.push(`/library?search=${encodeURIComponent(q.trim())}`);
      }
    }, 400),
    [router]
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/library?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 glass">
      <div className="flex items-center gap-4 px-4 lg:px-6 py-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          <MenuIcon />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search tracks, artists, genres..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden lg:inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
            100% Free
          </span>

          {showPublisherCta && <PublisherCta />}
        </div>
      </div>
    </header>
  );
}
