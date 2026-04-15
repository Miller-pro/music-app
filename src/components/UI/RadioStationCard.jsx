import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { PlayIcon } from './Icons';

function StopIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function DefaultRadioLogo() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/30 to-primary-700/30">
      <svg className="w-10 h-10 text-primary-400/60" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-.83-.49-1.57-1.24-1.85L12 2 3.24 6.15zM12 4.53l6.03 2.47H5.97L12 4.53zM4 20V8h16v12H4zm4.5-5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
      </svg>
    </div>
  );
}

export default function RadioStationCard({ station, stationList, index }) {
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
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className={`group relative rounded-lg overflow-hidden transition-all duration-200 p-3
        ${isActive ? 'bg-white/[0.1] ring-1 ring-primary-500/30' : 'bg-white/[0.04] hover:bg-white/[0.08]'}`}
    >
      {/* Cover / Logo */}
      <div className="relative aspect-square overflow-hidden rounded-md mb-3 shadow-lg shadow-black/30">
        {station.cover && !imgError ? (
          <img
            src={station.cover}
            alt={station.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <DefaultRadioLogo />
        )}

        {/* Play/Stop button overlay */}
        <div className="absolute inset-0 flex items-end justify-end p-2">
          <button
            onClick={handlePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl shadow-black/40 transition-all duration-200 hover:scale-105 active:scale-95
              ${isActive && isPlaying
                ? 'bg-red-500 hover:bg-red-400 opacity-100'
                : 'bg-primary-500 hover:bg-primary-400 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
              }`}
          >
            {isActive && isPlaying ? (
              <StopIcon className="w-5 h-5 text-white" />
            ) : (
              <PlayIcon className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* LIVE badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live</span>
        </div>

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
      <div>
        <h3
          className={`font-semibold text-sm truncate leading-tight ${isActive ? 'text-primary-400' : 'text-white'}`}
          title={station.name}
        >
          {station.name}
        </h3>
        <p className="text-xs text-gray-400 truncate mt-1">
          {station.genre.charAt(0).toUpperCase() + station.genre.slice(1)}
          {station.country ? ` \u00B7 ${station.country}` : ''}
        </p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{station.bitrate}kbps</span>
          {station.votes > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {station.votes}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
