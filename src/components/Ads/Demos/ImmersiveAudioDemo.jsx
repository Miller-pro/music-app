import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdAudio, { ADS } from './useAdAudio';
import DemoShell from './DemoShell';
import AudioWaveform, { SyncedScript, AdInfoBadge } from './AudioWaveform';
import { getImmersiveAudioBidRequest } from './bidRequestData';

const AD = ADS.designflow;

const BANNER_HEADLINES = [
  'All-in-One Creative',
  '2 Million+ Creators',
  'Try Free for 30 Days',
];

function CompanionBanner({ isPlaying, progress, onClick }) {
  const [clicks, setClicks] = useState(0);
  const headlineIdx = Math.min(Math.floor(progress * BANNER_HEADLINES.length), BANNER_HEADLINES.length - 1);

  const handleClick = () => {
    setClicks(c => c + 1);
    onClick?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-[300px] h-[250px] rounded-xl overflow-hidden relative cursor-pointer group"
      onClick={handleClick}
      style={{
        boxShadow: isPlaying ? '0 0 30px rgba(255,107,53,0.3), 0 0 60px rgba(255,215,0,0.15)' : 'none',
        transition: 'box-shadow 0.5s ease',
      }}
    >
      {/* Background gradient — blue to orange (DesignFlow brand) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#FF6B35] to-[#FFD700]" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: 80 + i * 25,
              height: 80 + i * 25,
              left: `${15 + i * 12}%`,
              top: `${5 + i * 14}%`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)',
              animation: isPlaying
                ? `bannerFloat ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite alternate`
                : 'none',
            }}
          />
        ))}
      </div>

      {/* SVG animated brush strokes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 250" fill="none">
        <motion.path
          d="M 20 200 Q 80 130 150 170 T 280 110"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="30"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isPlaying ? { pathLength: [0, 1, 1, 0] } : { pathLength: 0 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 0 70 Q 100 30 200 100 T 300 50"
          stroke="rgba(249,115,22,0.15)"
          strokeWidth="20"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isPlaying ? { pathLength: [0, 1, 1, 0] } : { pathLength: 0 }}
          transition={{ duration: 5, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <motion.div
          animate={isPlaying ? { scale: [1, 1.06, 1], rotate: [0, 3, -3, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-3"
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z" />
          </svg>
        </motion.div>

        <p className="text-white/60 text-xs font-medium tracking-wider uppercase mb-2">{AD.brand}</p>

        {/* Headline — syncs with audio progress */}
        <div className="mb-2 h-12 flex items-center">
          <AnimatePresence mode="wait">
            <motion.h4
              key={headlineIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-white font-display font-bold text-lg leading-tight"
            >
              {BANNER_HEADLINES[headlineIdx]}
            </motion.h4>
          </AnimatePresence>
        </div>

        <p className="text-white/70 text-xs mb-4">Video, graphics &amp; animation in one tool</p>

        {/* Pulsing CTA */}
        <motion.button
          animate={isPlaying ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="px-6 py-2.5 bg-orange-500 text-white font-bold text-sm rounded-full shadow-lg hover:bg-orange-400 transition-colors"
        >
          Try Free for 30 Days
        </motion.button>

        {/* Waveform bar at bottom */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-6 flex items-end justify-center gap-[1px] px-2">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="rounded-t-full bg-white/30"
                style={{
                  width: 4,
                  animation: `waveformBounce ${0.3 + (i % 5) * 0.1}s ease-in-out ${i * 0.03}s infinite alternate`,
                  height: '30%',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Click tracker */}
      {clicks > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
        >
          {clicks}
        </motion.div>
      )}

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
        <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded-full">
          Click to visit
        </span>
      </div>
    </motion.div>
  );
}

export default function ImmersiveAudioDemo() {
  const audio = useAdAudio(AD.script, 15, {
    voice: AD.voice,
    musicStyle: AD.music.style,
  });
  const [clicks, setClicks] = useState(0);
  const [adState, setAdState] = useState('waiting');
  const bidRequest = useMemo(() => getImmersiveAudioBidRequest(), []);

  useEffect(() => {
    if (audio.isPlaying) setAdState('playing');
  }, [audio.isPlaying]);

  useEffect(() => {
    if (audio.isComplete) setAdState('complete');
  }, [audio.isComplete]);

  const handlePlay = () => {
    setAdState('waiting');
    setClicks(0);
    audio.play();
  };

  const handleRestart = () => {
    setAdState('waiting');
    setClicks(0);
    audio.restart();
  };

  return (
    <DemoShell
      title="Immersive Audio (Audio + Display)"
      subtitle={`"${AD.brand}" ad with ${AD.voice.label.toLowerCase()} voice, ${AD.music.label.toLowerCase()}, and animated companion banner. 2x engagement vs audio-only.`}
      badge="Premium"
      isPlaying={audio.isPlaying}
      isComplete={audio.isComplete}
      onPlay={handlePlay}
      onPause={audio.pause}
      onRestart={handleRestart}
      voiceName={audio.selectedVoiceName}
      onCycleVoice={audio.cycleVoice}
      bidRequest={bidRequest}
      bidRequestIsPlaying={audio.isPlaying}
      bidRequestProgress={audio.progress}
      bidRequestFormatLabel="Immersive Audio"
      formatId="immersive-audio"
      metrics={[
        { label: 'Engagement Rate', value: '4.8%' },
        { label: 'vs. Audio-Only', value: '2x' },
        { label: 'Avg. CTR', value: '1.2%' },
        { label: 'Click Tracking', value: `${clicks} clicks` },
        { label: 'Viewability', value: '96%' },
        { label: 'CPM Range', value: '$28-45' },
        { label: 'Brand Lift', value: '+38%' },
        { label: 'Monthly Impressions', value: '1.8M' },
      ]}
    >
      <div className="p-6">
        {/* Ad info badge */}
        <AdInfoBadge ad={AD} className="mb-4 pb-3 border-b border-white/[0.06]" />

        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left: Audio player simulation */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${adState === 'playing' ? 'bg-red-400 animate-pulse' : 'bg-gray-600'}`} />
              <span className="text-xs text-gray-400">
                {adState === 'waiting' ? 'Ready to play' : adState === 'playing' ? 'Ad playing with background music...' : 'Ad complete'}
              </span>
              {adState === 'playing' && (
                <span className="ml-auto text-xs text-gray-500 font-mono">{audio.timeLeft}s remaining</span>
              )}
            </div>

            {/* Audio visualization */}
            <div className="glass-light rounded-xl p-5 mb-4">
              <AudioWaveform isPlaying={audio.isPlaying} barCount={48} height={64} color="blue" />
            </div>

            {/* Synced script caption */}
            <div className="glass-light rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[9px] font-bold shrink-0 mt-0.5">AD</span>
                <div className="flex-1">
                  {adState === 'complete' ? (
                    <span className="text-sm text-green-400">Ad complete. Banner remains visible for engagement tracking.</span>
                  ) : (
                    <SyncedScript
                      script={AD.script}
                      progress={audio.progress}
                      isPlaying={audio.isPlaying}
                      accentColor={AD.accentColor}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${audio.progress * 100}%`,
                  background: `linear-gradient(to right, ${AD.color}, ${AD.accentColor})`,
                }}
              />
            </div>

            {/* Engagement comparison */}
            {adState === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-4"
              >
                <div className="flex-1 glass-light rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Audio Only</p>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">2.4% engagement</p>
                </div>
                <div className="flex-1 glass-light rounded-lg p-3 text-center border border-primary-400/30">
                  <p className="text-xs text-primary-400 mb-1">Audio + Display</p>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '84%', background: `linear-gradient(to right, ${AD.color}, ${AD.accentColor})` }} />
                  </div>
                  <p className="text-xs text-primary-400 mt-1">4.8% engagement</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Companion Banner */}
          <div className="shrink-0">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2 text-center">
              Companion Banner (300&times;250)
            </div>
            <CompanionBanner
              isPlaying={audio.isPlaying}
              progress={audio.progress}
              onClick={() => setClicks(c => c + 1)}
            />
            {clicks > 0 && (
              <div className="text-center mt-2">
                <span className="text-xs text-green-400">{clicks} click{clicks > 1 ? 's' : ''} tracked</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
