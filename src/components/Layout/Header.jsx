import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, SearchIcon } from '../UI/Icons';
import { debounce } from '../../utils/helpers';

export default function Header({ onMenuToggle }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((q) => {
      if (q.trim()) {
        navigate(`/library?search=${encodeURIComponent(q.trim())}`);
      }
    }, 400),
    [navigate]
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/library?search=${encodeURIComponent(query.trim())}`);
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

        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
            100% Free
          </span>
        </div>
      </div>
    </header>
  );
}
