import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import musicService from '../services/musicService';
import config from '../config/config';
import { useApp } from '../context/AppContext';
import { PlayIcon, PauseIcon, HeartIcon, DownloadIcon } from '../components/UI/Icons';
import { formatDuration, formatNumber } from '../utils/helpers';
import PlaylistCard from '../components/UI/PlaylistCard';
import BannerAd from '../components/Ads/BannerAd';

const GENRE_ORDER = [
  { id: 'ambient', name: 'Ambient', icon: '🌊' },
  { id: 'jazz', name: 'Jazz', icon: '🎷' },
  { id: 'world', name: 'World', icon: '🌍' },
  { id: 'folk', name: 'Folk', icon: '🪕' },
  { id: 'blues', name: 'Blues', icon: '🎸' },
  { id: 'classical', name: 'Classical', icon: '🎻' },
];

/* ─── Horizontal scroll track card ─────────────────────── */
function GenreTrackCard({ track, trackList, index }) {
  const { playTrack, currentTrack, isPlaying, togglePlay, downloadTrack, toggleLike, isLiked } = useApp();
  const isActive = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playTrack(track, trackList);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className={`group relative rounded-xl overflow-hidden transition-all duration-200 p-2.5 shrink-0
        w-[160px] sm:w-[180px]
        ${isActive ? 'bg-white/[0.1]' : 'bg-white/[0.04] hover:bg-white/[0.08]'}`}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-2.5 shadow-lg shadow-black/30">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="w-11 h-11 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center shadow-xl shadow-black/40 transition-all duration-200 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 hover:scale-110 active:scale-95"
          >
            {isActive && isPlaying ? (
              <PauseIcon className="w-5 h-5 text-white" />
            ) : (
              <PlayIcon className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-gray-200 font-medium backdrop-blur-sm">
          {formatDuration(track.duration)}
        </div>

        {/* Now Playing indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-[3px]">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-[3px] bg-primary-400 rounded-full"
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <h3
        className={`font-semibold text-[13px] leading-tight line-clamp-2 min-h-[2.4em] ${isActive ? 'text-primary-400' : 'text-white'}`}
        title={track.title}
      >
        {track.title}
      </h3>
      <p className="text-[11px] text-gray-400 truncate mt-0.5">{track.artist}</p>

      {/* Actions row */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
        <span>{formatNumber(track.plays)} plays</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
            className={`p-1 transition-all duration-200 active:scale-90
              ${liked ? 'text-primary-400' : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <HeartIcon className="w-3.5 h-3.5" filled={liked} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); downloadTrack(track); }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-400 transition-all p-1"
            title="Download"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Scroll arrows for horizontal row ─────────────────── */
function HorizontalScroller({ children }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/scroller">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-[#1A1A2E]/90 to-transparent opacity-0 group-hover/scroller:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-[#1A1A2E]/90 to-transparent opacity-0 group-hover/scroller:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2 -mb-2"
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Genre section ────────────────────────────────────── */
function GenreSection({ genre, index }) {
  const tracks = useMemo(
    () => musicService.getTracksByGenreSorted(genre.id, 8),
    [genre.id]
  );
  const allTracks = useMemo(
    () => musicService.getTracksByGenre(genre.id),
    [genre.id]
  );

  if (tracks.length === 0) return null;

  return (
    <section className="px-4 lg:px-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.06 }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{genre.icon}</span>
            <h2 className="font-display text-xl font-bold">{genre.name}</h2>
            <span className="text-[11px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
              {allTracks.length} tracks
            </span>
          </div>
          <Link
            to={`/library?genre=${genre.id}`}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
          >
            View All
          </Link>
        </div>

        {/* Horizontal scroll */}
        <HorizontalScroller>
          {tracks.map((track, i) => (
            <div key={track.id} className="snap-start">
              <GenreTrackCard track={track} trackList={tracks} index={i} />
            </div>
          ))}
        </HorizontalScroller>
      </motion.div>
    </section>
  );
}

/* ─── Main Home page ───────────────────────────────────── */
export default function Home() {
  const playlists = useMemo(() => musicService.getFeaturedPlaylists(), []);
  const sponsored = useMemo(() => musicService.getSponsoredPlaylists(), []);
  const stats = useMemo(() => musicService.getGenreStats(), []);

  return (
    <div className="pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl mx-4 lg:mx-6 mt-4 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/80 via-[#FF6B35]/20 to-[#FFD700]/30" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative px-8 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              100% Copyright Free
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              <span className="gradient-text">Thousands of Hours</span>
              <br />
              of Free Music
            </h1>
            <p className="text-gray-300 text-lg max-w-lg mb-6">
              {config.branding.shortTagline} Perfect for content creators, YouTubers, podcasters, and businesses.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 font-semibold text-sm transition-colors shadow-lg shadow-primary-500/30"
              >
                Start Listening
              </Link>
              <Link
                to="/library"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-colors border border-white/10"
              >
                Browse Library
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <BannerAd zone="bannerTop" />

      {/* ─── Genre Sections ──────────────────────────── */}
      {GENRE_ORDER.map((genre, i) => (
        <GenreSection key={genre.id} genre={genre} index={i} />
      ))}

      {/* ─── Featured Playlists ──────────────────────── */}
      <section className="px-4 lg:px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">Featured Playlists</h2>
          <Link to="/browse" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((pl, i) => (
            <PlaylistCard key={pl.id} playlist={pl} index={i} />
          ))}
          {sponsored.map((pl, i) => (
            <PlaylistCard key={pl.id} playlist={pl} index={playlists.length + i} sponsored />
          ))}
        </div>
      </section>

      {/* ─── Use Cases ───────────────────────────────── */}
      <section className="px-4 lg:px-6 mb-10">
        <h2 className="font-display text-xl font-bold mb-4">Music For Every Need</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {config.useCases.map((uc, i) => (
            <Link
              key={uc.id}
              to={`/browse?useCase=${uc.id}`}
              className="group glass-light rounded-xl p-4 text-center hover:bg-primary-500/10 transition-all"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-3xl block mb-2">{uc.icon}</span>
                <p className="text-sm font-medium">{uc.name}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Stats Section ───────────────────────────── */}
      <section className="px-4 lg:px-6 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: stats.totalTracks.toLocaleString(), label: 'Total Tracks', icon: '🎵' },
            { value: `${(stats.totalDuration / 3600).toFixed(1)}`, label: 'Hours of Music', icon: '⏱️' },
            { value: Object.keys(stats.genres).length.toString(), label: 'Genres', icon: '🎼' },
            { value: '100%', label: 'Copyright Free', icon: '✅' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="glass-light rounded-xl p-5 text-center"
            >
              <span className="text-2xl block mb-1.5">{stat.icon}</span>
              <p className="text-2xl font-bold gradient-text mb-0.5">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
