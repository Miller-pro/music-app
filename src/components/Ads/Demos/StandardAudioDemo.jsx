import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdAudio, { ADS } from './useAdAudio';
import DemoShell from './DemoShell';
import AudioWaveform, { SyncedScript, AdInfoBadge } from './AudioWaveform';
import { getStandardAudioBidRequest } from './bidRequestData';

const AD = ADS.podwave;

function MockMusicPlayer({ adState, audio }) {
  return (
    <div className="bg-gradient-to-b from-[#16213E]/80 to-[#1A1A2E]">
      {/* Now Playing header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Now Playing</span>
        <span className="text-[10px] text-gray-500">AudioVerse Player</span>
      </div>

      {/* Track info (dimmed during ad) */}
      <div className={`p-6 transition-opacity duration-500 ${adState === 'playing' ? 'opacity-30' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">Sunset Dreams</p>
            <p className="text-xs text-gray-400 truncate">Ambient Productions</p>
            <p className="text-[10px] text-gray-500 mt-1">Ambient &middot; 3:42</p>
          </div>
        </div>
      </div>

      {/* Ad overlay */}
      <AnimatePresence>
        {adState === 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 pb-2"
          >
            {/* Ad label + brand */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                Ad
              </span>
              <span className="text-xs text-gray-400">{AD.brand}</span>
              <span className="text-[10px] text-gray-500 ml-auto">{AD.url}</span>
            </div>

            {/* Synced script display */}
            <div className="glass-light rounded-xl p-4 mb-3">
              <SyncedScript
                script={AD.script}
                progress={audio.progress}
                isPlaying={audio.isPlaying}
                accentColor={AD.accentColor}
              />
            </div>

            {/* Waveform */}
            <AudioWaveform isPlaying barCount={40} height={40} color="primary" />

            {/* Ad info */}
            <div className="mt-3 pt-2 border-t border-white/[0.04]">
              <AdInfoBadge ad={AD} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad completion state */}
      <AnimatePresence>
        {adState === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 pb-2"
          >
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-xs font-medium">Ad complete &mdash; music starting now</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress & timer area */}
      <div className="px-6 pb-4 pt-2">
        {adState === 'playing' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Ad playing with {AD.music.label.toLowerCase()}
              </span>
              <span className="font-mono">Ad will end in {audio.timeLeft}s</span>
            </div>
          </div>
        )}

        {/* Track progress bar */}
        <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: adState === 'waiting' ? '0%' : adState === 'complete' ? '2%' : '0%' }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
          <span>0:00</span>
          <span>3:42</span>
        </div>
      </div>
    </div>
  );
}

export default function StandardAudioDemo() {
  const audio = useAdAudio(AD.script, 15, {
    voice: AD.voice,
    musicStyle: AD.music.style,
  });
  const [canSkip, setCanSkip] = useState(false);
  const [adState, setAdState] = useState('waiting');
  const [listenRate, setListenRate] = useState(0);
  const bidRequest = useMemo(() => getStandardAudioBidRequest(), []);

  useEffect(() => {
    if (audio.isPlaying && audio.currentTime < 0.1) {
      setAdState('playing');
      setCanSkip(false);
    }
  }, [audio.isPlaying, audio.currentTime]);

  useEffect(() => {
    if (audio.isPlaying) setAdState('playing');
  }, [audio.isPlaying]);

  useEffect(() => {
    if (audio.isComplete) {
      setAdState('complete');
      setListenRate(92);
    }
  }, [audio.isComplete]);

  useEffect(() => {
    if (audio.currentTime >= 5) setCanSkip(true);
  }, [audio.currentTime]);

  const handlePlay = () => {
    setAdState('waiting');
    setCanSkip(false);
    setListenRate(0);
    audio.play();
  };

  const handleRestart = () => {
    setAdState('waiting');
    setCanSkip(false);
    setListenRate(0);
    audio.restart();
  };

  const handleSkip = () => {
    audio.skip();
    setAdState('complete');
    setListenRate(Math.round(audio.progress * 100));
  };

  return (
    <DemoShell
      title="Standard Audio (Pre-Roll)"
      subtitle={`15-second "${AD.brand}" audio ad with ${AD.voice.label.toLowerCase()} voice and ${AD.music.label.toLowerCase()}. Plays before a music track starts.`}
      badge="Most Popular"
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
      bidRequestFormatLabel="Standard Pre-Roll"
      formatId="standard-audio"
      metrics={[
        { label: 'Avg. Completion Rate', value: '92%' },
        { label: 'Avg. Listen-Through', value: '13.2s' },
        { label: 'Skip Rate (after 5s)', value: '8%' },
        { label: 'CPM Range', value: '$18-32' },
        { label: 'Avg. Frequency', value: '1 per 4 tracks' },
        { label: 'User Satisfaction', value: '4.2/5' },
        { label: 'Brand Recall', value: '74%' },
        { label: 'Monthly Impressions', value: '2.4M' },
      ]}
    >
      <div className="relative">
        <MockMusicPlayer adState={adState} audio={audio} />

        {/* Countdown overlay */}
        {adState === 'playing' && (
          <div className="absolute top-2 right-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="17" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                  <circle
                    cx="20" cy="20" r="17"
                    stroke={AD.color}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 17}`}
                    strokeDashoffset={`${2 * Math.PI * 17 * (1 - audio.progress)}`}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {audio.timeLeft}
                </span>
              </div>
            </div>

            {canSkip ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleSkip}
                className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
              >
                Skip Ad &rarr;
              </motion.button>
            ) : (
              <span className="text-[10px] text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg">
                Skip in {Math.max(0, 5 - Math.floor(audio.currentTime))}s
              </span>
            )}
          </div>
        )}

        {/* Completion stat badge */}
        {adState === 'complete' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 right-4"
          >
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-green-400">{listenRate || 92}% listened</p>
                <p className="text-[10px] text-gray-400">90%+ users listen to completion</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress bar overlay */}
        {adState === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
              style={{ width: `${audio.progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </DemoShell>
  );
}
