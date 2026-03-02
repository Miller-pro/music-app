import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import adConfig from '../../config/adConfig';

export default function PreRollAd() {
  const { showPreRoll, onPreRollComplete } = useApp();
  const [timeLeft, setTimeLeft] = useState(adConfig.preRoll.skipAfterSeconds);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!showPreRoll) {
      setTimeLeft(adConfig.preRoll.skipAfterSeconds);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-complete after max duration
    const autoComplete = setTimeout(() => {
      onPreRollComplete();
    }, adConfig.preRoll.maxDuration * 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoComplete);
    };
  }, [showPreRoll, onPreRollComplete]);

  const handleSkip = useCallback(() => {
    if (canSkip) onPreRollComplete();
  }, [canSkip, onPreRollComplete]);

  return (
    <AnimatePresence>
      {showPreRoll && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        >
          <div className="text-center max-w-md mx-auto px-6">
            {/* Ad content placeholder */}
            <div className="w-full aspect-video rounded-xl bg-[#16213E] flex items-center justify-center mb-6 border border-white/10">
              <div className="text-gray-400">
                <p className="text-lg font-medium">{adConfig.preRoll.fallbackMessage}</p>
                <p className="text-sm mt-2 text-gray-500">Ad Slot: {adConfig.preRoll.slotId}</p>
                {/* Replace this div with VAST/VPAID video player */}
              </div>
            </div>

            {/* Skip button */}
            <div className="flex justify-end">
              {canSkip ? (
                <button
                  onClick={handleSkip}
                  className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Skip Ad
                </button>
              ) : (
                <div className="px-6 py-2 bg-white/10 rounded-lg text-gray-400 text-sm">
                  Skip in {timeLeft}s
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
