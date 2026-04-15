import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import musicService from '../services/musicService';
import RadioStationCard from '../components/UI/RadioStationCard';
import config from '../config/config';

const COUNTRY_FILTERS = [
  { code: 'all', name: 'All Countries' },
  { code: 'US', name: 'USA' },
  { code: 'GB', name: 'UK' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IL', name: 'Israel' },
  { code: 'CA', name: 'Canada' },
];

export default function Radio() {
  const [genreFilter, setGenreFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allStations = useMemo(() => musicService.getRadioStations(), []);

  const filtered = useMemo(() => {
    return musicService.filterRadioStations({
      genre: genreFilter,
      country: countryFilter,
      search: searchQuery,
    });
  }, [genreFilter, countryFilter, searchQuery]);

  const genreStats = useMemo(() => {
    const stats = {};
    for (const s of allStations) {
      stats[s.genre] = (stats[s.genre] || 0) + 1;
    }
    return stats;
  }, [allStations]);

  const radioGenres = [
    { id: 'all', name: 'All Genres' },
    ...config.radioGenres,
  ];

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-4 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-display text-2xl font-bold">Live Radio</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
          </span>
        </div>
        <p className="text-sm text-gray-400">
          {allStations.length} radio stations streaming worldwide
        </p>
      </div>

      {/* Search */}
      <div className="px-4 lg:px-6 mb-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search stations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:bg-white/[0.07] transition-all"
          />
        </div>
      </div>

      {/* Genre filters */}
      <section className="px-4 lg:px-6 mb-4">
        <div className="flex gap-2 flex-wrap">
          {radioGenres.map(g => (
            <button
              key={g.id}
              onClick={() => setGenreFilter(g.id)}
              className={`px-4 py-2 rounded-full text-sm transition-all border
                ${genreFilter === g.id
                  ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              {g.icon && <span className="mr-1">{g.icon}</span>}
              {g.name}
              {g.id !== 'all' && genreStats[g.id] && (
                <span className="ml-1.5 text-[10px] opacity-60">({genreStats[g.id]})</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Country filters */}
      <section className="px-4 lg:px-6 mb-6">
        <div className="flex gap-2 flex-wrap">
          {COUNTRY_FILTERS.map(c => (
            <button
              key={c.code}
              onClick={() => setCountryFilter(c.code)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all border
                ${countryFilter === c.code
                  ? 'bg-accent-500/20 border-accent-500/40 text-accent-400'
                  : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      {/* Results count */}
      <div className="px-4 lg:px-6 mb-4">
        <p className="text-sm text-gray-500">
          {filtered.length} station{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Station grid */}
      <section className="px-4 lg:px-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((station, i) => (
              <RadioStationCard key={station.id} station={station} stationList={filtered} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-.83-.49-1.57-1.24-1.85L12 2 3.24 6.15zM12 4.53l6.03 2.47H5.97L12 4.53zM4 20V8h16v12H4zm7-3h2v-4h3l-4-4-4 4h3v4z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No stations found</p>
            <p className="text-gray-600 text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}
      </section>
    </div>
  );
}
