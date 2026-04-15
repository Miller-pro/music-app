import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import musicService from '../services/musicService';
import { useApp } from '../context/AppContext';
import { PlayIcon } from '../components/UI/Icons';
import BannerAd from '../components/Ads/BannerAd';

/* ─── Genre color map ─────────────────────────────────── */
const GENRE_COLORS = {
  cinematic:  'from-red-800/50 to-red-600/20',
  acoustic:   'from-slate-700/50 to-slate-500/20',
  electronic: 'from-emerald-800/50 to-emerald-600/20',
  ambient:    'from-blue-800/50 to-blue-600/20',
  jazz:       'from-amber-800/50 to-amber-600/20',
  classical:  'from-purple-800/50 to-purple-600/20',
};
const DEFAULT_GRADIENT = 'from-gray-800/50 to-gray-600/20';

/* ─── Featured Collection card ────────────────────────── */
const COLLECTIONS = [
  { icon: '🎬', name: 'Cinematic & Epic', desc: 'For ads & trailers', playlistId: 'pl009', genre: 'cinematic' },
  { icon: '💼', name: 'Corporate & Professional', desc: 'Business presentations', playlistId: 'pl010', genre: 'acoustic' },
  { icon: '⚡', name: 'Upbeat & Energetic', desc: 'Apps & games', playlistId: 'pl007', genre: 'electronic' },
  { icon: '🌊', name: 'Ambient & Chill', desc: 'Background music', playlistId: 'pl005', genre: 'ambient' },
  { icon: '🎷', name: 'Jazz Essentials', desc: 'Cafes & restaurants', playlistId: 'pl002', genre: 'jazz' },
  { icon: '🎻', name: 'Classical Masterpieces', desc: 'Premium content', playlistId: 'pl001', genre: 'classical' },
];

