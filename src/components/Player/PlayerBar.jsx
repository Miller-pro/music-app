import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../utils/helpers';
import {
  PlayIcon, PauseIcon, SkipNextIcon, SkipPrevIcon,
  ShuffleIcon, RepeatIcon, RepeatOneIcon,
  VolumeIcon, VolumeLowIcon, VolumeMuteIcon,
  DownloadIcon, QueueIcon, HeartIcon,
} from '../UI/Icons';
import QueuePanel from './QueuePanel';

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, currentTime, duration, volume, isLoading,
    togglePlay, playNext, playPrev, seek, setVolume,
    shuffle, toggleShuffle, repeat, cycleRepeat, downloadTrack,
    toggleLike, isLiked,
  } = useApp();

  const [showQueue, setShowQueue] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const progressRef = useRef(null);

  const handleProgressInteraction = useCallback((e, commit = false) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    const time = pct * duration;
    if (commit) {
      seek(time);
      setIsDragging(false);
    }
    return time;
  }, [duration, seek]);

  const onProgressMouseDown = useCallback((e) => {
    setIsDragging(true);
    const time = handleProgressInteraction(e, false);
    if (time !== undefined) seek(time);
  }, [handleProgressInteraction, seek]);

  const onProgressMouseMove = useCallback((e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    setHoverTime(pct * duration);
    if (isDragging) seek(pct * duration);
  }, [duration, isDragging, seek]);

  const onProgressMouseUp = useCallback((e) => {
    if (isDragging) handleProgressInteraction(e, true);
  }, [isDragging, handleProgressInteraction]);

  const getClientXFromTouch = (e) => {
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    return touch ? touch.clientX : null;
  };

  const onTouchStart = useCallback((e) => {
    e.preventDefault();
    if (!progressRef.current || !duration) return;
    setIsDragging(true);
    const clientX = getClientXFromTouch(e);
    if (clientX === null) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    seek(pct * duration);
  }, [duration, seek]);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!progressRef.current || !duration) return;
    const clientX = getClientXFromTouch(e);
    if (clientX === null) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    setHoverTime(pct * duration);
    if (isDragging) seek(pct * duration);
  }, [duration, isDragging, seek]);

  const onTouchEnd = useCallback((e) => {
    if (!isDragging) return;
    const clientX = getClientXFromTouch(e);
    if (clientX !== null && progressRef.current && duration) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const pct = x / rect.width;
      seek(pct * duration);
    }
    setIsDragging(false);
    setHoverTime(null);
  }, [isDragging, duration, seek]);

  if (!currentTrack) return null;

  const isRadio = currentTrack.type === 'radio' || currentTrack.isLive;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentTrack.id);

  const VolumeActiveIcon = volume === 0 ? VolumeMuteIcon : volume < 0.5 ? VolumeLowIcon : VolumeIcon;

  return (
    <>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.06]"
        style={{ background: 'linear-gradient(to top, rgba(26,26,46,0.98), rgba(22,33,62,0.95))' }}
      >
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-5">
          {/* ── Progress Bar / Live Indicator ────────────────── */}
          {isRadio ? (
            <div className="relative h-5 -mt-2.5 flex items-center">
              <div className="absolute left-0 right-0 h-1 rounded-full bg-red-500/30">
                <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-red-500/60 animate-pulse" />
              </div>
            </div>
          ) : (
            <div
              ref={progressRef}
              className="progress-bar-container group relative h-6 sm:h-5 -mt-2.5 flex items-center cursor-pointer select-none"
              onMouseDown={onProgressMouseDown}
              onMouseMove={onProgressMouseMove}
              onMouseUp={onProgressMouseUp}
              onMouseLeave={() => { setHoverTime(null); if (isDragging) setIsDragging(false); }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Track background */}
              <div className="absolute left-0 right-0 h-1 group-hover:h-1.5 rounded-full bg-white/[0.08] transition-all duration-150">
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white group-hover:bg-primary-400 transition-colors duration-150"
                  style={{ width: `${progress}%` }}
                />
                {/* Hover preview */}
                {hoverTime !== null && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-white/20"
                    style={{ width: `${(hoverTime / duration) * 100}%` }}
                  />
                )}
              </div>
              {/* Scrubber dot - visible on hover or drag */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-md pointer-events-none"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-7 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/90 text-[10px] text-white font-medium pointer-events-none"
                  style={{ left: `${(hoverTime / duration) * 100}%` }}
                >
                  {formatDuration(hoverTime)}
                </div>
              )}
            </div>
          )}

          {/* ── Main Player Row ──────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-4 pb-3 pt-0.5">
            {/* ── Left: Track Info ─────────────────── */}
            <div className="flex items-center gap-3 w-[30%] min-w-0">
              <motion.div
                layout
                className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 shadow-lg shadow-black/40"
              >
                {currentTrack.cover ? (
                  <img
                    src={currentTrack.cover}
                    alt={isRadio ? currentTrack.name : currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/30 to-primary-700/30">
                    <svg className="w-6 h-6 text-primary-400/60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8c0-.83-.49-1.57-1.24-1.85L12 2 3.24 6.15z" />
                    </svg>
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="flex items-center gap-[3px]">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-[3px] bg-primary-400 rounded-full"
                          animate={{ height: [4, 14, 4] }}
                          transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.13, ease: 'easeInOut' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-semibold truncate text-white leading-tight hover:underline cursor-default">
                    {isRadio ? currentTrack.name : currentTrack.title}
                  </p>
                  {isRadio && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5 hover:text-gray-300 cursor-default">
                  {isRadio ? 'Live Radio' : currentTrack.artist}
                </p>
              </div>

              {/* Like button (hide for radio) */}
              {!isRadio && (
                <button
                  onClick={() => toggleLike(currentTrack.id)}
                  className={`shrink-0 p-2 rounded-full transition-all duration-200 active:scale-90
                    ${liked ? 'text-primary-400' : 'text-gray-500 hover:text-white'}`}
                  title={liked ? 'Remove from Liked' : 'Save to Liked'}
                >
                  <HeartIcon className="w-[18px] h-[18px]" filled={liked} />
                </button>
              )}
            </div>

            {/* ── Center: Controls ─────────────────── */}
            <div className="flex-1 flex flex-col items-center gap-0.5 max-w-[45%]">
              <div className="flex items-center gap-1 sm:gap-4">
                {!isRadio && (
                  <button
                    onClick={toggleShuffle}
                    className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200
                      ${shuffle ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    title="Shuffle"
                  >
                    <ShuffleIcon className="w-4 h-4" />
                    {shuffle && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary-400" />}
                  </button>
                )}

                {!isRadio && (
                  <button
                    onClick={playPrev}
                    className="flex items-center justify-center w-9 h-9 text-gray-300 hover:text-white transition-colors active:scale-95"
                    title="Previous"
                  >
                    <SkipPrevIcon className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={togglePlay}
                  disabled={isLoading}
                  className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:scale-[1.06] active:scale-95 transition-all duration-150 disabled:opacity-50
                    ${isRadio && isPlaying ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
                  title={isPlaying ? (isRadio ? 'Stop' : 'Pause') : 'Play'}
                >
                  {isLoading ? (
                    <motion.div
                      className={`w-5 h-5 border-2 rounded-full ${isRadio ? 'border-white/30 border-t-white' : 'border-black/30 border-t-black'}`}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : isPlaying ? (
                    isRadio ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>
                    ) : (
                      <PauseIcon className="w-5 h-5" />
                    )
                  ) : (
                    <PlayIcon className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                {!isRadio && (
                  <button
                    onClick={playNext}
                    className="flex items-center justify-center w-9 h-9 text-gray-300 hover:text-white transition-colors active:scale-95"
                    title="Next"
                  >
                    <SkipNextIcon className="w-5 h-5" />
                  </button>
                )}

                {!isRadio && (
                  <button
                    onClick={cycleRepeat}
                    className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 relative
                      ${repeat !== 'none' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    title={`Repeat: ${repeat}`}
                  >
                    {repeat === 'one' ? <RepeatOneIcon className="w-4 h-4" /> : <RepeatIcon className="w-4 h-4" />}
                    {repeat !== 'none' && <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary-400" />}
                  </button>
                )}
              </div>

              {/* Desktop time display (hidden for radio) */}
              {!isRadio && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 w-full max-w-lg select-none">
                  <span className="w-9 text-right tabular-nums">{formatDuration(currentTime)}</span>
                  <div className="flex-1" />
                  <span className="w-9 tabular-nums">{formatDuration(duration)}</span>
                </div>
              )}
              {isRadio && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-red-400/70 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="uppercase tracking-wider font-semibold text-xs">Live Broadcast</span>
                </div>
              )}
            </div>

            {/* ── Right: Actions ───────────────────── */}
            <div className="hidden md:flex items-center gap-1 w-[30%] justify-end">
              {!isRadio && (
                <button
                  onClick={() => downloadTrack(currentTrack)}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white transition-colors"
                  title="Download"
                >
                  <DownloadIcon className="w-[18px] h-[18px]" />
                </button>
              )}

              <button
                onClick={() => setShowQueue(prev => !prev)}
                className={`flex items-center justify-center w-8 h-8 rounded transition-colors
                  ${showQueue ? 'text-primary-400' : 'text-gray-500 hover:text-white'}`}
                title="Queue"
              >
                <QueueIcon className="w-[18px] h-[18px]" />
              </button>

              {/* Volume */}
              <div className="group/vol flex items-center gap-1 ml-1">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white transition-colors"
                  title={volume === 0 ? 'Unmute' : 'Mute'}
                >
                  <VolumeActiveIcon className="w-[18px] h-[18px]" />
                </button>
                <div className="relative w-24 h-8 flex items-center">
                  {/* Background track */}
                  <div className="absolute left-0 right-0 h-1 rounded-full bg-white/[0.08] group-hover/vol:h-1 transition-all">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-white group-hover/vol:bg-primary-400 transition-colors"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="vol-slider absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {/* Scrubber */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover/vol:opacity-100 transition-opacity pointer-events-none shadow-sm"
                    style={{ left: `calc(${volume * 100}% - 6px)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Queue panel */}
      <QueuePanel isOpen={showQueue} onClose={() => setShowQueue(false)} />
    </>
  );
}
