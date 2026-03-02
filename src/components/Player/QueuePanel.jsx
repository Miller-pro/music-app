import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CloseIcon, PlayIcon, PauseIcon } from '../UI/Icons';
import { formatDuration } from '../../utils/helpers';

export default function QueuePanel({ isOpen, onClose }) {
  const { queue, queueIndex, currentTrack, isPlaying, playTrack, removeFromQueue, togglePlay } = useApp();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-25 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-[88px] w-80 z-30 flex flex-col border-l border-white/[0.06]"
            style={{ background: 'rgba(22,33,62,0.97)', backdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-base text-white">Queue</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Now Playing */}
            {currentTrack && (
              <div className="px-4 pt-4 pb-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Now playing</p>
                <div className="flex items-center gap-3 p-2 rounded-md bg-white/[0.06]">
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title}
                    className="w-10 h-10 rounded object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate text-primary-400">{currentTrack.title}</p>
                    <p className="text-[11px] text-gray-500 truncate">{currentTrack.artist}</p>
                  </div>
                  <span className="text-[11px] text-gray-500 tabular-nums">{formatDuration(currentTrack.duration)}</span>
                </div>
              </div>
            )}

            {/* Queue label */}
            {queue.length > 0 && (
              <div className="px-4 pt-3 pb-1">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Next up</p>
              </div>
            )}

            {/* Queue list */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm gap-1">
                  <p>Queue is empty</p>
                  <p className="text-xs text-gray-600">Add tracks to get started</p>
                </div>
              ) : (
                queue.map((track, i) => {
                  const isActive = i === queueIndex;
                  if (isActive) return null; // Already shown in "Now playing"
                  return (
                    <div
                      key={`${track.id}-${i}`}
                      className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer transition-colors duration-150 group hover:bg-white/[0.05]"
                      onClick={() => playTrack(track, queue)}
                    >
                      <span className="text-[11px] text-gray-600 w-5 text-center tabular-nums shrink-0">
                        {i + 1}
                      </span>
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-9 h-9 rounded object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-white">{track.title}</p>
                        <p className="text-[10px] text-gray-500 truncate">{track.artist}</p>
                      </div>
                      <span className="text-[10px] text-gray-600 tabular-nums">{formatDuration(track.duration)}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(i); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <CloseIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
