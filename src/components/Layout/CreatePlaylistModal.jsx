import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CloseIcon } from '../UI/Icons';

export default function CreatePlaylistModal({ isOpen, onClose }) {
  const { createPlaylist, showToast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createPlaylist(trimmed, description.trim());
    showToast(`Playlist "${trimmed}" created`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl"
              style={{ background: 'rgba(22,33,62,0.98)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h2 className="text-lg font-bold text-white">Create Playlist</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 pb-6 pt-3">
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Name
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Playlist"
                    maxLength={60}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Description
                    <span className="text-gray-600 font-normal normal-case tracking-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="px-6 py-2.5 rounded-full text-sm font-semibold bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
