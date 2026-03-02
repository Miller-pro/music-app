import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { PlayIcon, PauseIcon, DownloadIcon, HeartIcon } from './Icons';
import { formatDuration, formatNumber } from '../../utils/helpers';

export default function TrackCard({ track, trackList, index }) {
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
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      className={`group relative rounded-lg overflow-hidden transition-all duration-200 p-3
        ${isActive ? 'bg-white/[0.1]' : 'bg-white/[0.04] hover:bg-white/[0.08]'}`}
    >
      {/* Cover */}
      <div className="relative aspect-square overflow-hidden rounded-md mb-3 shadow-lg shadow-black/30">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Play button overlay - Spotify-style floating button */}
        <div className="absolute inset-0 flex items-end justify-end p-2">
          <button
            onClick={handlePlay}
            className="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center shadow-xl shadow-black/40 transition-all duration-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95"
          >
            {isActive && isPlaying ? (
              <PauseIcon className="w-6 h-6 text-white" />
            ) : (
              <PlayIcon className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Copyright Free Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-green-500/90 text-[10px] font-bold uppercase tracking-wider text-white">
          Free
        </div>

        {/* Now Playing indicator */}
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
        <h3 className={`font-semibold text-sm truncate leading-tight ${isActive ? 'text-primary-400' : 'text-white'}`} title={track.title}>
          {track.title}
        </h3>
        <p className="text-[11px] text-gray-400 truncate mt-1">{track.artist}</p>
        <div className="flex items-center justify-between mt-2.5 text-[11px] text-gray-500">
          <span>{formatDuration(track.duration)}</span>
          <div className="flex items-center gap-1.5">
            <span>{formatNumber(track.plays)} plays</span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
              className={`p-1 transition-all duration-200 active:scale-90
                ${liked ? 'text-primary-400' : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <HeartIcon className="w-4 h-4" filled={liked} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); downloadTrack(track); }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary-400 transition-all p-1"
              title="Download"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
