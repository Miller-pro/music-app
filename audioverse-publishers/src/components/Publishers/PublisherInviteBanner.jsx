'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getFromStorage, setToStorage } from '../../utils/helpers';
import config from '../../config/config';

// How many cumulative seconds of playback earn the invite. Counted across
// tracks (skipping songs still counts) — not 10s into any single track.
const PLAYBACK_THRESHOLD_SECONDS = 10;

// Brand orange-red (primary-500 = #FF6B35) as an rgb triplet, for glow shadows.
const BRAND_RGB = '255, 107, 53';

// Entrance: scale-pop in, with a one-time glow swell that settles into a soft
// resting halo (the last keyframe persists). The dark drop shadow is kept in
// every keyframe so the layered box-shadow interpolates cleanly. No looping —
// the glow never blinks once settled.
const GLOW_KEYFRAMES = [
  `0 0 0px rgba(${BRAND_RGB}, 0), 0 8px 40px rgba(0,0,0,0.5)`,
  `0 0 40px rgba(${BRAND_RGB}, 0.6), 0 8px 40px rgba(0,0,0,0.5)`,
  `0 0 36px rgba(${BRAND_RGB}, 0.4), 0 8px 40px rgba(0,0,0,0.5)`,
];

/**
 * A once-ever, non-intrusive invitation for listeners to become publishers.
 * It slides up bottom-right — anchored ABOVE the PlayerBar so it never covers
 * the controls — after the visitor has accumulated 10 seconds of actual
 * playback. Once shown or dismissed it persists a flag in localStorage (same
 * pattern as liked/history) so it never nags again across reloads.
 *
 * Playback-triggered, not route-triggered: it rides on `isPlaying` from the
 * shared audio context, so it works on every route where music can play.
 */
export default function PublisherInviteBanner() {
  const { isPlaying } = useApp();
  const [visible, setVisible] = useState(false);

  // Cumulative playing seconds; a ref so it survives track changes without
  // re-rendering on every tick.
  const playedSecondsRef = useRef(0);
  // Once we've shown or dismissed, we're done for good this browser.
  const settledRef = useRef(false);

  // Seed settled state from storage so a returning visitor never sees it again.
  useEffect(() => {
    if (getFromStorage(config.storage.publisherInvite, false)) {
      settledRef.current = true;
    }
  }, []);

  const settle = useCallback(() => {
    settledRef.current = true;
    setToStorage(config.storage.publisherInvite, true);
  }, []);

  // Accumulate one second per tick while audio is actually playing. Using a
  // wall-clock interval (rather than the track's currentTime) keeps the count
  // correct through skips and seeks — only real playing time advances it.
  useEffect(() => {
    if (!isPlaying || settledRef.current) return;

    const id = setInterval(() => {
      playedSecondsRef.current += 1;
      if (playedSecondsRef.current >= PLAYBACK_THRESHOLD_SECONDS) {
        clearInterval(id);
        settle();
        setVisible(true);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [isPlaying, settle]);

  const dismiss = useCallback(() => {
    setVisible(false);
    settle();
  }, [settle]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1, boxShadow: GLOW_KEYFRAMES }}
          exit={{ opacity: 0, y: 24 }}
          transition={{
            type: 'spring',
            damping: 17,
            stiffness: 340,
            boxShadow: { duration: 1.1, times: [0, 0.55, 1] },
          }}
          role="dialog"
          aria-label="Become a publisher"
          // Sits above the PlayerBar (which is ~96px tall, fixed bottom-0).
          // border-2 primary rim (glowing border) + the animated halo above.
          className="fixed bottom-28 right-4 z-40 w-[280px] max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-primary-500/70 bg-[#1A1A2E]/95 backdrop-blur-md"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <div className="p-4 pr-8">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-400">
              For Publishers
            </span>
            <p className="mt-1 text-sm font-bold text-white leading-snug">
              Add Premium Music
            </p>
            <p className="mt-1 text-xs text-gray-400 leading-snug">
              Own an app or website? Add a premium music library your users will
              love, for FREE.
            </p>

            <Link
              href="/auth/signup"
              onClick={dismiss}
              className="mt-3 inline-flex items-center justify-center gap-1 w-full px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold transition-colors"
            >
              Get Started
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
