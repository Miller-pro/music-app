import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdAudio, { ADS, CONTEXTUAL_AD_MAP } from './useAdAudio';
import DemoShell from './DemoShell';
import AudioWaveform, { SyncedScript, AdInfoBadge } from './AudioWaveform';
import { getContextualAudioBidRequest, getChangedPaths } from './bidRequestData';

const CONTEXT_PRESETS = [
  {
    id: 'default',
    label: 'Default',
    device: 'iPhone 14 Pro',
    deviceIcon: '📱',
    location: 'New York, NY',
    time: '2:30 PM EST',
    content: 'Classical Music Playlist',
    session: '15 minutes in',
    profile: 'Content Creator, 25-34',
    weather: '72°F, Sunny',
    connectivity: 'WiFi (5G available)',
    adKey: 'default',
    matchReason: 'Content creator profile matched to photography education',
  },
  {
    id: 'morning',
    label: 'Morning Commute',
    device: 'AirPods Pro',
    deviceIcon: '🎧',
    location: 'San Francisco, CA',
    time: '7:45 AM PST',
    content: 'Morning Motivation Mix',
    session: '8 minutes in',
    profile: 'Professional, 30-40',
    weather: '58°F, Foggy',
    connectivity: 'Cellular (LTE)',
    adKey: 'morning',
    matchReason: 'Professional commuter matched to podcast hosting',
  },
  {
    id: 'evening',
    label: 'Evening Relaxation',
    device: 'MacBook Pro (Speakers)',
    deviceIcon: '💻',
    location: 'Austin, TX',
    time: '8:15 PM CST',
    content: 'Lo-Fi Study Beats',
    session: '45 minutes in',
    profile: 'Student, 18-24',
    weather: '85°F, Clear',
    connectivity: 'WiFi',
    adKey: 'evening',
    matchReason: 'Student creator matched to affordable music licensing',
  },
  {
    id: 'workout',
    label: 'Gym Workout',
    device: 'Galaxy Watch 5',
    deviceIcon: '⌚',
    location: 'Miami, FL',
    time: '6:00 PM EST',
    content: 'High-Energy EDM',
    session: '22 minutes in',
    profile: 'Fitness Enthusiast, 22-30',
    weather: '88°F, Humid',
    connectivity: 'Bluetooth via Phone',
    adKey: 'workout',
    matchReason: 'Active professional matched to productivity tools',
  },
  {
    id: 'creative',
    label: 'Creative Session',
    device: 'iPad Pro',
    deviceIcon: '🖥️',
    location: 'London, UK',
    time: '3:00 PM GMT',
    content: 'Ambient Focus Sounds',
    session: '1 hour 10 min in',
    profile: 'Designer, 28-35',
    weather: '52°F, Overcast',
    connectivity: 'WiFi (Fiber)',
    adKey: 'creative',
    matchReason: 'Designer profile matched to creative software tools',
  },
];

const SIGNAL_COUNT = 54;

function ContextField({ icon, label, value, highlight }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${highlight ? 'bg-primary-500/10 border border-primary-500/20' : 'bg-white/[0.03]'}`}>
      <span className="text-sm shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-medium truncate ${highlight ? 'text-primary-300' : 'text-gray-200'}`}>{value}</p>
      </div>
    </div>
  );
}

