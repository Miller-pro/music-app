import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import musicService from '../services/musicService';
import config from '../config/config';
import TrackCard from '../components/UI/TrackCard';
import TrackRow from '../components/UI/TrackRow';
import InFeedAd from '../components/Ads/InFeedAd';
import BannerAd from '../components/Ads/BannerAd';
import { GridIcon, ListIcon, FilterIcon, SearchIcon } from '../components/UI/Icons';
import { motion } from 'framer-motion';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const genre = searchParams.get('genre') || 'all';
  const mood = searchParams.get('mood') || '';
  const useCase = searchParams.get('useCase') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popular';

  const setFilter = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const tracks = useMemo(() => {
    return musicService.filterTracks({ genre, mood, useCase, search, sort });
  }, [genre, mood, useCase, search, sort]);

  const clearFilters = () => setSearchParams({});

  const hasFilters = genre !== 'all' || mood || useCase || search;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Library</h1>
            <p className="text-sm text-gray-400 mt-0.5">{tracks.length} tracks available</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-primary-500/15 border-primary-500/30 text-primary-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            >
              <FilterIcon />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 lg:px-6 mb-6 overflow-hidden"
        >
          <div className="glass-light rounded-xl p-4 space-y-4">
            {/* Search */}
            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setFilter('search', e.target.value)}
                  placeholder="Search tracks..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Genre */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Genre</label>
                <select
                  value={genre}
                  onChange={e => setFilter('genre', e.target.value === 'all' ? '' : e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary-500/50 transition-all appearance-none"
                >
                  <option value="all">All Genres</option>
                  {config.genres.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Mood</label>
                <select
                  value={mood}
                  onChange={e => setFilter('mood', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary-500/50 transition-all appearance-none"
                >
                  <option value="">All Moods</option>
                  {config.moods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Use Case */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Use Case</label>
                <select
                  value={useCase}
                  onChange={e => setFilter('useCase', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary-500/50 transition-all appearance-none"
                >
                  <option value="">All</option>
                  {config.useCases.map(uc => (
                    <option key={uc.id} value={uc.id}>{uc.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Sort By</label>
                <select
                  value={sort}
                  onChange={e => setFilter('sort', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary-500/50 transition-all appearance-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Added</option>
                  <option value="downloads">Most Downloaded</option>
                  <option value="az">A - Z</option>
                </select>
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Active filters */}
      {hasFilters && !showFilters && (
        <div className="px-4 lg:px-6 mb-4 flex flex-wrap gap-2">
          {search && (
            <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 text-xs flex items-center gap-1">
              Search: {search}
              <button onClick={() => setFilter('search', '')} className="ml-1 hover:text-white">&times;</button>
            </span>
          )}
          {genre !== 'all' && (
            <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 text-xs flex items-center gap-1">
              {genre}
              <button onClick={() => setFilter('genre', '')} className="ml-1 hover:text-white">&times;</button>
            </span>
          )}
          {mood && (
            <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-300 text-xs flex items-center gap-1">
              {mood}
              <button onClick={() => setFilter('mood', '')} className="ml-1 hover:text-white">&times;</button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-white transition-colors">
            Clear all
          </button>
        </div>
      )}

      {/* Sidebar ad */}
      <div className="flex gap-6 px-4 lg:px-6">
        <div className="flex-1 min-w-0">
          {/* Track list */}
          {tracks.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium mb-2">No tracks found</p>
              <p className="text-sm">Try adjusting your filters or search terms</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary-500/20 text-primary-300 text-sm hover:bg-primary-500/30 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tracks.map((track, i) => (
                <TrackCard key={track.id} track={track} trackList={tracks} index={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {/* List header */}
              <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-500 border-b border-white/5">
                <span className="w-8 text-center">#</span>
                <span className="w-10" />
                <span className="flex-1">Title</span>
                <span className="hidden sm:inline w-20">License</span>
                <span className="hidden md:inline w-20">Genre</span>
                <span className="w-12 text-right">Time</span>
                <span className="w-16" />
              </div>
              {tracks.map((track, i) => (
                <div key={track.id}>
                  <TrackRow track={track} trackList={tracks} index={i} />
                  <InFeedAd index={i + 1} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar ad (desktop only) */}
        <div className="hidden xl:block w-[300px] shrink-0">
          <div className="sticky top-20">
            <BannerAd zone="bannerSidebar" />
          </div>
        </div>
      </div>
    </div>
  );
}
