import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PlayIcon, PauseIcon, DownloadIcon, AddIcon, HeartIcon, MoreIcon } from './Icons';
import { formatDuration } from '../../utils/helpers';
import { motion } from 'framer-motion';

export default function TrackRow({ track, trackList, index, showIndex = true }) {
  const { playTrack, currentTrack, isPlaying, togglePlay, downloadTrack, addToQueue, toggleLike, isLiked, playlists, addTrackToPlaylist, showToast } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);
  const isActive = currentTrack?.id === track.id;
  const liked = isLiked(track.id);

  const handlePlay = () => {
    if (isActive) togglePlay();
    else playTrack(track, trackList);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.015, 0.2) }}
      onClick={handlePlay}
      className={`group flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-md cursor-pointer transition-all duration-150
        ${isActive
          ? 'bg-white/[0.08]'
          : 'hover:bg-white/[0.06]'}`}
    >
      {/* Index / Play button */}
      <div className="w-7 text-center shrink-0 relative">
        {isActive && isPlaying ? (
          <>
            <span className="group-hover:hidden flex items-center justify-center gap-[2px] mx-auto w-4 h-4">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full bg-primary-400"
                  animate={{ height: [3, 10, 3] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                />
              ))}
            </span>
            <span className="hidden group-hover:inline">
              <PauseIcon className="w-4 h-4 text-white mx-auto" />
            </span>
          </>
        ) : (
          <>
            <span className={`group-hover:hidden text-sm tabular-nums ${isActive ? 'text-primary-400 font-medium' : 'text-gray-500'}`}>
              {showIndex ? index + 1 : ''}
            </span>
            <span className="hidden group-hover:inline text-white">
              <PlayIcon className="w-4 h-4 mx-auto" />
            </span>
          </>
        )}
      </div>

      {/* Cover */}
      <img
        src={track.cover}
        alt={track.title}
        className="w-10 h-10 rounded object-cover shrink-0"
        loading="lazy"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate leading-tight ${isActive ? 'text-primary-400' : 'text-white'}`}>
          {track.title}
        </p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{track.artist}</p>
      </div>

      {/* Like button - visible on hover or if liked */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
        className={`shrink-0 p-1.5 rounded-full transition-all duration-200 active:scale-90
          ${liked ? 'text-primary-400 opacity-100' : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
        title={liked ? 'Remove from Liked' : 'Save to Liked'}
      >
        <HeartIcon className="w-4 h-4" filled={liked} />
      </button>

      {/* Badge */}
      <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 text-[10px] font-semibold uppercase tracking-wider shrink-0">
        {track.license}
      </span>

      {/* Genre */}
      <span className="hidden md:inline text-[11px] text-gray-500 w-20 truncate shrink-0 capitalize">
        {track.genre}
      </span>

      {/* Duration */}
      <span className="text-[11px] text-gray-500 w-11 text-right shrink-0 tabular-nums">
        {formatDuration(track.duration)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 relative">
        <button
          onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
          className="p-1.5 text-gray-400 hover:text-white transition-colors"
          title="Add to queue"
        >
          <AddIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); downloadTrack(track); }}
          className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors"
          title="Download"
        >
          <DownloadIcon className="w-4 h-4" />
        </button>
        {/* More / Add to playlist */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="More options"
          >
            <MoreIcon className="w-4 h-4" />
          </button>
          {showMenu && playlists.length > 0 && (
            <div
              className="absolute right-0 bottom-8 w-48 rounded-lg border border-white/[0.08] shadow-xl py-1 z-50"
              style={{ background: 'rgba(22,33,62,0.98)' }}
            >
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Add to playlist</p>
              {playlists.map(pl => (
                <button
                  key={pl.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    addTrackToPlaylist(pl.id, track.id);
                    showToast(`Added to "${pl.name}"`);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors truncate"
                >
                  {pl.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