function CollectionCard({ collection, index }) {
  const { playTrack } = useApp();

  const handlePlay = () => {
    const playlist = musicService.getPlaylistById(collection.playlistId);
    if (playlist) {
      const tracks = musicService.getTracksByIds(playlist.trackIds);
      if (tracks.length > 0) playTrack(tracks[0], tracks);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06 }}
    >
      <Link
        to={`/browse?genre=${collection.genre}`}
        className={`group relative block rounded-xl overflow-hidden bg-gradient-to-br ${GENRE_COLORS[collection.genre] || DEFAULT_GRADIENT} border border-white/[0.06] hover:border-white/[0.12] hover:brightness-110 transition-all duration-300`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <span className="text-3xl">{collection.icon}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePlay(); }}
              className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/30 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 translate-y-0 lg:translate-y-1 lg:group-hover:translate-y-0 transition-all duration-200 hover:scale-110"
            >
              <PlayIcon className="w-5 h-5 text-white ml-0.5" />
            </button>
          </div>
          <h3 className="font-semibold text-sm text-white mb-1">{collection.name}</h3>
          <p className="text-xs text-gray-400">{collection.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Radio Station card (compact for homepage) ───────── */
function HomeRadioCard({ station, stationList, index }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useApp();
  const isActive = currentTrack?.id === station.id;
  const [imgError, setImgError] = useState(false);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playTrack(station, stationList);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      onClick={handlePlay}
      className={`group relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer
        ${isActive ? 'bg-white/[0.1] ring-1 ring-primary-500/30' : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12]'}`}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden">
        {station.cover && !imgError ? (
          <img
            src={station.cover}
            alt={station.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/30 to-primary-700/30">
            <svg className="w-10 h-10 text-primary-400/60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-.83-.49-1.57-1.24-1.85L12 2 3.24 6.15zM12 4.53l6.03 2.47H5.97L12 4.53zM4 20V8h16v12H4zm4.5-5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
            </svg>
          </div>
        )}

        {/* LIVE badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live</span>
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />

        {/* Now playing indicator */}
        {isActive && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-center gap-[3px]">
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
      <div className="p-3">
        <h3
          className={`font-semibold text-sm truncate leading-tight ${isActive ? 'text-primary-400' : 'text-white'}`}
          title={station.name}
        >
          {station.name}
        </h3>
        <p className="text-xs text-gray-400 truncate mt-1">
          {station.genre.charAt(0).toUpperCase() + station.genre.slice(1)}
          {station.country ? ` · ${station.country}` : ''}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Value Prop card ─────────────────────────────────── */
const VALUE_PROPS = [
  { icon: '🛡️', title: 'Legally Cleared Content', desc: 'Every track verified and cleared for commercial use. Zero risk guarantee.' },
  { icon: '🚀', title: 'True Commercial Freedom', desc: 'Monetize anywhere, anytime. No platform restrictions, no limitations.' },
  { icon: '🎁', title: 'No Subscription Required', desc: '100% free forever. Access everything without barriers.' },
  { icon: '⚙️', title: 'Enterprise-Grade Integration', desc: 'Professional APIs and direct streaming URLs. Built for scale.' },
  { icon: '💎', title: 'Curated Audio Library', desc: 'Hand-picked, verified content. Quality over quantity.' },
  { icon: '📈', title: 'Constantly Expanding', desc: 'Proprietary sourcing methods. Fresh verified content weekly.' },
];

/* ─── Main Home page ───────────────────────────────────── */
export default function Home() {
  const radioStations = useMemo(() => musicService.getTopRadioStations(6), []);
  const totalTracks = useMemo(() => musicService.getAllTracks().length, []);
  const totalRadio = useMemo(() => musicService.getRadioStations().length, []);

  return (
    <div className="pb-8">

      {/* ═══ 1. Hero Section ════════════════════════════════ */}
      <section className="relative overflow-hidden rounded-2xl mx-4 lg:mx-6 mt-4 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/80 via-[#FF6B35]/35 to-[#FFD700]/30" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=400&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative px-8 py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              ✓ 100% Legally Cleared
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              <span className="gradient-text">Thousands of Hours</span>
              <br />
              of Free Music
            </h1>
            <p className="text-gray-200 text-lg max-w-lg mb-6">
              Legally verified audio for content creators and businesses. Monetize with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 font-semibold text-base transition-colors shadow-xl shadow-primary-500/30"
              >
                Start Listening
              </Link>
              <Link
                to="/library"
                className="text-sm text-primary-400 hover:text-primary-300 font-semibold transition-colors flex items-center gap-1"
              >
                Browse Library →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <BannerAd zone="bannerTop" />

      {/* ═══ 2. Stats Bar ═══════════════════════════════════ */}
      <section className="px-4 lg:px-6 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: totalTracks.toLocaleString(), label: 'Music Tracks', icon: '🎵' },
            { value: totalRadio.toLocaleString(), label: 'Radio Stations', icon: '📻' },
            { value: '1,000+', label: 'Podcasts (Coming Soon)', icon: '🎙️' },
            { value: 'Verified Safe', label: 'All Content', icon: '✅' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="relative rounded-xl p-5 text-center bg-white/[0.04] border border-white/[0.08] hover:border-primary-500/30 transition-all duration-300"
            >
              {/* Gradient border glow on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-500/0 to-accent-500/0 hover:from-primary-500/10 hover:to-accent-500/10 transition-all duration-300 pointer-events-none" />
              <span className="text-2xl block mb-1.5">{stat.icon}</span>
              <p className="text-2xl font-bold gradient-text mb-0.5">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 3. Why AudioVerse ══════════════════════════════ */}
      <section className="px-4 lg:px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h2 className="font-display text-2xl lg:text-3xl font-bold mb-2">Why AudioVerse?</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Built for businesses who need legally verified audio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="rounded-xl p-5 bg-white/[0.04] border border-white/[0.06] hover:border-primary-500/20 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5 shrink-0">{prop.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm text-white mb-1">{prop.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{prop.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ 4. Featured Collections ════════════════════════ */}
      <section className="px-4 lg:px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-5"
        >
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold mb-1">Featured Collections</h2>
            <p className="text-gray-400 text-sm">Curated playlists for every purpose</p>
          </div>
          <Link
            to="/browse"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
          >
            Browse All Music →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {COLLECTIONS.map((c, i) => (
            <CollectionCard key={c.playlistId} collection={c} index={i} />
          ))}
        </div>
      </section>

      {/* ═══ 5. Live Radio Stations ═════════════════════════ */}
      <section className="px-4 lg:px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-5"
        >
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold mb-1">Live Radio Stations</h2>
            <p className="text-gray-400 text-sm">Stream from 50+ countries, 24/7</p>
          </div>
          <Link
            to="/radio"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
          >
            All Stations →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {radioStations.map((station, i) => (
            <HomeRadioCard key={station.id} station={station} stationList={radioStations} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