export default function ContextualAudioDemo() {
  const [activePreset, setActivePreset] = useState(0);
  const ctx = CONTEXT_PRESETS[activePreset];
  const currentAd = CONTEXTUAL_AD_MAP[ctx.adKey] || ADS.masterclass;
  const audio = useAdAudio(currentAd.script, 15, {
    voice: currentAd.voice,
    musicStyle: currentAd.music.style,
  });
  const [highlightSignals, setHighlightSignals] = useState(false);

  const currentBidRequest = useMemo(() => getContextualAudioBidRequest(ctx.adKey), [ctx.adKey]);
  const prevBidRequestRef = useRef(null);
  const [changedFields, setChangedFields] = useState(null);

  useEffect(() => {
    if (prevBidRequestRef.current) {
      const changes = getChangedPaths(prevBidRequestRef.current, currentBidRequest);
      setChangedFields(changes);
      const timer = setTimeout(() => setChangedFields(null), 3000);
      return () => clearTimeout(timer);
    }
    prevBidRequestRef.current = currentBidRequest;
  }, [currentBidRequest]);

  useEffect(() => {
    prevBidRequestRef.current = currentBidRequest;
  }, [currentBidRequest]);

  const cycleContext = useCallback(() => {
    audio.restart();
    setActivePreset(p => (p + 1) % CONTEXT_PRESETS.length);
    setHighlightSignals(true);
    setTimeout(() => setHighlightSignals(false), 1500);
  }, [audio]);

  useEffect(() => {
    audio.restart();
  }, [activePreset]);

  const handlePlay = () => audio.play();

  return (
    <DemoShell
      title="Contextual Audio"
      subtitle="Dynamically targeted ads that adapt to context. Each scenario selects a different advertiser based on 54+ real-time signals. Try switching contexts!"
      badge="Smart"
      isPlaying={audio.isPlaying}
      isComplete={audio.isComplete}
      onPlay={handlePlay}
      onPause={audio.pause}
      onRestart={audio.restart}
      voiceName={audio.selectedVoiceName}
      onCycleVoice={audio.cycleVoice}
      bidRequest={currentBidRequest}
      bidRequestIsPlaying={audio.isPlaying}
      bidRequestProgress={audio.progress}
      bidRequestChangedFields={changedFields}
      bidRequestFormatLabel="Contextual Audio"
      formatId="contextual-audio"
      metrics={[
        { label: 'Targeting Signals', value: `${SIGNAL_COUNT}+` },
        { label: 'Relevance Score', value: '94%' },
        { label: 'CTR Lift', value: '+180%' },
        { label: 'CPM Range', value: '$25-50' },
        { label: 'Fill Rate', value: '98%' },
        { label: 'Brand Safety', value: '100%' },
        { label: 'Completion Rate', value: '88%' },
        { label: 'Audience Match', value: '96%' },
      ]}
    >
      <div className="p-5">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left: Targeting Panel */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-gray-300">Live Targeting Panel</span>
              </div>
              <motion.div
                animate={highlightSignals ? { scale: [1, 1.1, 1] } : {}}
                className="px-2.5 py-1 rounded-full bg-primary-500/15 border border-primary-500/25"
              >
                <span className="text-[10px] font-bold text-primary-300">{SIGNAL_COUNT}+ signals active</span>
              </motion.div>
            </div>

            {/* Context presets */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {CONTEXT_PRESETS.map((preset, i) => (
                <button
                  key={preset.id}
                  onClick={() => { setActivePreset(i); audio.restart(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    i === activePreset
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {preset.deviceIcon} {preset.label}
                </button>
              ))}
            </div>

            {/* Context fields */}
            <motion.div
              key={ctx.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-2"
            >
              <ContextField icon="📱" label="Device" value={ctx.device} highlight={highlightSignals} />
              <ContextField icon="📍" label="Location" value={ctx.location} highlight={highlightSignals} />
              <ContextField icon="🕐" label="Time" value={ctx.time} highlight={highlightSignals} />
              <ContextField icon="🎵" label="Content" value={ctx.content} highlight={highlightSignals} />
              <ContextField icon="⏱️" label="Session" value={ctx.session} highlight={highlightSignals} />
              <ContextField icon="👤" label="Profile" value={ctx.profile} highlight={highlightSignals} />
              <ContextField icon="🌤️" label="Weather" value={ctx.weather} highlight={highlightSignals} />
              <ContextField icon="📶" label="Connection" value={ctx.connectivity} highlight={highlightSignals} />
            </motion.div>

            {/* Match reason */}
            <AnimatePresence mode="wait">
              <motion.div
                key={ctx.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-3 p-2.5 bg-green-500/10 rounded-lg border border-green-500/20 flex items-start gap-2"
              >
                <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <div>
                  <p className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Why this ad?</p>
                  <p className="text-xs text-green-300/80">{ctx.matchReason}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Change context button */}
            <button
              onClick={cycleContext}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] text-sm font-medium text-gray-300 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
              </svg>
              Change Context &mdash; See Different Ad
            </button>
          </div>

          {/* Right: Ad Preview & Audio */}
          <div className="lg:w-80 shrink-0">
            <div className="glass-light rounded-xl p-4">
              {/* Selected ad info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAd.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[9px] font-bold">AD</span>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: currentAd.color }} />
                      <span className="text-xs font-semibold text-gray-200 truncate">{currentAd.brand}</span>
                    </div>
                  </div>

                  {/* Ad metadata */}
                  <div className="flex flex-wrap gap-2 mb-3 text-[10px] text-gray-500">
                    <span className="px-2 py-0.5 rounded bg-white/5">{currentAd.voice.label}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">{currentAd.music.label}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">{currentAd.format}</span>
                  </div>

                  {/* Audio visualization */}
                  <div className="mb-4">
                    <AudioWaveform isPlaying={audio.isPlaying} barCount={36} height={48} color="primary" />
                  </div>

                  {/* Synced script preview */}
                  <div className="bg-black/30 rounded-lg p-3 mb-3">
                    <SyncedScript
                      script={currentAd.script}
                      progress={audio.progress}
                      isPlaying={audio.isPlaying}
                      accentColor={currentAd.accentColor}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress */}
              {audio.isPlaying && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>{Math.floor(audio.currentTime)}s</span>
                    <span>{audio.duration}s</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${audio.progress * 100}%`,
                        background: `linear-gradient(to right, ${currentAd.color}, ${currentAd.accentColor})`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Targeting match score */}
              <div className="flex items-center justify-between p-2.5 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-xs text-green-400">Targeting Match</span>
                <span className="text-sm font-bold text-green-400">94%</span>
              </div>
            </div>

            {audio.isComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-center"
              >
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">{currentAd.brand}</span> was dynamically selected from 5 advertisers based on {SIGNAL_COUNT}+ real-time signals
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DemoShell>
  );
}
